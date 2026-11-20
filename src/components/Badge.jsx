import { TONES } from '../utils/constants';

// Badge à pastille (même anatomie que dans Appesteban), coloré par ton sémantique.
export default function Badge({ tone = 'neutral', children, dot = true, icon }) {
  const t = TONES[tone] ?? TONES.neutral;
  return (
    <span className="badge" style={{ background: t.soft, color: t.color }}>
      {icon ?? (dot && <span className="badge-dot" />)}
      {children}
    </span>
  );
}
