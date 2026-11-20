import { parseDate } from './format';

// Contexte horaire d'un appel : lundi (fermé), pause 12h–14h, hors horaires.
export function callContext(at) {
  const d = parseDate(at);
  const day = d.getDay();
  const h = d.getHours() + d.getMinutes() / 60;
  if (day === 1) return { key: 'lundi', label: 'Lundi · fermé' };
  if (day === 0) return { key: 'ferme', label: 'Dimanche · fermé' };
  if (h >= 12 && h < 14) return { key: 'midi', label: 'Pause 12h–14h' };
  const close = day === 6 ? 12 : 18.5;
  if (h < 9 || h >= close) return { key: 'soir', label: 'Hors horaires' };
  return { key: 'ouvert', label: 'Centre ouvert' };
}

export const CALL_STATUS = {
  ia: { tone: 'blue', label: "Répondu par l'IA" },
  sms: { tone: 'amber', label: 'SMS de rappel envoyé' },
  rdv: { tone: 'green', label: 'RDV pris' },
  atelier: { tone: 'neutral', label: "Pris par l'équipe" },
};

export const BESOINS = {
  stage1: 'Stage 1',
  stage2: 'Stage 2',
  e85: 'Conversion E85',
  fap: 'Nettoyage FAP',
  meca: 'Mécanique',
  devis: 'Suivi de devis',
  suivi: 'Suivi client',
  autre: 'Non précisé',
};
