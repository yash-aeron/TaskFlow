import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// CSP applied to production builds only (dev mode needs inline scripts/HMR).
// Allows: self scripts; inline styles (React inline styles); Google Fonts css+fonts.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Inject CSP meta tag into every HTML entry during production builds only
    // (dev server is left untouched so HMR/inline scripts keep working).
    {
      name: 'inject-csp',
      apply: 'build',
      transformIndexHtml(html) {
        return html.replace(/<head>/, `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`)
      },
    },
  ],
  base: './',
  server: {
    // Hardening for dev server (GHSA-fx2h-pf6j-xcff / GHSA-67mh-4wv8-2f99):
    // prevent reading files outside the project root and block cross-origin
    // requests from arbitrary websites to the dev server.
    cors: false,
    fs: { strict: true, allow: [resolve(__dirname)] },
  },
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
