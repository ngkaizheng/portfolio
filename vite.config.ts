import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Deployed as a GitHub Pages *project* page at https://ngkaizheng.github.io/portfolio/,
// so every emitted asset URL must carry the /portfolio/ prefix or it 404s.
export default defineConfig({
  base: '/portfolio/',
  plugins: [react()],
})
