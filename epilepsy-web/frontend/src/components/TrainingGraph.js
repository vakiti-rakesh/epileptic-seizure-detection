import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function TrainingGraph({ metrics }) {
  const data = {
    labels: ["Accuracy", "Precision", "Recall", "F1 Score"],
    datasets: [
      {
        label: "Performance %",
        data: [
          metrics.accuracy,
          metrics.precision,
          metrics.recall,
          metrics.f1_score,
        ],
        backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#FF5722"],
      },
    ],
  };

  return (
    <div style={{ width: "80%", margin: "auto" }}>
      <Bar
        data={data}
        options={{
          responsive: true,
          animation: {
            duration: 2000,
          },
        }}
      />
    </div>
  );
}

export default TrainingGraph;
