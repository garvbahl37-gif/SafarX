import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ── HTTPS cert loader — only runs in local dev, skipped in production build ──
const loadLocalHttps = () => {
  // Vercel handles HTTPS automatically — skip in production
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    // Dynamic require so Vercel's build doesn't break
    const fs = require("fs");
    const keyPath = path.resolve(__dirname, "localhost-key.pem");
    const certPath = path.resolve(__dirname, "localhost.pem");

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      console.log("✅ HTTPS certs found — WebXR headset mode enabled");
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }

    console.log(
      "ℹ️  No HTTPS certs found — running HTTP (VR headset requires HTTPS)"
    );
    console.log(
      "   To enable: run `mkcert -install && mkcert localhost` in project root"
    );
    return false;
  } catch {
    return false;
  }
};

const httpsConfig = loadLocalHttps();

export default defineConfig({
  plugins: [react()],

  base: "/", // ← Keep explicit base path

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    // ── HTTPS (only active when certs exist in local dev) ─────────
    // Required for WebXR on VR headsets connected over local network
    // Vercel provides HTTPS automatically in production
    ...(httpsConfig && { https: httpsConfig }),

    host: true,   // Expose to network — needed so VR headset can connect
    port: 3000,   // Keep your original port
    open: true,

    proxy: {
      "/api": {
        target: "http://localhost:1337",
        changeOrigin: true,
        secure: false,
      },
      "/graphql": {
        target: "http://localhost:1337",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ── Pre-bundle Three.js so Vite doesn't re-transform it ──────────
  optimizeDeps: {
    include: [
      "three",
    ],
  },

  build: {
    outDir: "dist",

    // Three.js is ~600KB — raise warning limit to avoid noise
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["lucide-react", "framer-motion"],

          // ── Split Three.js into its own chunk ───────────────────
          // Prevents it from bloating the main bundle (~600KB)
          // Only loads when user enters VR mode
          three: ["three"],
        },
      },
    },
  },
});