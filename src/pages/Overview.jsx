import { useMemo, useState } from 'react';
import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';
import data from '../data/overview.json';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Segmented from '../components/Segmented';
import Badge from '../components/Badge';
import PrestationTag from '../components/PrestationTag';
import LineChart from '../components/charts/LineChart';
import Donut from '../components/charts/Donut';
import useCountUp from '../hooks/useCountUp';
import { PRESTATIONS, NOW } from '../utils/constants';
import { formatEuros, formatEurosRound, formatRelative, formatTime } from '../utils/format';
import {
  IconEuro,
  IconCalendar,
  IconFile,
  IconPhoneMissed,
  IconZap,
  IconGauge,
  IconMessage,
  IconPhone,
  IconStar,
  IconPackage,
  IconAlert,
  IconMail,
  IconFlag,
  IconLeaf,
  IconArrowRight,
  IconClose,
} from '../components/icons';

const stagger = (i) => ({ '--stagger-i': i });

// Part du CA issue d'un appel récupéré par l'IA, d'un devis automatique ou d'une relance
const CA_IA = 21380;

const PERIODS = [
  { value: 3, label: '3 mois' },
  { value: 6, label: '6 mois' },
  { value: 12, label: '12 mois' },
];

const FEED_ICONS = {
  dyno: IconGauge,
  warning: IconAlert,
  quote: IconFile,
  rdv: IconCalendar,
  call: IconPhone,
  sms: IconMessage,
  review: IconStar,
  invoice: IconPackage,
  report: IconMail,
  event: IconFlag,
  e85: IconLeaf,
};

const STATUT_PLANNING = {
  termine: { tone: 'green', label: 'Terminé' },
  en_cours: { tone: 'red', label: 'En cours' },
  a_venir: { tone: 'neutral', label: 'À venir' },
};

