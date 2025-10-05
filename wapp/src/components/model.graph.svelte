<!-- This is a nested component for Graph Models  -->

<script lang="ts">

    import * as tf from "@tensorflow/tfjs";
    export let model: tf.GraphModel;

    // Models specific functions

</script>

<!-- General UI components -->
<!-- Cool example -->
<div class="p-4 bg-blue-100 text-blue-800 rounded">
    <h2 class="text-lg font-semibold mb-2">Graph Model Details</h2>
    <p>Number of Inputs: {model.inputs.length}</p>
    <p>Number of Outputs: {model.outputs.length}</p>
</div>

<!-- Model specific components -->


