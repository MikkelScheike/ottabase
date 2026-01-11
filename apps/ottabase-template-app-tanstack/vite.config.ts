import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, Plugin } from "vite";

// SPA fallback plugin for client-side routing
// SPA fallback plugin: rewrites non-API HTML requests to index.html
// This ensures that paths like /demo or /profile trigger the React app instead of 404ing
function spaFallback(): Plugin {
  return {
    name: "spa-fallback",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        // Don't touch API requests
        if (url.startsWith("/api")) return next();

        // Check if path has a file extension (heuristic for "is a file")
        // We strip query params first so /search?q=doc.pdf works as a route
        const path = url.split(/[?#]/)[0];
        const isFile = path.includes(".");

        // If it's not a file and the browser wants HTML, serve the app
        if (!isFile && req.headers.accept?.includes("text/html")) {
          req.url = "/index.html";
        }

        next();
      });
    },
  };
}

export default defineConfig(async () => {
  const { default: tsconfigPaths } = await import("vite-tsconfig-paths");

  return {
    plugins: [
      tsconfigPaths({
        projects: [path.resolve(__dirname, "./tsconfig.json")],
        ignoreConfigErrors: true,
      }),
      react(),
      spaFallback(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      cssTarget: "chrome88",
      rollupOptions: {
        output: {
          manualChunks: {
            mantine: [
              "@mantine/core",
              "@mantine/hooks",
              "@mantine/modals",
              "@mantine/notifications",
              "@mantine/carousel",
            ],
            tanstack: [
              "@tanstack/react-query",
              "@tanstack/react-query-devtools",
              "@tanstack/react-router",
            ],
            ottaeditor: ["@ottabase/ottaeditor"],
          },
        },
      },
    },
    server: {
      host: "127.0.0.1",
      port: parseInt(process.env.PORT_FE || "3003"),
      strictPort: true,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${process.env.PORT_BE || 3004}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 4173,
    },
  };
});
