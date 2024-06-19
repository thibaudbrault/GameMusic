import { createAlbum, createCompany, createGame } from '$lib/actions';
import { db } from '$lib/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const popularAlbums = await db.query.albums.findMany({
		orderBy: (albums, { desc }) => [desc(albums.popularity)],
		with: {
			games: true,
		},
	});
	return {
		popularAlbums,
	};
};

export const actions: Actions = {
	createAlbum,
	createGame,
	createCompany,
};
