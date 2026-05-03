import { jsPDF } from "jspdf";
import lertiLogo from "../assets/LERTI.png";

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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function imageToDataURL(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL("image/png");
}

function drawCenteredText(doc, text, x, y, options = {}) {
  const { font = "times", style = "normal", size = 12, color = [0, 0, 0] } = options;

  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(text, x, y, { align: "center" });
}

function drawGoldLine(doc, y, x1 = 28, x2 = 182) {
  doc.setDrawColor(200, 157, 43);
  doc.setLineWidth(1.4);
  doc.line(x1, y, x2, y);
}

function drawSeal(doc, x, y, size, logoDataUrl) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;

  doc.setDrawColor(189, 149, 48);
  doc.setFillColor(247, 239, 214);
  doc.circle(cx, cy, r, "FD");

  doc.setLineWidth(0.8);
  doc.setDrawColor(210, 180, 95);
  doc.circle(cx, cy, r - 4, "S");

  doc.setDrawColor(220, 195, 120);
  doc.circle(cx, cy, r - 10, "S");

  doc.setFillColor(255, 252, 245);
  doc.circle(cx, cy, r - 15, "FD");

  if (logoDataUrl) {
    const logoSize = size * 0.34;
    doc.addImage(
      logoDataUrl,
      "PNG",
      cx - logoSize / 2,
      cy - logoSize / 2 - 2,
      logoSize,
      logoSize
    );
  }

  drawCenteredText(doc, "LERTI", cx, cy + 15, {
    font: "helvetica",
    style: "bold",
    size: 10,
    color: [31, 63, 143],
  });

  drawCenteredText(doc, "ACADEMY", cx, cy + 21, {
    font: "helvetica",
    style: "bold",
    size: 6.5,
    color: [142, 109, 24],
  });
}

export async function downloadDiplomaPDF(userName, levelName, dateText) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let logoDataUrl = null;

  try {
    const logoImg = await loadImage(lertiLogo);
    logoDataUrl = imageToDataURL(logoImg);
  } catch (error) {
    console.error("No se pudo cargar el logo para el diploma:", error);
  }

  // Fondo papel
  doc.setFillColor(248, 243, 230);
  doc.rect(0, 0, 210, 297, "F");

  // Marco exterior azul
  doc.setDrawColor(36, 63, 143);
  doc.setLineWidth(2.4);
  doc.rect(10, 10, 190, 277);

  // Marco interior azul
  doc.setLineWidth(0.9);
  doc.rect(15, 15, 180, 267);

  // Marco interior dorado
  doc.setDrawColor(200, 157, 43);
  doc.setLineWidth(0.35);
  doc.rect(18, 18, 174, 261);

  // Logo superior
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 88, 24, 34, 34);
  }

  // Cabecera
  drawCenteredText(doc, "English Training App", 105, 64, {
    font: "times",
    style: "normal",
    size: 12,
    color: [70, 70, 70],
  });

  drawCenteredText(doc, "CERTIFICADO", 105, 84, {
    font: "times",
    style: "bold",
    size: 28,
    color: [36, 63, 143],
  });

  drawCenteredText(doc, "de finalización", 105, 94, {
    font: "times",
    style: "normal",
    size: 16,
    color: [91, 75, 42],
  });

  drawGoldLine(doc, 102, 65, 145);

  // Cuerpo
  drawCenteredText(doc, "SE CERTIFICA QUE", 105, 122, {
    font: "times",
    style: "normal",
    size: 13,
    color: [55, 55, 55],
  });

  drawCenteredText(doc, userName, 105, 138, {
    font: "times",
    style: "bold",
    size: 24,
    color: [20, 20, 20],
  });

  drawCenteredText(doc, "HA COMPLETADO", 105, 152, {
    font: "times",
    style: "normal",
    size: 13,
    color: [55, 55, 55],
  });

  drawCenteredText(doc, "SATISFACTORIAMENTE EL NIVEL", 105, 161, {
    font: "times",
    style: "normal",
    size: 13,
    color: [55, 55, 55],
  });

  // Nivel destacado
  doc.setDrawColor(200, 157, 43);
  doc.setLineWidth(0.4);
  doc.line(60, 169, 150, 169);
  doc.line(60, 184, 150, 184);

  drawCenteredText(doc, String(levelName).toUpperCase(), 105, 180, {
    font: "times",
    style: "bold",
    size: 26,
    color: [178, 138, 43],
  });

  // Fecha
  drawCenteredText(doc, `FECHA: ${dateText}`, 105, 203, {
    font: "times",
    style: "normal",
    size: 12,
    color: [45, 45, 45],
  });

  drawGoldLine(doc, 222, 58, 152);

  // Pie
  drawCenteredText(doc, "LERTI", 105, 235, {
    font: "helvetica",
    style: "bold",
    size: 16,
    color: [36, 63, 143],
  });

  drawCenteredText(doc, "English Training App", 105, 243, {
    font: "times",
    style: "normal",
    size: 12,
    color: [70, 70, 70],
  });

  // Sello
  drawSeal(doc, 145, 222, 38, logoDataUrl);

  doc.save(`diploma_${userName}_${levelName}.pdf`);
}