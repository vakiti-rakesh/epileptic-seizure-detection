import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function ProbabilityGauge({ probability, riskLevel }) {

  const remaining = 100 - probability;

  let color;

  if (riskLevel === "High") {
    color = "#ff4d4f";
  } else if (riskLevel === "Moderate") {
    color = "#faad14";
  } else {
    color = "#52c41a";
  }

  const data = {
    datasets: [
      {
        data: [probability, remaining],
        backgroundColor: [color, "#2f2f2f"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      animateRotate: true,
      duration: 2000,
    },
  };

  return (
    <div style={{ width: "250px", margin: "20px auto", position: "relative" }}>
      <Doughnut data={data} options={options} />

      {/* Center Text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "24px",
          fontWeight: "bold",
          color: color,
        }}
      >
        {probability.toFixed(1)}%
      </div>
    </div>
  );
}

export default ProbabilityGauge;