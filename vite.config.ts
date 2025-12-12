
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // API_KEY is now handled securely on the server (Vercel Edge Function).
      // We do NOT inject it into the client bundle anymore to prevent leaks.
    },
    server: {
      host: '0.0.0.0', // Allow access from network (critical for WeChat DevTools on same wifi)
      port: 5173,
    }
  }
})
