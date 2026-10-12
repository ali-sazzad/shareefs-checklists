import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const display = Alfa_Slab_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Barlow_Condensed({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Shareefs Checklists",
  description: "Opening and closing checklists for Front of House and Back of House.",
  appleWebApp: { capable: true, title: "Checklists", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#c8452f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
