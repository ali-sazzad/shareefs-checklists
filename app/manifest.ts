import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shareefs Checklists",
    short_name: "Checklists",
    start_url: `${base}/`,
    display: "standalone",
    background_color: "#f4f1ec",
    theme_color: "#c8452f",
    icons: [{ src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml" }],
  };
}
