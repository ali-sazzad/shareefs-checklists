"use client";

import { useEffect, useRef } from "react";
import { VERSION, type Checklist } from "@/lib/checklists";
import { formatDate, type FormData } from "@/lib/store";
import { itemValues } from "@/lib/summary";
import { Brand } from "./Brand";

/** Paper-style layout matching the printed Shareefs sheets. Only visible when printing. */
export function PrintSheet({ c, f, date }: { c: Checklist; f: FormData; date: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Measure the sheet at A4 print width (it is laid out off-screen) and shrink it to fit ONE page.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--fit", "1");
    const mm = 3.7795;
    const avail = 274 * mm; // A4 height minus @page margins, with a little safety
    const h = el.scrollHeight;
    el.style.setProperty("--fit", String(h > avail ? Math.max(0.4, avail / h) : 1));
  }, [c, f, date]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute -left-[9999px] top-0 w-[194mm] bg-white text-[#222] print:static print:w-auto print:[zoom:var(--fit)]"
      style={{ fontSize: "9.5px" }}
    >
      <div className="relative mb-1 flex items-start justify-between">
        <span className="text-[7px]">{VERSION}</span>
        <Brand small />
        <span className="font-bold">DATE {formatDate(date) || "___/___/___"}</span>
      </div>
      <h1 className="mb-1.5 text-center font-display text-[20px] text-brand">{c.title.toUpperCase()}</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-[52%]" />
            <th className="w-[9%] border border-[#555] bg-teal py-1 text-white">CHECK</th>
            <th className="border border-[#555] bg-teal py-1 text-white">COMMENTS</th>
          </tr>
        </thead>
        <tbody>
          {c.sections.map((s) => (
            <SectionRows key={s.id} s={s} f={f} />
          ))}
        </tbody>
      </table>

      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr>
            <th className="w-[30%]" />
            <th className="w-[35%] bg-brand py-1 text-white">NAME</th>
            <th className="bg-brand py-1 text-white">SIGNATURE</th>
          </tr>
        </thead>
        <tbody>
          {(
            [
              ["Completed by", f.completedBy],
              ["Manager on shift", f.manager],
            ] as const
          ).map(([label, p]) => (
            <tr key={label}>
              <td className="py-1 text-[12px] font-bold text-brand">{label}</td>
              <td className="h-8 border border-[#555] px-2">{p.name}</td>
              <td className="h-8 border border-[#555] px-2">
                {p.signature && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.signature} alt="" className="h-8" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionRows({ s, f }: { s: Checklist["sections"][number]; f: FormData }) {
  return (
    <>
      <tr>
        <td className="bg-[#2b2b2b] px-2 py-[2px] font-bold uppercase text-white">{s.title}</td>
        <td className="border border-[#555]" />
        <td className="border border-[#555]" />
      </tr>
      {s.items.map((i) => {
        const vals = itemValues(i, f);
        const note = f.comments[i.id];
        return (
          <tr key={i.id} style={{ breakInside: "avoid" }}>
            <td className="border border-[#555] px-2 py-[1.5px] font-semibold">{i.text}</td>
            <td className="border border-[#555] text-center text-[14px] font-bold text-teal">{f.checks[i.id] ? "✓" : ""}</td>
            <td className="border border-[#555] px-2 py-[1.5px]">
              {vals.join("  ·  ")}
              {vals.length > 0 && note ? "  ·  " : ""}
              {note}
              {!vals.length && !note && i.readings && (
                <span className="text-[#888]">{i.readings.map((r) => `${r.label}: ____${r.unit ?? ""}`).join("   ")}</span>
              )}
              {!vals.length && !note && i.choice && <span className="text-[#888]">{i.choice.options.join(" – ")}</span>}
            </td>
          </tr>
        );
      })}
    </>
  );
}
