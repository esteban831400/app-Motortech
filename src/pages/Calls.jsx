import { useMemo, useState } from 'react';
import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';
import data from '../data/calls.json';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Segmented from '../components/Segmented';
import EmptyState from '../components/EmptyState';
import BarChart from '../components/charts/BarChart';
import { callContext, CALL_STATUS, BESOINS } from '../utils/calls';
import { formatDate, formatTime, formatWeekdayShort } from '../utils/format';
import { IconPhone, IconPhoneMissed, IconCalendar, IconTimer, IconBot, IconMessage, IconSparkles, IconCar, IconLeaf, IconInbox } from '../components/icons';

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'ferme', label: 'Fermeture' },
  { value: 'rdv', label: 'RDV pris' },
];

export default function Calls() {
  const { params } = useApp();
  const toast = useToast();
  const [filter, setFilter] = useState(params.statut === 'rdv' ? 'rdv' : 'all');
  const [chart, setChart] = useState('heure');
  const [open, setOpen] = useState(null);

  const calls = useMemo(
    () =>
      data.calls
        .map((c) => ({ ...c, ctx: callContext(c.at) }))
        .filter((c) => {
          if (filter === 'rdv') return c.statut === 'rdv';
          if (filter === 'ferme') return c.ctx.key !== 'ouvert';
          return true;
        }),
    [filter]
  );
  const closedCount = data.calls.filter((c) => callContext(c.at).key !== 'ouvert').length;
  const s = data.stats;

  return (
    <div>
      <PageHeader
        title="Standard"
        highlight="IA"
        after=" & appels"
        subtitle="Chaque appel est décroché, résumé et qualifié, y compris le lundi et entre 12h et 14h, quand le centre est fermé."
      />

      <div className="stat-grid stagger-children">
        <StatCard label="Appels ce mois" value={s.appelsMois} sub={`Taux de décroché : ${s.tauxDecroche}`} icon={<IconPhone width={18} height={18} />} color="var(--tone-info)" softColor="var(--tone-info-soft)" />
        <StatCard label="Appels manqués récupérés" value={s.manquesRecuperes} highlight sub="Lundi, midi et soir" icon={<IconPhoneMissed width={18} height={18} />} color="var(--tone-red)" softColor="var(--tone-red-soft)" />
        <StatCard label="RDV pris par l'IA" value={s.rdvIA} sub="Directement dans l'agenda" icon={<IconCalendar width={18} height={18} />} color="var(--tone-success)" softColor="var(--tone-success-soft)" />
        <StatCard label="Temps de décroché" value={s.tempsReponse} sub="Contre 4 sonneries en moyenne" icon={<IconTimer width={18} height={18} />} color="var(--tone-warning)" softColor="var(--tone-warning-soft)" />
      </div>

      <div className="dashboard-columns">
        <Card
          title="Quand vos clients appellent"
          subtitle="En rouge : créneaux où le centre est fermé, pris en charge par l'IA"
          action={
            <Segmented
              options={[
                { value: 'heure', label: 'Heure' },
                { value: 'jour', label: 'Jour' },
              ]}
              value={chart}
              onChange={setChart}
              label="Répartition"
            />
          }
        >
          <BarChart key={chart} data={chart === 'heure' ? data.parCreneau : data.parJour} />
        </Card>
        <Card title="Ce que l'IA a fait cette semaine" className="dashboard-side-card">
          <ul className="kv-list">
            <li>
              <span>Appels pendant la fermeture</span>
              <strong>{closedCount}</strong>
            </li>
            <li>
              <span>Dont le lundi</span>
              <strong>{data.calls.filter((c) => callContext(c.at).key === 'lundi').length}</strong>
            </li>
            <li>
              <span>Dont pause 12h–14h</span>
              <strong>{data.calls.filter((c) => callContext(c.at).key === 'midi').length}</strong>
            </li>
            <li>
              <span>SMS de rappel envoyés</span>
              <strong>{data.calls.filter((c) => c.statut === 'sms').length}</strong>
            </li>
            <li>
              <span>RDV réservés sans intervention</span>
              <strong className="text-accent">{data.calls.filter((c) => c.statut === 'rdv').length}</strong>
            </li>
          </ul>
          <p className="card-note">
            <IconBot width={14} height={14} /> Voix française, connaît vos tarifs, vos horaires et les gains par modèle.
          </p>
        </Card>
      </div>

      <div className="section-header-row">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Journal des appels
        </h2>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} label="Filtrer les appels" />
      </div>

      {calls.length === 0 ? (
        <div className="card">
          <EmptyState icon={<IconInbox width={20} height={20} />} title="Aucun appel" />
        </div>
      ) : (
        <>
          <div className="table-wrap desktop-only">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Appelant</th>
                  <th>Véhicule · besoin</th>
                  <th>Résumé IA</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((c) => (
                  <tr key={c.id} onClick={() => setOpen(c)} className={c.ctx.key !== 'ouvert' ? 'row-flag' : ''}>
                    <td>
                      <div className="cell-primary">
                        {formatWeekdayShort(c.at)} {formatTime(c.at)}
                      </div>
                      <div className="cell-muted cell-small">{formatDate(c.at)}</div>
                      {c.ctx.key !== 'ouvert' && <span className="ctx-flag">{c.ctx.label}</span>}
                    </td>
                    <td>
                      <div className="cell-primary">{c.nom ?? 'Numéro inconnu'}</div>
                      <div className="cell-muted cell-small">{c.tel}</div>
                    </td>
                    <td>
                      <div>{c.vehicule}</div>
                      <div className={`cell-small ${c.besoin === 'e85' ? 'text-e85' : 'cell-muted'}`}>
                        {c.besoin === 'e85' && <IconLeaf width={12} height={12} />} {BESOINS[c.besoin]}
                      </div>
                    </td>
                    <td className="cell-summary">{c.resume}</td>
                    <td>
                      <Badge tone={CALL_STATUS[c.statut].tone}>{CALL_STATUS[c.statut].label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="m-list mobile-only">
            {calls.map((c) => (
              <button key={c.id} className="m-card" onClick={() => setOpen(c)}>
                <div className="m-card-row">
                  <span className="m-card-title">{c.nom ?? 'Numéro inconnu'}</span>
                  <span className="m-card-time">
                    {formatWeekdayShort(c.at)} {formatTime(c.at)}
                  </span>
                </div>
                <div className="m-card-sub">
                  {c.vehicule} · <span className={c.besoin === 'e85' ? 'text-e85' : ''}>{BESOINS[c.besoin]}</span>
                </div>
                <p className="m-card-text">{c.resume}</p>
                <div className="m-card-row">
                  <Badge tone={CALL_STATUS[c.statut].tone}>{CALL_STATUS[c.statut].label}</Badge>
                  {c.ctx.key !== 'ouvert' && <span className="ctx-flag">{c.ctx.label}</span>}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {open && (
        <Modal
          title={open.nom ?? 'Numéro inconnu'}
          subtitle={`${formatDate(open.at)} à ${formatTime(open.at)} · ${open.ctx.label} · ${open.duree}`}
          onClose={() => setOpen(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setOpen(null)}>
                Fermer
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  toast.success(`Rappel de ${open.nom ?? open.tel} ajouté à vos tâches`);
                  setOpen(null);
                }}
              >
                <IconPhone width={15} height={15} /> Rappeler
              </button>
            </>
          }
        >
          <div className="detail-stack">
            <div className="detail-badges">
              <Badge tone={CALL_STATUS[open.statut].tone}>{CALL_STATUS[open.statut].label}</Badge>
              <span className="chip chip-static">
                <IconCar width={13} height={13} /> {open.vehicule}
              </span>
              <span className={`chip chip-static ${open.besoin === 'e85' ? 'chip-e85' : ''}`}>{BESOINS[open.besoin]}</span>
            </div>
            <div className="ai-block">
              <span className="ai-block-label">
                <IconSparkles width={14} height={14} /> Résumé IA
              </span>
              <p>{open.resume}</p>
            </div>
            {open.sms && (
              <div className="sms-bubble-wrap">
                <span className="ai-block-label">
                  <IconMessage width={14} height={14} /> SMS envoyé automatiquement
                </span>
                <div className="sms-bubble">{open.sms}</div>
              </div>
            )}
            {open.rdv && (
              <div className="info-row">
                <IconCalendar width={16} height={16} />
                <span>
                  RDV réservé le <strong>{formatDate(open.rdv)}</strong> à <strong>{formatTime(open.rdv)}</strong>, confirmation SMS
                  envoyée.
                </span>
              </div>
            )}
            <div className="info-row cell-muted">
              <IconPhone width={16} height={16} /> {open.tel}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
