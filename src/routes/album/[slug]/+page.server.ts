import { CLOUDFRONT_URL } from '$env/static/private';
import {
	albums,
	authors,
	db,
	games,
	musics,
	musicsToAuthors,
	playlistMusics,
	userFavoritesAlbums,
	userFavoritesMusics,
} from '$lib/db';
import { uploadFile } from '$lib/server';
import { musicSlug } from '$lib/utils';
import {
	addToPlaylistSchema,
	createMusicSchema,
	favoriteAlbumSchema,
	favoriteMusicSchema,
	playlistSchema,
} from '$lib/validation';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { and, count, eq, sql } from 'drizzle-orm';
import * as mm from 'music-metadata';
import {
	message,
	setError,
	superValidate,
	withFiles,
} from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const favoriteForm = await superValidate(zod(favoriteMusicSchema));
	const addToPlaylistForm = await superValidate(zod(playlistSchema));
	const createMusicForm = await superValidate(zod(createMusicSchema));
	const slug = params.slug;
	const album = await db.query.albums.findFirst({
		where: eq(albums.slug, slug),
	});
	if (!album) {
		return redirect(300, '/');
	}
	const game = await db.query.games.findFirst({
		where: eq(games.id, album.gameId),
	});
	const albumLength = await db
		.select({ count: count() })
		.from(musics)
		.where(eq(musics.albumId, album.id));
	const albumMusics = await db.query.musics.findMany({
		where: eq(musics.albumId, album.id),
		orderBy: musics.number,
		with: {
			musicsToAuthors: {
				with: {
					author: true,
				},
			},
		},
	});
	const albumLikes = await db
		.select({ count: count() })
		.from(userFavoritesAlbums)
		.where(eq(userFavoritesAlbums.albumId, album.id));
	return {
		album,
		game: game?.name ?? '',
		length: albumLength[0].count,
		musics: albumMusics,
		likes: albumLikes[0].count,
		favoriteForm,
		createMusicForm,
		addToPlaylistForm,
	};
};

export const actions: Actions = {
	addFavoriteMusic: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(favoriteMusicSchema));
		if (!form.valid) {
			fail(400, { form });
		}
		const { userId, musicId } = form.data;
		await db.insert(userFavoritesMusics).values({
			userId: userId,
			musicId,
		});
		return message(form, 'Favorite added successfully');
	},
	removeFavoriteMusic: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(favoriteMusicSchema));
		if (!form.valid) {
			fail(400, { form });
		}
		const { userId, musicId } = form.data;
		await db
			.delete(userFavoritesMusics)
			.where(
				and(
					eq(userFavoritesMusics.userId, userId),
					eq(userFavoritesMusics.musicId, musicId),
				),
			);
		return message(form, 'Favorite removed successfully');
	},
	addFavoriteAlbum: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(favoriteAlbumSchema));
		if (!form.valid) {
			fail(400, { form });
		}
		const { userId, albumId } = form.data;
		await db.insert(userFavoritesAlbums).values({
			userId: userId,
			albumId,
		});
		await db
			.update(albums)
			.set({ popularity: sql<number>`popularity + 1` })
			.where(eq(albums.id, albumId));
		return message(form, 'Favorite added successfully');
	},
	removeFavoriteAlbum: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(favoriteAlbumSchema));
		if (!form.valid) {
			fail(400, { form });
		}
		const { userId, albumId } = form.data;
		await db
			.delete(userFavoritesAlbums)
			.where(
				and(
					eq(userFavoritesAlbums.userId, userId),
					eq(userFavoritesAlbums.albumId, albumId),
				),
			);
		await db
			.update(albums)
			.set({ popularity: sql<number>`popularity - 1` })
			.where(eq(albums.id, albumId));
		return message(form, 'Favorite removed successfully');
	},
	addToPlaylist: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(addToPlaylistSchema));
		if (!form.valid) {
			fail(400, { form });
		}
		const { userId, musicId, name } = form.data;
		const playlist = await db.query.playlists.findFirst({
			where: (playlists, { eq, and }) =>
				and(eq(playlists.value, name), eq(playlists.userId, userId)),
			columns: {
				id: true,
			},
		});
		if (!playlist) {
			return error(404, { message: 'Could not find playlist' });
		}
		await db.insert(playlistMusics).values({
			musicId,
			playlistId: playlist?.id,
		});
		return message(form, 'Playlist updated successfully');
	},
	createMusic: async ({ request, params }) => {
		const slug = params.slug as string;
		const album = await db.query.albums.findFirst({
			where: eq(albums.slug, slug),
		});
		if (!album) {
			return error(404, { message: 'Could not find album' });
		}
		const { id: albumId } = album;
		const formData = await request.formData();
		const form = await superValidate(formData, zod(createMusicSchema), {
			id: 'createMusic',
		});
		if (!form.valid) {
			return fail(400, withFiles({ form }));
		}
		const { tracks } = form.data;
		for (const track of tracks) {
			const buffer = Buffer.from(await track.arrayBuffer());
			const metadata = await mm.parseBuffer(buffer);
			if (!metadata) {
				return setError(form, 'tracks._errors', 'Could not find metadata');
			}
			const name = metadata.common.title ?? '';
			const musicExists = await db.query.musics.findFirst({
				where: (musics, { eq, and }) =>
					and(eq(musics.name, name), eq(musics.albumId, albumId)),
			});
			if (musicExists) {
				continue;
			}
			let artists = metadata.common.artists ?? [];
			artists = artists[0].split(',').map((item) => item.trim());
			const titleSlug = musicSlug(track.name);
			const filename = `${slug}/${crypto.randomUUID()}${titleSlug}`;
			await uploadFile(buffer, filename, track.type);
			const trackUrl = CLOUDFRONT_URL + filename;
			const newMusic = await db
				.insert(musics)
				.values({
					name,
					url: trackUrl,
					duration: Math.round(metadata.format?.duration ?? 0),
					number: metadata.common.track.no ?? 0,
					albumId,
				})
				.returning({ musicId: musics.id });
			if (!newMusic) {
				continue;
			}
			const musicId = newMusic[0].musicId;
			let authorId;
			artists?.forEach(async (artist) => {
				const artistExists = await db.query.authors.findFirst({
					where: eq(authors.name, artist),
				});
				if (!artistExists) {
					const newAuthor = await db
						.insert(authors)
						.values({
							name: artist,
						})
						.returning({ authorId: authors.id });
					authorId = newAuthor[0].authorId;
				} else {
					authorId = artistExists.id;
				}
				await db.insert(musicsToAuthors).values({
					musicId,
					authorId,
				});
			});
		}
		return message(form, 'Tracks added successfully');
	},
	deleteMusics: async ({ params }) => {
		const slug = params.slug as string;
		const album = await db.query.albums.findFirst({
			where: eq(albums.slug, slug),
		});
		if (!album) {
			return error(404, { message: 'Could not find album' });
		}
		const { id: albumId } = album;
		await db.delete(musics).where(eq(musics.albumId, albumId));
		return { message: 'Musics deleted successfully' };
	},
};
