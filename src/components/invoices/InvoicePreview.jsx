import { formatDate, formatEuros } from '../../utils/format';

// Aperçu fidèle d'une facture Amazon Business (mise en page générique,
// sans logo), tel que l'IA la lit avant de la renommer.
export default function InvoicePreview({ invoice, client, pending = false }) {
  return (
    <div className="pdf-paper" aria-label="Aperçu de la facture PDF">
      <div className="pdf-head">
        <div>
          <div className="pdf-brand">amazon business</div>
          <div className="pdf-muted">{invoice.vendeur}</div>
          <div className="pdf-muted">38 avenue J.F. Kennedy, L-1855 Luxembourg</div>
        </div>
        <div className="pdf-right">
          <div className="pdf-title">Facture</div>
          <div className="pdf-muted">N° FR{invoice.commande.replace(/-/g, '').slice(3, 13)}</div>
          <div className="pdf-muted">Date : {formatDate(invoice.date)}</div>
        </div>
      </div>
      <div className="pdf-grid">
        <div>
          <div className="pdf-label">Facturé à</div>
          <div>MOTORTECH TOULON</div>
          <div className="pdf-muted">La Garde (83130)</div>
        </div>
        <div>
          <div className="pdf-label">Commande</div>
          <div className="pdf-mark pdf-mark-order">{invoice.commande}</div>
          <div className="pdf-label" style={{ marginTop: 6 }}>
            N° de bon de commande
          </div>
          <div className={`pdf-mark ${invoice.bonDeCommande ? 'pdf-mark-po' : 'pdf-mark-missing'}`}>
            {invoice.bonDeCommande || '— non renseigné —'}
          </div>
        </div>
      </div>
      <table className="pdf-table">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Qté</th>
            <th>PU TTC</th>
            <th>Total TTC</th>
          </tr>
        </thead>
        <tbody>
          {invoice.articles.map((a) => (
            <tr key={a.ref}>
              <td>
                {a.designation}
                <div className="pdf-muted">Réf. {a.ref}</div>
              </td>
              <td>{a.qte}</td>
              <td>{formatEuros(a.puTtc)}</td>
              <td>{formatEuros(a.qte * a.puTtc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pdf-totals">
        <div>
          <span>Total HT</span>
          <span className="pdf-mark">{formatEuros(invoice.ht)}</span>
        </div>
        <div>
          <span>TVA 20 %</span>
          <span className="pdf-mark">{formatEuros(invoice.tva)}</span>
        </div>
        <div className="pdf-total">
          <span>Total TTC</span>
          <span className="pdf-mark">{formatEuros(invoice.ttc)}</span>
        </div>
      </div>
      <div className="pdf-foot">
        {client
          ? `Véhicule : ${client.vehicule.marque} ${client.vehicule.modele} · ${client.immat}`
          : pending
            ? 'Véhicule : non identifié'
            : 'Usage : stock atelier'} · TVA intracom.
        LU20260743
      </div>
    </div>
  );
}
