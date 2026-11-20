import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../hooks/AppContext';
import { NAV_ITEMS } from '../utils/nav';
import clients from '../data/clients.json';
import { IconSearch, IconCar, IconReceipt, IconArrowRight } from './icons';
import { formatDate, formatEuros } from '../utils/format';

const OPEN_EVENT = 'motortech:cmdk';
export const openCommandPalette = () => window.dispatchEvent(new Event(OPEN_EVENT));

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s-]/g, '');

// Palette ⌘K : pages, clients (nom, véhicule, immatriculation) et factures.
export default function CommandPalette() {
  const { navigate, invoices } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const groups = useMemo(() => {
    const q = norm(query);
    const pages = NAV_ITEMS.filter((p) => !q || norm(p.label).includes(q)).map((p) => ({
      id: `p-${p.key}`,
      icon: <p.icon width={15} height={15} />,
      label: p.label,
      sub: 'Page',
      run: () => navigate(p.key),
    }));
    const cl = q
      ? clients
          .filter((c) => norm(`${c.prenom} ${c.nom} ${c.vehicule.modele} ${c.immat}`).includes(q))
          .slice(0, 6)
          .map((c) => ({
            id: c.id,
            icon: <IconCar width={15} height={15} />,
            label: `${c.prenom} ${c.nom} · ${c.vehicule.modele}`,
            sub: c.immat,
            run: () => navigate('invoices', { view: 'dossiers', clientId: c.id }),
          }))
      : [];
    const inv =
      q.length >= 3
        ? invoices
            .filter((i) => norm(`${i.commande} ${i.fichier} ${i.bonDeCommande}`).includes(q))
            .slice(0, 5)
            .map((i) => ({
              id: i.id,
              icon: <IconReceipt width={15} height={15} />,
              label: i.fichier,
              sub: `${formatDate(i.date)} · ${formatEuros(i.ttc)}`,
              run: () => navigate('invoices', { openInvoiceId: i.id }),
            }))
        : [];
    return [
      { title: 'Navigation', items: pages },
      { title: 'Clients & véhicules', items: cl },
      { title: 'Factures Amazon', items: inv },
    ].filter((g) => g.items.length > 0);
  }, [query, invoices, navigate]);

  const flat = groups.flatMap((g) => g.items);

  if (!open) return null;

  const run = (item) => {
    setOpen(false);
    item?.run();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      run(flat[active]);
    }
  };

  let idx = -1;
  return createPortal(
    <div className="cmdk-overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="cmdk-panel" onKeyDown={onKeyDown}>
        <div className="cmdk-search">
          <IconSearch width={18} height={18} />
          <input
            ref={inputRef}
            className="cmdk-input"
            placeholder="Rechercher un client, une immatriculation, une facture…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
          />
          <kbd className="cmdk-kbd">Échap</kbd>
        </div>
        <div className="cmdk-list">
          {flat.length === 0 && <div className="cmdk-empty">Aucun résultat pour « {query} »</div>}
          {groups.map((g) => (
            <div className="cmdk-group" key={g.title}>
              <div className="cmdk-group-title">{g.title}</div>
              {g.items.map((item) => {
                idx += 1;
                const i = idx;
                return (
                  <button
                    key={item.id}
                    className="cmdk-item"
                    data-active={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(item)}
                  >
                    <span className="cmdk-item-icon">{item.icon}</span>
                    <span className="cmdk-item-label">{item.label}</span>
                    <span className="cmdk-item-sub">{item.sub}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-footer">
          <span>
            <kbd className="cmdk-kbd">↑</kbd>
            <kbd className="cmdk-kbd">↓</kbd> naviguer
          </span>
          <span>
            <kbd className="cmdk-kbd">↵</kbd> ouvrir
          </span>
          <span>
            <IconArrowRight width={12} height={12} /> Essayez « GE-482 » ou « RS3 »
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
