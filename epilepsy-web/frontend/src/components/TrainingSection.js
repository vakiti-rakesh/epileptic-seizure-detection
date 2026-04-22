import React, { useState } from "react";
import axios from "axios";
import TrainingGraph from "./TrainingGraph";

function TrainingSection() {
  const [file, setFile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrain = async () => {
    if (!file) {
      alert("Upload training dataset");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/train", formData);
      setMetrics(res.data);
    } catch (err) {
      alert("Training failed");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>🔧 Train Model (Developer Mode)</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button className="primary-btn" onClick={handleTrain}>
        Train Model
      </button>

      {loading && <p>Training in progress...</p>}

      {metrics && (
        <>
          <div className="metrics">
            <p>Version: {metrics.version}</p>
            <p>Accuracy: {metrics.accuracy.toFixed(2)}%</p>
            <p>Precision: {metrics.precision.toFixed(2)}%</p>
            <p>Recall: {metrics.recall.toFixed(2)}%</p>
            <p>F1 Score: {metrics.f1_score.toFixed(2)}%</p>
          </div>

          <TrainingGraph metrics={metrics} />
        </>
      )}
    </div>
  );
}

export default TrainingSection;
