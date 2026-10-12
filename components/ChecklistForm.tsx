"use client";

import Link from "next/link";
import { useState } from "react";
import type { Checklist, Item, Section } from "@/lib/checklists";
import { useDraft, useMounted, type FormData } from "@/lib/store";
import { progress } from "@/lib/summary";
import { PrintSheet } from "./PrintSheet";
import { ShareDialog } from "./ShareDialog";
import { SignaturePad } from "./SignaturePad";

export function ChecklistForm({ checklist }: { checklist: Checklist }) {
  const mounted = useMounted();
  if (!mounted) return <div className="p-6 text-muted">Loading…</div>;
  return <Form c={checklist} />;
}

function Form({ c }: { c: Checklist }) {
  const { date, setDate, data, update, reset } = useDraft(c.id);
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const p = progress(c, data);

  const toggle = (id: string, v?: boolean) =>
    update((f) => ({ ...f, checks: { ...f.checks, [id]: v ?? !f.checks[id] } }));

  const setReading = (item: Item, rid: string, value: string) =>
    update((f) => {
      const readings = { ...f.readings, [rid]: value };
      const filled = item.readings?.every((r) => r.optional || /\d/.test(readings[r.id] ?? "")) ?? false;
      return { ...f, readings, checks: filled ? { ...f.checks, [item.id]: true } : f.checks };
    });

  const setChoice = (item: Item, cid: string, value: string) =>
    update((f) => ({ ...f, choices: { ...f.choices, [cid]: value }, checks: { ...f.checks, [item.id]: true } }));

  const setComment = (id: string, v: string) => update((f) => ({ ...f, comments: { ...f.comments, [id]: v } }));

  const tickSection = (s: Section) =>
    update((f) => {
      const all = s.items.every((i) => f.checks[i.id]);
      const checks = { ...f.checks };
      s.items.forEach((i) => (checks[i.id] = !all));
      return { ...f, checks };
    });

  const setPerson = (k: "completedBy" | "manager", patch: Partial<FormData["completedBy"]>) =>
    update((f) => ({ ...f, [k]: { ...f[k], ...patch } }));

  return (
    <>
      <div className="print:hidden">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <Link href="/" aria-label="Back to all checklists" className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-2xl shadow-sm">
              ←
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-xl leading-tight text-brand">{c.title}</h1>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress">
                  <div className="h-full rounded-full bg-teal transition-[width] duration-300" style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-base font-bold tabular-nums">
                  {p.done}/{p.total}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 pb-36 pt-4">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-card p-3 shadow-sm">
            <label htmlFor="date" className="text-lg font-bold">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-12 rounded-xl border border-line bg-white px-3 text-lg font-semibold"
            />
          </div>

          {c.sections.map((s) => (
            <SectionCard key={s.id} s={s} f={data} onTickAll={() => tickSection(s)} onToggle={toggle} onReading={setReading} onChoice={setChoice} onComment={setComment} />
          ))}

          <section className="mt-6 rounded-2xl bg-card p-4 shadow-sm">
            <h2 className="mb-3 font-display text-xl text-brand">Sign-off</h2>
            {(
              [
                ["completedBy", "Completed by"],
                ["manager", "Manager on shift"],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className="mb-5 last:mb-0">
                <label htmlFor={k} className="mb-1 block text-lg font-bold text-brand">
                  {label}
                </label>
                <input
                  id={k}
                  value={data[k].name}
                  autoComplete="name"
                  onChange={(e) => setPerson(k, { name: e.target.value })}
                  placeholder="Full name"
                  className="mb-2 min-h-12 w-full rounded-xl border border-line bg-white px-3 text-lg"
                />
                <SignaturePad label={label} value={data[k].signature} onChange={(s) => setPerson(k, { signature: s })} />
              </div>
            ))}
          </section>

          <div className="mt-6 text-center">
            {confirmReset ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-card p-2 shadow-sm">
                <span className="px-2 font-semibold">Clear everything for {date}?</span>
                <button type="button" onClick={() => { reset(); setConfirmReset(false); }} className="min-h-11 rounded-lg bg-brand px-4 font-bold text-white">
                  Yes, clear
                </button>
                <button type="button" onClick={() => setConfirmReset(false)} className="min-h-11 rounded-lg border border-line px-4 font-semibold">
                  Keep
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="min-h-11 px-4 text-base font-semibold text-muted underline">
                Start over / clear this checklist
              </button>
            )}
          </div>
        </main>

        <nav aria-label="Actions" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 px-4 py-3">
            <button type="button" onClick={() => window.print()} className="min-h-14 rounded-xl border-2 border-charcoal bg-white text-lg font-bold">
              🖨 Print
            </button>
            <button type="button" onClick={() => setShareOpen(true)} className="min-h-14 rounded-xl bg-brand text-lg font-bold text-white active:bg-brand-dark">
              ✉ Send / Share
            </button>
          </div>
        </nav>

        {shareOpen && <ShareDialog c={c} f={data} date={date} onClose={() => setShareOpen(false)} />}
      </div>

      <PrintSheet c={c} f={data} date={date} />
    </>
  );
}

type RowHandlers = {
  onToggle: (id: string) => void;
  onReading: (item: Item, rid: string, v: string) => void;
  onChoice: (item: Item, cid: string, v: string) => void;
  onComment: (id: string, v: string) => void;
};

