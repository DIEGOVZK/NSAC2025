<script lang="ts">
    import { onMount } from "svelte";

    // const inputTensor = tf.tensor2d([[/* your 8 features */]]);
    // const prediction = model.predict(inputTensor) as tf.Tensor;

    let loading = true;

    onMount(async () => {
        loading = false;
    });
</script>

{#if loading}
    <p class="bg-red-500 text-white px-4 py-2 rounded" aria-live="polite">Loading ML Model...</p>
{:else}
    <p class="bg-green-500 text-white px-4 py-2 rounded" aria-live="polite">Model ready for client-side inference.</p>
{/if}
