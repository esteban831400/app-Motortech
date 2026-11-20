import { PRESTATIONS } from '../utils/constants';
import { IconLeaf } from './icons';

// Étiquette de prestation : rouge pour la reprog, vert réservé à l'E85.
export default function PrestationTag({ value, short = false }) {
  const p = PRESTATIONS[value] ?? PRESTATIONS.meca;
  return (
    <span className={`presta-tag presta-${value}`}>
      {value === 'e85' ? <IconLeaf width={12} height={12} /> : <span className="presta-tag-dot" style={{ background: p.color }} />}
      {short && p.short ? p.short : p.label}
    </span>
  );
}
