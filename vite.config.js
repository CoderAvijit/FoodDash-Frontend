import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server runs on port 8081 — free on this machine and already in the backend CORS allowlist.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 8081,
    strictPort: true,
    // Local dev: proxy "/api/*" to a backend on localhost:8080 (strip the /api prefix),
    // mirroring the Vercel rewrite so the same code path works everywhere.
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
