import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ConfusionMatrixChart = ({ matrix }) => {
  const data = {
    labels: ["Normal", "Seizure"],
    datasets: [
      {
        label: "Predicted Normal",
        data: [matrix[0][0], matrix[1][0]],
        backgroundColor: "#42a5f5",
      },
      {
        label: "Predicted Seizure",
        data: [matrix[0][1], matrix[1][1]],
        backgroundColor: "#ef5350",
      },
    ],
  };

  return <Bar data={data} />;
};

export default ConfusionMatrixChart;
