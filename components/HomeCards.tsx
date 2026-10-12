"use client";

import Link from "next/link";
import { allItems, checklists } from "@/lib/checklists";
import { readProgress, useMounted } from "@/lib/store";

export function HomeCards() {
  const mounted = useMounted();
  const prog: Record<string, number> = {};
  if (mounted) checklists.forEach((c) => (prog[c.id] = readProgress(c.id, allItems(c).length).done));

  return (
    <div className="grid gap-6">
      {(["FOH", "BOH"] as const).map((area) => (
        <section key={area} aria-labelledby={`h-${area}`}>
          <h2 id={`h-${area}`} className="mb-2 text-lg font-bold uppercase tracking-widest text-muted">
            {area === "FOH" ? "Front of House" : "Back of House"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {checklists
              .filter((c) => c.area === area)
              .map((c) => {
                const total = allItems(c).length;
                const done = prog[c.id] ?? 0;
                const pct = Math.round((done / total) * 100);
                return (
                  <Link
                    key={c.id}
                    href={`/${c.id}`}
                    className="group flex min-h-32 flex-col justify-between rounded-2xl bg-card p-4 shadow-sm ring-1 ring-line transition active:scale-[0.98]"
                  >
                    <div>
                      <span className={`inline-block rounded-full px-3 py-0.5 text-sm font-bold uppercase tracking-wide text-white ${c.when === "Opening" ? "bg-teal" : "bg-charcoal"}`}>
                        {c.when}
                      </span>
                      <h3 className="mt-2 font-display text-2xl leading-tight text-brand">{c.short}</h3>
                      <p className="mt-1 text-base leading-snug text-muted">{c.blurb}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-base font-bold tabular-nums">
                        {done}/{total}
                      </span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
      <p className="text-center text-base text-muted">Today’s progress is shown on each card. Tip: add this page to your phone’s home screen.</p>
    </div>
  );
}
