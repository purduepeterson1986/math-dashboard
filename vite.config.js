import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { execSync } from 'node:child_process';

// Shown (small, gray) on the Parent Portal PIN screen so you can tell which build a device is running.
const commit = (() => { try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return 'local'; } })();
const built = new Date().toISOString().slice(0, 10);

// base: './' keeps every path relative, so the build works on GitHub Pages at
// https://<user>.github.io/<repo>/ without knowing the repo name.
// viteSingleFile inlines all JS and CSS into index.html, so the same page also runs
// straight from a file on disk (the Desktop shortcut's offline copy).
const versionFile = { name: 'version-file', generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: `${built} · ${commit}` }) }); } };

export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(`${built} · ${commit}`) },
  plugins: [react(), tailwindcss(), viteSingleFile(), versionFile],
});
