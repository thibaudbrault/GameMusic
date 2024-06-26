import { CLOUDFRONT_URL } from '$env/static/private';
import { albums, companies, db, games } from '$lib/db';
import { uploadFile } from '$lib/server';
import { albumSlug, renameFileWithExtension } from '$lib/utils';
import {
	createAlbumSchema,
	createCompanySchema,
	createGameSchema,
} from '$lib/validation';
import { fail } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import {
	message,
	setError,
	superValidate,
	withFiles,
} from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const album = await db.execute(
		sql`select * from ${albums} order by random() limit 1`,
	);
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
		album,
		latestAlbums,
		popularAlbums,
	};
};

export const actions: Actions = {
	createCompany: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(createCompanySchema), {
			id: 'createCompany',
		});
		if (!form.valid) {
			return fail(400, { form });
		}
		const { name } = form.data;
		const value = name.toLowerCase();
		const companyExists = await db.query.companies.findFirst({
			where: eq(companies.value, value),
		});
		if (companyExists) {
			return setError(form, 'name', 'Company already exists');
		}
		await db.insert(companies).values({
			name,
			value,
		});
		return message(form, 'Company created successfully');
	},
	createGame: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(createGameSchema), {
			id: 'createGame',
		});
		if (!form.valid) {
			return fail(400, { form });
		}
		const { name, company } = form.data;
		const value = name.toLowerCase();
		const gameExists = await db.query.games.findFirst({
			where: eq(games.value, value),
		});
		if (gameExists) {
			return setError(form, 'name', 'Game already exists');
		}
		const findCompany = await db.query.companies.findFirst({
			where: eq(companies.value, company),
		});
		if (!findCompany) {
			return setError(form, 'company', 'Company not found');
		}
		const companyId = findCompany.id;
		await db.insert(games).values({
			name,
			value,
			companyId,
		});
		return message(form, 'Game created successfully');
	},
	createAlbum: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(createAlbumSchema), {
			id: 'createAlbum',
		});
		if (!form.valid) {
			return fail(400, withFiles({ form }));
		}
		const { name, game, cover, release } = form.data;
		const slug = albumSlug(name);
		const albumExists = await db.query.albums.findFirst({
			where: eq(albums.slug, slug),
		});
		if (albumExists) {
			return setError(form, 'name', 'Album already exists');
		}
		let filename = renameFileWithExtension(cover.name, 'cover');
		filename = `${slug}/${crypto.randomUUID()}${filename}`;
		const findGame = await db.query.games.findFirst({
			where: eq(companies.value, game),
		});
		if (!findGame) {
			return setError(form, 'game', 'Game not found');
		}
		const gameId = findGame.id;
		await uploadFile(
			Buffer.from(await cover.arrayBuffer()),
			filename,
			cover.type,
		);
		const coverUrl = CLOUDFRONT_URL + filename;
		await db.insert(albums).values({
			name,
			cover: coverUrl,
			slug,
			release: Number(release),
			gameId,
		});
		return message(form, 'Album created successfully');
	},
};
