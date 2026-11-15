import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/portfolio/',
  plugins: [react()],
  build: {
    rollupOptions: {
      // Two entry pages: the classic site and the 3D showcase.
      input: { main: 'index.html', showcase: 'showcase.html' },
    },
  },
})
