// Carte en verre avec en-tête optionnel (titre, sous-titre, action).
export default function Card({ title, subtitle, action, children, className = '', style, padded = true }) {
  return (
    <section className={`card ${padded ? 'card-padded' : ''} ${className}`} style={style}>
      {(title || action) && (
        <div className="section-header-row card-head">
          <div>
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
