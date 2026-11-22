import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { execSync } from 'node:child_process';

// The version label: the date of the latest commit and its short code, e.g. "2026-11-22 · 9e9a83f".
// The published site and the test copy use the same format, so the two can be compared at a glance.
const git = (args) => { try { return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } };
const gitVersion = () => `${git('log -1 --format=%cs') || new Date().toISOString().slice(0, 10)} · ${git('rev-parse --short HEAD') || 'local'}`;
const built = gitVersion();

// base: './' keeps every path relative, so the build works on GitHub Pages at
// https://<user>.github.io/<repo>/ without knowing the repo name.
// viteSingleFile inlines all JS and CSS into index.html, so the same page also runs
// straight from a file on disk (the Desktop shortcut's offline copy).
const versionFile = { name: 'version-file', generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: built }) }); } };

// Dev server only: GET /__version returns the commit the files on disk are based on, and says so if there are unsaved-to-git edits.
const devVersion = {
  name: 'dev-version',
  configureServer(server) {
    server.middlewares.use('/__version', (_req, res) => {
      const dirty = git('status --porcelain') !== '';
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ version: `${gitVersion()}${dirty ? ' + local changes' : ''}` }));
    });
  },
};

export default defineConfig(({ command }) => ({
  base: './',
  // The test copy asks the dev server for the current commit each time (see devVersion), because this value is fixed at start-up
  define: { __APP_VERSION__: JSON.stringify(command === 'serve' ? 'local test copy' : built) },
  plugins: [react(), tailwindcss(), viteSingleFile(), versionFile, devVersion],
}));
