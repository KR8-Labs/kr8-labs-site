import { fromHTML } from "../dom.ts";
import {
  CONTACT_EMAIL,
  PRICING_ADDONS,
  PRICING_TIERS,
  PRICING_SINGLE_TYPES,
  PRICING_URGENCY,
  type PricingAddOn,
  type PricingTier,
} from "../data.ts";

function parsePesoAmount(price: string): number {
  const digits = price.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function formatPeso(n: number): string {
  return "₱" + n.toLocaleString("en-PH");
}

function buildMailto(typeLabel: string, addons: PricingAddOn[], urgencyLabel: string): string {
  const lines = [
    `Project type: ${typeLabel}`,
    `Add-ons: ${addons.length ? addons.map((a) => a.name).join(", ") : "none"}`,
    urgencyLabel ? `Timeline: ${urgencyLabel}` : "",
  ].filter(Boolean);
  const subject = `Quote request: ${typeLabel}`;
  const body = lines.join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function pricing(): HTMLElement {
  const typeOptionsHTML =
    `<option value="" disabled selected>Select project type*</option>` +
    PRICING_SINGLE_TYPES.map((t, i) => `<option value="${i}">${t.label}</option>`).join("");

  const urgencyOptionsHTML =
    `<option value="" disabled selected>Select timeline*</option>` +
    PRICING_URGENCY.map((u, i) => `<option value="${i}">${u.label}</option>`).join("");

  const addonsHTML = PRICING_ADDONS.map(
    (a, i) => `
      <button type="button" class="pricing-addon" data-addon-index="${i}" aria-pressed="false">
        <span class="pricing-addon-check" aria-hidden="true"></span>
        <span class="pricing-addon-name">${a.name}</span>
        <span class="pricing-addon-price">${a.price}</span>
      </button>
    `,
  ).join("");

  const section = fromHTML(`
    <section class="pricing" id="pricing">
      <div class="pricing-header">
        <p class="eyebrow">06 · PRICING</p>
        <h2>Estimates</h2>
        <p class="pricing-intro">
          Every project is priced per product, starting at a base rate — pick what you're building,
          add only what you need. Prices shown are estimates; your final quote is confirmed after a
          short discovery call.
        </p>
      </div>

      <div class="pricing-card">
        <div class="pricing-wizard">
          <div class="pricing-step" data-step="1">
            <div class="pricing-step-head">
              <span class="pricing-step-num">1</span>
              <span class="pricing-step-line"></span>
              <span class="pricing-step-label">PROJECT TYPE</span>
            </div>
            <div class="pricing-select-wrap">
              <select class="pricing-select" data-field="type">${typeOptionsHTML}</select>
            </div>
          </div>

          <div class="pricing-step pricing-step-locked" data-step="2">
            <div class="pricing-step-head">
              <span class="pricing-step-num">2</span>
              <span class="pricing-step-line"></span>
              <span class="pricing-step-label">ADD-ONS</span>
            </div>
            <div class="pricing-addons">${addonsHTML}</div>
          </div>

          <div class="pricing-step pricing-step-locked" data-step="3">
            <div class="pricing-step-head">
              <span class="pricing-step-num">3</span>
              <span class="pricing-step-line"></span>
              <span class="pricing-step-label">TIMELINE</span>
            </div>
            <div class="pricing-select-wrap">
              <select class="pricing-select" data-field="urgency">${urgencyOptionsHTML}</select>
            </div>
          </div>
        </div>

        <div class="pricing-result" data-result hidden></div>
      </div>

      <p class="pricing-footnote" data-footnote>Fill in your project information to see an estimated price.</p>
    </section>
  `);

  const typeSelect = section.querySelector<HTMLSelectElement>('[data-field="type"]')!;
  const urgencySelect = section.querySelector<HTMLSelectElement>('[data-field="urgency"]')!;
  const step2 = section.querySelector<HTMLElement>('[data-step="2"]')!;
  const step3 = section.querySelector<HTMLElement>('[data-step="3"]')!;
  const addonButtons = Array.from(section.querySelectorAll<HTMLButtonElement>(".pricing-addon"));
  const resultEl = section.querySelector<HTMLElement>("[data-result]")!;
  const footnote = section.querySelector<HTMLElement>("[data-footnote]")!;

  const selectedAddons = new Set<number>();

  function updateLockState() {
    const unlocked = typeSelect.value !== "";
    [step2, step3].forEach((step) => step.classList.toggle("pricing-step-locked", !unlocked));
  }

  function renderResult() {
    if (typeSelect.value === "") {
      resultEl.hidden = true;
      footnote.textContent = "Fill in your project information to see an estimated price.";
      return;
    }

    const selectedType = PRICING_SINGLE_TYPES[Number(typeSelect.value)];
    const tier: PricingTier = PRICING_TIERS[selectedType.tierKey];
    const chosenAddons = Array.from(selectedAddons).map((i) => PRICING_ADDONS[i]);
    const addonsTotal = chosenAddons.reduce((sum, a) => sum + parsePesoAmount(a.price), 0);
    const urgencyOption = urgencySelect.value === "" ? undefined : PRICING_URGENCY[Number(urgencySelect.value)];
    const multiplier = urgencyOption?.multiplier ?? 1;

    resultEl.hidden = false;

    const includesHTML = tier.includes.map((item) => `<li>${item}</li>`).join("");
    const addonsListHTML = chosenAddons.length
      ? `<ul class="pricing-result-addons">${chosenAddons
          .map((a) => `<li>${a.name} <span>${a.price}</span></li>`)
          .join("")}</ul>`
      : "";

    const total = Math.round((parsePesoAmount(tier.startingPrice) + addonsTotal) * multiplier);
    const diffPct = Math.round((multiplier - 1) * 100);
    const rushNoteHTML =
      diffPct > 0
        ? `<p class="pricing-result-rush-note">Includes a ${diffPct}% rush fee</p>`
        : diffPct < 0
          ? `<p class="pricing-result-rush-note">Includes a ${Math.abs(diffPct)}% flexible-timeline discount</p>`
          : "";

    resultEl.innerHTML = `
      <p class="pricing-result-type">${selectedType.label}</p>
      <p class="pricing-result-desc">${tier.description}</p>
      <p class="pricing-result-price">Starting at ${formatPeso(total)}${tier.priceSuffix ?? ""}</p>
      ${rushNoteHTML}
      <p class="pricing-result-delivery">${tier.delivery}</p>
      <ul class="pricing-result-includes">${includesHTML}</ul>
      ${addonsListHTML}
      <a class="btn btn-primary" href="${buildMailto(selectedType.label, chosenAddons, urgencyOption?.label ?? "")}">Get this quote</a>
    `;

    footnote.textContent = "This is an estimate — final pricing is confirmed after a short discovery call.";
  }

  typeSelect.addEventListener("change", () => {
    updateLockState();
    renderResult();
  });
  urgencySelect.addEventListener("change", renderResult);

  addonButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (selectedAddons.has(i)) selectedAddons.delete(i);
      else selectedAddons.add(i);
      const active = selectedAddons.has(i);
      btn.classList.toggle("pricing-addon-active", active);
      btn.setAttribute("aria-pressed", String(active));
      renderResult();
    });
  });

  return section;
}