function SectionCard({ s, f, onTickAll, ...h }: { s: Section; f: FormData; onTickAll: () => void } & RowHandlers) {
  const [open, setOpen] = useState(true);
  const done = s.items.filter((i) => f.checks[i.id]).length;
  const complete = done === s.items.length;

  return (
    <section className="mb-4 overflow-hidden rounded-2xl bg-card shadow-sm">
      <div className="flex items-center bg-charcoal text-white">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex min-h-14 flex-1 items-center gap-2 px-4 text-left text-lg font-bold uppercase tracking-wide"
        >
          <span className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
          <span className="flex-1">{s.title}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-sm tabular-nums ${complete ? "bg-teal" : "bg-white/20"}`}>
            {complete ? "✓ " : ""}
            {done}/{s.items.length}
          </span>
        </button>
        <button type="button" onClick={onTickAll} className="min-h-14 border-l border-white/20 px-4 text-base font-semibold">
          {complete ? "Untick" : "Tick all"}
        </button>
      </div>
      {open && (
        <ul>
          {s.items.map((i) => (
            <ItemRow key={i.id} item={i} f={f} {...h} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemRow({ item, f, onToggle, onReading, onChoice, onComment }: { item: Item; f: FormData } & RowHandlers) {
  const checked = !!f.checks[item.id];
  const [noteOpen, setNoteOpen] = useState(false);
  const hasNote = !!f.comments[item.id];
  const showNote = noteOpen || hasNote;
  const [justTicked, setJustTicked] = useState(false);

  const tap = () => {
    if (!checked) {
      setJustTicked(true);
      setTimeout(() => setJustTicked(false), 250);
    }
    onToggle(item.id);
  };

  return (
    <li className={`border-t border-line first:border-t-0 ${checked ? "bg-teal-soft/60" : ""}`}>
      <div className="flex items-start">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={tap}
          className="flex min-h-16 flex-1 items-center gap-3 py-3 pl-4 pr-2 text-left"
        >
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-lg border-2 text-2xl font-bold ${justTicked ? "pop" : ""} ${checked ? "border-teal bg-teal text-white" : "border-[#b5ada0] bg-white text-transparent"}`}
          >
            ✓
          </span>
          <span className={`text-[19px] font-medium leading-snug ${checked ? "text-ink/70" : ""}`}>{item.text}</span>
        </button>
        <button
          type="button"
          onClick={() => setNoteOpen(!showNote)}
          aria-label={hasNote ? "Edit comment" : "Add comment"}
          className={`mr-2 mt-2.5 grid size-11 shrink-0 place-items-center rounded-full text-xl ${hasNote ? "bg-brand text-white" : "text-muted"}`}
        >
          💬
        </button>
      </div>

      {(item.readings || item.choice) && (
        <div className="flex flex-wrap gap-2 px-4 pb-3 pl-16">
          {item.readings?.map((r) => (
            <label key={r.id} className="flex min-w-[8.5rem] flex-1 flex-col text-sm font-semibold text-muted">
              {r.label}
              <span className="mt-0.5 flex items-center rounded-xl border border-line bg-white focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/30">
                <button
                  type="button"
                  aria-label={`Toggle negative for ${r.label}`}
                  onClick={() => {
                    const v = f.readings[r.id] ?? "";
                    onReading(item, r.id, v.startsWith("-") ? v.slice(1) : "-" + v);
                  }}
                  className={`ml-1 grid min-h-10 w-11 shrink-0 place-items-center rounded-lg text-xl font-bold ${f.readings[r.id]?.startsWith("-") ? "bg-teal text-white" : "bg-paper text-ink"}`}
                >
                  ±
                </button>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={f.readings[r.id] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[−–—]/g, "-").replace(/,/g, ".");
                    if (/^-?\d{0,3}(\.\d{0,1})?$/.test(v)) onReading(item, r.id, v);
                  }}
                  placeholder="0.0"
                  className="min-h-12 w-full min-w-0 rounded-xl bg-transparent px-2 text-xl font-bold text-ink outline-none"
                />
                <span className="pr-3 text-lg font-bold text-muted">{r.unit}</span>
              </span>
            </label>
          ))}
          {item.choice && (
            <div className="w-full">
              <p className="mb-1 text-sm font-semibold text-muted">{item.choice.label}</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={item.choice.label}>
                {item.choice.options.map((o) => {
                  const on = f.choices[item.choice!.id] === o;
                  return (
                    <button
                      key={o}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => onChoice(item, item.choice!.id, o)}
                      className={`min-h-12 rounded-full border-2 px-4 text-lg font-bold ${on ? "border-teal bg-teal text-white" : "border-line bg-white"}`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {showNote && (
        <div className="px-4 pb-3 pl-16">
          <label className="sr-only" htmlFor={`note-${item.id}`}>
            Comment for {item.text}
          </label>
          <textarea
            id={`note-${item.id}`}
            rows={2}
            value={f.comments[item.id] ?? ""}
            onChange={(e) => onComment(item.id, e.target.value)}
            placeholder="Add a comment…"
            className="w-full rounded-xl border border-line bg-white p-3 text-lg"
          />
        </div>
      )}
    </li>
  );
}
