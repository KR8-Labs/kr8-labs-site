/** Site copy + content definitions, kept in one place for easy editing. */

export const CONTACT_EMAIL = "mail@kr8labs.com";

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export const SOCIALS: SocialLink[] = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/kr8.labs",
    icon: `<path d="M15 3h-3a5 5 0 0 0-5 5v3H4v4h3v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1h3Z"/>`,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/kr8_labs/",
    icon: `<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>`,
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@kr8_labs",
    icon: `<path d="M16 3v9.5a3.5 3.5 0 1 1-3-3.46V6a6.5 6.5 0 1 0 6.5 6.5"/><path d="M16 3a5 5 0 0 0 5 5"/>`,
  },
];

export const SITE = {
  eyebrow: "CUSTOM SOFTWARE • WEB DEVELOPMENT • UI/UX",
  headlinePrefix: "Custom web development that",
  morphWords: ["scales", "ships", "performs", "converts"],
  subcopy:
    "We build custom websites, SaaS, and web apps for growing businesses — fast, secure, and built to last.",
  ctaPrimary: "Let's Talk",
  ctaSecondary: "View Our Work",
};

export interface Service {
  icon: string;
  title: string;
  description: string;
}

export const SERVICES: Service[] = [
  {
    title: "Development",
    description: "Custom websites, SaaS products, APIs, and business platforms engineered with clean, maintainable code for long-term growth.",
    icon: `<polyline points="8 7 3 12 8 17"/><polyline points="16 7 21 12 16 17"/>`,
  },
  {
    title: "UI / UX",
    description: "User-centered interfaces designed to improve usability, increase conversions, and strengthen your brand.",
    icon: `<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M8 21h8"/>`,
  },
  {
    title: "Cloud",
    description: "Cloud architecture and deployment pipelines that keep your applications fast, reliable, and ready to scale.",
    icon: `<path d="M7 18a4 4 0 0 1 .6-7.96 5 5 0 0 1 9.7 1.46A3.5 3.5 0 0 1 17 18H7Z"/>`,
  },
  {
    title: "Database",
    description: "Well-structured databases optimized for speed, security, and long-term scalability.",
    icon: `<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/>`,
  },
  {
    title: "Security",
    description: "Industry-standard authentication, encryption, and security best practices to protect your users and your business.",
    icon: `<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"/><path d="M9 12l2 2 4-4"/>`,
  },
  {
    title: "Performance",
    description: "Optimized applications with fast load times, Core Web Vitals improvements, and efficient code that keeps users engaged.",
    icon: `<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>`,
  },
];

export interface PricingAddOn {
  name: string;
  price: string;
}

export const PRICING_ADDONS: PricingAddOn[] = [
  { name: "Additional Page", price: "₱2,500" },
  { name: "Blog / CMS", price: "₱8,000" },
  { name: "Booking System", price: "₱15,000" },
  { name: "Payment Gateway", price: "₱20,000" },
  { name: "Membership System", price: "₱25,000" },
  { name: "Multi-language Support", price: "₱10,000" },
  { name: "Logo Design", price: "₱10,000" },
  { name: "Google Business Profile Setup", price: "₱5,000" },
];

export type PricingTierKey = "landing" | "portfolio" | "site" | "webapp" | "saas";

export interface PricingTier {
  description: string;
  startingPrice: string;
  priceSuffix?: string;
  delivery: string;
  includes: string[];
}

export const PRICING_TIERS: Record<PricingTierKey, PricingTier> = {
  landing: {
    description: "For businesses that need a professional single-page site to generate leads or promote a product or service.",
    startingPrice: "₱15,000",
    delivery: "5–10 business days",
    includes: [
      "Custom responsive design",
      "Up to 1 page",
      "Contact form",
      "Google Maps integration",
      "Mobile optimization",
      "Basic on-page SEO",
      "Speed optimization",
      "Domain & deployment assistance",
      "Google Analytics setup",
      "Basic accessibility",
      "2 rounds of revisions",
    ],
  },
  portfolio: {
    description: "For individuals who want a polished personal site to showcase their work, résumé, or personal brand.",
    startingPrice: "₱12,000",
    delivery: "5–8 business days",
    includes: [
      "Custom responsive design",
      "Up to 1 page",
      "Project / work showcase layout",
      "Contact form",
      "Mobile optimization",
      "Speed optimization",
      "Domain & deployment assistance",
      "Basic accessibility",
      "2 rounds of revisions",
    ],
  },
  site: {
    description: "For businesses that need a complete website with multiple pages.",
    startingPrice: "₱35,000",
    delivery: "2–4 weeks",
    includes: [
      "Up to 5 pages",
      "Custom UI/UX",
      "Contact forms",
      "Image gallery",
      "About, Services, Contact pages",
      "Google Maps integration",
      "Technical SEO",
      "Analytics setup",
      "Performance optimization",
      "Deployment",
    ],
  },
  webapp: {
    description: "For businesses that need custom software tailored to internal operations — inventory systems, booking platforms, portals, dashboards, and more.",
    startingPrice: "₱80,000",
    delivery: "8–12 weeks",
    includes: [
      "Discovery workshop",
      "System architecture",
      "Database design",
      "Authentication",
      "Admin dashboard",
      "API development",
      "Deployment",
      "Documentation",
      "Training session",
    ],
  },
  saas: {
    description: "For founders building a multi-tenant product with subscriptions, billing, and user accounts from day one.",
    startingPrice: "₱120,000",
    delivery: "10–14 weeks",
    includes: [
      "Discovery workshop",
      "System architecture",
      "Multi-tenant database design",
      "Authentication & role management",
      "Subscription & billing integration",
      "Admin dashboard",
      "API development",
      "Deployment",
      "Documentation",
    ],
  },
};

