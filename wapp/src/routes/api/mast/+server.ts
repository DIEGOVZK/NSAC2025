import { json } from '@sveltejs/kit'
import * as fs from 'fs';
import { FITSParser } from 'jsfitio';


let fileBuffer: Buffer;

export async function GET({ url }: { url: URL }) {
    const _params_id = url.searchParams.get('id')
    
    try {
        fileBuffer = fs.readFileSync(`./static/fits/${_params_id}.fits`);
        const parser = new FITSParser(fileBuffer);
        const data = parser.parse();
        return json({ id: _params_id, data });
    } catch (error) {
        console.error("Error reading FITS file:", error);
        return json({ error: "Failed to read FITS file" }, { status: 500 });
    }

}
