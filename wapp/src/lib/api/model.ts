import * as tf from "@tensorflow/tfjs";

export async function load_model(model_name: string) {
    return await tf.loadGraphModel(`/api/tfjs/${model_name}/model.json`);
}

export async function load_model_metadata(model_name: string) {
    return await fetch(`/api/tfjs/${model_name}/model.json`).then((res) => res.json());
}

export async function model_options() {
    return await fetch("/api/tfjs/models.json").then((res) => res.json()).then(data => data.models);
}

export async function load_features(model_name: string) {
    return await fetch(`/api/tfjs/${model_name}/features.json`).then((res) => res.json());
}
