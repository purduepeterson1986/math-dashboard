import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base: './' makes every asset path relative, so the build works on
// GitHub Pages at https://<user>.github.io/<repo>/ without knowing the repo name.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
