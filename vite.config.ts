import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({
      presets: [
        reactCompilerPreset()
      ],
      exclude: ["**/node_modules/**"],
      include: ["src/**/*.{ts,tsx,js,jsx}"],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Gom nhóm các thư viện Core UI/Logic
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-core";
            }
            // Gom nhóm các thư viện Visualization (Three.js, D3, Recharts...)
            if (id.includes("three") || id.includes("d3") || id.includes("recharts")) {
              return "vendor-viz";
            }
            // Tất cả các thư viện nhỏ khác gom vào một file vendors chung
            return "vendor-libs";
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  appType: 'spa'
});
