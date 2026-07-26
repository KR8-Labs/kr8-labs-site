import Lenis from "lenis";

/**
 * Same technique as incredibles.dev: Lenis in its default window-scrolling
 * mode (no wrapper/content options) — it still mutates real window scroll
 * position each frame, so existing scroll listeners and IntersectionObservers
 * elsewhere in the app keep working unchanged.
 */
export function initSmoothScroll(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  new Lenis({
    autoRaf: true,
    anchors: true,
  });
}
