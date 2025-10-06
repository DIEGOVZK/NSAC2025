export async function get_fits_data(id: string): Promise<number[][]> {
    const res = await fetch(`/api/fits/data?id=${id}`);
    if (!res.ok) throw new Error("Failed to load FITS data");
    return res.json();
}
 