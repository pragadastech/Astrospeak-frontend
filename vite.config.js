import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const siteOrigins = [
  'https://astrogreet.com',
  'https://www.astrogreet.com',
  'https://astrogreet.in',
  'https://www.astrogreet.in',
]
const siteHosts = siteOrigins.map((origin) => new URL(origin).host)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: siteHosts,
    cors: { origin: siteOrigins },
    proxy: { '/api': 'http://localhost:8080' },
  },
  preview: {
    allowedHosts: siteHosts,
    cors: { origin: siteOrigins },
  },
})
