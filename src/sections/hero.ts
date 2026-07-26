import { fromHTML } from "../dom.ts";
import { CONTACT_EMAIL, SITE } from "../data.ts";
import { initTextMorph } from "../textmorph.ts";
import { initParticles } from "../svgparticles.ts";

export function hero(): HTMLElement {
  const iconSrc = import.meta.env.BASE_URL + "icon.webp";
  const section = fromHTML(`
    <section class="hero" id="top">
      <div class="hero-dim" aria-hidden="true"></div>
      <canvas class="hero-particles" aria-hidden="true"></canvas>
      <div class="hero-text">
        <p class="eyebrow">${SITE.eyebrow}</p>
        <h1 class="hero-title">${SITE.headlinePrefix} <span class="hero-accent-word" data-morph></span></h1>
        <p class="hero-sub">${SITE.subcopy}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="mailto:${CONTACT_EMAIL}">${SITE.ctaPrimary}</a>
          <a class="btn btn-ghost" href="#works">${SITE.ctaSecondary}</a>
        </div>
      </div>
      <div class="hero-visual"></div>
    </section>
  `);

  const morphWord = section.querySelector<HTMLElement>("[data-morph]")!;
  const cleanupMorph = initTextMorph(morphWord, SITE.morphWords);

  const canvas = section.querySelector<HTMLCanvasElement>(".hero-particles")!;
  // Invisible grid item — the canvas spans the whole section as a
  // background, but the particle logo assembles inside this anchor's
  // rect so it stays where the boxed visual used to sit.
  const anchor = section.querySelector<HTMLElement>(".hero-visual")!;

  // Defer until the section is in the DOM, same reasoning as the old ripple:
  // observing/measuring a detached canvas gets zero dimensions and never
  // recovers once the parent is appended elsewhere.
  let cleanupParticles = () => {};
  let removed = false;

  requestAnimationFrame(() => {
    if (removed) return;
    cleanupParticles = initParticles(canvas, iconSrc, anchor);
  });

  const originalRemove = section.remove.bind(section);
  section.remove = () => {
    removed = true;
    cleanupMorph();
    cleanupParticles();
    originalRemove();
  };

  return section;
}
