import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { createServer } from "./backend";

// Vite serves the frontend and mounts the Express API in development.
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./frontend", "index.html"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "backend/**"],
    },
  },
  build: { outDir: "dist/spa" },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(createServer());
    },
  };
}
