import { useApp } from '../hooks/AppContext';
import { NAV_BY_KEY } from '../utils/nav';
import { openCommandPalette } from './CommandPalette';
import NotificationBell from './NotificationBell';
import { IconSearch, IconSun, IconMoon, IconCalendar } from './icons';

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

// Barre supérieure : titre de la page, recherche ⌘K, thème, notifications
// et l'action principale du centre : « Prendre RDV ».
export default function Topbar() {
  const { page, theme, toggleTheme, openRdv } = useApp();
  const ThemeIcon = theme === 'dark' ? IconSun : IconMoon;

  return (
    <header className="topbar">
      <span className="mt-wordmark mt-wordmark-topbar" aria-hidden="true">
        MOTORTECH
      </span>
      <span className="topbar-title">{NAV_BY_KEY[page]?.label ?? ''}</span>
      <div className="topbar-spacer" />
      <button type="button" className="topbar-search" onClick={openCommandPalette} aria-label="Recherche globale">
        <IconSearch width={16} height={16} />
        <span className="topbar-search-label">Client, immat, facture…</span>
        <kbd className="cmdk-kbd topbar-search-kbd">{IS_MAC ? '⌘K' : 'Ctrl K'}</kbd>
      </button>
      <button
        className="topbar-icon-btn"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
        title={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
      >
        <ThemeIcon width={18} height={18} />
      </button>
      <NotificationBell />
      <button className="btn btn-primary topbar-cta" onClick={openRdv}>
        <IconCalendar width={16} height={16} />
        <span className="topbar-cta-label">Prendre RDV</span>
        <span className="topbar-cta-short">RDV</span>
      </button>
    </header>
  );
}
