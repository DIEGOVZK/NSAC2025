import { json } from '@sveltejs/kit'

export async function GET({ url }: { url: URL }) {
    const _params_id = url.searchParams.get('id')
    return json({ id: _params_id })
}
