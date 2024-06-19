import { createAlbum, createCompany, createGame } from '$lib/actions';
import { db } from '$lib/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const latestAlbums = await db.query.albums.findMany({
		orderBy: (albums, { desc }) => [desc(albums.createdAt)],
		with: {
			games: true,
		},
	});
	return {
		latestAlbums,
	};
};

export const actions: Actions = {
	createAlbum,
	createGame,
	createCompany,
};
