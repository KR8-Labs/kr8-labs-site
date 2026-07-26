import { defineConfig, type Plugin } from "vite";
import { FAQ } from "./src/data.ts";

/**
 * Emits FAQPage structured data into index.html, generated from the same FAQ
 * array the section renders from. Doing it here rather than hand-writing the
 * JSON-LD in index.html keeps the two from drifting apart, and doing it at
 * build time rather than at runtime means crawlers see it in the served HTML
 * without having to execute the page's JavaScript.
 */
function faqSchema(): Plugin {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return {
    name: "kr8-faq-schema",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          // Escaping "<" stops a "</script>" ever appearing inside the answer
          // copy from terminating the block early.
          children: JSON.stringify(schema, null, 2).replace(/</g, "\\u003c"),
          injectTo: "head",
        },
      ];
    },
  };
}

export default defineConfig({
  base: "/",
  server: { open: false },
  plugins: [faqSchema()],
});
