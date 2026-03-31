import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'docs', // Output to docs for GitHub Pages master/docs deploying
        emptyOutDir: true
    }
})
