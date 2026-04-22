import jsPDF from "jspdf";

function getAdvice(risk) {

  if (risk === "High") {
    return "High seizure risk detected. The patient should consult a neurologist immediately and avoid driving or operating heavy machinery.";
  }

  if (risk === "Moderate") {
    return "Moderate seizure risk detected. The patient should monitor symptoms carefully and schedule a medical consultation.";
  }

  return "Low seizure risk detected. Maintain healthy sleep patterns and reduce stress.";
}

function generateReport(result, city) {

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Seizure Risk Analysis Report", 20, 20);

  doc.setFontSize(12);

  doc.text(`City: ${city}`, 20, 40);
  doc.text(`Model Used: ${result.version_used}`, 20, 50);
  doc.text(`Risk Level: ${result.risk_level}`, 20, 60);
  doc.text(`Probability: ${result.average_probability}%`, 20, 70);

  // Explainable AI
  doc.text("Top Influential Features:", 20, 90);

  result.feature_importance.forEach((f, i) => {
    doc.text(`${i + 1}. ${f.feature}`, 20, 100 + i * 8);
  });

  // Hospitals
  doc.text("Recommended Hospitals:", 20, 140);

  result.hospitals.forEach((h, i) => {
    doc.text(`${h.name} - ${h.speciality}`, 20, 150 + i * 8);
  });

  // AI Recommendation
  const advice = getAdvice(result.risk_level);

  doc.text("AI Medical Recommendation:", 20, 190);
  doc.text(advice, 20, 200, { maxWidth: 170 });

  doc.save("Seizure_Risk_Report.pdf");
}

export default generateReport;