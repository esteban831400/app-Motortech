import { useApp } from '../hooks/AppContext';
import { NAV_GROUPS } from '../utils/nav';

// Navigation principale, fixe sur desktop (≥860px). Masquée sur mobile au
// profit de la bottom nav (voir BottomNav.jsx).
export default function Sidebar() {
  const { page, navigate, counts } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand mt-brand">
        <span className="mt-wordmark">MOTORTECH</span>
        <span className="mt-wordmark-sub">Toulon · La Garde</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div className="sidebar-group" key={group.label}>
            <span className="sidebar-group-label">{group.label}</span>
            {group.items.map(({ key, label, icon: Icon, count, alert }) => {
              const n = count ? counts[count] : 0;
              return (
                <button
                  key={key}
                  className={`sidebar-link ${page === key ? 'active' : ''}`}
                  onClick={() => navigate(key)}
                >
                  <Icon className="icon" />
                  <span className="sidebar-link-label">{label}</span>
                  {n > 0 && <span className={`sidebar-count ${alert ? 'sidebar-count-alert' : ''}`}>{n}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-status" onClick={() => navigate('automations')}>
          <span className="status-dot status-dot-live" />
          <span>
            <span className="sidebar-status-title">{counts.workflowsActive} workflows actifs</span>
            <span className="sidebar-status-sub">n8n · dernière exécution il y a 4 min</span>
          </span>
        </button>
        <div className="sidebar-user">
          <span className="sidebar-user-avatar">MT</span>
          <span>
            <span className="sidebar-user-name">Motortech Toulon</span>
            <span className="sidebar-user-role">Espace gérant</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
