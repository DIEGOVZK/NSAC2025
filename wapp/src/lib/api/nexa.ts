export async function get_table_schema(): Promise<string[]> {
    const res = await fetch("/api/nexa/schema");
    if (!res.ok) throw new Error("Failed to load schema");
    return res.json();
}

export async function get_table_data(start: number, end: number): Promise<string[][]> {
    const params = new URLSearchParams({
        start: String(start),
        end: String(end),
    });
    const res = await fetch(`/api/nexa/range?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to load data");
    return res.json();
}

export async function get_table_length(): Promise<number> {
    const res = await fetch("/api/nexa/lenght");
    if (!res.ok) throw new Error("Failed to load length");
    const data = await res.json();
    return data.length;
}