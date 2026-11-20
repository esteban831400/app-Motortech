// Génère src/data/invoices.json : factures Amazon Business fictives mais réalistes
// (sept. → 19 nov. 2026). Déterministe : relancer le script redonne les mêmes données.
//   node scripts/generate-invoices.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const clients = JSON.parse(readFileSync(new URL('../src/data/clients.json', import.meta.url)));

let seed = 831400;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));

const CATALOG = {
  stage1: [
    ['Bougies NGK Iridium IX (lot de 4)', 'NGK-BKR7EIX', 47.9],
    ['Filtre à air sport K&N 33-3005', 'KN-33-3005', 69.9],
    ['Huile Motul 8100 X-cess 5W40 – 5 L', 'MOT-104256', 54.9],
    ['Filtre à huile MANN HU 7020 z', 'MANN-HU7020Z', 13.49],
    ['Bobine d\'allumage Bosch 0 986 221 023', 'BSH-0986221023', 38.5],
  ],
  stage2: [
    ['Kit admission directe Forge Motorsport', 'FMINDK-EA888', 289.0],
    ['Durite turbo silicone Samco', 'SAM-TCS442', 164.0],
    ['Bougies NGK Iridium indice 8 (lot de 4)', 'NGK-BKR8EIX', 52.9],
    ['Capteur de pression de suralimentation Bosch', 'BSH-0281006059', 79.9],
    ['Collier inox T-bolt 63 mm (lot de 4)', 'TBT-63', 21.9],
  ],
  e85: [
    ['Capteur d\'éthanol Continental Flex Fuel', 'CNT-13577429', 129.0],
    ['Filtre à essence Mahle KL 583', 'MAH-KL583', 32.9],
    ['Pompe à essence Walbro 255 l/h', 'WAL-F90000267', 149.0],
    ['Injecteurs Bosch EV14 550 cc (lot de 4)', 'BSH-EV14-550', 319.0],
    ['Faisceau adaptateur capteur éthanol', 'FFX-HARN-01', 44.9],
  ],
  fap: [
    ['Nettoyant FAP Bardahl – 1 L', 'BAR-1063', 27.9],
    ['Capteur pression différentielle FAP Bosch', 'BSH-0281006082', 64.9],
    ['Additif FAP Eolys PowerFlex – 1 L', 'EOL-9736', 49.9],
    ['Joint de bride FAP (lot de 2)', 'ELR-FAP-G2', 16.9],
    ['Sonde de température gaz d\'échappement', 'NGK-93245', 58.0],
  ],
  meca: [
    ['Plaquettes Ferodo DS2500 avant', 'FER-FCP4664H', 134.0],
    ['Disques Brembo Max ventilés (paire)', 'BRE-09.A820.75', 189.0],
    ['Liquide de frein Motul RBF 600 – 500 ml', 'MOT-100949', 21.9],
    ['Kit distribution Gates + pompe à eau', 'GAT-KP15580XS', 167.0],
    ['Filtre à gazole Bosch F 026 402 062', 'BSH-F026402062', 24.9],
  ],
};
CATALOG.stage3 = CATALOG.stage2;
CATALOG.pieces = CATALOG.stage2;

const STOCK = [
  ['Gants nitrile noirs taille L (boîte de 100)', 'NIT-L100', 12.9],
  ['Nettoyant frein Würth – 500 ml (lot de 12)', 'WUR-089010', 59.9],
  ['Bobine papier d\'atelier 2 plis', 'PAP-1000', 34.5],
  ['Câble OBD2 rallonge 1,5 m', 'OBD-EXT15', 14.99],
  ['Booster de démarrage NOCO GB70', 'NOCO-GB70', 249.0],
  ['Housses de siège jetables (rouleau de 500)', 'HSJ-500', 39.9],
  ['Dégraissant moteur – 5 L', 'DGM-5L', 26.9],
  ['Papier thermique imprimante banc (lot de 10)', 'THM-57', 18.5],
];

const SELLERS = ['Amazon EU S.à r.l.', 'Amazon EU S.à r.l.', 'Racing Parts Europe', 'Atelier Pro Distribution', 'Amazon EU S.à r.l.'];

const pad = (n) => String(n).padStart(2, '0');
const orderNo = () => `403-${int(1000000, 9999999)}-${int(1000000, 9999999)}`;
const round2 = (n) => Math.round(n * 100) / 100;

