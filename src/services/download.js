import { jsPDF } from "jspdf";

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export function downloadDiplomaPDF(userName, levelName, dateText) {
  const doc = new jsPDF();

  doc.setDrawColor(25, 50, 120);

  doc.setLineWidth(3);
  doc.rect(10, 10, 190, 277);

  doc.setLineWidth(0.8);
  doc.rect(15, 15, 180, 267);

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(2);
  doc.line(20, 30, 190, 30);

  doc.setTextColor(25, 50, 120);
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.text("CERTIFICADO", 105, 55, { align: "center" });

  // Subtítulo
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text("de finalización", 105, 65, { align: "center" });

  // Texto 
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Se certifica que", 105, 95, { align: "center" });

  // Nombre 
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text(userName, 105, 110, { align: "center" });

  // Nivel
  doc.setFont("times", "normal");
  doc.setFontSize(13);
  doc.text(
    `ha completado satisfactoriamente el nivel ${levelName}`,
    105,
    125,
    { align: "center" }
  );

  // Fecha
  doc.setFontSize(11);
  doc.text(`Fecha: ${dateText}`, 105, 155, { align: "center" });

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.5);
  doc.line(40, 200, 170, 200);

  // Firma 
  doc.setFontSize(10);
  doc.text("English Learning App", 105, 210, { align: "center" });

  // Guardar archivo
  doc.save(`certificado_${userName}_${levelName}.pdf`);
}