import { useState } from 'react';

// Anneau de répartition : segments séparés par un fin espace, valeur centrale
// qui suit le survol (ou le toucher sur mobile).
export default function Donut({ items, size = 168, thickness = 18, centerLabel, centerValue, formatValue = String }) {
  const [hover, setHover] = useState(null);
  const total = items.reduce((s, i) => s + i.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gap = 3;
  let offset = 0;
  const shown = hover !== null ? items[hover] : null;

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="donut-svg">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-neutral-soft)" strokeWidth={thickness} />
        {items.map((it, i) => {
          const len = (it.value / total) * c;
          const el = (
            <circle
              key={it.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={it.color}
              strokeWidth={hover === i ? thickness + 4 : thickness}
              strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="donut-seg"
              style={{ '--seg-i': i, opacity: hover === null || hover === i ? 1 : 0.35 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(hover === i ? null : i)}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="donut-center">
        <span className="donut-center-value">{shown ? `${Math.round((shown.value / total) * 100)} %` : centerValue}</span>
        <span className="donut-center-label">{shown ? shown.label : centerLabel}</span>
        {shown && <span className="donut-center-sub">{formatValue(shown.value)}</span>}
      </div>
    </div>
  );
}
