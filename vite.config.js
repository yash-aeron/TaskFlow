import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        today: resolve(__dirname, 'today.html'),
        timer: resolve(__dirname, 'timer.html'),
        habits: resolve(__dirname, 'habits.html'),
        quickadd: resolve(__dirname, 'quickadd.html'),
      }
    }
  }
})
