import type { Checklist, Item } from "./checklists";
import { VERSION } from "./checklists";
import { formatDate, type FormData } from "./form";
import type { RowInput } from "jspdf-autotable";

type RGB = [number, number, number];
const RED: RGB = [200, 69, 47];
const TEAL: RGB = [47, 122, 110];
const DARK: RGB = [43, 43, 43];
const PANEL: RGB = [233, 230, 224];
const CELL: RGB = [243, 241, 237];

const PAGE_W = 210;
const PAGE_H = 297;
const ML = 14; // table left/right margin
const SIGNOFF_H = 34;

type Doc = import("jspdf").jsPDF;

function cellNote(i: Item, f: FormData): string {
  const lines: string[] = [];
  i.readings?.forEach((r) => {
    const v = f.readings[r.id];
    lines.push(`${r.label}: ${v ? v : "______"}${r.unit ?? ""}`);
  });
  if (i.choice) {
    const v = f.choices[i.choice.id];
    lines.push(v ? `${i.choice.label}: ${v}` : i.choice.options.join(" - "));
  }
  const c = f.comments[i.id];
  if (c) lines.push(c);
  return lines.join("\n");
}

function background(doc: Doc) {
  doc.setFillColor(...PANEL);
  doc.rect(8, 8, PAGE_W - 16, PAGE_H - 16, "F");
}

/** Centre letter-spaced text by its real width (jsPDF ignores charSpace when aligning). */
function spacedCentered(doc: Doc, text: string, cx: number, y: number, gap: number) {
  const chars = [...text];
  const widths = chars.map((ch) => doc.getTextWidth(ch));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let x = cx - total / 2;
  chars.forEach((ch, i) => {
    doc.text(ch, x, y);
    x += widths[i] + gap;
  });
}

function header(doc: Doc, c: Checklist, date: string) {
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.text(VERSION, ML, 16.25, { baseline: "middle" });

  // logo badge
  doc.setFillColor(...RED);
  doc.roundedRect(PAGE_W / 2 - 17, 12, 34, 8.5, 0.8, 0.8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  spacedCentered(doc, "SHAREEFS", PAGE_W / 2, 17.8, 0.4);
  doc.setTextColor(...RED);
  doc.setFontSize(4.2);
  spacedCentered(doc, "THE SHAWARMA SOCIAL CLUB", PAGE_W / 2, 23.7, 0.35);

  doc.setTextColor(...DARK);
  doc.setFontSize(8.5);
  doc.text(`DATE  ${formatDate(date) || "__ / __ / ____"}`, PAGE_W - ML, 16.25, { align: "right", baseline: "middle" });

  doc.setFont("times", "bold");
  doc.setTextColor(...RED);
  doc.setFontSize(23);
  doc.text(c.title.toUpperCase(), PAGE_W / 2, 36, { align: "center" });
}

async function drawTable(doc: Doc, c: Checklist, f: FormData, pad: number, fs: number): Promise<number> {
  const autoTable = (await import("jspdf-autotable")).default;
  const body: RowInput[] = [];
  for (const s of c.sections) {
    body.push([
      { content: s.title.toUpperCase(), styles: { fillColor: DARK, textColor: 255, fontStyle: "bold" } },
      { content: "" },
      { content: "" },
    ]);
    for (const i of s.items) {
      body.push([
        { content: i.text, styles: { fontStyle: "bold" } },
        { content: f.checks[i.id] ? "x" : "", styles: { textColor: CELL } },
        { content: cellNote(i, f), styles: { fontSize: Math.max(fs - 1, 6), fontStyle: "normal" } },
      ]);
    }
  }

  autoTable(doc, {
    startY: 41,
    head: [[{ content: "", styles: { fillColor: false as unknown as RGB, lineWidth: 0 } }, "CHECK", "COMMENTS"]],
    body,
    theme: "grid",
    styles: { font: "helvetica", fontSize: fs, cellPadding: pad, lineColor: [90, 90, 90], lineWidth: 0.15, textColor: DARK, fillColor: CELL, valign: "middle", overflow: "linebreak" },
    headStyles: { fillColor: TEAL, textColor: 255, halign: "center", fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 88 }, 1: { cellWidth: 18, halign: "center" }, 2: { cellWidth: "auto" } },
    margin: { left: ML, right: ML, top: 14, bottom: 14 },
    willDrawPage: () => background(doc),
    didDrawCell: (d) => {
      if (d.section === "body" && d.column.index === 1 && d.cell.raw && (d.cell.raw as { content?: string }).content === "x") {
        const { x, y, width, height } = d.cell;
        const cx = x + width / 2;
        const cy = y + height / 2;
        doc.setDrawColor(...TEAL);
        doc.setLineWidth(0.7);
        doc.line(cx - 2, cy + 0.1, cx - 0.6, cy + 1.6);
        doc.line(cx - 0.6, cy + 1.6, cx + 2.2, cy - 1.8);
      }
    },
  });
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

function signoff(doc: Doc, f: FormData, y: number) {
  const nameX = 74;
  const sigX = 134;
  const right = PAGE_W - ML;
  const rowH = 13;

  doc.setFillColor(...RED);
  doc.rect(nameX, y, sigX - nameX, 6, "F");
  doc.rect(sigX, y, right - sigX, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("NAME", (nameX + sigX) / 2, y + 4.2, { align: "center" });
  doc.text("SIGNATURE", (sigX + right) / 2, y + 4.2, { align: "center" });

  const rows: [string, FormData["completedBy"]][] = [
    ["Completed by", f.completedBy],
    ["Manager on shift", f.manager],
  ];
  rows.forEach(([label, p], idx) => {
    const top = y + 6 + idx * rowH;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...RED);
    doc.text(label, ML + 1, top + rowH / 2 + 1.5);
    doc.setFillColor(...CELL);
    doc.setDrawColor(90, 90, 90);
    doc.setLineWidth(0.15);
    doc.rect(nameX, top, sigX - nameX, rowH, "FD");
    doc.rect(sigX, top, right - sigX, rowH, "FD");
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(p.name || "", nameX + 2, top + rowH / 2 + 1.5);
    if (p.signature) {
      try {
        doc.addImage(p.signature, "PNG", sigX + 2, top + 1, 40, rowH - 2);
      } catch {}
    }
  });
}

/** Builds a one-page A4 PDF styled like the printed Shareefs sheets. Works in browser and Node. */
export async function buildPdf(c: Checklist, f: FormData, date: string) {
  const { jsPDF } = await import("jspdf");

  // Pick the largest type size that keeps the sheet (plus sign-off) on a single page.
  const presets: [number, number][] = [
    [2.4, 9],
    [2, 8.5],
    [1.6, 8],
    [1.3, 7.5],
    [1.0, 7],
  ];
  let chosen = presets[presets.length - 1];
  for (const p of presets) {
    const t = new jsPDF({ unit: "mm", format: "a4" });
    const y = await drawTable(t, c, f, p[0], p[1]);
    if (t.getNumberOfPages() === 1 && y < PAGE_H - 14 - SIGNOFF_H) {
      chosen = p;
      break;
    }
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = await drawTable(doc, c, f, chosen[0], chosen[1]);
  doc.setPage(1);
  header(doc, c, date);

  doc.setPage(doc.getNumberOfPages());
  y += 6;
  if (y + SIGNOFF_H > PAGE_H - 12) {
    doc.addPage();
    background(doc);
    y = 16;
  }
  signoff(doc, f, y);
  return doc;
}

export const pdfFileName = (c: Checklist, date: string) => `${c.id}-${date}.pdf`;
