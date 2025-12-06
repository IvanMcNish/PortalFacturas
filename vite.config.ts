import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/PortalFacturas/',   // 👈 muy importante para GitHub Pages
})
