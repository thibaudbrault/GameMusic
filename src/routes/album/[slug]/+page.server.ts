import { CLOUDFRONT_URL } from '$env/static/private';
import {
	createAlbum,
	createGame,
	createCompany,
	updateHistory,
} from '$lib/actions';
import {
	albums,
	authors,
	db,
	favoritesAlbums,
	favoritesMusics,
	games,
	musics,
	musicsToAuthors,
	playlistMusics,
} from '$lib/db';
import { uploadFile } from '$lib/server';
import { authorSlug, musicSlug } from '$lib/utils';
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
			authors: {
				with: {
					author: true,
				},
			},
		},
	});
	const albumLikes = await db
		.select({ count: count() })
		.from(favoritesAlbums)
		.where(eq(favoritesAlbums.albumId, album.id));
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
	createAlbum,
	createGame,
	createCompany,
	updateHistory,
	addFavoriteMusic: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(favoriteMusicSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const { userId, musicId } = form.data;
		await db.insert(favoritesMusics).values({
			userId: userId,
			musicId,
		});
		return message(form, 'Favorite added successfully');
	},
	removeFavoriteMusic: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(favoriteMusicSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const { userId, musicId } = form.data;
		await db
			.delete(favoritesMusics)
			.where(
				and(
					eq(favoritesMusics.userId, userId),
					eq(favoritesMusics.musicId, musicId),
				),
			);
		return message(form, 'Favorite removed successfully');
	},
	addFavoriteAlbum: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(favoriteAlbumSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const { userId, albumId } = form.data;
		await db.insert(favoritesAlbums).values({
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
			return fail(400, { form });
		}
		const { userId, albumId } = form.data;
		await db
			.delete(favoritesAlbums)
			.where(
				and(
					eq(favoritesAlbums.userId, userId),
					eq(favoritesAlbums.albumId, albumId),
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
			return fail(400, { form });
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
		let uploadedTracks = 0;
		for (const track of tracks) {
			const buffer = Buffer.from(await track.arrayBuffer());
			const metadata = await mm.parseBuffer(buffer);
			if (!metadata) {
				return setError(form, 'tracks._errors', 'Could not find metadata');
			}
			const name = metadata.common.title ?? '';
			const number = parseFloat(
				metadata.common.disk.no?.toString() +
					'.' +
					metadata.common.track.no?.toString().padStart(2, '0'),
			);
			const musicExists = await db.query.musics.findFirst({
				where: (musics, { eq, and }) =>
					and(
						eq(musics.name, name),
						eq(musics.albumId, albumId),
						eq(musics.number, number),
					),
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
					number,
					albumId,
				})
				.returning({ musicId: musics.id });
			if (!newMusic) {
				continue;
			}
			uploadedTracks += 1;
			const musicId = newMusic[0].musicId;
			let authorId;
			artists?.forEach(async (artist) => {
				const slug = authorSlug(artist);
				const artistExists = await db.query.authors.findFirst({
					where: eq(authors.slug, slug),
				});
				if (!artistExists) {
					const newAuthor = await db
						.insert(authors)
						.values({
							name: artist,
							slug,
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
		if (uploadedTracks === 0) {
			return error(500, { message: 'Tracks already exist' });
		} else {
			return message(form, 'Tracks added successfully');
		}
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
