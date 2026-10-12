import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shareefs Checklists",
    short_name: "Checklists",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ec",
    theme_color: "#c8452f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
