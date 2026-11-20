// Gain avant → après (ch ou Nm) : barre d'origine en gris, gain en rouge.
export default function GainBar({ avant, apres, unit, max }) {
  const m = max ?? apres * 1.1;
  return (
    <div className="gain">
      <div className="gain-head">
        <span className="gain-values">
          {avant} → <strong>{apres}</strong> {unit}
        </span>
        <span className="gain-delta">+{apres - avant} {unit}</span>
      </div>
      <div className="gain-track">
        <span className="gain-after" style={{ '--bar-ratio': apres / m }} />
        <span className="gain-before" style={{ '--bar-ratio': avant / m }} />
      </div>
    </div>
  );
}

// Version compacte pour les tableaux : « 230 → 290 ch »
export function GainInline({ gain }) {
  if (!gain) return <span className="cell-muted">Entretien</span>;
  return (
    <span className="gain-inline">
      <span>
        {gain.chAvant} → <strong>{gain.chApres}</strong> ch
      </span>
      <span className="cell-muted cell-small">
        {gain.nmAvant} → {gain.nmApres} Nm
      </span>
    </span>
  );
}
