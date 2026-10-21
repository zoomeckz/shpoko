/**
 * Rebuild switchboard.
 *
 * Everything from the old site is still in the code, just hidden while the
 * new course is built. Set SHOW_LEGACY to true to bring all of it back, or add
 * a single path to LIVE_PATHS to bring back one page.
 */
export const SHOW_LEGACY = false;

/**
 * Sound buttons in lessons play recorded clips from /public/audio/...
 * Turn this on once the clips are in place (see src/data/course.ts).
 */
export const SHOW_SOUND_BUTTONS = false;

/** Pages that are part of the new site. */
const LIVE_PATHS = ["/", "/welcome", "/auth"];

/** Whole sections that stay reachable (the admin panel is for the site owner). */
const LIVE_PREFIXES = ["/admin", "/course"];

export const isLive = (path: string) =>
  SHOW_LEGACY ||
  LIVE_PATHS.includes(path) ||
  LIVE_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
