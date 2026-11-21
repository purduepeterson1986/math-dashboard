# Lumen Math Lab

An iPad-first homeschool math & STEM dashboard (React + Vite + Tailwind CSS + Lucide).
Ages 3 and 12 are fully built; ages 4–11 and 13–18 show a "coming soon" module and plug in
by adding `src/curriculum/ageN.js` (see `PLAN.md` for the contract).

## Run locally

```bash
npm install
npm run dev          # serves on your LAN too: open http://<your-mac-ip>:5173 on the iPad
npm run test:generators   # stress-tests every question generator (~65k checks)
npm run build        # production build into dist/
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository (branch `main`).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`: it tests the generators, builds, and publishes.

The build uses relative asset paths (`base: './'`), so it works at `https://<user>.github.io/<repo>/`
without any configuration. On the iPad, open the site in Safari → Share → **Add to Home Screen**
for a full-screen app.

## Data

Progress is stored in the browser's `localStorage` on each device (key `lumen.sessions.v1`).
Use **Parent Portal → Settings → Export JSON backup** regularly; Import merges a backup back in.
The Parent Portal is gated by a grown-up math question, or a 4-digit PIN once one is set.
