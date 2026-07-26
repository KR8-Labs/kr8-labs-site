import { fromHTML } from "../dom.ts";
import { logoLockup } from "../logo.ts";
import { CONTACT_EMAIL, SITE } from "../data.ts";

export function nav(): HTMLElement {
  const header = fromHTML(`
    <header class="nav">
      <a class="nav-brand" href="#top" aria-label="KR8 Labs home">
        ${logoLockup("nav")}
      </a>
      <nav class="nav-links">
        <a href="#services">Services</a>
        <a href="#works">Work</a>
        <a href="#process">Process</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </nav>
      <a class="btn btn-primary btn-sm nav-cta" href="mailto:${CONTACT_EMAIL}">
        ${SITE.ctaPrimary}
      </a>
    </header>
  `);

  const navCta = header.querySelector(".nav-cta") as HTMLElement;

  setTimeout(() => {
    let heroAway = false;
    let ctaNear = false;

    function update() {
      navCta.classList.toggle("nav-cta-visible", heroAway && !ctaNear);
    }

    const heroActions = document.querySelector(".hero-actions");
    if (heroActions) {
      new IntersectionObserver(
        ([entry]) => { heroAway = !entry.isIntersecting; update(); },
        { threshold: 0 }
      ).observe(heroActions);
    }

    const ctaSection = document.getElementById("contact");
    if (ctaSection) {
      new IntersectionObserver(
        ([entry]) => { ctaNear = entry.isIntersecting; update(); },
        { threshold: 0.1 }
      ).observe(ctaSection);
    }
  }, 50);

  const mql = window.matchMedia("(max-width: 768px)");

  function updateNav() {
    if (!mql.matches) {
      header.classList.remove("nav-visible");
      return;
    }
    if (window.scrollY > window.innerHeight * 0.8) {
      header.classList.add("nav-visible");
    } else {
      header.classList.remove("nav-visible");
    }
  }

  window.addEventListener("scroll", updateNav, { passive: true });
  mql.addEventListener("change", updateNav);
  updateNav();

  return header;
}
