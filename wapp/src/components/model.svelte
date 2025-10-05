<!-- This is a parent component to store and handle TF.js general operations -->

<script lang="ts">
    import * as tf from "@tensorflow/tfjs";

    let model: tf.LayersModel | tf.GraphModel | null = null;
    let metadata: { type: string; name: string; [key: string]: any } | null =
        null;

    export let selected_model: string;

    import { load_model, load_model_metadata } from "$lib/api/model";
    import GraphModel from "./model.graph.svelte";
    // import LayersModel from "./model.layers.svelte";

    export let model_options_list: string[] = [];


    async function load() {
        // Load metadata first to determine model type
        metadata = await load_model_metadata(selected_model);
        console.log("Model metadata:", metadata);

        // Load the model
        model = await load_model(selected_model);
        console.log("Model loaded:", model);
    }
</script>

<select
    bind:value={selected_model}
    class="mt-4 px-4 py-2 bg-indigo-400 text-white rounded-md hover:bg-indigo-500 transition-colors duration-150 font-medium border-0 focus:ring-2 focus:ring-indigo-500"
>
    {#each model_options_list as option}
        <option value={option}>{option}</option>
    {/each}
</select>
<button
    on:click={async () => {
        await load();
    }}
    class="mt-4 px-4 py-2 bg-indigo-400 text-white rounded-md hover:bg-indigo-500 transition-colors duration-150 font-medium border-0 focus:ring-2 focus:ring-indigo-500"
>
    Load Model
</button>

{#if model && metadata}
    <!-- Conditionally render based on model type -->
    {#if metadata.format === "graph-model"}
        <GraphModel model={model as tf.GraphModel} />
    {:else if metadata.format === "layers-model"}
        <!-- <LayersModel model={model as tf.LayersModel}/> -->
        <div class="p-4 bg-yellow-100 text-yellow-800 rounded">
            <p>LayersModel component not yet implemented</p>
        </div>
    {:else}
        <div class="p-4 bg-orange-100 text-orange-800 rounded">
            <p>Unknown model type: {metadata.format}</p>
        </div>
    {/if}
{/if}
