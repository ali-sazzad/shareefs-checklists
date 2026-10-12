import { allItems, type Checklist } from "./checklists";
import { formatDate, type FormData } from "./form";

export function progress(c: Checklist, f: FormData) {
  const items = allItems(c);
  const done = items.filter((i) => f.checks[i.id]).length;
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

/** Readings and choices as printable strings for an item. */
export function itemValues(item: ReturnType<typeof allItems>[number], f: FormData): string[] {
  const out: string[] = [];
  item.readings?.forEach((r) => {
    const v = f.readings[r.id];
    if (v) out.push(`${r.label}: ${v}${r.unit ?? ""}`);
  });
  if (item.choice && f.choices[item.choice.id]) out.push(`${item.choice.label}: ${f.choices[item.choice.id]}`);
  return out;
}

export function buildSummary(c: Checklist, f: FormData, date: string, venue = "Shareefs") {
  const p = progress(c, f);
  const lines: string[] = [];
  lines.push(`${venue} - ${c.title}`);
  lines.push(`Date: ${formatDate(date)}`);
  lines.push(`Completed: ${p.done}/${p.total} tasks (${p.pct}%)`);
  lines.push(`Completed by: ${f.completedBy.name || "-"}`);
  lines.push(`Manager on shift: ${f.manager.name || "-"}`);
  lines.push("");

  const readings: string[] = [];
  const missed: string[] = [];
  const notes: string[] = [];
  for (const s of c.sections) {
    for (const i of s.items) {
      const vals = itemValues(i, f);
      if (vals.length) readings.push(...vals.map((v) => `  - ${v}`));
      if (!f.checks[i.id]) missed.push(`  - [${s.title}] ${i.text}`);
      if (f.comments[i.id]) notes.push(`  - ${i.text}: ${f.comments[i.id]}`);
    }
  }
  if (readings.length) lines.push("READINGS", ...readings, "");
  if (missed.length) lines.push("NOT COMPLETED", ...missed, "");
  else lines.push("All tasks completed.", "");
  if (notes.length) lines.push("COMMENTS", ...notes, "");
  return lines.join("\n");
}
