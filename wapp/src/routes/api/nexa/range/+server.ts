import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { transits } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ url }) => {
    const start = Number(url.searchParams.get('start') ?? '0');
    const end = Number(url.searchParams.get('end') ?? '50');
    const limit = Math.max(0, end - start);

    const rows = db.select().from(transits).limit(limit).offset(start).all();
    const data = rows.map((row) => Object.values(row).map((v) => (v == null ? '' : String(v))));
    return json(data);
};