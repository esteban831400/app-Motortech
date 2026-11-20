// Petits utilitaires d'animation partagés (compteurs, morphing de courbes).
// Les durées sont lues dans le design system (glass.css) pour ne pas
// dupliquer de valeur en dur côté JS.

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Lit une durée CSS (ex: "--dur-chart: 550ms") et la renvoie en millisecondes.
export function cssDurationMs(varName, fallback) {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith('ms') ? value : value * 1000;
}

// Courbe proche de --ease-premium (cubic-bezier(0.22, 1, 0.36, 1)).
export function easeOutQuart(t) {
  return 1 - (1 - t) ** 4;
}

// Anime une progression 0 → 1 via requestAnimationFrame. Renvoie une
// fonction d'annulation.
export function animateProgress(durationMs, onFrame) {
  let frame = null;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / durationMs);
    onFrame(easeOutQuart(t));
    if (t < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => frame !== null && cancelAnimationFrame(frame);
}
