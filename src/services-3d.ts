import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface Services3D {
  /** Continuous front-of-carousel position (0..count, wraps) — not just an
   * integer index, so scroll can scrub smoothly between objects. */
  setCarousel(value: number): void;
  destroy(): void;
}

const CAMERA_Z = 3.0;
const FOV = 45;
const SPEEDS = [0.003, 0.005, 0.004, 0.006, 0.0045, 0.0055];
// Objects travel *toward* the camera across their own step: they enter far
// back and small, and reach full size at z=0 just as they hand off. Scrolling
// down advances that travel so they grow; scrolling up runs it backwards and
// they shrink away.
const APPROACH_DISTANCE = 1.7; // z-distance covered from far end to front
const FAR_SCALE = 0.55; // scale at the far end of that travel
// Portions of a step spent fading in at the far end / fading out at the front.
// These must not overlap (FADE_IN + FADE_OUT < 1) — that's what guarantees
// only one object is ever on screen at a time. Because exactly one object is
// ever visible, opacity has to pass through zero at each handoff; keeping the
// windows short confines that to a brief blink instead of leaving the stage
// dim for a third of every step.
const FADE_IN = 0.08;
const FADE_OUT = 0.12;
// Layout offsets, as fractions of the frustum at z=0. Matches the 768px CSS
// breakpoint, which is where .services-stage-text switches to bottom-aligned.
const MOBILE_BREAKPOINT = 768;
const DESKTOP_X_SHIFT = 0.15;
// Stacked layout is a three-band column: pinned header, objects, copy. The
// lift centres the objects in the middle band, so it clears the header rather
// than sitting under it.
const MOBILE_Y_LIFT = 0.08;

function createWireframeMaterial(opacity: number): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: 0xc4b5fd,
    transparent: true,
    opacity,
    depthTest: true,
  });
}

type SceneBuilder = () => { scene: THREE.Scene; group: THREE.Group };

function sceneDevelopment(): ReturnType<SceneBuilder> {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const mat = createWireframeMaterial(0.7);
  const bar = () => new THREE.BoxGeometry(0.62, 0.11, 0.15);
  const placements: [number, number, number, number, number, number][] = [
    [-0.52,  0.27, 0, 0, 0,  Math.PI / 4],
    [-0.52, -0.27, 0, 0, 0, -Math.PI / 4],
    [ 0.52,  0.27, 0, 0, 0, -Math.PI / 4],
    [ 0.52, -0.27, 0, 0, 0,  Math.PI / 4],
  ];
  for (const [x, y, z, rx, ry, rz] of placements) {
    const geo = new THREE.EdgesGeometry(bar());
    const lines = new THREE.LineSegments(geo, mat);
    lines.position.set(x, y, z);
    lines.rotation.set(rx, ry, rz);
    group.add(lines);
  }
  scene.add(group);
  return { scene, group };
}

function sceneUI(): ReturnType<SceneBuilder> {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const mat = createWireframeMaterial(0.7);
  const items: { geo: THREE.BufferGeometry; pos?: [number, number, number] }[] = [
    { geo: new THREE.BoxGeometry(1.8, 1.1, 0.12) },
    { geo: new THREE.BoxGeometry(1.8, 0.18, 0.14), pos: [0,  0.64, 0] },
    { geo: new THREE.BoxGeometry(0.35, 0.3, 0.09), pos: [0, -0.7,  0] },
    { geo: new THREE.BoxGeometry(0.8, 0.09, 0.22), pos: [0, -0.85, 0] },
  ];
  for (const { geo, pos } of items) {
    const eg = new THREE.EdgesGeometry(geo);
    const lines = new THREE.LineSegments(eg, mat);
    if (pos) lines.position.set(...pos);
    group.add(lines);
  }
  scene.add(group);
  return { scene, group };
}

function sceneCloud(): ReturnType<SceneBuilder> {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const mat = createWireframeMaterial(0.7);
  const main = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.SphereGeometry(0.65, 8, 6)), mat);
  group.add(main);
  const torus1 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.TorusGeometry(0.85, 0.06, 8, 20)), createWireframeMaterial(0.35));
  torus1.rotation.set(Math.PI / 4, 0, 0);
  group.add(torus1);
  const torus2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.TorusGeometry(0.85, 0.06, 8, 20)), createWireframeMaterial(0.35));
  torus2.rotation.set(-Math.PI / 4, Math.PI / 2, 0);
  group.add(torus2);
  scene.add(group);
  return { scene, group };
}

