import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Ficheiros com hash permitem à Vercel fazer cache do JavaScript e CSS.
  // O site deixa de ser injetado num único HTML grande.
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
        // opcional: se o backend não precisar do prefixo /api, ative a reescrita
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
