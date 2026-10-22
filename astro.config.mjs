import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Static-first foundation. Patient data and booking rules must be enforced
// by Supabase Auth, Row Level Security, and database constraints—not the UI.
export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
