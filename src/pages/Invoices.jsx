import { useMemo, useState } from 'react';
import { useApp } from '../hooks/AppContext';
import { useToast } from '../hooks/ToastContext';
import clients from '../data/clients.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Segmented from '../components/Segmented';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import FlowDiagram from '../components/invoices/FlowDiagram';
import InvoiceModal from '../components/invoices/InvoiceModal';
import ExportModal from '../components/invoices/ExportModal';
import { formatDate, formatDateShort, formatDuration, formatEuros, formatEurosRound, formatMonth, formatNumber } from '../utils/format';
import { IconArchive, IconTimer, IconSearch, IconFolder, IconAlert, IconCar, IconReceipt, IconDownload, IconExternal, IconEuro, IconSparkles, IconPackage } from '../components/icons';

const byId = Object.fromEntries(clients.map((c) => [c.id, c]));
const CURRENT_MONTH = '2026-11';
const PAGE_SIZE = 20;
const MINUTES_PER_INVOICE = 4.3; // téléchargement + renommage + classement + saisie dans le registre

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s-]/g, '');

function ClientCell({ invoice }) {
  const c = byId[invoice.clientId];
  if (invoice.statut === 'a_verifier') {
    return (
      <span className="client-cell">
        <span className="cell-muted">Non attribuée</span>
        <span className="cell-small text-warning">Bon de cde : {invoice.bonDeCommande || 'vide'}</span>
      </span>
    );
  }
  if (!c) return <span className="cell-muted">Stock atelier</span>;
  return (
    <span className="client-cell">
      <span className="cell-primary">
        {c.prenom[0]}. {c.nom} · {c.vehicule.modele}
      </span>
      <span className="plate plate-sm">{c.immat}</span>
    </span>
  );
}

function StatusBadge({ invoice }) {
  return invoice.statut === 'a_verifier' ? <Badge tone="amber">À vérifier</Badge> : <Badge tone="green">Classée</Badge>;
}

const articlesLabel = (inv) =>
  inv.articles.length > 1 ? `${inv.articles[0].designation} +${inv.articles.length - 1}` : inv.articles[0].designation;