function buildInvoice({ date, client, order, status = 'classee', reason = null, suggestion = null, po }) {
  const pool = client ? CATALOG[client.prestation] : STOCK;
  const n = int(1, 3);
  const items = [];
  const used = new Set();
  while (items.length < n) {
    const it = pick(pool);
    if (used.has(it[1])) continue;
    used.add(it[1]);
    items.push({ designation: it[0], ref: it[1], qte: it[2] < 30 && rnd() > 0.5 ? 2 : 1, puTtc: it[2] });
  }
  const ttc = round2(items.reduce((s, i) => s + i.qte * i.puTtc, 0));
  const ht = round2(ttc / 1.2);
  const tva = round2(ttc - ht);
  const commande = order ?? orderNo();
  const short = commande.split('-').slice(0, 2).join('-');
  const label = client ? `${client.nom.normalize('NFD').replace(/[̀-ͯ]/g, '')}_${client.court}` : 'StockAtelier';
  const [y, m] = date.split('-');
  return {
    id: `inv-${commande}`,
    date,
    recuLe: `${date}T${pad(date === '2026-11-19' ? int(7, 15) : int(7, 21))}:${pad(int(0, 59))}`,
    commande,
    vendeur: pick(SELLERS),
    articles: items,
    ht,
    tva,
    ttc,
    clientId: status === 'a_verifier' ? null : client?.id ?? null,
    bonDeCommande: po !== undefined ? po : client ? `${client.immat} ${client.nom.toUpperCase()}` : 'STOCK ATELIER',
    statut: status,
    motif: reason,
    suggestionClientId: suggestion,
    confiance: status === 'a_verifier' ? int(48, 71) : int(94, 99),
    fichierOrigine: `Facture_${commande}.pdf`,
    fichier: status === 'a_verifier' ? `${date}_A-VERIFIER_${short}.pdf` : `${date}_${label}_${short}.pdf`,
    dossierDrive: status === 'a_verifier' ? `Factures/${y}/${m} – À vérifier` : client ? `Clients/${client.nom} – ${client.immat}` : `Factures/${y}/${m} – Stock atelier`,
  };
}

function monthInvoices(year, month, lastDay, count) {
  const list = [];
  for (let i = 0; i < count; i += 1) {
    let day = int(1, lastDay);
    let date = `${year}-${pad(month)}-${pad(day)}`;
    // Pas de livraison le dimanche
    while (new Date(year, month - 1, day).getDay() === 0) {
      day = day === lastDay ? day - 1 : day + 1;
      date = `${year}-${pad(month)}-${pad(day)}`;
    }
    const client = rnd() < 0.82 ? pick(clients) : null;
    list.push(buildInvoice({ date, client }));
  }
  return list;
}

const byId = Object.fromEntries(clients.map((c) => [c.id, c]));
const nov = monthInvoices(2026, 11, 19, 59);
// Facture d'exemple du brief
nov.push(buildInvoice({ date: '2026-11-14', client: byId['c-martin'], order: '403-1234567-5528391' }));
// 3 factures à vérifier (bon de commande vide ou ambigu)
nov.push(
  buildInvoice({
    date: '2026-11-18',
    client: byId['c-giraud'],
    status: 'a_verifier',
    po: '',
    reason: 'Champ « n° de bon de commande » vide sur Amazon Business',
    suggestion: 'c-giraud',
  }),
  buildInvoice({
    date: '2026-11-19',
    client: byId['c-roux'],
    status: 'a_verifier',
    po: 'FA-713-RS ROUX',
    reason: 'Immatriculation saisie inconnue (FA-713-RS) — proche de FA-731-RS',
    suggestion: 'c-roux',
  }),
  buildInvoice({
    date: '2026-11-17',
    client: byId['c-henry'],
    status: 'a_verifier',
    po: 'RS3 HENRY',
    reason: 'Immatriculation absente, deux RS3 en atelier cette semaine',
    suggestion: 'c-henry',
  })
);

const all = [...monthInvoices(2026, 9, 30, 58), ...monthInvoices(2026, 10, 31, 71), ...nov].sort((a, b) =>
  b.recuLe.localeCompare(a.recuLe)
);
writeFileSync(new URL('../src/data/invoices.json', import.meta.url), JSON.stringify(all, null, 2));
console.log(`${all.length} factures générées (${nov.length} en novembre)`);
