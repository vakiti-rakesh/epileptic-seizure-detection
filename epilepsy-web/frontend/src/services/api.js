import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000"
});

export const trainModel = (formData) =>
  API.post("/train", formData);

export const predictModel = (formData) =>
  API.post("/predict", formData);
