import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10 MiB
      },
      manifest: {
        name: "CandyCal",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon"
          },
          {
            src: "favicon-16x16.png",
            type: "image/png",
            sizes: "16x16"
          },
          {
            src: "favicon-32x32.png",
            type: "image/png",
            sizes: "32x32"
          }
        ],
        start_url: "/",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff"
      }
    })
  ],
  server: {
    port: 8386
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const parts = id.split("node_modules/")[1].split("/")
            return parts[0].startsWith("@")
              ? `${parts[0]}/${parts[1]}`
              : parts[0]
          }
        }
      }
    }
  }
})
