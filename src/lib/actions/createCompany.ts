import { companies, db } from '$lib/db';
import { createCompanySchema } from '$lib/validation';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const createCompany = async ({ request }) => {
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
};