function sceneDatabase(): ReturnType<SceneBuilder> {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const mat = createWireframeMaterial(0.7);
  const tiers: [number, number, number, number, number, number][] = [
    [0.72, 0.72, 0.28, 0,  0.58, 0],
    [0.82, 0.82, 0.28, 0,  0,    0],
    [0.72, 0.72, 0.28, 0, -0.58, 0],
  ];
  for (const [rt, rb, h, x, y, z] of tiers) {
    const geo = new THREE.CylinderGeometry(rt, rb, h, 24);
    const eg = new THREE.EdgesGeometry(geo);
    const lines = new THREE.LineSegments(eg, mat);
    lines.position.set(x, y, z);
    group.add(lines);
  }
  scene.add(group);
  return { scene, group };
}

function sceneSecurity(): ReturnType<SceneBuilder> {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const mat = createWireframeMaterial(0.7);
  const shape = new THREE.Shape();
  shape.moveTo(-0.7,  0.85);
  shape.lineTo( 0.7,  0.85);
  shape.lineTo( 0.7,  0.15);
  shape.bezierCurveTo( 0.7, -0.55,    0, -0.95, 0, -0.95);
  shape.bezierCurveTo(   0, -0.95, -0.7, -0.55, -0.7, 0.15);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: false });
  const eg = new THREE.EdgesGeometry(geo);
  const lines = new THREE.LineSegments(eg, mat);
  lines.position.set(0, -0.05, -0.11);
  group.add(lines);
  scene.add(group);
  return { scene, group };
}

function scenePerformance(): ReturnType<SceneBuilder> {
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  const mat = createWireframeMaterial(0.7);
  const shape = new THREE.Shape();
  shape.moveTo( 0.28,  1.0);
  shape.lineTo(-0.12,  0.08);
  shape.lineTo( 0.22,  0.08);
  shape.lineTo(-0.28, -1.0);
  shape.lineTo( 0.12, -0.08);
  shape.lineTo(-0.22, -0.08);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
  const eg = new THREE.EdgesGeometry(geo);
  const lines = new THREE.LineSegments(eg, mat);
  lines.position.set(0, 0, -0.1);
  group.add(lines);
  scene.add(group);
  return { scene, group };
}

const BUILDERS: SceneBuilder[] = [
  sceneDevelopment,
  sceneUI,
  sceneCloud,
  sceneDatabase,
  sceneSecurity,
  scenePerformance,
];

type CarouselItem = {
  group: THREE.Group;
  mats: { mat: THREE.LineBasicMaterial; base: number }[];
};

/**
 * All 6 objects live in one shared scene, arranged along Z as a depth
 * carousel — the "front" one (closest to camera) is what setCarousel()'s
 * value currently points at; the rest recede in a ring behind it, shrinking
 * and fading with depth. One renderer/composer/bloom-pass instance total
 * (not 6), since all objects are always in the same scene/render pass.
 */
