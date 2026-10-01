import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // Relative base keeps the build deployable under any sub path
  base: './',
  plugins: [vue()],
  server: {
    // Expose the dev server on the LAN so a phone can open it
    host: true,
  },
})
