import { db, playlists } from '$lib/db';
import {
	createPlaylistSchema,
	deletePlaylistSchema,
	playlistSchema,
	updatePlaylistSchema,
} from '$lib/validation';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';
import { createAlbum, createGame, createCompany } from '$lib/actions';

export const load: PageServerLoad = async (event) => {
	const playlistForm = await superValidate(zod(playlistSchema));
	const { session } = await event.locals.safeGetSession();
	if (!session) throw redirect(303, '/login');
	return {
		playlistForm,
	};
};

export const actions: Actions = {
	createAlbum,
	createGame,
	createCompany,
	createPlaylist: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(createPlaylistSchema), {
			id: 'createPlaylist',
		});
		if (!form.valid) {
			return fail(400, { form });
		}
		const { name, userId } = form.data;
		const value = name.toLowerCase();
		const playlistExists = await db.query.playlists.findFirst({
			where: (playlists, { eq, and }) =>
				and(eq(playlists.name, name), eq(playlists.userId, userId)),
		});
		if (playlistExists) {
			return setError(form, 'name', 'Album already exists');
		}
		await db.insert(playlists).values({
			name,
			value,
			userId,
		});
		return message(form, 'Playlist created successfully');
	},
	updatePlaylist: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(updatePlaylistSchema), {
			id: 'updatePlaylist',
		});
		if (!form.valid) {
			return fail(400, { form });
		}
		const { name, userId, id } = form.data;
		const value = name.toLowerCase();
		await db
			.update(playlists)
			.set({ name, value })
			.where(and(eq(playlists.id, id), eq(playlists.userId, userId)));
		return message(form, 'Playlist updated successfully');
	},
	deletePlaylist: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(deletePlaylistSchema), {
			id: 'deletePlaylist',
		});
		if (!form.valid) {
			return fail(400, { form });
		}
		const { userId, id } = form.data;
		await db
			.delete(playlists)
			.where(and(eq(playlists.id, id), eq(playlists.userId, userId)));
		return message(form, 'Playlist deleted successfully');
	},
};
