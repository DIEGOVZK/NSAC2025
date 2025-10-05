<script lang="ts">
    import { onMount } from "svelte";

    // Props
    export let number_of_rows = 10;
    export let total_range = { start: 0, end: 1000 };
    export let get_table_data: (
        start: number,
        end: number,
    ) => Promise<string[][]>;
    export let get_table_schema: () => Promise<string[]>;
    export let callback_selection: (row: string[]) => void = () => {};

    // State
    let table_header: string[] = [];
    let table_visible: string[][] = [];
    let loading = false;
    let search_query = "";
    let current_range = {
        start: total_range.start,
        end: total_range.start + number_of_rows,
    };

    // Computed
    $: canRollUp = current_range.start > total_range.start;
    $: canRollDown = current_range.end < total_range.end;

    // Methods
    async function roll(direction: "up" | "down") {
        const delta = direction === "down" ? number_of_rows : -number_of_rows;
        const nextStart = Math.max(
            total_range.start,
            current_range.start + delta,
        );
        if (nextStart === current_range.start) return;
        const nextEnd = Math.min(total_range.end, nextStart + number_of_rows);
        current_range = { start: nextStart, end: nextEnd };

        loading = true;

        table_visible = await get_table_data(
            current_range.start,
            current_range.end,
        );

        loading = false;
    }

    function handle_search() {
        // Implement search functionality here
        console.log("Searching for:", search_query);
    }

    onMount(async () => {
        loading = true;
        try {
            [table_header, table_visible] = await Promise.all([
                get_table_schema(),
                get_table_data(current_range.start, current_range.end),
            ]);
        } finally {
            loading = false;
        }
    });
</script>

<div class="w-full h-full flex flex-col">
    <!-- Search Bar -->
    <div class="mb-4 flex-shrink-0">
        <form on:submit|preventDefault={handle_search} class="relative">
            <input
                type="search"
                bind:value={search_query}
                placeholder="Search..."
                class="block w-full rounded-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-4 pr-12 py-3"
            />
            <button
                type="submit"
                class="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-400 text-white rounded-full hover:bg-indigo-500 transition-colors duration-150 text-sm font-medium"
            >
                Search
            </button>
        </form>
    </div>

    <div class="border border-indigo-400 rounded-lg overflow-auto flex-1 min-h-0 shadow-lg">
        <div class="relative">
            <table class="w-full border-collapse">
                <thead class="bg-indigo-400 text-white sticky top-0 z-10">
                    <tr>
                        {#each table_header as header}
                            <th
                                class="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider border-b-2 border-indigo-400"
                            >
                                {header}
                            </th>
                        {/each}
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each Array(number_of_rows) as _, ri}
                        <tr
                            class="hover:bg-indigo-200 transition-colors duration-150 {table_visible[ri] ? 'cursor-pointer' : ''}"
                            on:click={() => {
                                if (table_visible[ri]) {
                                    callback_selection(table_visible[ri]);
                                }
                            }}
                        >
                            {#each Array(table_header.length) as _, ci}
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                >
                                    {table_visible[ri]?.[ci] ?? ""}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
{#if loading}
    <div
        class="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-20"
    >
        <div class="text-indigo-600 text-lg font-semibold drop-shadow-lg">
            Loading…
        </div>
    </div>
{/if}
        </div>
    </div>

    <div class="flex items-center justify-center gap-4 mt-4 flex-shrink-0">
        <button
            on:click={() => roll("up")}
            disabled={!canRollUp || loading}
            class="px-4 py-2 bg-indigo-400 text-white rounded-md hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150 font-medium"
        >
            ← Previous
        </button>
        <span class="text-sm text-gray-700 font-medium">
            Rows {current_range.start} - {Math.max(0, current_range.end - 1)} of
            {total_range.end}
        </span>
        <button
            on:click={() => roll("down")}
            disabled={!canRollDown || loading}
            class="px-4 py-2 bg-indigo-400 text-white rounded-md hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150 font-medium"
        >
            Next →
        </button>
    </div>
</div>
