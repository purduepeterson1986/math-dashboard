import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base: './' keeps every path relative, so the build works on GitHub Pages at
// https://<user>.github.io/<repo>/ without knowing the repo name.
// viteSingleFile inlines all JS and CSS into index.html, so the same page also runs
// straight from a file on disk (the Desktop shortcut's offline copy).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
});
