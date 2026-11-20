import {
  IconDashboard,
  IconPhone,
  IconFile,
  IconPackage,
  IconStar,
  IconFlag,
  IconNetwork,
  IconZap,
} from '../components/icons';

// Source unique de la navigation (sidebar, bottom nav, palette, titres).
export const NAV_GROUPS = [
  {
    label: 'Pilotage',
    items: [
      { key: 'overview', label: "Vue d'ensemble", short: 'Accueil', icon: IconDashboard },
      { key: 'calls', label: 'Standard IA & appels', short: 'Appels', icon: IconPhone },
      { key: 'quotes', label: 'Devis automatiques', short: 'Devis', icon: IconFile },
      { key: 'invoices', label: 'Factures Amazon', short: 'Factures', icon: IconPackage, count: 'invoicesToCheck', alert: true },
    ],
  },
  {
    label: 'Clients',
    items: [
      { key: 'followup', label: 'Suivi client & avis', short: 'Avis', icon: IconStar },
      { key: 'events', label: 'Événements', short: 'Événements', icon: IconFlag },
    ],
  },
  {
    label: 'Réseau & IA',
    items: [
      { key: 'network', label: 'Réseau Motortech', short: 'Réseau', icon: IconNetwork },
      { key: 'automations', label: 'Automatisations', short: 'Workflows', icon: IconZap },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
export const NAV_BY_KEY = Object.fromEntries(NAV_ITEMS.map((i) => [i.key, i]));

// Mobile : 4 raccourcis + feuille « Plus »
export const MOBILE_PRIMARY = ['overview', 'calls', 'quotes', 'invoices'];
