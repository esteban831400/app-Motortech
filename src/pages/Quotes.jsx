import { useMemo, useState } from 'react';
import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';
import data from '../data/quotes.json';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import PrestationTag from '../components/PrestationTag';
import GainBar, { GainInline } from '../components/GainBar';
import { NOW } from '../utils/constants';
import { formatDate, formatDateShort, formatEuros, formatEurosRound, formatNumber, formatRelative } from '../utils/format';
import { IconFile, IconEye, IconCheckCircle, IconTimer, IconSend, IconMessage, IconMail, IconCheck, IconDownload, IconRepeat } from '../components/icons';

export const QUOTE_STATUS = {
  envoye: { tone: 'neutral', label: 'Envoyé' },
  ouvert: { tone: 'blue', label: 'Ouvert' },
  accepte: { tone: 'green', label: 'Accepté' },
  relance: { tone: 'amber', label: 'Relancé' },
};

const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'envoye', label: 'Envoyés' },
  { value: 'ouvert', label: 'Ouverts' },
  { value: 'relance', label: 'Relancés' },
  { value: 'accepte', label: 'Acceptés' },
];

function RelanceSteps({ q }) {
  return (
    <span className="steps">
      {q.relances.map((r) => (
        <span key={r.etape} className={`step step-${r.statut}`} title={`${r.etape} · ${r.label} · ${formatDate(r.date)}`}>
          {r.etape}
        </span>
      ))}
    </span>
  );
}

