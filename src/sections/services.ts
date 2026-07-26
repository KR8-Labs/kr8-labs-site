import { fromHTML } from "../dom.ts";
import { SERVICES } from "../data.ts";
import { initServices3D, type Services3D } from "../services-3d.ts";

// Fraction of the entrance over which the canvas fades from transparent to
// fully opaque — deliberately well short of 1 so it reaches full opacity
// partway up rather than only once it has finished sliding.
const FADE_FRACTION = 0.45;

export function services(): HTMLElement {
  const section = fromHTML(`
    <section class="services" id="services">
      <div class="services-header">
        <p class="eyebrow">01 · WHAT WE DO</p>
        <h2>Capabilities</h2>
      </div>
      <div class="services-track" style="--count: ${SERVICES.length}">
        <div class="services-stage">
          <div class="services-stage-canvas-wrap">
            <canvas class="services-stage-canvas" aria-hidden="true"></canvas>
          </div>
          <div class="services-stage-text">
            <div class="services-stage-panels">
              ${SERVICES.map((s, i) => `
                <div class="services-panel" data-index="${i}">
                  <p class="services-panel-num">0${i + 1}</p>
                  <h3 class="services-panel-title">${s.title}</h3>
                  <p class="services-panel-desc">${s.description}</p>
                </div>
              `).join("")}
            </div>
            <div class="services-progress">
              ${SERVICES.map((s, i) => `<span class="services-progress-dot" data-index="${i}" title="${s.title}"></span>`).join("")}
            </div>
          </div>
        </div>
      </div>
    </section>
  `);

  const track = section.querySelector<HTMLElement>(".services-track")!;
  const canvas = section.querySelector<HTMLCanvasElement>(".services-stage-canvas")!;
  // Animate this wrapper, not the canvas directly — initServices3D() replaces
  // the canvas element internally (Three.js creates its own), so a direct
  // reference to it would go stale the moment the controller is built.
  const canvasWrap = section.querySelector<HTMLElement>(".services-stage-canvas-wrap")!;
  const stageText = section.querySelector<HTMLElement>(".services-stage-text")!;
  const panels = Array.from(section.querySelectorAll<HTMLElement>(".services-panel"));
  const dots = Array.from(section.querySelectorAll<HTMLElement>(".services-progress-dot"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let controller: Services3D | null = null;
  let lastApplied = -1;
  let removed = false;

  // `entrance` (0..1) drives the canvas reveal at the top of the track;
  // `carousel` (0..count, wraps) drives which object is at the front once
  // the entrance has finished.
  function computeState(): { entrance: number; carousel: number } {
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight;
    // The entrance is keyed to the stage travelling up through the viewport —
    // 0 when the track's top is at the bottom of the screen, 1 the moment it
    // reaches the top and the stage pins. Keying it to the *pinned* scroll
    // range instead would leave the canvas at opacity 0 for the whole stretch
    // directly under the section header, reading as a large empty gap.
    const entrance = Math.min(1, Math.max(0, 1 - rect.top / vh));
    // The carousel then gets the entire pinned range to itself.
    const total = rect.height - vh;
    const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
    // Clamp just short of SERVICES.length — landing exactly on it would leave
    // no object owning the step while the text panel is still clamped to the
    // last index, a one-frame mismatch right at track's end.
    const carousel = Math.min(progress * SERVICES.length, SERVICES.length - 0.001);
    return { entrance, carousel };
  }

  function applyIndex(index: number) {
    if (index === lastApplied) return;
    lastApplied = index;
    panels.forEach((p, i) => p.classList.toggle("is-active", i === index));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function onScroll() {
    const { entrance, carousel } = computeState();

    if (reducedMotion) {
      canvasWrap.style.transform = "";
      canvasWrap.style.opacity = "";
    } else {
      // Slides up into place as a whole card — translate + *uniform* scale,
      // never scaleY, which would squash the 3D render's aspect ratio. The
      // stage clips it, so it reads as rising from below the section edge.
      // smoothstep so it eases in/out rather than tracking scroll linearly.
      const eased = entrance * entrance * (3 - 2 * entrance);
      canvasWrap.style.transform = `translateY(${(1 - eased) * 40}%) scale(${0.94 + eased * 0.06})`;
      // Fade runs on its own, shorter schedule than the slide: it starts at
      // fully transparent and is done by FADE_FRACTION of the way up, so the
      // card spends the rest of the rise solid rather than creeping towards
      // opaque for the whole entrance.
      canvasWrap.style.opacity = String(Math.min(1, entrance / FADE_FRACTION));
    }
    stageText.style.opacity = String(Math.max(0, (entrance - 0.5) / 0.5));

    const index = Math.min(SERVICES.length - 1, Math.floor(carousel));
    applyIndex(index);
    controller?.setCarousel(carousel);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Building the WebGL renderer + bloom pass is cheap now that it's a
  // single shared instance (see services-3d.ts), but the track is below
  // the fold on load, so still defer construction until it's about to be
  // scrolled into view rather than paying that cost unconditionally.
  const initObserver = new IntersectionObserver(
    (entries, obs) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      obs.disconnect();
      if (removed) return;
      controller = initServices3D(canvas);
      lastApplied = -1; // force the freshly-built controller to sync to the current state
      onScroll();
    },
    { rootMargin: "200px 0px" },
  );
  initObserver.observe(track);

  const originalRemove = section.remove.bind(section);
  section.remove = () => {
    removed = true;
    window.removeEventListener("scroll", onScroll);
    initObserver.disconnect();
    controller?.destroy();
    originalRemove();
  };

  return section;
}
