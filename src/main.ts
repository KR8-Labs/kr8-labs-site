import "./style.css";
import { nav } from "./sections/nav.ts";
import { hero } from "./sections/hero.ts";
import { services } from "./sections/services.ts";
import { techStack } from "./sections/tech-stack.ts";
import { works } from "./sections/works.ts";
import { whyKr8 } from "./sections/why-kr8.ts";
import { process } from "./sections/process.ts";
import { pricing } from "./sections/pricing.ts";
import { faq } from "./sections/faq.ts";
import { cta } from "./sections/cta.ts";
import { footer } from "./sections/footer.ts";

const app = document.getElementById("app")!;
document.body.insertBefore(nav(), app);
app.append(hero(), services(), techStack(), works(), whyKr8(), process(), pricing(), faq(), cta(), footer());
