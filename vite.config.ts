import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      __WAAPI_ACCESS_TOKEN__: JSON.stringify(env.WAAPI_ACCESS_TOKEN),
      __WAAPI_INSTANCE_ID__: JSON.stringify(env.WAAPI_INSTANCE_ID),
      __WAAPI_PHONE_NUMBER__: JSON.stringify(env.WAAPI_PHONE_NUMBER),
      __WAAPI_BASE_URL__: JSON.stringify(env.WAAPI_BASE_URL || 'https://waapi.app/api/v1'),
      __SUPABASE_URL__: JSON.stringify(env.SUPABASE_URL),
      __SUPABASE_ANON_KEY__: JSON.stringify(env.SUPABASE_ANON_KEY),
    }
  };
});
