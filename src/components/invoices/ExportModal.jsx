import { useMemo, useState } from 'react';
import Modal from '../Modal';
import { useToast } from '../../hooks/ToastContext';
import { formatEuros, formatMonth } from '../../utils/format';
import { IconArchive, IconSheet, IconSend, IconDownload, IconFile } from '../icons';

// Export comptable : ZIP des PDF renommés + CSV prêt à importer.
export default function ExportModal({ invoices, months, defaultMonth, clientsById, onClose }) {
  const toast = useToast();
  const [month, setMonth] = useState(defaultMonth);
  const list = useMemo(() => invoices.filter((i) => i.date.startsWith(month)), [invoices, month]);
  const totals = list.reduce((s, i) => ({ ht: s.ht + i.ht, tva: s.tva + i.tva, ttc: s.ttc + i.ttc }), { ht: 0, tva: 0, ttc: 0 });
  const pending = list.filter((i) => i.statut === 'a_verifier').length;
  const label = formatMonth(`${month}-01`);
  const zipName = `Motortech-Toulon_Achats-Amazon_${month}.zip`;

  return (
    <Modal
      size="lg"
      title="Export comptable du mois"
      subtitle="PDF renommés + registre CSV, au format attendu par votre cabinet"
      onClose={onClose}
      footer={
        <>
          <button
            className="btn btn-secondary"
            onClick={() => {
              toast.success(`${zipName} et le CSV ont été téléchargés`);
              onClose();
            }}
          >
            <IconDownload width={15} height={15} /> Télécharger
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              toast.success(`Export ${label} envoyé au cabinet comptable (${list.length} factures)`);
              onClose();
            }}
          >
            <IconSend width={15} height={15} /> Envoyer au comptable
          </button>
        </>
      }
    >
      <div className="detail-stack">
        <div className="field">
          <label htmlFor="export-month">Mois</label>
          <select id="export-month" value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(`${m}-01`)}
              </option>
            ))}
          </select>
        </div>

        <div className="export-files">
          <div className="export-file">
            <span className="export-file-icon">
              <IconArchive width={18} height={18} />
            </span>
            <div>
              <strong>{zipName}</strong>
              <span>
                {list.length} PDF · {(list.length * 0.084).toFixed(1).replace('.', ',')} Mo
              </span>
            </div>
          </div>
          <div className="export-file">
            <span className="export-file-icon export-file-icon-green">
              <IconSheet width={18} height={18} />
            </span>
            <div>
              <strong>Registre-achats_{month}.csv</strong>
              <span>Date ; commande ; client ; immat ; HT ; TVA ; TTC ; fichier</span>
            </div>
          </div>
        </div>

        <div className="export-totals">
          <div>
            <span>Total HT</span>
            <strong>{formatEuros(totals.ht)}</strong>
          </div>
          <div>
            <span>TVA déductible</span>
            <strong>{formatEuros(totals.tva)}</strong>
          </div>
          <div>
            <span>Total TTC</span>
            <strong>{formatEuros(totals.ttc)}</strong>
          </div>
        </div>

        {pending > 0 && (
          <p className="form-hint form-hint-warning">
            {pending} facture{pending > 1 ? 's' : ''} encore à vérifier : elle{pending > 1 ? 's seront placées' : ' sera placée'} dans un
            sous-dossier « À vérifier » du ZIP.
          </p>
        )}

        <div>
          <h3 className="detail-heading">Aperçu du ZIP</h3>
          <ul className="zip-list">
            {list.slice(0, 6).map((i) => (
              <li key={i.id}>
                <IconFile width={13} height={13} /> <span className="mono">{i.fichier}</span>
                <span className="zip-client">{clientsById[i.clientId] ? clientsById[i.clientId].immat : ''}</span>
              </li>
            ))}
            {list.length > 6 && <li className="cell-muted">… et {list.length - 6} autres fichiers</li>}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
