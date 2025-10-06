<script lang="ts">
    import { onMount } from "svelte";
    import { model_options } from "$lib/api/model";
    import { modelStore } from "$lib/stores/modelStore";

    let model_options_list: string[] = [];
    let selected_model: string = "default";
    let predictions = new Map<number, number[]>();
    let table_header: string[] = [];

    import {
        get_table_schema,
        get_table_data,
        get_table_length,
    } from "$lib/api/nexa";

    import NexaTable from "$components/table.nexa.svelte";
    import Model from "$components/model.svelte";
    import LineGraph from "$components/LineGraph.svelte";

    let total_rows = 0;
    let tableHovered = false;
    let visible_data: string[][] = [];
    let current_range = { start: 0, end: 0 };

    // Sample data for LineGraph
    const graphData: { time: Date; value: number; low: number; high: number }[] =
        [];
    const now = new Date();
    for (let i = 0; i < 100; i++) {
        const time = new Date(now.getTime() + i * 3600 * 1000 * 6); // 6-hourly data
        const value = Math.sin(i * 0.2) * 40 + 50;
        graphData.push({
            time: time,
            value: value,
            low: value - (10 + Math.random() * 10),
            high: value + (10 + Math.random() * 10),
        });
    }

    const graphThreshold = 65;

    const floatingLabels = [
        {
            xValue: graphData[8].time,
            yValue: graphData[8].value,
            text: "First Peak",
        },
        {
            xValue: graphData[24].time,
            yValue: graphData[24].value,
            text: "Second Peak",
        },
    ];

    function handleZoom(event: CustomEvent<[Date, Date]>) {
        console.log("Zoom region selected:", event.detail);
        // Here you could filter data or perform other actions based on the new domain
    }

    function handleZoomReset() {
        console.log("Zoom has been reset");
    }

    onMount(async () => {
        model_options_list = await model_options();
        total_rows = await get_table_length();
        table_header = await get_table_schema();
    });

    async function callback_selection(row: string[]) {
        alert(`Selected row: ${row.join(", ")}`);
    }

    async function handle_data_change(
        e: CustomEvent<{
            data: string[][];
            range: { start: number; end: number };
        }>,
    ) {
        visible_data = e.detail.data;
        current_range = e.detail.range;
    }

    async function classify_visible_data() {
        if (!visible_data || visible_data.length === 0 || !$modelStore.features)
            return;

        const { features: model_features } = $modelStore.features;

        // Create a map of header names to their index for quick lookup
        const header_index_map = new Map(table_header.map((h, i) => [h, i]));

        // Get the indices of the features required by the model
        const feature_indices = model_features
            .map((f) => header_index_map.get(f))
            .filter((i) => i !== undefined) as number[];

        // Map the visible data to the format expected by the model
        const prediction_data = visible_data.map((row) => {
            return feature_indices.map((index) => Number(row[index]));
        });

        const results = await modelStore.predict(prediction_data);

        results.forEach((result, index) => {
            const absoluteIndex = current_range.start + index;
            predictions.set(absoluteIndex, result); // Mutate the existing map
        });

        // Force reactivity by creating a new Map and reassigning
        predictions = new Map(predictions);

        console.log("Predictions updated:", predictions);
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
                {predictions}
                on:data_changed={handle_data_change}
            />
        </div>
        <div
            class="grid-section bg-gray-200 rounded-lg overflow-hidden"
            class:col-span-2={!tableHovered}
            class:col-span-1={tableHovered}
            class:blurred={tableHovered}
        >
            <div
                class="grid-section-graph bg-gray-200 rounded-lg overflow-hidden"
                class:col-span-2={!tableHovered}
                class:col-span-1={tableHovered}
            >
                <LineGraph
                    data={graphData}
                    threshold={graphThreshold}
                    floatingLabels={floatingLabels}
                    on:zoomRegionSelected={handleZoom}
                    on:zoomReset={handleZoomReset}
                />
            </div>
        </div>
        <div
            class="grid-section bg-gray-200 rounded-lg overflow-hidden col-span-1"
            class:blurred={tableHovered}
        >
            <div class="flex items-center justify-center h-full text-gray-500">
                <Model
                    {selected_model}
                    {model_options_list}
                    on:predict={classify_visible_data}
                />
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
    .grid-section-graph {
        position: relative;
        width: 100%;
        height: 90%;
    }
</style>
