import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Static-first foundation. Patient data and booking rules must be enforced
// by Supabase Auth, Row Level Security, and database constraints—not the UI.
export default defineConfig({
  output: "static",
  site: "https://som76377-alt.github.io",
  base: "/Doctor-",
  vite: {
    plugins: [tailwindcss()],
  },
});
