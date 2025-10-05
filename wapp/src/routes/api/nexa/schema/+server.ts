import { json, type RequestHandler } from '@sveltejs/kit';
import { getTableColumns } from 'drizzle-orm';
import { transits } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
  const cols = Object.keys(getTableColumns(transits));
  return json(cols);
};