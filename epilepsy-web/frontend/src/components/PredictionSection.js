import React, { useState, useEffect } from "react";
import axios from "axios";
import ProbabilityGauge from "./ProbabilityGauge";
import FeatureImportanceChart from "./FeatureImportanceChart";
import generateReport from "./ReportGenerator";

// Encryption utility functions
export const toBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }

  return window.btoa(binary);
};

export const fromBase64 = (b64) =>
  Uint8Array.from(window.atob(b64), (c) => c.charCodeAt(0));

export async function generateAESKey() {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(key, data) {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return {
    iv: toBase64(iv),
    ciphertext: toBase64(encrypted),
  };
}

export async function exportKey(key) {
  const raw = await crypto.subtle.exportKey("raw", key);
  return toBase64(raw);
}

function PredictionSection() {
  const [file, setFile] = useState(null);
  const [city, setCity] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch available models
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/models")
      .then((res) => {
        const available = res.data.available_models || [];
        setModels(available);

        if (available.length > 0) {
          setSelectedModel(available[available.length - 1]);
        }
      })
      .catch((err) => console.error("Error loading models", err));
  }, []);

  const handlePredict = async () => {
    if (!file || !city) {
      alert("Please upload file and enter city.");
      return;
    }

    setLoading(true);

    try {
      // Read file as ArrayBuffer
      const buffer = await file.arrayBuffer();

      // Generate AES key
      const aesKey = await generateAESKey();

      // Encrypt dataset
      const encrypted = await encryptData(aesKey, buffer);

      // Export key
      const exportedKey = await exportKey(aesKey);

      const payload = {
        encrypted: encrypted.ciphertext,
        iv: encrypted.iv,
        key: exportedKey,
        city: city,
        version: selectedModel,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/predictEncrypted",
        payload
      );

      setResult(response.data);
    } catch (error) {
      console.error("Prediction error", error);
      alert("Prediction failed");
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2>🔍 Secure Test Model (AES-GCM)</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />

      <input
        type="text"
        placeholder="Enter City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <br /><br />

      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        {models.length === 0 ? (
          <option>No Models Available</option>
        ) : (
          models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))
        )}
      </select>

      <br /><br />

      <button className="primary-btn" onClick={handlePredict}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {loading && <p>Prediction in progress...</p>}

      {result && (
        <div className="metrics">

          <p><strong>Model Used:</strong> {result.version_used}</p>
          <p><strong>Risk Level:</strong> {result.risk_level}</p>

          <ProbabilityGauge
            probability={result.average_probability}
            riskLevel={result.risk_level}
          />

          <h4>Recommended Hospitals:</h4>
          <ul>
            {result.hospitals.map((h, i) => (
              <li key={i}>
                <strong>{h.name}</strong> — {h.speciality} ({h.city})
              </li>
            ))}
          </ul>

          {/* Explainable AI Section */}
          {result.feature_importance && (
            <div className="metrics" style={{ marginTop: "30px" }}>
              <h3 style={{ color: "#1976d2", marginBottom: "15px" }}>
                🔎 Explainable AI – Feature Importance
              </h3>

              <FeatureImportanceChart
                features={result.feature_importance}
              />
            </div>
          )}
          <br />
          <button
            className="primary-btn"
            onClick={() => generateReport(result, city)}
          >
            Download Medical Report
          </button>

        </div>
      )}
    </div>
  );
}

export default PredictionSection;