import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // Relative asset URLs work both locally and under a GitHub Pages project path.
  base: './',
  plugins: [vue()],
})
