import { fromHTML } from "../dom.ts";
import { FAQ } from "../data.ts";

export function faq(): HTMLElement {
  return fromHTML(`
    <section class="faq" id="faq">
      <div class="faq-header">
        <p class="eyebrow">07 · FAQ</p>
        <h2>Frequently Asked Questions</h2>
      </div>
      <div class="faq-list">
        ${FAQ.map(item => `
          <details class="faq-item">
            <summary class="faq-question">${item.q}</summary>
            <p class="faq-answer">${item.a}</p>
          </details>
        `).join("")}
      </div>
    </section>
  `);
}
