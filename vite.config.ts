import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  // host: true permite abrir la app desde el celular en la misma red Wi-Fi.
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  // three.js pesa bastante; evita el aviso de chunk grande en el build.
  build: { chunkSizeWarningLimit: 2000 },
})
