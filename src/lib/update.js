// Home Screen web apps on iPad/iPhone often keep running an old copy after a new version is published.
// Every build publishes a tiny version.json next to the page; the app compares it with its own version and
// offers a one-tap reload that bypasses the cache.
export const CURRENT_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

/** The version currently published, or null if it can't be read (offline, dev server). */
export async function latestVersion() {
  try {
    const r = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json();
    return typeof j.version === 'string' ? j.version : null;
  } catch {
    return null;
  }
}

/** Load the page again under a new address so the old cached copy is not used. Saved progress is untouched. */
export function reloadFresh() {
  const u = new URL(window.location.href);
  u.searchParams.set('v', String(Date.now()));
  window.location.replace(u.toString());
}
