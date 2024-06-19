import { CLOUDFRONT_URL } from '$env/static/private';
import { albums, companies, db } from '$lib/db';
import { uploadFile } from '$lib/server';
import { albumSlug, renameFileWithExtension } from '$lib/utils';
import { createAlbumSchema } from '$lib/validation';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import {
	message,
	setError,
	superValidate,
	withFiles,
} from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const createAlbum = async ({ request }) => {
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
};
