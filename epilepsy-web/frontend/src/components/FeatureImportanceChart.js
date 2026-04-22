import { Bar } from "react-chartjs-2";

function FeatureImportanceChart({ features }) {

  const data = {
    labels: features.map(f => f.feature),
    datasets: [
      {
        label: "Feature Importance",
        data: features.map(f => f.importance),
        backgroundColor: "#ff6384"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
        legend: { display: false }
    }
  };

  return <Bar data={data} options={options} />;
}

export default FeatureImportanceChart;