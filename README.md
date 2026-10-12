<div align="center">

# 🥙 Shareef's Daily Checklists

**Mobile-first opening & closing checklists for restaurant Front of House and Back of House.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-daily--shift--checklists--aus.vercel.app-c8452f?style=for-the-badge&logo=vercel&logoColor=white)](https://daily-shift-checklists-aus.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)

### 🔗 [**Open the live app → daily-shift-checklists-aus.vercel.app**](https://daily-shift-checklists-aus.vercel.app)

</div>

---

## Overview

Daily Checklists replaces paper shift sheets with a fast, phone-friendly web app. Staff pick a list, tick tasks as they go, record temperatures, sign off, and send a PDF report to the manager. Everything autosaves on the device, so it keeps working through patchy Wi-Fi and accidental refreshes.

## Features

- **Four ready-made checklists:** FOH Opening, FOH Closing, BOH Opening and BOH Closing, grouped into sections (temp checks, booza, drinks fountain, order & pickup, dining room, bins, and more).
- **Temperature and reading capture:** required readings (cool rooms, freezers, etc.) with units, plus pick-one answers such as CO₂ fill level.
- **Autosave drafts:** progress is stored per checklist, per date in the browser, with no account needed.
- **Digital sign-off:** drawn signatures for the staff member and the manager.
- **PDF reports:** generated client-side with jsPDF, ready to download, print or share.
- **Email delivery:** send the completed PDF to up to 5 recipients through any SMTP provider.
- **Installable PWA:** add to the home screen for a full-screen, app-like experience.
- **Print-friendly:** dedicated print sheet layout.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | React 19, Tailwind CSS 4, `next/font` (Alfa Slab One, Barlow Condensed) |
| Language | TypeScript |
| PDF | jsPDF + jspdf-autotable |
| Email | Nodemailer (SMTP) |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
git clone https://github.com/ali-sazzad/shareefs-checklists.git
cd shareefs-checklists
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Configuration

Emailing reports is optional. Without SMTP settings the app still works fully, and the send endpoint responds with a friendly "not set up" message. To enable it, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | :---: | --- |
| `SMTP_HOST` | ✅ | SMTP server, e.g. `smtp.gmail.com` |
| `SMTP_PORT` | | Defaults to `587` |
| `SMTP_USER` | ✅ | SMTP username / sender address |
| `SMTP_PASS` | ✅ | SMTP password or app password |
| `MAIL_FROM` | | Display sender, defaults to `SMTP_USER` |
| `MAIL_TO` | | Addresses always included on every send (comma separated) |
| `MAIL_ALLOWED_DOMAINS` | | Restrict recipients to these domains (comma separated) |

> Never commit real credentials. `.env*` files are git-ignored, except `.env.example`.

## Project Structure

```
app/
├── page.tsx            # Home: checklist picker
├── [id]/page.tsx       # Checklist page (SSG for each list)
├── api/send/route.ts   # Email-a-PDF endpoint (validated, rate-limited)
├── layout.tsx          # Fonts, metadata, viewport
└── manifest.ts         # PWA manifest
components/             # ChecklistForm, SignaturePad, ShareDialog, PrintSheet, ...
lib/
├── checklists.ts       # Checklist definitions (edit tasks here)
├── store.ts            # Autosaving draft + settings in localStorage
├── pdf.ts              # PDF report builder
└── summary.ts          # Progress and summary text
```

## Customising the checklists

All tasks live in [`lib/checklists.ts`](lib/checklists.ts). Add or edit a section, item, temperature reading or multiple-choice question there and the home screen, form, PDF and email all pick it up automatically.

## Deployment

The app is deployed on [Vercel](https://vercel.com). To deploy your own copy:

1. Import this repository at [vercel.com/new](https://vercel.com/new).
2. (Optional) Add the SMTP environment variables above under **Settings → Environment Variables**.
3. Deploy. Every push to `main` ships automatically.

## Security notes

- The email endpoint validates and sanitises all input, caps recipients and payload sizes, supports a domain allow-list, and applies a per-IP rate limit.
- Checklist drafts never leave the device unless a user explicitly downloads or emails a report.

## License

All rights reserved. Contact the repository owner for permission to reuse.
