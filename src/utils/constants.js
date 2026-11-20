// Horloge figée de la démo : toutes les données sont cohérentes avec ce « maintenant ».
export const NOW = new Date(2026, 10, 19, 16, 42); // jeudi 19 nov. 2026, 16h42
export const TODAY_ISO = '2026-11-19';

export const CENTRE = {
  nom: 'Motortech Toulon',
  ville: 'La Garde',
  departement: 'Var (83)',
  horaires: 'Mar–Ven 9h–12h · 14h–18h30 · Sam 9h–12h',
  gerant: 'Gérant',
};

// Prestations : la couleur suit le rôle (rouge = reprog, vert = E85, gris = atelier).
export const PRESTATIONS = {
  stage1: { label: 'Stage 1', color: 'var(--mt-red)', soft: 'var(--color-accent-soft)', text: 'var(--acc-text)' },
  stage2: { label: 'Stage 2', color: '#ff8a8f', soft: 'var(--color-accent-soft)', text: 'var(--acc-text)' },
  stage3: { label: 'Stage 3', color: '#ff8a8f', soft: 'var(--color-accent-soft)', text: 'var(--acc-text)' },
  e85: { label: 'Conversion E85', short: 'E85', color: 'var(--mt-e85)', soft: 'var(--color-success-soft)', text: 'var(--mt-e85-text)' },
  fap: { label: 'Nettoyage FAP', short: 'FAP', color: '#a1a1aa', soft: 'var(--color-neutral-soft)', text: 'var(--color-text)' },
  meca: { label: 'Mécanique', color: '#52525b', soft: 'var(--color-neutral-soft)', text: 'var(--color-text)' },
  pieces: { label: 'Pièces perf.', color: '#71717a', soft: 'var(--color-neutral-soft)', text: 'var(--color-text)' },
};

// Tons des badges : un statut = un rôle sémantique.
export const TONES = {
  red: { color: 'var(--acc-text)', soft: 'var(--color-accent-soft)' },
  green: { color: 'var(--color-success)', soft: 'var(--color-success-soft)' },
  amber: { color: 'var(--color-warning)', soft: 'var(--color-warning-soft)' },
  blue: { color: 'var(--color-rdv)', soft: 'var(--color-rdv-soft)' },
  danger: { color: 'var(--color-danger)', soft: 'var(--color-danger-soft)' },
  neutral: { color: 'var(--color-muted)', soft: 'var(--color-neutral-soft)' },
};
