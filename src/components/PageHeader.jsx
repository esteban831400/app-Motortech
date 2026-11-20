// En-tête de page : titre avec un mot clé en rouge souligné (clin d'œil au
// « préparation automobile » de motortech.fr), sous-titre et actions.
export default function PageHeader({ title, highlight, after = '', subtitle, actions, className = '', style }) {
  return (
    <div className={`page-header ${className}`} style={style}>
      <div>
        <h1>
          {title} {highlight && <span className="mt-highlight">{highlight}</span>}
          {after}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
