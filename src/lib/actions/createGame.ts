import { companies, db, games } from '$lib/db';
import { createGameSchema } from '$lib/validation';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const createGame = async ({ request }) => {
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
};
