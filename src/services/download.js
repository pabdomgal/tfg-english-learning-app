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

function safeFileName(value) {
  return String(value)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\wÀ-ÿ_-]/g, "");
}

function setText(doc, options = {}) {
  const {
    font = "times",
    style = "normal",
    size = 12,
    color = [0, 0, 0],
  } = options;

  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function drawCenteredText(doc, text, x, y, options = {}) {
  setText(doc, options);
  doc.text(String(text), x, y, { align: "center" });
}

function drawSpacedCenteredText(doc, text, x, y, options = {}) {
  const {
    font = "helvetica",
    style = "bold",
    size = 10,
    color = [0, 0, 0],
    charSpace = 1.5,
  } = options;

  const cleanText = String(text);

  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.setCharSpace(charSpace);

  const textWidth = doc.getTextWidth(cleanText);
  const extraSpace = Math.max(cleanText.length - 1, 0) * charSpace;
  const visualWidth = textWidth + extraSpace;
  const startX = x - visualWidth / 2;

  doc.text(cleanText, startX, y);

  doc.setCharSpace(0);
}

function drawElegantDivider(doc, y, x1 = 48, x2 = 162, color = [200, 161, 58]) {
  const center = 105;

  doc.setDrawColor(...color);
  doc.setFillColor(...color);
  doc.setLineWidth(0.28);

  doc.line(x1, y, center - 4, y);
  doc.line(center + 4, y, x2, y);

  doc.saveGraphicsState();
  doc.setLineWidth(0);
  doc.triangle(center, y - 1.2, center + 1.2, y, center, y + 1.2, "F");
  doc.triangle(center, y - 1.2, center - 1.2, y, center, y + 1.2, "F");
  doc.restoreGraphicsState();
}

function drawSeal(doc, x, y, size, logoDataUrl) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;

  doc.setDrawColor(200, 161, 58);
  doc.setFillColor(248, 241, 220);
  doc.setLineWidth(0.8);
  doc.circle(cx, cy, r, "FD");

  doc.setDrawColor(200, 161, 58);
  doc.setLineWidth(0.35);
  doc.circle(cx, cy, r - 3.5, "S");

  doc.setDrawColor(223, 197, 121);
  doc.setLineWidth(0.25);
  doc.circle(cx, cy, r - 7, "S");

  doc.setFillColor(16, 29, 79);
  doc.setDrawColor(16, 29, 79);
  doc.circle(cx, cy, r - 11, "FD");

  if (logoDataUrl) {
    const logoSize = size * 0.27;
    doc.addImage(
      logoDataUrl,
      "PNG",
      cx - logoSize / 2,
      cy - logoSize / 2 - 1,
      logoSize,
      logoSize
    );
  }

  drawSpacedCenteredText(doc, "LERTI", cx, cy + 14, {
    font: "helvetica",
    style: "bold",
    size: 5.8,
    color: [16, 29, 79],
    charSpace: 0.5,
  });

  drawSpacedCenteredText(doc, "ACADEMY", cx, cy + 18, {
    font: "helvetica",
    style: "bold",
    size: 4,
    color: [142, 109, 24],
    charSpace: 0.4,
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

  const navy = [16, 29, 79];
  const gold = [200, 161, 58];
  const softGold = [178, 138, 43];
  const muted = [150, 150, 150];
  const dark = [25, 25, 25];

  doc.setFillColor(248, 244, 234);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFillColor(255, 253, 248);
  doc.rect(8, 8, 194, 281, "F");

  doc.setDrawColor(...navy);
  doc.setLineWidth(1.55);
  doc.rect(8, 8, 194, 281);

  doc.setLineWidth(0.65);
  doc.rect(12, 12, 186, 273);

  doc.setDrawColor(...gold);
  doc.setLineWidth(0.35);
  doc.rect(15, 15, 180, 267);

  if (logoDataUrl) {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.045 }));
    doc.addImage(logoDataUrl, "PNG", 67, 104, 76, 76);
    doc.restoreGraphicsState();
  }

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 90, 23, 30, 30);
  }

  drawSpacedCenteredText(doc, "ENGLISH TRAINING APP", 105, 60, {
    font: "helvetica",
    style: "bold",
    size: 6.8,
    color: muted,
    charSpace: 1.8,
  });

  drawSpacedCenteredText(doc, "CERTIFICADO", 105, 79, {
    font: "times",
    style: "bold",
    size: 25,
    color: navy,
    charSpace: 1.8,
  });

  drawSpacedCenteredText(doc, "DE FINALIZACIÓN", 105, 88, {
    font: "helvetica",
    style: "bold",
    size: 7.2,
    color: muted,
    charSpace: 1.5,
  });

  drawElegantDivider(doc, 102, 45, 165, gold);

  drawSpacedCenteredText(doc, "SE CERTIFICA QUE", 105, 121, {
    font: "helvetica",
    style: "normal",
    size: 7,
    color: muted,
    charSpace: 1.8,
  });

  drawCenteredText(doc, userName, 105, 138, {
    font: "times",
    style: "bold",
    size: 23,
    color: navy,
  });

  drawSpacedCenteredText(
    doc,
    "HA COMPLETADO SATISFACTORIAMENTE EL NIVEL",
    105,
    153,
    {
      font: "helvetica",
      style: "normal",
      size: 6.8,
      color: muted,
      charSpace: 1.2,
    }
  );

  drawElegantDivider(doc, 168, 55, 155, gold);

  drawSpacedCenteredText(doc, String(levelName).toUpperCase(), 105, 182, {
    font: "times",
    style: "bold",
    size: 24,
    color: softGold,
    charSpace: 2.8,
  });

  drawElegantDivider(doc, 192, 55, 155, gold);

  drawSpacedCenteredText(doc, "FECHA:", 96, 211, {
    font: "helvetica",
    style: "bold",
    size: 6.8,
    color: muted,
    charSpace: 1.2,
  });

  drawSpacedCenteredText(doc, dateText, 115, 211, {
    font: "helvetica",
    style: "bold",
    size: 6.8,
    color: dark,
    charSpace: 0.6,
  });

  doc.setDrawColor(...navy);
  doc.setLineWidth(0.35);
  doc.line(28, 251, 72, 251);

  drawSpacedCenteredText(doc, "LERTI", 50, 258, {
    font: "helvetica",
    style: "bold",
    size: 7,
    color: navy,
    charSpace: 0.4,
  });

  drawSpacedCenteredText(doc, "ENGLISH TRAINING APP", 50, 264, {
    font: "helvetica",
    style: "normal",
    size: 5.5,
    color: muted,
    charSpace: 0.8,
  });

  drawSeal(doc, 146, 238, 34, logoDataUrl);

  doc.save(`diploma_${safeFileName(userName)}_${safeFileName(levelName)}.pdf`);
}