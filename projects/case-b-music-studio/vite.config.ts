import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Production builds are served from
 * https://civicaiclub.github.io/Civic-AI-Github-Repository/, so assets need
 * that subpath. Dev keeps the root so `npm run dev` still serves at
 * http://localhost:5173/.
 */
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Civic-AI-Github-Repository/" : "/",
  plugins: [react()],
}));
