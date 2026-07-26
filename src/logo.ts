/**
 * KR8 Labs logo mark — uses the brand icon PNG.
 */
export function logoMark(_id = "kr8", size = 30): string {
  const h = Math.round(size * 581 / 610);
  const src = import.meta.env.BASE_URL + "icon.webp";
  return `<img class="logo-mark" src="${src}" width="${size}" height="${h}" alt="" />`;
}

/** Full lockup: mark + "KR8 Labs" wordmark. */
export function logoLockup(_id = "kr8", size = 30): string {
  return `
  <span class="logo">
    ${logoMark(_id, size)}
    <span class="logo-word"><strong>KR8</strong> Labs</span>
  </span>`;
}
