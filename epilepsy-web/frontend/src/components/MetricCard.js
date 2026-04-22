import { Card, CardContent, Typography } from "@mui/material";

const MetricCard = ({ title, value }) => {
  return (
    <Card
      sx={{
        minWidth: 200,
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#f5faff"
      }}
    >
      <CardContent>
        <Typography variant="h6" color="primary">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {value}%
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
