<!-- This is a parent component to store and handle TF.js general operations -->

<script lang="ts">
    import { modelStore } from "$lib/stores/modelStore";
    import { createEventDispatcher } from "svelte";

    export let selected_model: string;
    export let model_options_list: string[] = [];

    import GraphModel from "./model.graph.svelte";
    import * as tf from "@tensorflow/tfjs";
    // import LayersModel from "./model.layers.svelte";

    const dispatch = createEventDispatcher();

    function load() {
        modelStore.loadModel(selected_model);
    }

    function predict() {
        dispatch("predict");
    }
</script>

<div class="flex flex-col h-screen gap-4 p-4">
    <!-- Button and Dropdown in horizontal layout -->
    <div class="flex-none flex gap-4">
        <select
            bind:value={selected_model}
            class="flex-1 px-4 py-2 bg-indigo-400 text-white rounded-md hover:bg-indigo-500 transition-colors duration-150 font-medium border-0 focus:ring-2 focus:ring-indigo-500"
        >
            {#each model_options_list as option (option)}
                <option value={option}>{option}</option>
            {/each}
        </select>

        <button
            on:click={load}
            disabled={$modelStore.loading}
            class="flex-1 px-4 py-2 bg-indigo-400 text-white rounded-md hover:bg-indigo-500 transition-colors duration-150 font-medium border-0 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
            {$modelStore.loading ? "Loading..." : "Load Model"}
        </button>
    </div>

    <button
        on:click={predict}
        disabled={!$modelStore.model || $modelStore.loading}
        class="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-150 font-medium border-0 focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
    >
        Classify Visible Data
    </button>

    <!-- Model Component - takes remaining space -->
    <div class="flex-1 overflow-auto">
        {#if $modelStore.error}
            <div class="p-4 bg-red-100 text-red-800 rounded">
                <p>Error: {$modelStore.error}</p>
            </div>
        {/if}
        {#if $modelStore.model && $modelStore.metadata && $modelStore.features}
            <!-- Conditionally render based on model type -->
            {#if $modelStore.metadata.format === "graph-model"}
                <GraphModel
                    model={$modelStore.model as tf.GraphModel}
                    metadata={$modelStore.metadata}
                    features={$modelStore.features}
                />
            {:else if $modelStore.metadata.format === "layers-model"}
                <!-- <LayersModel model={model as tf.LayersModel}/> -->
                <div class="p-4 bg-yellow-100 text-yellow-800 rounded">
                    <p>LayersModel component not yet implemented</p>
                </div>
            {:else}
                <div class="p-4 bg-orange-100 text-orange-800 rounded">
                    <p>Unknown model type: {$modelStore.metadata.format}</p>
                </div>
            {/if}
        {/if}
    </div>
</div>

