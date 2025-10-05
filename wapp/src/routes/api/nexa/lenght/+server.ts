import { json, type RequestHandler } from '@sveltejs/kit';
import { count } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { transits } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ url }) => {
    const [{ count: tableCount }] = await db.select({ count: count() }).from(transits);
    return json({ length: tableCount });
};
