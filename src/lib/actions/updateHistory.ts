import { db, history } from '$lib/db';
import { sql } from 'drizzle-orm';

export const updateHistory = async ({ request }) => {
	const formData = await request.formData();
	const { musicId, userId } = Object.fromEntries(formData) as {
		musicId: string;
		userId: string;
	};
	await db
		.insert(history)
		.values({ musicId, userId })
		.onConflictDoUpdate({
			target: [history.userId, history.musicId],
			set: {
				listenedAt: sql`now()`,
			},
		});
};
