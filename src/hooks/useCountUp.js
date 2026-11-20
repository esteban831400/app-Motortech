import { useEffect, useRef, useState } from 'react';
import { animateProgress, cssDurationMs, prefersReducedMotion } from '../utils/motion';

// Fait défiler un nombre de sa valeur précédente (0 au montage) jusqu'à
// `target`. Sans animation si l'utilisateur a demandé moins de mouvement.
export default function useCountUp(target) {
  const isNumber = typeof target === 'number' && Number.isFinite(target);
  const [display, setDisplay] = useState(() => (isNumber && !prefersReducedMotion() ? 0 : target));
  const fromRef = useRef(isNumber && !prefersReducedMotion() ? 0 : target);

  useEffect(() => {
    if (!isNumber || prefersReducedMotion()) {
      fromRef.current = target;
      setDisplay(target);
      return undefined;
    }
    const from = typeof fromRef.current === 'number' ? fromRef.current : 0;
    if (from === target) {
      setDisplay(target);
      return undefined;
    }
    const cancel = animateProgress(cssDurationMs('--dur-count', 900), (p) => {
      const value = from + (target - from) * p;
      fromRef.current = value;
      setDisplay(p === 1 ? target : value);
    });
    return cancel;
  }, [target, isNumber]);

  if (!isNumber) return target;
  // Arrondi pendant l'animation ; valeur exacte à la fin.
  return display === target ? target : Math.round(display);
}