export interface PricingProjectType {
  label: string;
  tierKey: PricingTierKey;
}

export const PRICING_SINGLE_TYPES: PricingProjectType[] = [
  { label: "Landing Page", tierKey: "landing" },
  { label: "Portfolio", tierKey: "portfolio" },
  { label: "Marketing Site", tierKey: "site" },
  { label: "Web App", tierKey: "webapp" },
  { label: "SaaS Platform", tierKey: "saas" },
];

export interface PricingUrgencyOption {
  label: string;
  /** Multiplier applied to (base price + add-ons) — 1 = no change. */
  multiplier: number;
}

export const PRICING_URGENCY: PricingUrgencyOption[] = [
  { label: "Flexible", multiplier: 0.9 },
  { label: "Standard", multiplier: 1 },
  { label: "Rush (ASAP)", multiplier: 1.25 },
];

export interface Work {
  name: string;
  tagline: string;
  description: string;
  url: string;
  image: string;
}

export const WORKS: Work[] = [
  {
    name: "Naprey Almario",
    tagline: "Personal brand & advocacy site",
    description:
      "A personal site for a disability inclusion champion and accessible-travel advocate — built to carry his story, recognition, and work into one place.",
    url: "https://napreyalmario.online/",
    image: "/works/naprey-almario.webp",
  },
  {
    name: "Kamp Malaya",
    tagline: "Eco-resort & island tours",
    description:
      "A booking-ready marketing site for a luxury eco-resort in Balabac, Palawan — built to sell the destination and convert inquiries into bookings.",
    url: "https://www.kampmalaya.tours/",
    image: "/works/kamp-malaya.webp",
  },
];

export const TECH_STACK = [
  { category: "Frontend", items: ["Flutter", "React", "Next.js"] },
  { category: "Backend",  items: ["Node.js", "Go", "Laravel"] },
  { category: "Database", items: ["PostgreSQL", "Supabase", "Firebase", "Neon", "Turso"] },
  { category: "Infrastructure", items: ["Cloudflare", "Docker"] },
];

export const WHY_KR8 = [
  "Performance-first development",
  "Clean, maintainable code",
  "Transparent communication",
  "Scalable architecture",
  "Modern design systems",
  "Long-term technical support",
];

export const PROCESS = [
  "Discovery",
  "Planning",
  "Design",
  "Development",
  "Testing",
  "Launch",
  "Ongoing Support",
];

export const FAQ = [
  {
    q: "How long does a project take?",
    a: "Most projects run between 4 and 12 weeks, depending on scope. A focused marketing site can ship in 4–6 weeks; a full SaaS platform or custom web app typically takes 8–12. We'll give you a clear timeline after our first call.",
  },
  {
    q: "Do you redesign existing websites?",
    a: "Yes. Whether it's a visual refresh, a performance overhaul, or a full rebuild on better foundations, we work with what you already have. We start with an audit so you know exactly what's working, what isn't, and what's worth keeping.",
  },
  {
    q: "Can you build SaaS applications?",
    a: "Yes — SaaS is part of what we build most. Authentication, dashboards, billing, APIs, and scalable architecture are standard parts of our process, not add-ons. If you have an idea, we can turn it into a product your customers can actually use.",
  },
  {
    q: "What technologies do you use?",
    a: "We use modern, well-supported tools like React, Next.js, Node.js, and Go, paired with reliable data platforms like PostgreSQL, Supabase, and Neon. We choose the stack based on what your project needs — not on what's trendy.",
  },
  {
    q: "Do you offer maintenance and support?",
    a: "Yes. Launch isn't the end. We offer ongoing plans covering updates, performance monitoring, security patches, and feature work as your product grows.",
  },
];

export const ABOUT = {
  title: "Built for ambitious ideas.",
  body: "KR8 Labs is an independent software studio focused on building modern web applications, business platforms, and digital products. We believe software should be fast, intuitive, and built to evolve—not become technical debt after launch.",
};
