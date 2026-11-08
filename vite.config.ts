import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { dataApiPlugin } from './vite-plugins/data-api-plugin.ts'

// El repo de contenido (sessions/, ROADMAP.md) es el padre de dashboard/.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/huerto-inteligente/' : '/',
  plugins: [react(), tailwindcss(), dataApiPlugin({ repoRoot })],
})
