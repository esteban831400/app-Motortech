import { IconPackage, IconMail, IconSparkles, IconUsers, IconFolder, IconSheet, IconSend } from '../icons';

const STEPS = [
  { icon: IconPackage, title: 'Commande Amazon Business', sub: 'N° de bon de commande = immat + nom' },
  { icon: IconMail, title: 'Récupération auto', sub: 'Facture captée dans Gmail' },
  { icon: IconSparkles, title: 'Lecture IA', sub: 'Montants, TVA, articles' },
  { icon: IconUsers, title: 'Attribution client', sub: 'Rapprochement immatriculation' },
  { icon: IconFolder, title: 'Drive + Sheet', sub: 'PDF renommé et classé', extra: IconSheet },
  { icon: IconSend, title: 'Comptable', sub: 'Export ZIP + CSV le 1er' },
];

// Schéma du flux n8n : horizontal sur desktop, vertical sur mobile.
// Le connecteur animé matérialise le passage d'une facture.
export default function FlowDiagram({ stats }) {
  return (
    <ol className="flow">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        return (
          <li key={s.title} className="flow-step" style={{ '--stagger-i': i }}>
            <span className={`flow-icon ${i === 2 ? 'flow-icon-ai' : ''}`}>
              <Icon width={18} height={18} />
            </span>
            <span className="flow-title">{s.title}</span>
            <span className="flow-sub">{s.sub}</span>
            {stats?.[i] && <span className="flow-stat">{stats[i]}</span>}
            {i < STEPS.length - 1 && <span className="flow-connector" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
