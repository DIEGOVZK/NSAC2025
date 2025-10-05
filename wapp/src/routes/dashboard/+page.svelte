<script lang="ts">
    import { onMount } from "svelte";
    import { model_options } from "$lib/api/model";

    let model_options_list: string[] = [];
    let selected_model: string = "default";
    let model_features: string[] = [];

    import {
        get_table_schema,
        get_table_data,
        get_table_length,
    } from "$lib/api/nexa";

    import NexaTable from "$components/table.nexa.svelte";
    import Model from "$components/model.svelte";

    let total_rows = 0;
    let tableHovered = false;

    onMount(async () => {
        model_options_list = await model_options();
        total_rows = await get_table_length();
    });

    async function callback_selection(row: string[]) {
        alert(`Selected row: ${row.join(", ")}`);
    }
</script>

<!-- add a spacer div -->
<div class="h-8"></div>

<div class="w-full max-h-[calc(100vh-8rem)] px-4 pb-4">
    <div class="grid grid-cols-4 gap-6 max-h-full">
        <div
            class="grid-section min-w-0 flex flex-col max-h-[calc(100vh-8rem)]"
            class:col-span-1={!tableHovered}
            class:col-span-3={tableHovered}
            role="region"
            on:mouseenter={() => (tableHovered = true)}
            on:mouseleave={() => (tableHovered = false)}
        >
            <NexaTable
                number_of_rows={20}
                total_range={{ start: 0, end: total_rows }}
                {get_table_schema}
                {get_table_data}
                {callback_selection}
            />
        </div>
        <div
            class="grid-section bg-gray-200 rounded-lg overflow-hidden"
            class:col-span-2={!tableHovered}
            class:col-span-1={tableHovered}
            class:blurred={tableHovered}
        >
            <div class="flex items-center justify-center h-full text-gray-500">
                <span class="text-xl">Graph Placeholder (50%)</span>
            </div>
        </div>
        <div
            class="grid-section bg-gray-200 rounded-lg overflow-hidden col-span-1"
            class:blurred={tableHovered}
        >
            <div class="flex items-center justify-center h-full text-gray-500">
                <span class="text-xl">Control Placeholder (25%)</span>
                <Model {selected_model} {model_options_list} />
            </div>
        </div>
    </div>
</div>

<style>
    .grid-section {
        transition: all 0.3s ease-in-out;
    }

    .grid-section.blurred {
        filter: blur(2px);
        opacity: 0.5;
    }
</style>
