import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = {}

  const functionUrl = env.VITE_FUNCTION_URL
  if (functionUrl) {
    const { origin, pathname } = new URL(functionUrl)
    const key = pathname === '/' ? '/' : pathname
    proxy[key] = {
      target: origin,
      changeOrigin: true,
    }
  }

  return {
    plugins: [react()],
    server: {
      proxy,
    },
  }
})
