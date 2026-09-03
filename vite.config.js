import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// ── HTTPS cert loader — only runs in local dev, skipped in production build ──
const loadLocalHttps = () => {
  // Vercel handles HTTPS automatically — skip in production
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return false;
  }

  try {
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

/**
 * Runs the /api serverless functions during `npm run dev`.
 *
 * In production Vercel executes everything under api/ for us. Locally there
 * is no such runtime, so this middleware resolves /api/<path> to
 * api/<path>.js and calls its default export with request and response shims
 * shaped like the ones Vercel passes. Without it the stays autocomplete and
 * the agent chat only work once deployed.
 */
/**
 * Vercel's file routing, as much of it as these functions rely on:
 * /api/a/b -> api/a/b.js, then api/a/b/index.js, then a [param] segment
 * such as api/documents/[id].js, whose value is handed back as a query param.
 *
 * Without the last two rules /api/documents and /api/documents/<id> fell
 * through to the static server, which answered with the function's own source.
 */
const resolveApiFile = (pathname) => {
  const parts = pathname.slice(5).split("/").filter(Boolean);
  if (!parts.length) return null;
  const base = path.resolve(__dirname, "api");

  const direct = path.resolve(base, `${parts.join("/")}.js`);
  if (fs.existsSync(direct)) return { file: direct, params: {} };

  const index = path.resolve(base, ...parts, "index.js");
  if (fs.existsSync(index)) return { file: index, params: {} };

  // One dynamic segment, in the last position, which is all these routes use.
  const dir = path.resolve(base, ...parts.slice(0, -1));
  if (fs.existsSync(dir)) {
    const dynamic = fs.readdirSync(dir).find((f) => /^\[[^\]]+\]\.js$/.test(f));
    if (dynamic) {
      const name = dynamic.slice(1, dynamic.indexOf("]"));
      return { file: path.resolve(dir, dynamic), params: { [name]: parts[parts.length - 1] } };
    }
  }
  return null;
};

const vercelApiDev = () => ({
  name: "vercel-api-dev",
  apply: "serve",
  configureServer(server) {
    // Functions read plain (unprefixed) secrets from process.env, the way
    // they do on Vercel — Vite only exposes VITE_ vars by itself.
    const env = loadEnv(server.config.mode, process.cwd(), "");
    for (const [key, value] of Object.entries(env)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }

    /* WebSocket functions export an http.Server rather than a handler, and an
       upgrade never reaches the middleware stack — so it is forwarded here.
       Without this the voice socket only works once deployed. */
    server.httpServer?.on("upgrade", async (req, socket, head) => {
      if (!req.url?.startsWith("/api/")) return;
      const url = new URL(req.url, "http://localhost");
      const file = path.resolve(__dirname, "api", `${url.pathname.slice(5)}.js`);
      if (!fs.existsSync(file)) return;
      try {
        const mod = await server.ssrLoadModule(file);
        const upstream = mod.default;
        if (typeof upstream?.emit !== "function") return;
        upstream.emit("upgrade", req, socket, head);
      } catch (err) {
        server.config.logger.error(`[api upgrade] ${url.pathname}: ${err}`);
        socket.destroy();
      }
    });

    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith("/api/")) return next();

      const url = new URL(req.url, "http://localhost");
      const resolved = resolveApiFile(url.pathname);
      if (!resolved) return next();
      const { file, params } = resolved;

      const send = (code, payload) => {
        res.statusCode = code;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(payload));
      };

      try {
        const body = await new Promise((resolve) => {
          if (req.method === "GET" || req.method === "HEAD") return resolve(undefined);
          let raw = "";
          req.on("data", (c) => { raw += c; });
          req.on("end", () => {
            try { resolve(raw ? JSON.parse(raw) : undefined); } catch { resolve(undefined); }
          });
        });

        const mod = await server.ssrLoadModule(file);
        /* Mirrors the shape Vercel hands a Node function. writeHead and write
           are here because the agent's chat streams its answer, and without
           them dev would throw where production works — the worst kind of
           difference to discover after deploying. */
        const shimRes = {
          statusCode: 200,
          setHeader: (k, v) => res.setHeader(k, v),
          status(code) { this.statusCode = code; return this; },
          json(payload) { send(this.statusCode, payload); return this; },
          writeHead(code, headers) {
            this.statusCode = code;
            res.writeHead(code, headers);
            return this;
          },
          write: (chunk) => res.write(chunk),
          flushHeaders: () => res.flushHeaders?.(),
          end: (payload) => res.end(payload),
        };
        await mod.default(
          { method: req.method, url: req.url, headers: req.headers,
            query: { ...Object.fromEntries(url.searchParams), ...params }, body },
          shimRes
        );
      } catch (err) {
        server.config.logger.error(`[api] ${url.pathname}: ${err}`);
        send(500, { error: String(err).slice(0, 300) });
      }
    });
  },
});

const httpsConfig = loadLocalHttps();

export default defineConfig({
  plugins: [react(), vercelApiDev()],

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