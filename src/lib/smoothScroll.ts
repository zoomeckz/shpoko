/**
 * Smooth mouse-wheel scrolling for the whole page.
 *
 * A wheel "click" normally jumps the page ~100px at once. Here each click
 * moves a target position, and the page glides toward it every frame.
 * Left alone on purpose:
 *  - trackpads and touch screens (already smooth),
 *  - people who prefer reduced motion,
 *  - ctrl+wheel (zoom) and sideways scrolling,
 *  - scrollable areas inside the page (dialogs, tables),
 *  - while a dialog has locked the page.
 * Dragging the scrollbar or using the keyboard cancels the glide.
 */
export function initSmoothScroll(): () => void {
  if (typeof window === "undefined") return () => {};

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const EASE = 0.12; // share of the remaining distance covered each frame
  let target = window.scrollY;
  let current = window.scrollY;
  let frame = 0;
  let lastSet = -1;
  let trackpadUntil = 0;

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  // Can an element under the pointer scroll further in this direction itself?
  const innerScrollable = (start: EventTarget | null, dy: number) => {
    for (let node = start as HTMLElement | null; node && node !== document.body; node = node.parentElement) {
      if (!(node instanceof HTMLElement)) continue;
      const overflow = getComputedStyle(node).overflowY;
      if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight + 1) {
        const canGo = dy > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight - 1 : node.scrollTop > 0;
        if (canGo) return true;
      }
    }
    return false;
  };

  const step = () => {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) current = target;
    lastSet = Math.round(current);
    window.scrollTo({ top: current, behavior: "instant" as ScrollBehavior });
    frame = current === target ? 0 : requestAnimationFrame(step);
  };

  const onWheel = (e: WheelEvent) => {
    if (reduceMotion.matches || e.ctrlKey || e.defaultPrevented) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (document.body.hasAttribute("data-scroll-locked")) return;

    const dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1);
    // Trackpads send many small steps (and then momentum); leave the whole gesture alone.
    const now = performance.now();
    if (e.deltaMode === 0 && Math.abs(dy) < 40) trackpadUntil = now + 400;
    if (now < trackpadUntil) return;
    if (innerScrollable(e.target, dy)) return;

    e.preventDefault();
    if (!frame) current = target = window.scrollY;
    target = Math.max(0, Math.min(maxScroll(), target + dy));
    if (!frame) frame = requestAnimationFrame(step);
  };

  const onScroll = () => {
    // Someone else moved the page (scrollbar, keys, a link): stop gliding.
    if (frame && Math.abs(window.scrollY - lastSet) > 2) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (!frame) current = target = window.scrollY;
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("scroll", onScroll);
    if (frame) cancelAnimationFrame(frame);
  };
}