export default function Invoices() {
  const { params, invoices } = useApp();
  const toast = useToast();
  const [view, setView] = useState(params.view ?? 'list');
  const [query, setQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [statut, setStatut] = useState(params.statut ?? 'all');
  const [openInvoice, setOpenInvoice] = useState(params.openInvoiceId ?? null);
  const [openFolder, setOpenFolder] = useState(params.clientId ?? null);
  const [exportOpen, setExportOpen] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const months = useMemo(() => [...new Set(invoices.map((i) => i.date.slice(0, 7)))].sort().reverse(), [invoices]);
  const monthInvoices = invoices.filter((i) => i.date.startsWith(CURRENT_MONTH));
  const toCheck = monthInvoices.filter((i) => i.statut === 'a_verifier').length;
  const monthTotals = monthInvoices.reduce((s, i) => ({ ttc: s.ttc + i.ttc, tva: s.tva + i.tva }), { ttc: 0, tva: 0 });
  const autoRate = Math.round(((monthInvoices.length - toCheck) / monthInvoices.length) * 100);
  const minutesSaved = Math.round((monthInvoices.length * MINUTES_PER_INVOICE) / 30) * 30;

  const filtered = useMemo(() => {
    const q = norm(query);
    return invoices.filter((i) => {
      if (month !== 'all' && !i.date.startsWith(month)) return false;
      if (statut !== 'all' && i.statut !== statut) return false;
      if (clientFilter === 'stock' && (i.clientId || i.statut === 'a_verifier')) return false;
      if (clientFilter !== 'all' && clientFilter !== 'stock' && i.clientId !== clientFilter) return false;
      if (!q) return true;
      const c = byId[i.clientId];
      return norm(`${i.commande} ${i.bonDeCommande} ${i.fichier} ${c ? `${c.prenom} ${c.nom} ${c.immat} ${c.vehicule.modele}` : ''}`).includes(q);
    });
  }, [invoices, query, month, statut, clientFilter]);
  const filteredTotal = filtered.reduce((s, i) => s + i.ttc, 0);

  const folders = useMemo(() => {
    const map = {};
    for (const i of invoices) {
      if (!i.clientId) continue;
      (map[i.clientId] ??= []).push(i);
    }
    const q = norm(query);
    return Object.entries(map)
      .map(([id, list]) => ({ client: byId[id], list, total: list.reduce((s, i) => s + i.ttc, 0), last: list[0].date }))
      .filter((f) => !q || norm(`${f.client.prenom} ${f.client.nom} ${f.client.immat} ${f.client.vehicule.modele}`).includes(q))
      .sort((a, b) => b.last.localeCompare(a.last));
  }, [invoices, query]);

  const folder = openFolder ? folders.find((f) => f.client.id === openFolder) ?? null : null;

  return (
    <div className="invoices-page">
      <PageHeader
        title="Factures"
        highlight="Amazon Business"
        subtitle="Chaque facture est récupérée, lue par l'IA, rattachée au bon client grâce au n° de bon de commande, puis classée dans Drive. Vous ne touchez plus à rien."
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => toast.info('Ouverture de Google Drive · Motortech Toulon / Factures')}>
              <IconExternal width={15} height={15} /> Drive
            </button>
            <button className="btn btn-primary" onClick={() => setExportOpen(true)}>
              <IconArchive width={15} height={15} /> Export comptable du mois
            </button>
          </>
        }
      />

      <div className="dashboard-hero-row">
        <div className="hero-card mt-hero">
          <div className="hero-card-main" role="group">
            <span className="hero-card-label">
              <IconTimer width={16} height={16} /> Temps gagné ce mois-ci
            </span>
            <span className="hero-card-value mt-hero-value">{formatDuration(minutesSaved)}</span>
            <span className="hero-card-sub">
              {monthInvoices.length} factures traitées automatiquement depuis le 1er novembre · 0 saisie manuelle
            </span>
          </div>
          <div className="hero-card-stats">
            <div className="hero-card-stat hero-card-stat-static">
              <span className="hero-card-stat-value">{monthInvoices.length}</span>
              <span className="hero-card-stat-label">Factures lues</span>
            </div>
            <div className="hero-card-stat hero-card-stat-static">
              <span className="hero-card-stat-value">{autoRate} %</span>
              <span className="hero-card-stat-label">Attribuées seules</span>
            </div>
            <button className="hero-card-stat" onClick={() => setStatut('a_verifier')}>
              <span className="hero-card-stat-value">{toCheck}</span>
              <span className="hero-card-stat-label">À vérifier</span>
            </button>
          </div>
        </div>
        <div className="stat-grid dashboard-stat-grid">
          <StatCard label="Achats du mois (TTC)" value={Math.round(monthTotals.ttc)} format={formatEurosRound} sub="Pièces et consommables" icon={<IconEuro width={18} height={18} />} color="var(--tone-info)" softColor="var(--tone-info-soft)" />
          <StatCard label="TVA déductible" value={Math.round(monthTotals.tva)} format={formatEurosRound} sub="Prête pour la déclaration" icon={<IconReceipt width={18} height={18} />} color="var(--tone-success)" softColor="var(--tone-success-soft)" />
          <StatCard label="Dossiers clients" value={folders.length} sub="Toutes les pièces par véhicule" icon={<IconFolder width={18} height={18} />} color="var(--tone-violet)" softColor="var(--tone-violet-soft)" onClick={() => setView('dossiers')} />
          <StatCard label="Lecture IA moyenne" value="6 s" sub="Par facture, montants vérifiés" icon={<IconSparkles width={18} height={18} />} color="var(--tone-red)" softColor="var(--tone-red-soft)" />
        </div>
      </div>

      <Card title="Le flux, de la commande au comptable" subtitle="Workflow n8n · déclenché à chaque e-mail de facture Amazon Business" className="flow-card">
        <FlowDiagram stats={[`${monthInvoices.length} cdes`, '≈ 2 min', 'confiance 97 %', `${autoRate} % auto`, `${folders.length} dossiers`, '1er déc.']} />
      </Card>

      {toCheck > 0 && statut !== 'a_verifier' && (
        <button className="alert-row" onClick={() => setStatut('a_verifier')}>
          <IconAlert width={16} height={16} />
          <span>
            <strong>
              {toCheck} facture{toCheck > 1 ? 's' : ''} à vérifier
            </strong>{' '}
            · bon de commande vide ou immatriculation inconnue. L'IA propose déjà le bon client.
          </span>
          <span className="alert-row-cta">Vérifier</span>
        </button>
      )}

      <div className="section-header-row invoices-toolbar-head">
        <Segmented
          options={[
            { value: 'list', label: 'Factures' },
            { value: 'dossiers', label: 'Dossiers clients' },
          ]}
          value={view}
          onChange={setView}
          label="Vue"
        />
        {view === 'list' && (
          <span className="cell-muted results-count">
            {formatNumber(filtered.length)} facture{filtered.length > 1 ? 's' : ''} · {formatEuros(filteredTotal)} TTC
          </span>
        )}
      </div>

      <div className="toolbar">
        <div className="search-field">
          <IconSearch width={16} height={16} />
          <input
            className="search-input"
            placeholder={view === 'list' ? 'Immatriculation, client, n° de commande…' : 'Rechercher un client ou une immatriculation…'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            aria-label="Rechercher"
          />
        </div>
        {view === 'list' && (
          <>
            <select className="select-filter" value={clientFilter} onChange={(e) => {
              setClientFilter(e.target.value);
              setLimit(PAGE_SIZE);
            }} aria-label="Client">
              <option value="all">Tous les clients</option>
              <option value="stock">Stock atelier</option>
              {[...clients]
                .sort((a, b) => a.nom.localeCompare(b.nom))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} {c.prenom} · {c.vehicule.modele}
                  </option>
                ))}
            </select>
            <select className="select-filter" value={month} onChange={(e) => {
              setMonth(e.target.value);
              setLimit(PAGE_SIZE);
            }} aria-label="Mois">
              <option value="all">Tous les mois</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(`${m}-01`)}
                </option>
              ))}
            </select>
            <select className="select-filter" value={statut} onChange={(e) => {
              setStatut(e.target.value);
              setLimit(PAGE_SIZE);
            }} aria-label="Statut">
              <option value="all">Tous les statuts</option>
              <option value="classee">Classées</option>
              <option value="a_verifier">À vérifier</option>
            </select>
          </>
        )}
      </div>

      {view === 'list' ? (
        filtered.length === 0 ? (
          <div className="card">
            <EmptyState icon={<IconSearch width={20} height={20} />} title="Aucune facture" description="Essayez une autre immatriculation ou retirez un filtre." />
          </div>
        ) : (
          <>
            <div className="table-wrap desktop-only">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>N° de commande</th>
                    <th>Articles</th>
                    <th className="num">HT</th>
                    <th className="num">TVA</th>
                    <th className="num">TTC</th>
                    <th>Client · véhicule</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, limit).map((i) => (
                    <tr key={i.id} onClick={() => setOpenInvoice(i.id)} className={i.statut === 'a_verifier' ? 'row-warning' : ''}>
                      <td className="nowrap">{formatDate(i.date)}</td>
                      <td className="mono cell-small">{i.commande}</td>
                      <td className="cell-articles">
                        <span>{articlesLabel(i)}</span>
                      </td>
                      <td className="num cell-muted">{formatEuros(i.ht)}</td>
                      <td className="num cell-muted">{formatEuros(i.tva)}</td>
                      <td className="num cell-primary">{formatEuros(i.ttc)}</td>
                      <td>
                        <ClientCell invoice={i} />
                      </td>
                      <td>
                        <StatusBadge invoice={i} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="m-list mobile-only">
              {filtered.slice(0, limit).map((i) => (
                <button key={i.id} className={`m-card ${i.statut === 'a_verifier' ? 'm-card-warning' : ''}`} onClick={() => setOpenInvoice(i.id)}>
                  <div className="m-card-row">
                    <span className="m-card-title">{formatDate(i.date)}</span>
                    <span className="m-card-amount">{formatEuros(i.ttc)}</span>
                  </div>
                  <div className="m-card-sub">{articlesLabel(i)}</div>
                  <div className="m-card-row">
                    <ClientCell invoice={i} />
                    <StatusBadge invoice={i} />
                  </div>
                  <div className="m-card-file mono">{i.fichier}</div>
                </button>
              ))}
            </div>
            {filtered.length > limit && (
              <button className="btn btn-secondary load-more" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                Afficher {Math.min(PAGE_SIZE, filtered.length - limit)} factures de plus · {filtered.length - limit} restantes
              </button>
            )}
          </>
        )
      ) : folders.length === 0 ? (
        <div className="card">
          <EmptyState icon={<IconFolder width={20} height={20} />} title="Aucun dossier" />
        </div>
      ) : (
        <div className="folder-grid stagger-children">
          {folders.map((f) => (
            <button key={f.client.id} className="card folder-card lift-hover" onClick={() => setOpenFolder(f.client.id)}>
              <div className="folder-top">
                <span className="folder-icon">
                  <IconFolder width={18} height={18} />
                </span>
                <span className="plate plate-sm">{f.client.immat}</span>
              </div>
              <span className="folder-name">
                {f.client.prenom} {f.client.nom}
              </span>
              <span className="folder-sub">
                {f.client.vehicule.marque} {f.client.vehicule.modele}
              </span>
              <div className="folder-stats">
                <span>
                  <strong>{f.list.length}</strong> facture{f.list.length > 1 ? 's' : ''}
                </span>
                <span>
                  <strong>{formatEuros(f.total)}</strong>
                </span>
              </div>
              <span className="folder-last">Dernière : {formatDateShort(f.last)}</span>
            </button>
          ))}
        </div>
      )}

      {openInvoice && <InvoiceModal invoiceId={openInvoice} onClose={() => setOpenInvoice(null)} />}

      {folder && !openInvoice && (
        <Modal
          size="lg"
          title={`Dossier ${folder.client.prenom} ${folder.client.nom}`}
          subtitle={`${folder.client.vehicule.marque} ${folder.client.vehicule.modele} · ${folder.client.vehicule.moteur} · ${folder.client.immat}`}
          onClose={() => setOpenFolder(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => toast.info('Ouverture du dossier dans Google Drive…')}>
                <IconExternal width={15} height={15} /> Drive
              </button>
              <button
                className="btn btn-primary"
                onClick={() => toast.success(`Dossier_${folder.client.nom}_${folder.client.immat}.zip téléchargé (${folder.list.length} PDF)`)}
              >
                <IconDownload width={15} height={15} /> Télécharger le dossier
              </button>
            </>
          }
        >
          <div className="detail-stack">
            <div className="export-totals">
              <div>
                <span>Factures</span>
                <strong>{folder.list.length}</strong>
              </div>
              <div>
                <span>Total HT</span>
                <strong>{formatEuros(folder.list.reduce((s, i) => s + i.ht, 0))}</strong>
              </div>
              <div>
                <span>Total TTC</span>
                <strong>{formatEuros(folder.total)}</strong>
              </div>
            </div>
            <p className="rename-path">
              <IconFolder width={13} height={13} /> Drive / Motortech Toulon / Clients / {folder.client.nom} – {folder.client.immat}
            </p>
            <ul className="file-list">
              {folder.list.map((i) => (
                <li key={i.id}>
                  <button className="file-row" onClick={() => setOpenInvoice(i.id)}>
                    <span className="file-icon">
                      <IconPackage width={15} height={15} />
                    </span>
                    <span className="file-main">
                      <span className="mono file-name">{i.fichier}</span>
                      <span className="cell-muted cell-small">{articlesLabel(i)}</span>
                    </span>
                    <span className="file-amount">{formatEuros(i.ttc)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="card-note">
              <IconCar width={14} height={14} /> {formatNumber(folder.client.vehicule.km)} km au dernier passage · {folder.client.ville} · {folder.client.tel}
            </p>
          </div>
        </Modal>
      )}

      {exportOpen && (
        <ExportModal invoices={invoices} months={months} defaultMonth={CURRENT_MONTH} clientsById={byId} onClose={() => setExportOpen(false)} />
      )}
    </div>
  );
}
