import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Switch from '../components/Switch';
import Sparkline from '../components/charts/Sparkline';
import { NOW } from '../utils/constants';
import { formatDuration, formatNumber, formatRelative } from '../utils/format';
import {
  IconZap,
  IconPhone,
  IconMessage,
  IconFile,
  IconRepeat,
  IconPackage,
  IconFolder,
  IconArchive,
  IconGauge,
  IconStar,
  IconLeaf,
  IconFlag,
  IconMail,
  IconSparkles,
  IconCheckCircle,
  IconTimer,
  IconPlay,
} from '../components/icons';

const ICONS = {
  phone: IconPhone,
  message: IconMessage,
  file: IconFile,
  repeat: IconRepeat,
  package: IconPackage,
  folder: IconFolder,
  archive: IconArchive,
  gauge: IconGauge,
  star: IconStar,
  leaf: IconLeaf,
  flag: IconFlag,
  mail: IconMail,
  sparkles: IconSparkles,
};

export default function Automations() {
  const { workflows, toggleWorkflow } = useApp();
  const toast = useToast();
  const active = workflows.filter((w) => w.actif);
  const runs = workflows.reduce((s, w) => s + w.executionsMois, 0);

  return (
    <div>
      <PageHeader
        title="Vos"
        highlight="automatisations"
        subtitle="Les workflows n8n qui tournent pour le centre. Un interrupteur suffit pour mettre en pause ou réactiver."
      />

      <div className="stat-grid stagger-children">
        <StatCard label="Workflows actifs" value={active.length} sub={`sur ${workflows.length} installés`} highlight icon={<IconZap width={18} height={18} />} color="var(--tone-red)" softColor="var(--tone-red-soft)" />
        <StatCard label="Exécutions ce mois" value={runs} sub="Depuis le 1er novembre" icon={<IconPlay width={18} height={18} />} color="var(--tone-info)" softColor="var(--tone-info-soft)" />
        <StatCard label="Taux de succès" value="99,6 %" sub="3 reprises automatiques" icon={<IconCheckCircle width={18} height={18} />} color="var(--tone-success)" softColor="var(--tone-success-soft)" />
        <StatCard label="Temps libéré" value={formatDuration(31 * 60 + 30)} sub="Estimation sur novembre" icon={<IconTimer width={18} height={18} />} color="var(--tone-warning)" softColor="var(--tone-warning-soft)" />
      </div>

      <div className="workflow-list stagger-children">
        {workflows.map((w) => {
          const Icon = ICONS[w.icone] ?? IconZap;
          return (
            <div key={w.id} className={`card workflow ${w.actif ? '' : 'workflow-off'}`}>
              <span className="workflow-icon">
                <Icon width={18} height={18} />
              </span>
              <div className="workflow-main">
                <div className="workflow-title-row">
                  <strong className="workflow-name">{w.nom}</strong>
                  {w.actif ? (
                    <span className="live-pill">
                      <span className="status-dot status-dot-live" /> Actif
                    </span>
                  ) : (
                    <span className="live-pill live-pill-off">
                      <span className="status-dot" /> En pause
                    </span>
                  )}
                </div>
                <p className="workflow-desc">{w.description}</p>
                <div className="workflow-meta">
                  <span>
                    <span className="meta-label">Déclencheur</span> {w.declencheur}
                  </span>
                  <span>
                    <span className="meta-label">Dernière exécution</span> {formatRelative(w.derniereExecution, NOW)}
                  </span>
                </div>
              </div>
              <div className="workflow-stats">
                <Sparkline values={w.serie} color={w.actif ? 'var(--color-text)' : 'var(--color-muted)'} />
                <span className="workflow-runs">
                  <strong>{formatNumber(w.executionsMois)}</strong> exéc. ce mois
                </span>
                <span className="cell-muted cell-small">{w.tauxSucces.toLocaleString('fr-FR')} % de succès</span>
              </div>
              <div className="workflow-toggle">
                <Switch
                  checked={w.actif}
                  label={w.actif ? 'Mettre en pause' : 'Activer'}
                  onChange={() => {
                    toggleWorkflow(w.id);
                    toast[w.actif ? 'info' : 'success'](`« ${w.nom} » ${w.actif ? 'mis en pause' : 'réactivé'}`);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="page-footnote">Hébergé sur n8n · journaux d'exécution conservés 90 jours · données de démonstration.</p>
    </div>
  );
}
