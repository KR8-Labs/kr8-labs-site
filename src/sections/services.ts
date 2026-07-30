import { fromHTML } from "../dom.ts";
import { SERVICES } from "../data.ts";
// Type-only — the module itself is imported dynamically below so that Three.js
// stays out of the initial bundle. A `import type` is erased at compile time.
import type { Services3D } from "../services-3d.ts";

// Fraction of the entrance over which the canvas fades from transparent to
// fully opaque — deliberately well short of 1 so it reaches full opacity
// partway up rather than only once it has finished sliding.
const FADE_FRACTION = 0.45;
// Fraction of the un-pin tail the exit animation spends. The tail is always
// one viewport (sticky geometry: the stage travels its own height once it
// releases), and the last service stays on screen for all of it — so letting
// the exit fill the whole thing left Performance lingering for roughly twice
// the scroll distance of the services before it. Finishing early hands the
// remainder back as ordinary page background, which is what sits between
// every other pair of sections anyway.
const EXIT_FRACTION = 0.5;

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
  const header = section.querySelector<HTMLElement>(".services-header")!;
  const stageText = section.querySelector<HTMLElement>(".services-stage-text")!;
  const panels = Array.from(section.querySelectorAll<HTMLElement>(".services-panel"));
  const dots = Array.from(section.querySelectorAll<HTMLElement>(".services-progress-dot"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let controller: Services3D | null = null;
  let lastApplied = -1;
  let removed = false;

  // `reveal` (0..1) drives how present the canvas is — it ramps up over the
  // entrance and back down over the exit; `leaving` says which of the two is
  // running, since they move the card in opposite directions. `carousel`
  // (0..count) drives which object is at the front in between.
  function computeState(): {
    reveal: number;
    leaving: boolean;
    carousel: number;
    releasePx: number;
  } {
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight;
    // Entrance and exit are mirror images, one viewport of scroll each: the
    // entrance follows the track's *top* edge rising from the bottom of the
    // screen to the top, finishing exactly as the stage pins; the exit
    // follows its *bottom* edge doing the same, starting exactly as it
    // unpins. Keying the entrance to the pinned scroll range instead would
    // leave the canvas at opacity 0 for the whole stretch directly under the
    // section header, reading as a large empty gap.
    const entrance = Math.min(1, Math.max(0, 1 - rect.top / vh));
    const exit = Math.min(1, Math.max(0, (1 - rect.bottom / vh) / EXIT_FRACTION));
    // The carousel gets the entire pinned range — which is exactly the span
    // where both entrance and exit sit at their extremes, so it never
    // competes with either.
    const total = rect.height - vh;
    const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
    // Clamp just short of SERVICES.length — landing exactly on it would leave
    // no object owning the step while the text panel is still clamped to the
    // last index, a one-frame mismatch right at track's end.
    const carousel = Math.min(progress * SERVICES.length, SERVICES.length - 0.001);
    // Pixels scrolled since the stage un-pinned — 0 while it's still pinned.
    // Drives releasing the header in onScroll(). Keyed to the un-pin rather
    // than to the final service taking over, so the title leaves *with* the
    // last frame instead of sliding away while it's still sitting there.
    const releasePx = Math.max(0, vh - rect.bottom);
    return {
      reveal: Math.min(entrance, 1 - exit),
      leaving: exit > 0,
      carousel,
      releasePx,
    };
  }

  function applyIndex(index: number) {
    if (index === lastApplied) return;
    lastApplied = index;
    panels.forEach((p, i) => p.classList.toggle("is-active", i === index));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function onScroll() {
    const { reveal, leaving, carousel, releasePx } = computeState();

    // Once the stage un-pins, the header stops behaving like a sticky element
    // and travels with the page — 1:1 with scroll, which is exactly what the
    // Performance panel inside the stage is doing, so the title and the last
    // frame leave together. Translating it is equivalent to un-sticking it but
    // without the snap that flipping `position` mid-scroll would cause: the
    // element would jump from its pinned spot back to its long-since-scrolled-
    // past place in the flow. Capped once it has cleared the top of the
    // screen, so the offset stays bounded for the rest of the section.
    if (releasePx > 0) {
      // Read from the CSS rather than repeating the sticky offset here, so
      // the two can't drift apart.
      const stickyTop = parseFloat(getComputedStyle(header).top) || 0;
      const clearance = stickyTop + header.offsetHeight;
      header.style.transform = `translateY(${-Math.min(releasePx, clearance)}px)`;
    } else if (header.style.transform) {
      header.style.transform = "";
    }

    if (reducedMotion) {
      canvasWrap.style.transform = "";
      canvasWrap.style.opacity = "";
    } else {
      // Moves as a whole card — translate + *uniform* scale, never scaleY,
      // which would squash the 3D render's aspect ratio. The stage clips it,
      // so it reads as rising in from below the section edge and lifting out
      // past the top. smoothstep so it eases rather than tracking scroll
      // linearly.
      const eased = reveal * reveal * (3 - 2 * reveal);
      // Mirrored, not rewound. Leaving, the card carries on in the same
      // direction it arrived and lifts away past the top; playing the
      // entrance backwards would send it back *down* against the scroll,
      // which reads as the page stuttering rather than the card departing.
      const dir = leaving ? -1 : 1;
      canvasWrap.style.transform = `translateY(${dir * (1 - eased) * 40}%) scale(${0.94 + eased * 0.06})`;
      // Fade runs on its own, shorter schedule than the slide: it starts at
      // fully transparent and is done by FADE_FRACTION of the way in, so the
      // card spends the rest of the travel solid rather than creeping towards
      // opaque the whole way (and the same in reverse on the way out).
      canvasWrap.style.opacity = String(Math.min(1, reveal / FADE_FRACTION));
    }
    stageText.style.opacity = String(Math.max(0, (reveal - 0.5) / 0.5));

    const index = Math.min(SERVICES.length - 1, Math.floor(carousel));
    applyIndex(index);
    controller?.setCarousel(carousel);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Three.js is ~90% of the site's JavaScript, and this is its only consumer.
  // Importing it here rather than at module scope keeps it out of the initial
  // bundle entirely: the observer already decided *when* the scene gets built,
  // this makes it decide when the library gets downloaded too. The margin is
  // generous so the fetch has a head start before the track is on screen.
  const initObserver = new IntersectionObserver(
    (entries, obs) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      obs.disconnect();
      if (removed) return;
      import("../services-3d.ts").then(({ initServices3D }) => {
        // Re-checked because the section can be torn down mid-download.
        if (removed) return;
        controller = initServices3D(canvas);
        lastApplied = -1; // force the freshly-built controller to sync to the current state
        onScroll();
      });
    },
    { rootMargin: "600px 0px" },
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
