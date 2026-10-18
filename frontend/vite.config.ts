import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necesario para que escuche en todas las interfaces
    allowedHosts: [
      'chaplain-recollect-hydroxide.ngrok-free.dev' // Pega aquí tu dominio actual de ngrok
    ]
  }
})
