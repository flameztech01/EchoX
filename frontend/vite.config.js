import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      manifest: {
        name: "EchoX",
        short_name: "EchoX",
        description:
          "EchoX helps users express themselves freely, connect with others, and share anonymous posts in a safe, interactive community.",
        start_url: "/",
        display: "standalone",
        theme_color: "#1EA1D9",
        background_color: "#E8E8E8",
        icons: [
          {
            src: "/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      // ADD THIS to ensure manifest is properly injected
      injectRegister: "auto",
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  // ADD THIS to handle static assets properly
  build: {
    manifest: true,
    rollupOptions: {
      input: "./index.html",
    },
  },
});
