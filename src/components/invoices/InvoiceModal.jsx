import { useState } from 'react';
import Modal from '../Modal';
import Badge from '../Badge';
import InvoicePreview from './InvoicePreview';
import { useApp } from '../../hooks/AppContext';
import { useToast } from '../../hooks/ToastContext';
import clients from '../../data/clients.json';
import { formatDate, formatEuros, formatTime } from '../../utils/format';
import { IconFile, IconFolder, IconSparkles, IconDownload, IconExternal, IconCheck, IconAlert, IconArrowRight } from '../icons';

const byId = Object.fromEntries(clients.map((c) => [c.id, c]));

export default function InvoiceModal({ invoiceId, onClose }) {
  const { invoices, assignInvoice } = useApp();
  const toast = useToast();
  const invoice = invoices.find((i) => i.id === invoiceId);
  const [choice, setChoice] = useState(invoice?.suggestionClientId ?? '');
  if (!invoice) return null;

  const client = byId[invoice.clientId];
  const toCheck = invoice.statut === 'a_verifier';
  const short = invoice.commande.split('-').slice(0, 2).join('-');
  const chosen = byId[choice];
  const finalName = toCheck && chosen
    ? `${invoice.date}_${chosen.nom.normalize('NFD').replace(/[̀-ͯ]/g, '')}_${chosen.court}_${short}.pdf`
    : invoice.fichier;

  const validate = () => {
    assignInvoice(invoice.id, choice);
    toast.success(`Facture attribuée à ${chosen.prenom} ${chosen.nom} et classée dans Drive`);
  };

  return (
    <Modal
      size="xl"
      title={toCheck ? 'Facture à vérifier' : 'Facture classée'}
      subtitle={`Commande ${invoice.commande} · reçue le ${formatDate(invoice.recuLe)} à ${formatTime(invoice.recuLe)}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => toast.info(`${finalName} téléchargé`)}>
            <IconDownload width={15} height={15} /> Télécharger
          </button>
          {toCheck ? (
            <button className="btn btn-primary" disabled={!chosen} onClick={validate}>
              <IconCheck width={15} height={15} /> Valider l'attribution
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => toast.info('Ouverture du dossier dans Google Drive…')}>
              <IconExternal width={15} height={15} /> Ouvrir dans Drive
            </button>
          )}
        </>
      }
    >
      <div className="invoice-detail">
        <div className="pdf-frame">
          <InvoicePreview invoice={invoice} client={client} pending={toCheck} />
        </div>
        <div className="detail-stack">
          <div className="rename-box">
            <span className="ai-block-label">
              <IconFile width={14} height={14} /> Renommage automatique
            </span>
            <span className="rename-old">{invoice.fichierOrigine}</span>
            <IconArrowRight width={14} height={14} className="rename-arrow" />
            <span className="rename-new">{finalName}</span>
            <span className="rename-path">
              <IconFolder width={13} height={13} /> Drive / Motortech Toulon /{' '}
              {toCheck && chosen ? `Clients/${chosen.nom} – ${chosen.immat}` : invoice.dossierDrive}
            </span>
          </div>

          {toCheck && (
            <div className="verify-box">
              <span className="verify-title">
                <IconAlert width={15} height={15} /> {invoice.motif}
              </span>
              <span className="ai-block-label">
                <IconSparkles width={14} height={14} /> Suggestion de l'IA · confiance {invoice.confiance} %
              </span>
              <div className="field">
                <label htmlFor="assign">Attribuer au client</label>
                <select id="assign" value={choice} onChange={(e) => setChoice(e.target.value)}>
                  <option value="">Choisir un client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prenom} {c.nom} · {c.vehicule.modele} · {c.immat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <h3 className="detail-heading">Champs lus par l'IA</h3>
            <dl className="fields">
              <div>
                <dt>Date</dt>
                <dd>{formatDate(invoice.date)}</dd>
              </div>
              <div>
                <dt>N° de commande</dt>
                <dd className="mono">{invoice.commande}</dd>
              </div>
              <div>
                <dt>Bon de commande</dt>
                <dd className={invoice.bonDeCommande ? 'mono' : 'text-warning'}>{invoice.bonDeCommande || 'Vide'}</dd>
              </div>
              <div>
                <dt>Client · véhicule</dt>
                <dd>
                  {client
                    ? `${client.prenom} ${client.nom} · ${client.vehicule.modele}`
                    : toCheck
                      ? 'En attente de validation'
                      : 'Stock atelier'}
                </dd>
              </div>
              <div>
                <dt>Total HT</dt>
                <dd>{formatEuros(invoice.ht)}</dd>
              </div>
              <div>
                <dt>TVA 20 %</dt>
                <dd>{formatEuros(invoice.tva)}</dd>
              </div>
              <div>
                <dt>Total TTC</dt>
                <dd className="cell-primary">{formatEuros(invoice.ttc)}</dd>
              </div>
              <div>
                <dt>Statut</dt>
                <dd>
                  {toCheck ? (
                    <Badge tone="amber">À vérifier</Badge>
                  ) : (
                    <Badge tone="green">{invoice.valideManuellement ? 'Classée (validée)' : 'Classée'}</Badge>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          {!toCheck && (
            <p className="card-note">
              <IconSparkles width={14} height={14} /> Lue en 6 s · confiance {invoice.confiance} % · ligne ajoutée au registre
              « Achats 2026 » (Google Sheet).
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
