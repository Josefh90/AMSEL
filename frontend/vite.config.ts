import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ✅ Add these dev server optimizations
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: false, // Important for Windows performance
    },
  },

  clearScreen: false, // Optional: keeps logs visible
})
