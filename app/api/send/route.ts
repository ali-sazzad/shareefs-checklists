import nodemailer from "nodemailer";
import { getChecklist } from "@/lib/checklists";
import { buildPdf, pdfFileName } from "@/lib/pdf";
import { emptyForm, formatDate, type FormData } from "@/lib/form";
import { buildSummary } from "@/lib/summary";

export const runtime = "nodejs";
export const maxDuration = 30;

const EMAIL = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const MAX_RECIPIENTS = 5;
const MAX_SIG = 250_000;

// Basic per-IP throttle (per server instance) so the endpoint can't be used as a spam relay.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
}

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : "");
const rec = (v: unknown, max: number) => {
  const out: Record<string, string> = {};
  if (v && typeof v === "object") for (const [k, val] of Object.entries(v).slice(0, 200)) out[k.slice(0, 40)] = str(val, max);
  return out;
};
const person = (v: unknown) => {
  const p = (v ?? {}) as Record<string, unknown>;
  const sig = str(p.signature, MAX_SIG);
  return { name: str(p.name, 100), signature: sig.startsWith("data:image/png;base64,") ? sig : "" };
};

function sanitize(raw: Record<string, unknown>): FormData {
  const checks: Record<string, boolean> = {};
  if (raw.checks && typeof raw.checks === "object") for (const [k, v] of Object.entries(raw.checks).slice(0, 200)) checks[k.slice(0, 40)] = v === true;
  return {
    ...emptyForm(),
    checks,
    readings: rec(raw.readings, 20),
    choices: rec(raw.choices, 30),
    comments: rec(raw.comments, 500),
    completedBy: person(raw.completedBy),
    manager: person(raw.manager),
  };
}

export async function POST(req: Request) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO, MAIL_ALLOWED_DOMAINS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return Response.json({ error: "Email sending isn't set up yet on this site." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return Response.json({ error: "Too many emails sent. Please try again later." }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const checklist = getChecklist(str(body.checklistId, 40));
  const date = str(body.date, 10);
  if (!checklist || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Invalid checklist or date." }, { status: 400 });

  const typed = str(body.to, 1000).split(/[,;\s]+/).filter(Boolean);
  const defaults = (MAIL_TO ?? "").split(/[,;\s]+/).filter(Boolean);
  const to = [...new Set([...typed, ...defaults])];
  if (!to.length) return Response.json({ error: "Enter at least one email address." }, { status: 400 });
  if (to.length > MAX_RECIPIENTS) return Response.json({ error: `Maximum ${MAX_RECIPIENTS} recipients.` }, { status: 400 });
  const bad = to.find((a) => !EMAIL.test(a));
  if (bad) return Response.json({ error: `"${bad}" isn't a valid email address.` }, { status: 400 });
  const allowed = (MAIL_ALLOWED_DOMAINS ?? "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  if (allowed.length) {
    const blocked = to.find((a) => !allowed.includes(a.split("@")[1].toLowerCase()));
    if (blocked) return Response.json({ error: `Emails to ${blocked.split("@")[1]} aren't allowed.` }, { status: 400 });
  }

  const form = sanitize((body.form ?? {}) as Record<string, unknown>);
  const venue = str(body.venue, 80).trim() || "Shareefs";

  try {
    const doc = await buildPdf(checklist, form, date);
    const pdf = Buffer.from(doc.output("arraybuffer"));
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transport.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to,
      subject: `${venue} – ${checklist.title} – ${formatDate(date)}`,
      text: buildSummary(checklist, form, date, venue) + "\nThe full signed sheet is attached as a PDF.\n",
      attachments: [{ filename: pdfFileName(checklist, date), content: pdf, contentType: "application/pdf" }],
    });
    return Response.json({ ok: true, to });
  } catch (e) {
    console.error("send failed", e);
    return Response.json({ error: "Couldn't send the email. Check the email settings and try again." }, { status: 502 });
  }
}
