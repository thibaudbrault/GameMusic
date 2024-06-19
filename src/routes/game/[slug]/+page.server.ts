import { createAlbum, createCompany, createGame } from '$lib/actions';
import { albums, db, gameToAuthors, games, musicsToAuthors } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import { count, eq, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;
	const game = await db.query.games.findFirst({
		where: eq(games.value, slug),
		with: {
			albums: true,
			companies: true,
		},
	});
	if (!game) {
		return redirect(300, '/');
	}
	const countAlbums = await db
		.select({ count: count() })
		.from(albums)
		.where(eq(albums.gameId, game.id));
	if (countAlbums[0].count === 0) {
		return redirect(300, '/');
	}
	const authorsRequest = await db.query.gameToAuthors.findMany({
		where: eq(gameToAuthors.gameId, game?.id),
		with: {
			author: true,
		},
	});
	const authorIds = authorsRequest.map((ga) => ga.author.id);
	const musicsCountQuery = await db
		.select({
			authorId: musicsToAuthors.authorId,
			musicsCount: count(musicsToAuthors.musicId),
		})
		.from(musicsToAuthors)
		.where(inArray(musicsToAuthors.authorId, authorIds))
		.groupBy(musicsToAuthors.authorId);

	const authors = authorsRequest.map((ga) => {
		const musicsCount =
			musicsCountQuery.find((mc) => mc.authorId === ga.author.id)
				?.musicsCount || 0;
		return {
			...ga.author,
			musicsCount,
		};
	});
	// const allMusics = await db.select().from(musics).leftJoin(albums, eq(musics.albumId, albums.id)).leftJoin(games, eq(albums.gameId, games.id))
	const popularAlbums = await db.query.albums.findMany({
		orderBy: (albums, { desc }) => [desc(albums.popularity)],
		where: eq(albums.gameId, game.id),
		with: {
			games: true,
		},
		limit: 5,
	});
	const latestAlbums = await db.query.albums.findMany({
		orderBy: (albums, { desc }) => [desc(albums.createdAt)],
		where: eq(albums.gameId, game.id),
		with: {
			games: true,
		},
		limit: 5,
	});
	return {
		game,
		authors,
		countAlbums: countAlbums[0].count,
		popularAlbums,
		latestAlbums,
	};
};

export const actions: Actions = {
	createAlbum,
	createGame,
	createCompany,
};
