import { useState } from 'react';
import { useToast } from '../hooks/ToastContext';
import data from '../data/followup.json';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Stars from '../components/Stars';
import PrestationTag from '../components/PrestationTag';
import LineChart from '../components/charts/LineChart';
import DynoChart from '../components/charts/DynoChart';
import { NOW } from '../utils/constants';
import { formatDate, formatDateShort, formatNumber, formatRelative } from '../utils/format';
import { IconStar, IconGauge, IconMessage, IconBell, IconLeaf, IconSend, IconSparkles, IconCalendar, IconMail } from '../components/icons';

const AVIS = {
  laisse: { tone: 'green', label: 'Avis laissé' },
  programmee: { tone: 'neutral', label: 'Demande J+2' },
  relance: { tone: 'amber', label: 'Relancé J+5' },
};
const RAPPEL = {
  rdv: { tone: 'green', label: 'RDV pris' },
  envoye: { tone: 'blue', label: 'Envoyé' },
  planifie: { tone: 'neutral', label: 'Planifié' },
};

export default function Followup() {
  const toast = useToast();
  const [dyno, setDyno] = useState(null);
  const s = data.stats;

  return (
    <div>
      <PageHeader
        title="Suivi client &"
        highlight="avis Google"
        subtitle="Après chaque passage : courbe du banc envoyée au client, demande d'avis au bon moment, puis rappels d'entretien (E85, vidange après Stage 2…)."
      />

      <div className="stat-grid stagger-children">
        <StatCard label="Note Google" value={`${s.note.toLocaleString('fr-FR')} / 5`} highlight sub={`${formatNumber(s.avis)} avis`} icon={<IconStar width={18} height={18} />} color="var(--tone-red)" softColor="var(--tone-red-soft)" />
        <StatCard label="Nouveaux avis (90 j)" value={s.avisTrimestre} sub="×1,6 depuis l'automatisation" icon={<IconSparkles width={18} height={18} />} color="var(--tone-warning)" softColor="var(--tone-warning-soft)" />
        <StatCard label="Courbes de banc envoyées" value={s.courbesMois} sub="Ce mois · 92 % ouvertes" icon={<IconGauge width={18} height={18} />} color="var(--tone-info)" softColor="var(--tone-info-soft)" />
        <StatCard label="Rappels d'entretien" value={s.rappelsMois} sub="Dont 41 liés à l'E85" icon={<IconBell width={18} height={18} />} color="var(--tone-success)" softColor="var(--tone-success-soft)" />
      </div>

      <div className="dashboard-columns">
        <Card title="Évolution des avis Google" subtitle="Total cumulé · demandes automatiques actives depuis septembre">
          <LineChart
            data={data.avisSerie.map((d) => ({ ...d, tooltipLabel: `${d.label} ${d.key.slice(0, 4)} · +${d.nouveaux} avis` }))}
            series={[{ key: 'total', label: 'Avis Google', color: 'var(--chart-series-1)' }]}
            yMin={250}
            height={300}
            formatValue={(v) => `${formatNumber(Math.round(v))} avis`}
            formatAxis={(v) => formatNumber(Math.round(v))}
          />
        </Card>
        <Card title="Derniers avis" className="dashboard-side-card">
          <ul className="review-list">
            {data.avisRecents.slice(0, 3).map((r) => (
              <li key={r.auteur} className="review">
                <div className="review-head">
                  <strong>{r.auteur}</strong>
                  <Stars value={r.note} size={12} />
                  <span className="cell-muted cell-small">{formatDateShort(r.date)}</span>
                </div>
                <p className="review-text">{r.texte}</p>
                <p className="review-reply">
                  <span className="ai-block-label">
                    {r.reponseIA ? (
                      <>
                        <IconSparkles width={12} height={12} /> Réponse IA publiée
                      </>
                    ) : (
                      'Réponse du gérant'
                    )}
                  </span>
                  {r.reponse}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <h2 className="section-title">Courbes du banc envoyées</h2>
      <div className="dyno-grid stagger-children">
        {data.courbes.map((c) => (
          <button key={c.id} className="card dyno-card lift-hover" onClick={() => setDyno(c)}>
            <div className="m-card-row">
              <span className="m-card-title">{c.vehicule}</span>
              <PrestationTag value={c.prestation} short />
            </div>
            <span className="m-card-sub">
              {c.client} · {formatRelative(c.at, NOW)}
            </span>
            <DynoChart mesure={c} height={120} compact />
            <div className="dyno-figures">
              <span>
                <strong className="text-accent">+{c.chApres - c.chAvant} ch</strong> · {c.chApres} ch
              </span>
              <span>
                <strong>+{c.nmApres - c.nmAvant} Nm</strong> · {c.nmApres} Nm
              </span>
            </div>
            <div className="m-card-row">
              <span className="cell-small cell-muted">
                <IconMessage width={12} height={12} /> SMS {c.statut === 'ouverte' ? 'ouvert' : 'envoyé'}
              </span>
              <Badge tone={AVIS[c.avis].tone}>
                {c.avis === 'laisse' ? `${AVIS.laisse.label} ${c.note}★` : AVIS[c.avis].label}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      <Card
        title="Rappels d'entretien"
        subtitle="Calculés à partir de la prestation, du kilométrage et du carburant"
        action={
          <span className="chip chip-static chip-e85">
            <IconLeaf width={12} height={12} /> {data.rappels.filter((r) => r.e85).length} rappels E85
          </span>
        }
        className="section-gap"
      >
        <ul className="reminder-list">
          {data.rappels.map((r, i) => (
            <li key={i} className={`reminder ${r.e85 ? 'reminder-e85' : ''}`}>
              <span className="reminder-icon">{r.e85 ? <IconLeaf width={15} height={15} /> : <IconCalendar width={15} height={15} />}</span>
              <div className="reminder-main">
                <strong>{r.type}</strong>
                <span className="cell-muted cell-small">
                  {r.client} · {r.vehicule}
                </span>
              </div>
              <span className="reminder-date">
                {formatDate(r.echeance)}
                <small>
                  {r.canal === 'SMS' ? <IconMessage width={11} height={11} /> : <IconMail width={11} height={11} />} {r.canal}
                </small>
              </span>
              <Badge tone={RAPPEL[r.statut].tone}>{RAPPEL[r.statut].label}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      {dyno && (
        <Modal
          size="lg"
          title={`Courbe de puissance · ${dyno.vehicule}`}
          subtitle={`${dyno.client} · passage au banc le ${formatDate(dyno.at)}`}
          onClose={() => setDyno(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setDyno(null)}>
                Fermer
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  toast.success(`Courbe renvoyée à ${dyno.client} par SMS`);
                  setDyno(null);
                }}
              >
                <IconSend width={15} height={15} /> Renvoyer au client
              </button>
            </>
          }
        >
          <div className="detail-stack">
            <div className="dyno-kpis">
              <div>
                <span>Puissance</span>
                <strong>
                  {dyno.chAvant} → <em>{dyno.chApres} ch</em>
                </strong>
                <small>+{dyno.chApres - dyno.chAvant} ch (+{Math.round(((dyno.chApres - dyno.chAvant) / dyno.chAvant) * 100)} %)</small>
              </div>
              <div>
                <span>Couple</span>
                <strong>
                  {dyno.nmAvant} → <em>{dyno.nmApres} Nm</em>
                </strong>
                <small>+{dyno.nmApres - dyno.nmAvant} Nm (+{Math.round(((dyno.nmApres - dyno.nmAvant) / dyno.nmAvant) * 100)} %)</small>
              </div>
            </div>
            <DynoChart mesure={dyno} />
            <div className="sms-bubble-wrap">
              <span className="ai-block-label">
                <IconMessage width={14} height={14} /> SMS envoyé au client
              </span>
              <div className="sms-bubble">
                Bonjour {dyno.client.split(' ')[0]}, merci pour votre confiance ! Votre {dyno.vehicule.split(' ').slice(1, 3).join(' ')} développe
                désormais {dyno.chApres} ch et {dyno.nmApres} Nm. Votre courbe du banc : mtk.to/c/{dyno.id.slice(-1)}8F2 · Motortech Toulon
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