export function initServices3D(canvas: HTMLCanvasElement): Services3D {
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAMERA_Z;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The 2ms slack matters: rAF on a 60Hz display delivers deltas that jitter
  // either side of 16.67ms, so a threshold sitting exactly on that figure
  // would reject every marginally-early frame and halve the real rate to
  // 30fps. The cap still holds on 120Hz panels — 8.33ms deltas are rejected
  // until two have accumulated.
  const TARGET_MS = 1000 / 60 - 2;
  const BASELINE_MS = 1000 / 60;
  // Capped lower than the usual 2x — this canvas now spans the full section
  // (not half of it, and not a small grid-cell icon), so at dpr 2 the bloom
  // pass would be shading a meaningfully larger number of pixels than the
  // earlier layouts this same cap was tuned for.
  const dpr = Math.min(window.devicePixelRatio, 1.5);

  const scene = new THREE.Scene();
  // All objects hang off this so resize() can reposition the whole carousel
  // in one place: pushed right of the copy on desktop, lifted above it on
  // mobile (where the copy sits at the bottom of the stage instead).
  const stage = new THREE.Group();
  scene.add(stage);
  const items: CarouselItem[] = BUILDERS.map((build) => {
    const { group } = build();
    stage.add(group);
    const mats: CarouselItem['mats'] = [];
    group.traverse((child) => {
      if (child instanceof THREE.LineSegments) {
        const mat = child.material as THREE.LineBasicMaterial;
        mats.push({ mat, base: mat.opacity });
      }
    });
    return { group, mats };
  });

  // Largest half-extent across all six objects, measured once while the stage
  // is still untransformed. The horizontal figure is taken as a radius in the
  // XZ plane rather than an x-extent, because tick() spins each group on Y —
  // an x-only measurement would understate the width at other rotations.
  const bounds = new THREE.Box3();
  let extentXZ = 0;
  let extentY = 0;
  items.forEach(({ group }) => {
    bounds.setFromObject(group);
    extentXZ = Math.max(
      extentXZ,
      Math.hypot(bounds.max.x, bounds.max.z),
      Math.hypot(bounds.min.x, bounds.min.z),
    );
    extentY = Math.max(extentY, bounds.max.y, -bounds.min.y);
  });

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  canvas.replaceWith(renderer.domElement);
  renderer.domElement.className = canvas.className;

  const renderPass = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.0, 0.8, 0);
  // Null whenever the section is out of the viewport. The composer owns by far
  // the largest GPU allocation on the page — a full-viewport 4x multisampled
  // render target, its resolve buffer and the bloom mip chain, ~29MB at a
  // 1058x1280 backing store — and holding it for the rest of the page's life
  // is what makes weaker GPUs stutter in the sections *after* this one. It is
  // released on exit and rebuilt on return.
  let composer: EffectComposer | null = null;
  // Declared up here because resize() consults it before allocating.
  let inViewport = false;

  let carousel = 0;

  // Re-derives every object's position/scale/opacity from the current
  // carousel value. Each object owns exactly one unit-wide step of that
  // value: object i is on screen only while `carousel` is inside [i, i+1),
  // where it fades in at the far end, grows toward the camera, then fades out
  // as object i+1 takes over — so exactly one is ever visible.
  // Called before the first resize()/render() below so that render never
  // draws a frame with objects still at their untransformed default
  // positions (all stacked at the origin).
  function applyCarousel() {
    const last = items.length - 1;
    items.forEach((item, i) => {
      const local = carousel - i; // 0 → 1 across this object's own step
      item.group.visible = local >= 0 && local < 1;
      if (!item.group.visible) return;
      // local 0 = far back and small, local 1 = at the camera plane and full
      // size. Advancing `local` (scrolling down) grows the object; running it
      // backwards (scrolling up) shrinks it away again.
      item.group.position.z = (local - 1) * APPROACH_DISTANCE;
      item.group.scale.setScalar(FAR_SCALE + local * (1 - FAR_SCALE));
      let fade = 1;
      // The first and last objects have no neighbour to hand off to on their
      // outer edge, so they hold rather than fading against an empty stage —
      // the first would otherwise ride the entrance up as an empty card, and
      // the last would dissolve just as it reaches full size.
      if (i > 0 && local < FADE_IN) fade = local / FADE_IN;
      else if (i < last && local > 1 - FADE_OUT) fade = (1 - local) / FADE_OUT;
      item.mats.forEach(({ mat, base }) => {
        mat.opacity = base * fade;
      });
    });
  }
  applyCarousel();

  function resize() {
    const parent = renderer.domElement.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w <= 0 || h <= 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bloom.resolution.set(w, h);

    // Keep the carousel clear of the copy. The stage is full-viewport, so the
    // frustum's world extent at z=0 is what converts "a fraction of the
    // screen" into the world units the offsets are expressed in.
    const frustumH = 2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;
    const frustumW = frustumH * camera.aspect;
    const stacked = w < MOBILE_BREAKPOINT;
    stage.position.x = stacked ? 0 : frustumW * DESKTOP_X_SHIFT;
    stage.position.y = stacked ? frustumH * MOBILE_Y_LIFT : 0;

    // Scale to fit rather than assuming the objects' authored size suits every
    // viewport: at portrait aspect the frustum is far narrower than the
    // desktop one they were built against, and they'd overflow the sides.
    // Vertically on mobile they also have to clear the copy below them, hence
    // the tighter allowance there.
    const fit = Math.min(
      1,
      ((frustumW / 2) * 0.82) / extentXZ,
      ((frustumH / 2) * (stacked ? 0.34 : 0.82)) / extentY,
    );
    stage.scale.setScalar(fit);

    // Everything above is cheap bookkeeping and is worth keeping current even
    // while off screen. The composer is not — don't allocate ~29MB of render
    // targets for a section nobody is looking at. updatePlayState() rebuilds
    // by calling back into here the moment it scrolls into view.
    if (!inViewport) return;

    // Same anti-aliasing note as before: EffectComposer renders into its own
    // WebGLRenderTarget, so the renderer's antialias:true never reaches the
    // canvas once bloom is in the chain — an explicit multisampled target
    // restores it through the composer.
    const renderTarget = new THREE.WebGLRenderTarget(w * dpr, h * dpr, { samples: 4 });
    composer?.dispose();
    composer = new EffectComposer(renderer, renderTarget);
    composer.addPass(renderPass);
    composer.addPass(bloom);
    composer.render();
  }

  function releaseGpu() {
    composer?.dispose();
    composer = null;
    // Shrink the drawing buffer too — it is canvas-sized and would otherwise
    // sit there at full resolution. resize() restores it, and updateStyle
    // false means the CSS size (width/height 100%) is untouched either way.
    renderer.setSize(1, 1, false);
  }

  const ro = new ResizeObserver(resize);
  if (renderer.domElement.parentElement) ro.observe(renderer.domElement.parentElement);
  resize();

  let rafId = 0;
  let lastTime = 0;
  let tabVisible = document.visibilityState === 'visible';

  function tick(time: number) {
    rafId = requestAnimationFrame(tick);
    if (!composer) return; // released while off screen
    const dt = Math.min(time - lastTime, 100);
    if (dt < TARGET_MS) return;
    lastTime = time;

    // applyCarousel() re-reads whatever `carousel` was most recently set to
    // by scroll — doing the position/scale/opacity recompute on this frame
    // clock rather than on every scroll event is what keeps scrolling cheap:
    // scroll can fire far more often than the display refreshes, and
    // re-deriving 6 objects' transforms that often was real, measurable
    // main-thread cost competing with Lenis's own scroll interpolation.
    applyCarousel();
    if (!reducedMotion) {
      const rotationScale = dt / BASELINE_MS;
      items.forEach((item, i) => {
        item.group.rotation.y += SPEEDS[i % SPEEDS.length] * rotationScale;
      });
    }
    composer.render();
  }

  function start() {
    if (rafId) return;
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  function updatePlayState() {
    if (!inViewport) {
      stop();
      releaseGpu();
      return;
    }
    // Rebuild whatever the last exit released before anything tries to draw.
    if (!composer) resize();
    if (tabVisible && !reducedMotion) start();
    else stop(); // still composited: reduced-motion draws a single static frame
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      inViewport = entry.isIntersecting;
      updatePlayState();
    },
    { threshold: 0 },
  );
  observer.observe(renderer.domElement);

  function onVisibilityChange() {
    tabVisible = document.visibilityState === 'visible';
    updatePlayState();
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Scroll can fire far more often than tick()'s own frame cap — this just
  // stores the value (a single assignment, effectively free at any call
  // rate); tick() re-derives the actual transforms from it on its next
  // throttled frame. Only apply + render synchronously here when tick()'s
  // rAF loop genuinely isn't running (reducedMotion, or out of viewport/tab
  // hidden), since nothing else would ever pick up the change in that case.
  function setCarousel(value: number) {
    carousel = value;
    // No composer means the section is off screen and its targets are
    // released — there is nothing to draw into and nothing to see.
    if (!rafId && composer) {
      applyCarousel();
      composer.render();
    }
  }

  function destroy() {
    stop();
    ro.disconnect();
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    items.forEach(({ group }) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
          child.geometry.dispose();
        }
      });
    });
    composer?.dispose(); // already null if the section was off screen
    renderer.dispose();
  }

  return { setCarousel, destroy };
}
