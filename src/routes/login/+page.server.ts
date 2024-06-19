import { createAlbum, createGame, createCompany } from '$lib/actions';
import { redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	createAlbum,
	createGame,
	createCompany,
	login: async ({ locals: { supabase } }) => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: 'http://localhost:5173/auth/callback',
			},
		});
		if (error) {
			console.error(error);
			return redirect(303, '/auth/error');
		}
		if (data.url) {
			return redirect(302, data.url);
		}
	},
};
