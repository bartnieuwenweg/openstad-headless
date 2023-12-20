import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [react()]
    }
  } else {
    return {
      plugins: [react({ jsxRuntime: 'classic' })],
      build: {
        lib: {
          formats: ['iife'],
          entry: 'src/choice-guide.tsx',
          name: 'OpenstadHeadlessChoiceGuide'
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'remixicon/fonts/remixicon.css'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        }
      }
    }
  }
})
