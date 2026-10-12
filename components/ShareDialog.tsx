"use client";

import { useState } from "react";
import type { Checklist } from "@/lib/checklists";
import { buildPdf, pdfFileName } from "@/lib/pdf";
import { formatDate, loadSettings, saveSettings, type FormData } from "@/lib/store";
import { buildSummary } from "@/lib/summary";

type Props = { c: Checklist; f: FormData; date: string; onClose: () => void };

export function ShareDialog({ c, f, date, onClose }: Props) {
  const [email, setEmail] = useState(() => loadSettings().email);
  const [venue, setVenue] = useState(() => loadSettings().venue);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const venueName = venue.trim() || "Shareefs";
  const remember = () => saveSettings({ email: email.trim(), venue: venue.trim() });

  const makeFile = async () => {
    const doc = await buildPdf(c, f, date);
    const blob = doc.output("blob");
    return new File([blob], pdfFileName(c, date), { type: "application/pdf" });
  };

  const download = async () => {
    setBusy(true);
    try {
      const file = await makeFile();
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setMsg("PDF saved to your device.");
    } finally {
      setBusy(false);
    }
  };

  const printPdf = async () => {
    setBusy(true);
    setMsg("");
    try {
      const url = URL.createObjectURL(await makeFile());
      const frame = document.createElement("iframe");
      frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
      frame.src = url;
      frame.onload = () => {
        try {
          frame.contentWindow?.focus();
          frame.contentWindow?.print();
        } catch {
          window.open(url, "_blank");
        }
        setTimeout(() => {
          frame.remove();
          URL.revokeObjectURL(url);
        }, 60_000);
      };
      document.body.appendChild(frame);
    } finally {
      setBusy(false);
    }
  };

  const sharePdf = async () => {
    setBusy(true);
    try {
      const file = await makeFile();
      const data = { files: [file], title: `${c.title} ${formatDate(date)}`, text: `${venueName} – ${c.title} – ${formatDate(date)}` };
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share(data);
        setMsg("Shared.");
      } else {
        await download();
        setMsg("Sharing isn't supported on this device, so the PDF was downloaded. Attach it to an email.");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setMsg("Couldn't share – try Download PDF instead.");
    } finally {
      setBusy(false);
    }
  };

  const [sent, setSent] = useState(false);
  const sendPdf = async () => {
    remember();
    setBusy(true);
    setSent(false);
    setMsg("");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklistId: c.id, date, form: f, to: email, venue: venueName }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
        setMsg(`Sent! PDF emailed to ${(json.to as string[]).join(", ")}.`);
      } else {
        setMsg(json.error || "Couldn't send the email.");
      }
    } catch {
      setMsg("No connection – check your internet and try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendEmail = () => {
    remember();
    const subject = `${venueName} – ${c.title} – ${formatDate(date)}`;
    let body = buildSummary(c, f, date, venueName);
    if (body.length > 1500) body = body.slice(0, 1500) + "\n…(truncated – see attached PDF)";
    const to = email
      .split(/[,;\s]+/)
      .filter(Boolean)
      .join(",");
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setMsg("Opening your email app…");
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Send or share" className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div className="rise max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-brand">Send / Share</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 place-items-center rounded-full bg-paper text-2xl">
            ×
          </button>
        </div>

        <label className="block text-base font-semibold text-muted" htmlFor="venue">
          Venue / store name
        </label>
        <input
          id="venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          onBlur={remember}
          placeholder="e.g. Shareefs – Parramatta"
          className="mb-3 mt-1 min-h-12 w-full rounded-xl border border-line bg-white px-3 text-lg"
        />

        <label className="block text-base font-semibold text-muted" htmlFor="email">
          Email to (separate several with commas)
        </label>
        <input
          id="email"
          type="email"
          multiple
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={remember}
          placeholder="manager@shareefs.com"
          className="mb-4 mt-1 min-h-12 w-full rounded-xl border border-line bg-white px-3 text-lg"
        />

        <div className="grid gap-3">
          <button type="button" disabled={busy} onClick={sendPdf} className="min-h-14 rounded-xl bg-brand text-lg font-bold text-white active:bg-brand-dark disabled:opacity-60">
            {busy ? "Sending…" : sent ? "✓ Sent – send again" : "✉ Email PDF now"}
          </button>
          <button type="button" onClick={sendEmail} className="min-h-12 rounded-xl border border-line bg-white text-lg font-semibold">
            Open in my email app (text only)
          </button>
          <button type="button" disabled={busy} onClick={sharePdf} className="min-h-14 rounded-xl bg-teal text-lg font-bold text-white disabled:opacity-60">
            {busy ? "Preparing…" : "⇪ Share PDF (Mail, WhatsApp…)"}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={busy} onClick={printPdf} className="min-h-12 rounded-xl border-2 border-charcoal bg-white text-lg font-bold disabled:opacity-60">
              🖨 Print PDF
            </button>
            <button type="button" disabled={busy} onClick={download} className="min-h-12 rounded-xl border border-line bg-white text-lg font-semibold disabled:opacity-60">
              ⤓ Download PDF
            </button>
          </div>
        </div>

        <p className="mt-4 text-base leading-snug text-muted">
          “Email PDF now” sends the finished sheet, with signatures, straight from the site. No email app needed.
        </p>
        {msg && (
          <p role="status" className={`mt-3 rounded-lg p-3 text-base font-semibold ${/^(Sent|PDF saved|Shared|Opening)/.test(msg) ? "bg-teal-soft text-teal" : "bg-[#fbe9e5] text-brand-dark"}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