export default function Quotes() {
  const { params } = useApp();
  const toast = useToast();
  const [statut, setStatut] = useState(params.statut ?? 'all');
  const [open, setOpen] = useState(null);
  const s = data.stats;

  const quotes = useMemo(() => data.quotes.filter((q) => statut === 'all' || q.statut === statut), [statut]);

  const funnel = [
    { label: 'Demandes reçues', n: 64 },
    { label: 'Devis envoyés', n: s.envoyesMois },
    { label: 'Devis ouverts', n: s.ouverts },
    { label: 'Acceptés', n: s.acceptes },
  ];

  return (
    <div>
      <PageHeader
        title="Devis"
        highlight="automatiques"
        subtitle="Le formulaire du site génère le devis en moins d'une minute : gains mesurés, prix, puis relances J+2 et J+7 sans y penser."
      />

      <div className="stat-grid stagger-children">
        <StatCard label="Devis envoyés ce mois" value={s.envoyesMois} sub="64 demandes via motortech.fr" icon={<IconSend width={18} height={18} />} color="var(--tone-info)" softColor="var(--tone-info-soft)" />
        <StatCard label="Taux de conversion" value={s.conversion} format={(v) => `${v} %`} highlight sub="Moyenne réseau : 32 %" icon={<IconCheckCircle width={18} height={18} />} color="var(--tone-red)" softColor="var(--tone-red-soft)" />
        <StatCard label="CA signé" value={s.caSigne} format={formatEurosRound} sub={`${s.acceptes} devis acceptés`} icon={<IconFile width={18} height={18} />} color="var(--tone-success)" softColor="var(--tone-success-soft)" />
        <StatCard label="Délai d'envoi moyen" value={s.delaiMoyen} sub="De la demande au devis" icon={<IconTimer width={18} height={18} />} color="var(--tone-warning)" softColor="var(--tone-warning-soft)" />
      </div>

      <div className="dashboard-columns">
        <Card title="Entonnoir de novembre" subtitle="De la demande du site au devis signé">
          <div className="funnel">
            {funnel.map((f, i) => (
              <div className="funnel-row" key={f.label}>
                <span className="funnel-label">{f.label}</span>
                <div className="funnel-track">
                  <span className={`funnel-fill ${i === funnel.length - 1 ? 'funnel-fill-accent' : ''}`} style={{ '--bar-ratio': f.n / funnel[0].n }} />
                </div>
                <span className="funnel-value">{formatNumber(f.n)}</span>
                <span className="funnel-pct">{i === 0 ? '' : `${Math.round((f.n / funnel[i - 1].n) * 100)} %`}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Séquence de relance" subtitle="Appliquée à chaque devis non accepté" className="dashboard-side-card">
          <ol className="sequence">
            <li className="sequence-step">
              <span className="sequence-badge">J0</span>
              <div>
                <strong>Devis PDF + lien d'acceptation</strong>
                <span>E-mail et SMS · moins d'une minute après la demande</span>
              </div>
            </li>
            <li className="sequence-step">
              <span className="sequence-badge">J+2</span>
              <div>
                <strong>Relance douce</strong>
                <span>
                  <IconMessage width={12} height={12} /> SMS · 31 % des acceptations
                </span>
              </div>
            </li>
            <li className="sequence-step">
              <span className="sequence-badge">J+7</span>
              <div>
                <strong>Avis clients + créneaux libres</strong>
                <span>
                  <IconMail width={12} height={12} /> E-mail + SMS · 18 % des acceptations
                </span>
              </div>
            </li>
            <li className="sequence-step sequence-step-end">
              <span className="sequence-badge">J+10</span>
              <div>
                <strong>Alerte au gérant</strong>
                <span>Appel conseillé si toujours sans réponse</span>
              </div>
            </li>
          </ol>
        </Card>
      </div>

      <div className="section-header-row">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Demandes du formulaire
        </h2>
        <div className="filter-chips" role="tablist" aria-label="Filtrer par statut">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} className={`chip ${statut === f.value ? 'chip-active' : ''}`} onClick={() => setStatut(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap desktop-only">
        <table className="data-table">
          <thead>
            <tr>
              <th>Demande</th>
              <th>Client · véhicule</th>
              <th>Immat · km</th>
              <th>Prestation</th>
              <th>Gain</th>
              <th className="num">Prix TTC</th>
              <th>Statut</th>
              <th>Relances</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} onClick={() => setOpen(q)}>
                <td>
                  <div className="cell-primary">{formatDateShort(q.date)}</div>
                  <div className="cell-muted cell-small">{q.numero}</div>
                </td>
                <td>
                  <div className="cell-primary">{q.client}</div>
                  <div className="cell-muted cell-small">{q.modele}</div>
                </td>
                <td>
                  <span className="plate">{q.immat}</span>
                  <div className="cell-muted cell-small">{formatNumber(q.km)} km</div>
                </td>
                <td>
                  <PrestationTag value={q.prestation} short />
                </td>
                <td>
                  <GainInline gain={q.gain} />
                </td>
                <td className="num cell-primary">{formatEuros(q.prix)}</td>
                <td>
                  <Badge tone={QUOTE_STATUS[q.statut].tone}>{QUOTE_STATUS[q.statut].label}</Badge>
                </td>
                <td>
                  <RelanceSteps q={q} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="m-list mobile-only">
        {quotes.map((q) => (
          <button key={q.id} className="m-card" onClick={() => setOpen(q)}>
            <div className="m-card-row">
              <span className="m-card-title">{q.client}</span>
              <span className="m-card-amount">{formatEuros(q.prix)}</span>
            </div>
            <div className="m-card-sub">
              {q.modele} · <span className="plate plate-sm">{q.immat}</span>
            </div>
            <div className="m-card-row">
              <PrestationTag value={q.prestation} short />
              <GainInline gain={q.gain} />
            </div>
            <div className="m-card-row">
              <Badge tone={QUOTE_STATUS[q.statut].tone}>{QUOTE_STATUS[q.statut].label}</Badge>
              <RelanceSteps q={q} />
            </div>
          </button>
        ))}
      </div>

      {open && (
        <Modal
          size="lg"
          title={`Devis ${open.numero}`}
          subtitle={`${open.client} · ${open.vehicule}`}
          onClose={() => setOpen(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => toast.info(`PDF ${open.numero}.pdf téléchargé`)}>
                <IconDownload width={15} height={15} /> PDF
              </button>
              {open.statut !== 'accepte' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    toast.success(`Relance envoyée à ${open.client} par SMS`);
                    setOpen(null);
                  }}
                >
                  <IconRepeat width={15} height={15} /> Relancer maintenant
                </button>
              )}
            </>
          }
        >
          <div className="quote-detail">
            <div className="quote-summary">
              <div className="detail-badges">
                <Badge tone={QUOTE_STATUS[open.statut].tone}>{QUOTE_STATUS[open.statut].label}</Badge>
                <PrestationTag value={open.prestation} />
                <span className="plate">{open.immat}</span>
                <span className="chip chip-static">{formatNumber(open.km)} km</span>
              </div>
              {open.gain ? (
                <div className="gain-stack">
                  <GainBar avant={open.gain.chAvant} apres={open.gain.chApres} unit="ch" />
                  <GainBar avant={open.gain.nmAvant} apres={open.gain.nmApres} unit="Nm" />
                  <p className="card-note">Gains mesurés au banc Motortech sur ce moteur, valeurs moyennes constatées.</p>
                </div>
              ) : (
                <p className="card-note">Prestation d'entretien : nettoyage FAP, régénération et contrôle de la contre-pression.</p>
              )}
              <div className="price-box">
                <div>
                  <span>Total HT</span>
                  <span>{formatEuros(open.prix / 1.2)}</span>
                </div>
                <div>
                  <span>TVA 20 %</span>
                  <span>{formatEuros(open.prix - open.prix / 1.2)}</span>
                </div>
                <div className="price-box-total">
                  <span>Total TTC</span>
                  <span>{formatEuros(open.prix)}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="detail-heading">Historique automatique</h3>
              <ol className="mini-timeline">
                {open.historique.map((e, i) => (
                  <li key={i}>
                    <span className="mini-timeline-dot">
                      {e.text.startsWith('Devis accepté') ? <IconCheck width={11} height={11} /> : e.text.startsWith('Devis ouvert') ? <IconEye width={11} height={11} /> : null}
                    </span>
                    <div>
                      <span className="mini-timeline-text">{e.text}</span>
                      <span className="mini-timeline-date">{formatRelative(e.at, NOW)}</span>
                    </div>
                  </li>
                ))}
                {open.relances
                  .filter((r) => r.statut === 'planifie')
                  .map((r) => (
                    <li key={r.etape} className="mini-timeline-planned">
                      <span className="mini-timeline-dot" />
                      <div>
                        <span className="mini-timeline-text">
                          Relance {r.etape} programmée · {r.canal}
                        </span>
                        <span className="mini-timeline-date">{formatDate(r.date)} à 10h00</span>
                      </div>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
