
import { writable, get } from "svelte/store";
import * as tf from "@tensorflow/tfjs";
import {
    load_model,
    load_model_metadata,
    load_features,
} from "$lib/api/model";

// Based on the structure of model.json
export interface SignatureInfo {
    name?: string;
    dtype: string;
    shape?: readonly (number | null)[];
}

export interface ModelMetadata {
    format: string;
    generatedBy: string;
    convertedBy: string;
    signature: {
        inputs: { [key: string]: SignatureInfo };
        outputs: { [key: string]: SignatureInfo };
    };
    modelTopology: unknown;
    weightsManifest: unknown;
}

export interface ModelFeatures {
    features: string[];
    [key: string]: unknown;
}

export interface ModelStore {
    model: tf.LayersModel | tf.GraphModel | null;
    metadata: ModelMetadata | null;
    features: ModelFeatures | null;
    loading: boolean;
    error: string | null;
}

const modelStoreWritable = writable<ModelStore>({
    model: null,
    metadata: null,
    features: null,
    loading: false,
    error: null,
});

function createModelStore() {
    const { subscribe, set, update } = modelStoreWritable;

    async function loadModel(modelName: string) {
        update((store) => ({ ...store, loading: true, error: null }));
        try {
            const [model, metadata, features] = await Promise.all([
                load_model(modelName),
                load_model_metadata(modelName),
                load_features(modelName),
            ]);
            set({ model, metadata, features, loading: false, error: null });
            console.log("Model loaded:", model);
            console.log("Model metadata:", metadata);
            console.log("Model features:", features);
        } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            set({ model: null, metadata: null, features: null, loading: false, error });
            console.error("Failed to load model:", error);
        }
    }

    async function predict(data: number[][]): Promise<number[][]> {
        const model = get(modelStoreWritable).model;

        if (!model) {
            console.warn("Prediction skipped: model not loaded.");
            return [];
        }

        // This is a generic prediction function. You will need to adapt it
        // to your specific model's input/output shape and data format.
        // This example assumes a simple model that takes a 2D tensor and returns a 2D tensor.
        try {
            // Pre-process data (example: convert to tensor)
            // The shape and dtype should match your model's expectations.
            const inputTensor = tf.tensor(data);

            // Run inference
            const outputTensor = model.predict(inputTensor) as tf.Tensor;

            // Post-process results (example: get data from tensor)
            const results = (await outputTensor.array()) as number[][];

            // Clean up tensors
            inputTensor.dispose();
            outputTensor.dispose();

            return results;
        } catch (error) {
            console.error("Prediction failed:", error);
            return [];
        }
    }

    return {
        subscribe,
        loadModel,
        predict,
    };
}

export const modelStore = createModelStore();
