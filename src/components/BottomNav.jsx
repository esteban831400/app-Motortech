import { useState } from 'react';
import { useApp } from '../hooks/AppContext';
import { NAV_BY_KEY, NAV_ITEMS, MOBILE_PRIMARY } from '../utils/nav';
import { IconMore } from './icons';

const MORE_ITEMS = NAV_ITEMS.filter((i) => !MOBILE_PRIMARY.includes(i.key));

// Navigation mobile en bas d'écran : 4 raccourcis principaux + une feuille
// "Plus" pour les pages secondaires.
export default function BottomNav() {
  const { page, navigate, counts } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = MORE_ITEMS.some((i) => i.key === page);

  const go = (key) => {
    navigate(key);
    setMoreOpen(false);
  };

  return (
    <>
      <nav className="bottom-nav">
        {MOBILE_PRIMARY.map((key) => {
          const { short, icon: Icon, count, alert } = NAV_BY_KEY[key];
          const n = alert && count ? counts[count] : 0;
          return (
            <button key={key} className={`bottom-nav-item ${page === key ? 'active' : ''}`} onClick={() => go(key)}>
              <span className="bottom-nav-icon">
                <Icon width={20} height={20} />
                {n > 0 && <span className="bottom-nav-badge">{n}</span>}
              </span>
              <span>{short}</span>
            </button>
          );
        })}
        <button
          className={`bottom-nav-item ${isMoreActive || moreOpen ? 'active' : ''}`}
          onClick={() => setMoreOpen(true)}
        >
          <IconMore width={20} height={20} />
          <span>Plus</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="sheet-overlay" onMouseDown={() => setMoreOpen(false)}>
          <div className="sheet" onMouseDown={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-grid">
              {MORE_ITEMS.map(({ key, short, icon: Icon }) => (
                <button key={key} className={`sheet-item ${page === key ? 'active' : ''}`} onClick={() => go(key)}>
                  <Icon width={22} height={22} />
                  <span>{short}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
