import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box
} from "@mui/material";
import ConfusionMatrixChart from "./ConfusionMatrixChart";
import TrainingGraph from "./TrainingGraph";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { trainModel, predictModel } from "../services/api";
import MetricCard from "./MetricCard";
import Loader from "./Loader";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handleTrain = async (e) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const res = await trainModel(formData);
    setMetrics(res.data);
    setLoading(false);
  };

  const handlePredict = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const res = await predictModel(formData);

    const result = res.data.prediction.map((p) =>
      p === 0 ? "Interictal (Normal)" : "Preictal (Seizure)"
    );

    setPrediction(result.join(", "));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" align="center" gutterBottom color="primary">
        Epileptic Seizure Prediction Dashboard
      </Typography>

      {/* TRAIN SECTION */}
      <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Train Model
        </Typography>

        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ backgroundColor: "#1976d2" }}
        >
          Upload Training Dataset
          <input hidden type="file" onChange={handleTrain} />
        </Button>

        {loading && <Loader />}

        {metrics && (
          <>
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item>
                <MetricCard title="Accuracy" value={metrics.accuracy} />
              </Grid>
              <Grid item>
                <MetricCard title="Precision" value={metrics.precision} />
              </Grid>
              <Grid item>
                <MetricCard title="Recall" value={metrics.recall} />
              </Grid>
              <Grid item>
                <MetricCard title="F1 Score" value={metrics.f1_score} />
              </Grid>
            </Grid>

            {/* Confusion Matrix */}
            {metrics.confusion_matrix && (
              <Paper sx={{ p: 3, mt: 4 }}>
                <Typography variant="h6">
                  Confusion Matrix
                </Typography>
                <ConfusionMatrixChart matrix={metrics.confusion_matrix} />
              </Paper>
            )}

            {/* Training Graph */}
            {metrics.train_accuracy && (
              <Paper sx={{ p: 3, mt: 4 }}>
                <Typography variant="h6">
                  Training Accuracy & Loss
                </Typography>
                <TrainingGraph
                  accuracy={metrics.train_accuracy}
                  loss={metrics.train_loss}
                />
              </Paper>
            )}
          </>
        )}
      </Paper>

      {/* PREDICTION SECTION */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Predict Seizure
        </Typography>

        <Button
          variant="contained"
          component="label"
          color="secondary"
          startIcon={<CloudUploadIcon />}
        >
          Upload Test Dataset
          <input hidden type="file" onChange={handlePredict} />
        </Button>

        {prediction && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Prediction Result:
            </Typography>
            <Typography color="secondary">
              {prediction}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
