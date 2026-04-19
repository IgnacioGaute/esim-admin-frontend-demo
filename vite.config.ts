import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
// @ts-ignore
import { resolve } from 'path';

// @ts-ignore
const root = resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': root
    }
  }
})
