import { useEffect, useRef, useState } from 'react';
import { useApp } from '../hooks/AppContext';
import { IconBell } from './icons';

// Cloche : alertes que les automatisations remontent au gérant.
export default function NotificationBell() {
  const { counts, navigate } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const items = [
    counts.invoicesToCheck > 0 && {
      tone: 'relance',
      title: `${counts.invoicesToCheck} facture${counts.invoicesToCheck > 1 ? 's' : ''} Amazon à vérifier`,
      sub: 'Bon de commande vide ou immatriculation inconnue',
      page: 'invoices',
      params: { statut: 'a_verifier' },
    },
    {
      tone: 'task',
      title: 'Journée banc du 28 nov. complète',
      sub: '7 personnes en liste d’attente',
      page: 'events',
    },
    {
      tone: 'rdv',
      title: '4 devis relancés automatiquement',
      sub: 'Sans réponse après J+7 : un appel est conseillé',
      page: 'quotes',
      params: { statut: 'relance' },
    },
  ].filter(Boolean);

  return (
    <div className="notif-bell" ref={ref}>
      <button className="topbar-icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <IconBell width={18} height={18} />
        <span className="notif-badge">{items.length}</span>
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">À traiter</div>
          <div className="notif-list">
            {items.map((it) => (
              <button
                key={it.title}
                className="notif-item"
                onClick={() => {
                  setOpen(false);
                  navigate(it.page, it.params);
                }}
              >
                <span className={`notif-item-dot notif-item-dot-${it.tone}`} />
                <span className="notif-item-body">
                  <span className="notif-item-title">{it.title}</span>
                  <span className="notif-item-sub">{it.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
