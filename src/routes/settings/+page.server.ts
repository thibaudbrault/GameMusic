import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { albums, companies, db, games, users } from '$lib/db';
import { eq } from 'drizzle-orm';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import {
	updateAlbumSchema,
	updateCompanySchema,
	updateGameSchema,
} from '$lib/validation';
import { albumSlug, renameFileWithExtension } from '$lib/utils';
import { deleteFile, uploadFile } from '$lib/server';
import { CLOUDFRONT_URL } from '$env/static/private';
import { createAlbum, createGame, createCompany } from '$lib/actions';

export const load: PageServerLoad = async (event) => {
	const { session, user } = await event.locals.safeGetSession();
	if (!session || !user) throw redirect(303, '/');
	const updateAlbumForm = await superValidate(zod(updateAlbumSchema));
	const updateGameForm = await superValidate(zod(updateGameSchema));
	const updateCompanyForm = await superValidate(zod(updateCompanySchema));
	const allAlbums = await db.query.albums.findMany({
		with: {
			games: true,
		},
	});
	const profile = await db.query.users.findFirst({
		where: eq(users.email, user.email!),
	});
	if (profile?.role !== 'admin') throw redirect(303, '/');
	return {
		albums: allAlbums,
		updateAlbumForm,
		updateGameForm,
		updateCompanyForm,
	};
};

export const actions: Actions = {
	createAlbum,
	createGame,
	createCompany,
	updateAlbum: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(updateAlbumSchema), {
			id: 'updateAlbum',
		});
		if (!form.valid) {
			return fail(400, withFiles({ form }));
		}
		const { name, game, cover, release, albumId } = form.data;
		const slug = albumSlug(name);
		const albumExists = await db.query.albums.findFirst({
			where: eq(albums.slug, slug),
			columns: {
				id: true,
			},
		});
		if (albumExists) {
			return setError(form, 'name', 'Album already exists');
		}
		let filename = renameFileWithExtension(cover.name, 'cover');
		filename = `${slug}/${crypto.randomUUID()}${filename}`;
		const findGame = await db.query.games.findFirst({
			where: eq(companies.value, game!),
		});
		if (!findGame) {
			return setError(form, 'game', 'Game not found');
		}
		const gameId = findGame.id;
		if (cover) {
			const album = await db.query.albums.findFirst({
				where: eq(albums.id, albumId),
				columns: {
					cover: true,
				},
			});
			await deleteFile(album?.cover);
			await uploadFile(
				Buffer.from(await cover.arrayBuffer()),
				filename,
				cover.type,
			);
		}
		const coverUrl = CLOUDFRONT_URL + filename;
		await db
			.update(albums)
			.set({ name, cover: coverUrl, release, gameId })
			.where(eq(albums.id, albumId));
		return { message: 'Album name updated successfully' };
	},
	updateGame: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(updateGameSchema), {
			id: 'updateGame',
		});
		if (!form.valid) {
			return fail(400, { form });
		}
		const { name, gameId, company } = form.data;
		const value = name?.toLowerCase();
		const gameExists = await db.query.games.findFirst({
			where: eq(games.value, value!),
		});
		if (gameExists) {
			return setError(form, 'name', 'Game already exists');
		}
		const findCompany = await db.query.companies.findFirst({
			where: eq(companies.value, company!),
		});
		if (!findCompany) {
			return setError(form, 'company', 'Company not found');
		}
		const companyId = findCompany.id;
		await db
			.update(games)
			.set({ name, value, companyId })
			.where(eq(games.id, gameId));
		return { message: 'Game name updated successfully' };
	},
	updateCompany: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(updateCompanySchema), {
			id: 'updateCompany',
		});
		if (!form.valid) {
			return fail(400, { form });
		}
		const { name, companyId } = form.data;
		const value = name?.toLowerCase();
		const companyExists = await db.query.companies.findFirst({
			where: eq(companies.value, value),
		});
		if (companyExists) {
			return setError(form, 'name', 'Company already exists');
		}
		await db
			.update(companies)
			.set({ name, value })
			.where(eq(companies.id, companyId));
		return { message: 'COmpany name updated successfully' };
	},
};
