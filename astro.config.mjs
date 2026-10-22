import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages publishes this project under /Doctor-.
// Vercel publishes it at the domain root, so it must use / instead.
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  output: "static",
  site: isGitHubPagesBuild
    ? "https://som76377-alt.github.io"
    : "https://doctor-clinic-preview.vercel.app",
  base: isGitHubPagesBuild ? "/Doctor-" : "/",
  vite: {
    plugins: [tailwindcss()],
  },
});
