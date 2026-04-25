import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages: site is at https://<user>.github.io/<repo>/
// Cloudflare Pages: build has CF_PAGES set; app is served at the domain root → base "/"
const base =
  process.env.CF_PAGES === "1" || process.env.CF_PAGES === "true"
    ? "/"
    : "/i-know-a-spot-aitu/";

export default defineConfig({
  base,
  plugins: [react()],
  assetsInclude: ["**/*.JPG", "**/*.JPEG"],
});
