import useCountUp from '../hooks/useCountUp';

// Carte affichant une statistique clé du dashboard. Devient un raccourci
// cliquable vers la page/le filtre pertinent quand `onClick` est fourni.
// Une valeur numérique s'incrémente à l'affichage ; `format` la met en forme
// (ex: pourcentage, euros). Les valeurs texte restent affichées telles quelles.
export default function StatCard({
  label,
  value,
  format,
  icon,
  color = 'var(--color-accent)',
  softColor = 'var(--color-accent-soft)',
  onClick,
  className = '',
  style,
  sub,
  highlight = false,
}) {
  const Tag = onClick ? 'button' : 'div';
  const animated = useCountUp(value);
  const shown = typeof animated === 'number' && format ? format(animated) : animated;
  return (
    <Tag
      className={`card stat-card lift-hover ${onClick ? 'stat-card-clickable' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-icon" style={{ background: softColor, color }}>
          {icon}
        </span>
      </div>
      <span className={`stat-card-value count-up ${highlight ? 'stat-card-value-accent' : ''}`}>{shown}</span>
      {sub && <span className="stat-card-sub">{sub}</span>}
    </Tag>
  );
}
