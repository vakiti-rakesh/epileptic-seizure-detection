import React from "react";
import "./App.css";
import TrainingSection from "./components/TrainingSection";
import PredictionSection from "./components/PredictionSection";

function App() {
  return (
    <div className="container">
      <h1>🧠 AI Seizure Risk Prediction System</h1>

      <TrainingSection />

      <PredictionSection />

      <footer>
        ⚠️ This system is for research purposes only. Not a medical diagnosis.
      </footer>
    </div>
  );
}

export default App;
