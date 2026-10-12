import type { NextConfig } from "next";

// GitHub Pages build (see .github/workflows/pages.yml): static export under /<repo>.
// The Vercel build leaves these unset and keeps the server email route.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isStatic = process.env.NEXT_PUBLIC_STATIC === "1";

const nextConfig: NextConfig = {
  ...(isStatic && { output: "export", trailingSlash: true, images: { unoptimized: true } }),
  ...(basePath && { basePath }),
};

export default nextConfig;
