import { useEffect, useRef, useState } from 'react';

// Largeur réelle d'un conteneur : les graphiques SVG dessinent à la taille
// de l'écran pour garder des libellés lisibles (10 px) même sur téléphone.
export default function useElementWidth(fallback = 640) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}
