import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig({
  // Relative base keeps the build deployable under any sub path
  base: './',
  plugins: [vue()],
  define: {
    // Single source of truth for the version shown in the UI
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    // Expose the dev server on the LAN so a phone can open it
    host: true,
  },
})
