import {
	companies,
	db,
	games,
	type SelectAlbum,
	type SelectMusic,
} from '$lib/db';
import {
	createAlbumSchema,
	createCompanySchema,
	createGameSchema,
} from '$lib/validation';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { session } }) => {
	const createAlbumForm = await superValidate(zod(createAlbumSchema));
	const createGameForm = await superValidate(zod(createGameSchema));
	const createCompanyForm = await superValidate(zod(createCompanySchema));
	const allGames = await db.select().from(games).orderBy(games.name);
	const allCompanies = await db
		.select()
		.from(companies)
		.orderBy(companies.name);
	let allPlaylists;
	const favoritesMusics: SelectMusic[] = [];
	const favoritesAlbums: SelectAlbum[] = [];
	// if (session?.user?.email) {
	// 	user = await db.query.users.findFirst({
	// 		where: eq(users.email, session?.user?.email),
	// 	});
	// 	allPlaylists = await db.query.playlists.findMany({
	// 		where: eq(playlists.userId, user?.id),
	// 		with: {
	// 			musics: {
	// 				with: {
	// 					music: {
	// 						with: {
	// 							musicsToAuthors: {
	// 								with: {
	// 									author: true,
	// 								},
	// 							},
	// 							album: {
	// 								columns: {
	// 									cover: true,
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	});
	// 	const musicsRequest = await db.query.userFavoritesMusics.findMany({
	// 		where: eq(userFavoritesMusics.userId, user?.id),
	// 		with: {
	// 			music: {
	// 				with: {
	// 					musicsToAuthors: {
	// 						with: {
	// 							author: true,
	// 						},
	// 					},
	// 					album: {
	// 						columns: {
	// 							cover: true,
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	});
	// 	const albumsRequest = await db.query.userFavoritesAlbums.findMany({
	// 		where: eq(userFavoritesAlbums.userId, user?.id),
	// 		with: {
	// 			album: true,
	// 		},
	// 	});
	// 	if (musicsRequest) {
	// 		musicsRequest.forEach((item) => {
	// 			favoritesMusics.push(item.music);
	// 		});
	// 	}
	// 	if (albumsRequest) {
	// 		albumsRequest.forEach((item) => {
	// 			favoritesAlbums.push(item.album);
	// 		});
	// 	}
	// }
	return {
		createAlbumForm,
		createGameForm,
		createCompanyForm,
		games: allGames,
		companies: allCompanies,
		playlists: allPlaylists,
		favoritesMusics,
		favoritesAlbums,
		session,
	};
};
