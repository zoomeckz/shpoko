/**
 * Rebuild switchboard.
 *
 * Everything from the old site is still in the code, just hidden while the
 * new course is built. Set SHOW_LEGACY to true to bring all of it back, or add
 * a single path to LIVE_PATHS to bring back one page.
 */
export const SHOW_LEGACY = false;

/** Pages that are part of the new site. */
const LIVE_PATHS = ["/", "/welcome", "/auth"];

/** Whole sections that stay reachable (the admin panel is for the site owner). */
const LIVE_PREFIXES = ["/admin"];

export const isLive = (path: string) =>
  SHOW_LEGACY ||
  LIVE_PATHS.includes(path) ||
  LIVE_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
