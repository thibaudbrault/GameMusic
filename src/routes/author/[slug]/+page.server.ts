import { createAlbum, createCompany, createGame } from '$lib/actions';
import { authors, db, musicsToAuthors, type SelectMusic } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;
	const author = await db.query.authors.findFirst({
		where: eq(authors.slug, slug),
	});
	if (!author) {
		return redirect(300, '/');
	}
	const allMusics: SelectMusic[] = [];
	const allMusicsRequest = await db.query.musicsToAuthors.findMany({
		where: eq(musicsToAuthors.authorId, author.id),
		with: {
			music: {
				with: {
					authors: {
						with: {
							author: true,
						},
					},
					album: {
						columns: {
							cover: true,
						},
					},
				},
			},
		},
	});
	if (allMusicsRequest) {
		allMusicsRequest.forEach((item) => {
			allMusics.push(item.music);
		});
	}
	return {
		author,
		musics: allMusics,
	};
};

export const actions: Actions = {
	createAlbum,
	createGame,
	createCompany,
};
