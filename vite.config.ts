import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  define: {
    'process.env.VITE_WAAPI_ACCESS_TOKEN': JSON.stringify(process.env.VITE_WAAPI_ACCESS_TOKEN),
    'process.env.VITE_WAAPI_INSTANCE_ID': JSON.stringify(process.env.VITE_WAAPI_INSTANCE_ID),
    'process.env.VITE_WAAPI_PHONE_NUMBER': JSON.stringify(process.env.VITE_WAAPI_PHONE_NUMBER),
    'process.env.VITE_WAAPI_BASE_URL': JSON.stringify(process.env.VITE_WAAPI_BASE_URL || 'https://waapi.app/api/v1'),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY)
  }
});
