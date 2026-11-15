import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes every asset path relative, so the built site works
// on GitHub Pages no matter what the repository is named.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
