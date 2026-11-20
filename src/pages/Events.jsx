import { useState } from 'react';
import { useToast } from '../hooks/ToastContext';
import data from '../data/events.json';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { formatDate, formatEuros, formatEurosRound, formatWeekday, parseDate } from '../utils/format';
import { IconFlag, IconUsersGroup, IconBell, IconMapPin, IconClock, IconCheck, IconMessage, IconMail, IconLeaf, IconGauge, IconCar, IconPlus } from '../components/icons';

const TYPE_ICON = { banc: IconGauge, e85: IconLeaf, circuit: IconFlag, rassemblement: IconCar };

function Capacity({ ev }) {
  const n = ev.inscrits.length;
  const ratio = Math.min(1, n / ev.capacite);
  const full = n >= ev.capacite;
  return (
    <div className="capacity">
      <div className="capacity-head">
        <span>
          <strong>{n}</strong> / {ev.capacite} inscrits
        </span>
        {full ? <Badge tone="red">Complet</Badge> : <span className="cell-muted cell-small">{ev.capacite - n} places</span>}
      </div>
      <div className="capacity-track">
        <span className={`capacity-fill ${full ? 'capacity-fill-full' : ''} ${ev.type === 'e85' ? 'capacity-fill-e85' : ''}`} style={{ '--bar-ratio': ratio }} />
      </div>
      {ev.attente.length > 0 && <span className="cell-small text-warning">{ev.attente.length} en liste d'attente</span>}
    </div>
  );
}

export default function Events() {
  const toast = useToast();
  const [open, setOpen] = useState(null);
  const totalInscrits = data.events.reduce((s, e) => s + e.inscrits.length, 0);
  const totalAttente = data.events.reduce((s, e) => s + e.attente.length, 0);
  const rappels = data.events.reduce((s, e) => s + e.rappels.filter((r) => r.statut === 'planifie').reduce((a, r) => a + r.n, 0), 0);

  return (
    <div>
      <PageHeader
        title="Événements &"
        highlight="sessions groupées"
        subtitle="Inscriptions, liste d'attente et rappels automatiques : journées banc, soirées E85, track days."
        actions={
          <button className="btn btn-primary" onClick={() => toast.success('Brouillon d’événement créé · page d’inscription prête à publier')}>
            <IconPlus width={15} height={15} /> Nouvel événement
          </button>
        }
      />

      <div className="stat-grid stagger-children">
        <StatCard label="Événements à venir" value={data.events.length} sub="D'ici au 20 déc." icon={<IconFlag width={18} height={18} />} color="var(--tone-red)" softColor="var(--tone-red-soft)" />
        <StatCard label="Inscrits" value={totalInscrits} sub="Tous événements confondus" icon={<IconUsersGroup width={18} height={18} />} color="var(--tone-info)" softColor="var(--tone-info-soft)" />
        <StatCard label="Liste d'attente" value={totalAttente} sub="Prévenus dès qu'une place se libère" icon={<IconClock width={18} height={18} />} color="var(--tone-warning)" softColor="var(--tone-warning-soft)" />
        <StatCard label="Rappels programmés" value={rappels} sub="SMS et e-mails" icon={<IconBell width={18} height={18} />} color="var(--tone-success)" softColor="var(--tone-success-soft)" />
      </div>

      <div className="event-grid stagger-children">
        {data.events.map((ev) => {
          const Icon = TYPE_ICON[ev.type] ?? IconFlag;
          const d = parseDate(ev.date);
          return (
            <button key={ev.id} className="card event-card lift-hover" onClick={() => setOpen(ev)}>
              <div className="event-date">
                <span className="event-day">{d.getDate()}</span>
                <span className="event-month">{formatDate(ev.date).split(' ')[1]}</span>
              </div>
              <div className="event-body">
                <div className="m-card-row">
                  <span className="event-title">{ev.titre}</span>
                  <span className={`event-type-icon ${ev.type === 'e85' ? 'text-e85' : ''}`}>
                    <Icon width={16} height={16} />
                  </span>
                </div>
                <span className="event-meta">
                  <IconClock width={12} height={12} /> {formatWeekday(ev.date)} · {ev.horaire}
                </span>
                <span className="event-meta">
                  <IconMapPin width={12} height={12} /> {ev.lieu}
                </span>
                <Capacity ev={ev} />
                <span className="event-price">{ev.prix ? `${formatEuros(ev.prix)} / participant` : 'Gratuit sur inscription'}</span>
              </div>
            </button>
          );
        })}
      </div>

      <Card title="Événements passés" subtitle="Ce qu'ils ont rapporté" className="section-gap">
        <div className="table-wrap table-plain">
          <table className="data-table data-table-compact">
            <thead>
              <tr>
                <th>Événement</th>
                <th>Date</th>
                <th className="num">Présents</th>
                <th className="num">CA généré</th>
                <th className="num">Avis Google</th>
              </tr>
            </thead>
            <tbody>
              {data.passes.map((p) => (
                <tr key={p.titre} className="row-static">
                  <td className="cell-primary">{p.titre}</td>
                  <td>{formatDate(p.date)}</td>
                  <td className="num">
                    {p.presents} / {p.inscrits}
                  </td>
                  <td className="num cell-primary">{formatEurosRound(p.ca)}</td>
                  <td className="num">+{p.avis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <Modal
          size="lg"
          title={open.titre}
          subtitle={`${formatWeekday(open.date)} ${formatDate(open.date)} · ${open.horaire} · ${open.lieu}`}
          onClose={() => setOpen(null)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => toast.success(`Message envoyé aux ${open.inscrits.length} inscrits`)}
              >
                <IconMessage width={15} height={15} /> Écrire aux inscrits
              </button>
              {open.attente.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    toast.success(`2e session ouverte · ${open.attente.length} personnes de la liste d'attente invitées`);
                    setOpen(null);
                  }}
                >
                  <IconPlus width={15} height={15} /> Ouvrir une 2e session
                </button>
              )}
            </>
          }
        >
          <div className="detail-stack">
            <p className="cell-muted">{open.description}</p>
            <Capacity ev={open} />
            <div>
              <h3 className="detail-heading">Rappels automatiques</h3>
              <ol className="mini-timeline">
                {open.rappels.map((r) => (
                  <li key={r.label} className={r.statut === 'planifie' ? 'mini-timeline-planned' : ''}>
                    <span className="mini-timeline-dot">{r.statut === 'fait' && <IconCheck width={11} height={11} />}</span>
                    <div>
                      <span className="mini-timeline-text">
                        {r.label} · {r.canal === 'SMS' ? <IconMessage width={12} height={12} /> : <IconMail width={12} height={12} />} {r.canal}
                      </span>
                      <span className="mini-timeline-date">
                        {r.quand} · {r.n} destinataires · {r.statut === 'fait' ? 'envoyé' : 'programmé'}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {open.inscrits[0].vehicule && (
              <div>
                <h3 className="detail-heading">Inscrits ({open.inscrits.length})</h3>
                <ul className="people-grid">
                  {open.inscrits.map((p) => (
                    <li key={p.nom}>
                      <strong>{p.nom}</strong>
                      <span>{p.vehicule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {open.attente.length > 0 && (
              <div>
                <h3 className="detail-heading">Liste d'attente ({open.attente.length})</h3>
                <ul className="people-grid people-grid-wait">
                  {open.attente.map((p, i) => (
                    <li key={p.nom}>
                      <strong>
                        {i + 1}. {p.nom}
                      </strong>
                      <span>{p.vehicule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
