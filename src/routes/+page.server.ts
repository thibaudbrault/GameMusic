import { createAlbum, createCompany, createGame } from '$lib/actions';
import { albums, db } from '$lib/db';
import { sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const randomAlbums = await db.execute(
		sql`select * from ${albums} order by random() limit 1`,
	);
	const allGames = await db.query.games.findMany({
		limit: 10,
	});
	const latestAlbums = await db.query.albums.findMany({
		orderBy: (albums, { desc }) => [desc(albums.createdAt)],
		with: {
			games: true,
		},
		limit: 10,
	});
	const popularAlbums = await db.query.albums.findMany({
		orderBy: (albums, { desc }) => [desc(albums.popularity)],
		with: {
			games: true,
		},
		limit: 10,
	});
	return {
		randomAlbums,
		games: allGames,
		latestAlbums,
		popularAlbums,
	};
};

export const actions: Actions = {
	createCompany,
	createGame,
	createAlbum,
};