export default function Overview() {
  const { navigate } = useApp();
  const toast = useToast();
  const [period, setPeriod] = useState(12);
  const [bannerOpen, setBannerOpen] = useState(true);
  const k = data.kpis;
  const caIA = useCountUp(CA_IA);
  const evolution = Math.round(((k.caMois - k.caMoisN1) / k.caMoisN1) * 100);

  const revenue = useMemo(
    () =>
      data.revenue.slice(-period).map((r) => ({
        ...r,
        tooltipLabel: `${r.label} ${r.key.slice(0, 4)}${r.partiel ? ' (au 19)' : ''}`,
      })),
    [period]
  );
  const caAnnuel = data.revenue.reduce((s, r) => s + r.n, 0);
  const caAnnuelN1 = data.revenue.reduce((s, r) => s + r.n1, 0);

  const prestations = data.prestations.map((p) => ({
    key: p.key,
    value: p.montant,
    nombre: p.nombre,
    label: PRESTATIONS[p.key].label,
    color: PRESTATIONS[p.key].color,
  }));

  return (
    <div className="page-manual-stagger overview">
      <div className="mt-watermark" aria-hidden="true">
        MOTORTECH
      </div>

      {bannerOpen && (
        <div className="mt-banner stagger-in" style={stagger(0)} role="status">
          <IconFlag width={18} height={18} />
          <div className="mt-banner-text">
            <strong>{data.alerte.titre}</strong>
            <span>{data.alerte.texte}</span>
          </div>
          <button
            className="mt-banner-cta"
            onClick={() => {
              toast.success('2e session créée le sam. 5 déc. · 7 invitations envoyées à la liste d’attente');
              setBannerOpen(false);
            }}
          >
            {data.alerte.action}
          </button>
          <button className="mt-banner-close" onClick={() => setBannerOpen(false)} aria-label="Masquer l'alerte">
            <IconClose width={16} height={16} />
          </button>
        </div>
      )}

      <div className="page-header stagger-in" style={stagger(1)}>
        <div>
          <h1>
            Bonjour, voici votre <span className="mt-highlight">centre</span> aujourd'hui
          </h1>
          <p className="page-subtitle">
            Jeudi 19 novembre 2026 · 8 véhicules au planning · 12 automatisations actives
          </p>
        </div>
      </div>

      <div className="dashboard-hero-row stagger-parent">
        <div className="hero-card mt-hero stagger-in" style={stagger(2)}>
          <button className="hero-card-main" onClick={() => navigate('automations')}>
            <span className="hero-card-label">
              <IconZap width={16} height={16} />
              CA apporté par vos automatisations · novembre
            </span>
            <span className="hero-card-value count-up mt-hero-value">{formatEuros(caIA)}</span>
            <span className="hero-card-sub">
              <strong className="text-accent">{Math.round((CA_IA / k.caMois) * 100)} %</strong> du CA du mois · appels
              récupérés, devis automatiques et relances →
            </span>
          </button>
          <div className="mt-progress" role="img" aria-label={`${Math.round((CA_IA / k.caMois) * 100)} % du CA du mois`}>
            <span style={{ '--bar-ratio': CA_IA / k.caMois }} />
          </div>
          <div className="hero-card-stats">
            <button className="hero-card-stat" onClick={() => navigate('calls')}>
              <span className="hero-card-stat-value">{k.appelsRecuperes}</span>
              <span className="hero-card-stat-label">Appels récupérés</span>
            </button>
            <button className="hero-card-stat" onClick={() => navigate('quotes')}>
              <span className="hero-card-stat-value">25</span>
              <span className="hero-card-stat-label">Devis signés</span>
            </button>
            <button className="hero-card-stat" onClick={() => navigate('automations')}>
              <span className="hero-card-stat-value">31 h</span>
              <span className="hero-card-stat-label">Temps libéré</span>
            </button>
          </div>
        </div>

        <div className="stat-grid dashboard-stat-grid">
          <StatCard
            className="stagger-in"
            style={stagger(3)}
            label="CA du mois"
            value={k.caMois}
            format={formatEurosRound}
            highlight
            sub={`+${evolution} % vs N-1`}
            icon={<IconEuro width={18} height={18} />}
            color="var(--tone-red)"
            softColor="var(--tone-red-soft)"
            onClick={() => navigate('network')}
          />
          <StatCard
            className="stagger-in"
            style={stagger(4)}
            label="RDV de la semaine"
            value={k.rdvSemaine}
            sub={`dont ${k.rdvSemaineIA} pris par l'IA`}
            icon={<IconCalendar width={18} height={18} />}
            color="var(--tone-info)"
            softColor="var(--tone-info-soft)"
            onClick={() => navigate('calls', { statut: 'rdv' })}
          />
          <StatCard
            className="stagger-in"
            style={stagger(5)}
            label="Devis en attente"
            value={k.devisAttente}
            sub={`${formatEurosRound(k.devisAttenteMontant)} à signer`}
            icon={<IconFile width={18} height={18} />}
            color="var(--tone-warning)"
            softColor="var(--tone-warning-soft)"
            onClick={() => navigate('quotes')}
          />
          <StatCard
            className="stagger-in"
            style={stagger(6)}
            label="Appels manqués récupérés"
            value={k.appelsRecuperes}
            highlight
            sub={`${k.appelsRecuperesRdv} transformés en RDV`}
            icon={<IconPhoneMissed width={18} height={18} />}
            color="var(--tone-red)"
            softColor="var(--tone-red-soft)"
            onClick={() => navigate('calls')}
          />
        </div>
      </div>

      <div className="dashboard-columns stagger-parent">
        <Card
          className="dashboard-chart-card stagger-in"
          style={stagger(7)}
          title="Chiffre d'affaires"
          subtitle={`${formatEurosRound(caAnnuel)} sur 12 mois glissants · +${Math.round(((caAnnuel - caAnnuelN1) / caAnnuelN1) * 100)} % vs N-1`}
          action={<Segmented options={PERIODS} value={period} onChange={setPeriod} label="Période" />}
        >
          <LineChart
            data={revenue}
            series={[
              { key: 'n', label: '2025–2026', color: 'var(--chart-series-1)' },
              { key: 'n1', label: 'Année précédente', color: 'var(--chart-series-2)', dashed: true },
            ]}
            formatValue={formatEuros}
            formatAxis={(v) => (v >= 1000 ? `${Math.round(v / 1000)} k€` : `${v} €`)}
          />
        </Card>

        <Card className="dashboard-side-card stagger-in" style={stagger(8)} title="Répartition des prestations" subtitle="CA de novembre par type">
          <div className="presta-split">
            <Donut
              items={prestations}
              centerValue={formatEurosRound(k.caMois)}
              centerLabel="ce mois"
              formatValue={formatEuros}
            />
            <ul className="legend-list">
              {prestations.map((p) => (
                <li key={p.key}>
                  <span className="legend-swatch" style={{ background: p.color }} />
                  <span className="legend-label">{p.label}</span>
                  <span className="legend-meta">{p.nombre}</span>
                  <span className="legend-value">{Math.round((p.value / k.caMois) * 100)} %</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="dashboard-columns dashboard-columns-even stagger-parent">
        <Card
          className="stagger-in"
          style={stagger(9)}
          title="Planning du jour"
          subtitle="Banc, ponts et accueil · jeu. 19 nov."
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('calls', { statut: 'rdv' })}>
              Semaine
            </button>
          }
        >
          <ol className="timeline">
            {data.planning.map((p, i) => {
              const st = STATUT_PLANNING[p.statut];
              return (
                <li key={i} className={`timeline-item timeline-${p.statut}`}>
                  <span className="timeline-time">
                    {p.debut}
                    <small>{p.fin}</small>
                  </span>
                  <span className="timeline-dot" />
                  <div className="timeline-body">
                    <div className="timeline-row">
                      <span className="timeline-title">{p.vehicule}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <div className="timeline-sub">
                      {p.client} · {p.detail}
                    </div>
                    <div className="timeline-meta">
                      <span className="chip chip-static">{p.poste}</span>
                      <PrestationTag value={p.prestation} short />
                      {p.note && <span className="timeline-note">{p.note}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card
          className="stagger-in"
          style={stagger(10)}
          title="Fil des automatisations"
          subtitle="En direct depuis n8n"
          action={
            <span className="live-pill">
              <span className="status-dot status-dot-live" /> Live
            </span>
          }
        >
          <ul className="feed">
            {data.activity.map((a, i) => {
              const Icon = FEED_ICONS[a.type] ?? IconZap;
              return (
                <li key={i} className={`feed-item feed-${a.type}`}>
                  <span className="feed-icon">
                    <Icon width={15} height={15} />
                  </span>
                  <div className="feed-body">
                    <span className="feed-text">{a.text}</span>
                    <span className="feed-meta">
                      {formatRelative(a.at, NOW)} · {a.workflow}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <button className="link-btn" onClick={() => navigate('automations')}>
            Voir les 13 workflows <IconArrowRight width={14} height={14} />
          </button>
        </Card>
      </div>
      <p className="page-footnote stagger-in" style={stagger(11)}>
        Données de démonstration · mise à jour {formatTime(NOW)}
      </p>
    </div>
  );
}
