import { useMemo, useState } from 'react';
import data from '../data/network.json';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Segmented from '../components/Segmented';
import { formatEurosRound, formatNumber } from '../utils/format';
import { IconNetwork, IconTrendUp, IconCheckCircle, IconEuro, IconZap } from '../components/icons';

const METRICS = [
  { value: 'ca', label: 'CA', format: formatEurosRound },
  { value: 'conversion', label: 'Conversion', format: (v) => `${v} %` },
  { value: 'leads', label: 'Leads', format: formatNumber },
];

export default function Network() {
  const [metric, setMetric] = useState('ca');
  const m = METRICS.find((x) => x.value === metric);
  const sorted = useMemo(() => [...data.centres].sort((a, b) => b[metric] - a[metric]), [metric]);
  const max = sorted[0][metric];
  const me = data.centres.find((c) => c.me);
  const rank = sorted.findIndex((c) => c.me) + 1;
  const avgConv = Math.round(data.centres.reduce((s, c) => s + c.conversion, 0) / data.centres.length);
  const totalCa = data.centres.reduce((s, c) => s + c.ca, 0);
  const byConv = [...data.centres].sort((a, b) => b.conversion - a.conversion);

  return (
    <div>
      <PageHeader
        title="Réseau"
        highlight="Motortech"
        subtitle={`Comparaison des 12 centres · ${data.mois}. Toulon est le seul centre équipé des automatisations IA.`}
      />

      <div className="stat-grid stagger-children">
        <StatCard label="Rang Toulon (conversion)" value={`${byConv.findIndex((c) => c.me) + 1}er / 12`} highlight sub={`${me.conversion} % vs ${avgConv} % en moyenne`} icon={<IconCheckCircle width={18} height={18} />} color="var(--tone-red)" softColor="var(--tone-red-soft)" />
        <StatCard label="Écart de conversion" value={`+${me.conversion - avgConv} pts`} sub="Effet devis auto + relances" icon={<IconTrendUp width={18} height={18} />} color="var(--tone-success)" softColor="var(--tone-success-soft)" />
        <StatCard label="CA réseau du mois" value={totalCa} format={formatEurosRound} sub={`Toulon : ${Math.round((me.ca / totalCa) * 100)} % du réseau`} icon={<IconEuro width={18} height={18} />} color="var(--tone-info)" softColor="var(--tone-info-soft)" />
        <StatCard label="Centres connectés" value="12" sub="France, Belgique, Suisse" icon={<IconNetwork width={18} height={18} />} color="var(--tone-violet)" softColor="var(--tone-violet-soft)" />
      </div>

      <Card
        title="Classement des centres"
        subtitle={`Toulon : ${rank}${rank === 1 ? 'er' : 'e'} sur 12 · ${m.label}`}
        action={<Segmented options={METRICS} value={metric} onChange={setMetric} label="Indicateur" />}
      >
        <ol className="rank-list">
          {sorted.map((c, i) => (
            <li key={c.ville} className={`rank-row ${c.me ? 'rank-row-me' : ''}`}>
              <span className="rank-pos">{i + 1}</span>
              <span className="rank-name">
                <strong>{c.ville}</strong>
                <small>{c.region}</small>
              </span>
              <span className="rank-track">
                <span className={`rank-fill ${c.me ? 'rank-fill-me' : ''}`} style={{ '--bar-ratio': c[metric] / max }} />
              </span>
              <span className="rank-value">{m.format(c[metric])}</span>
              {c.auto ? (
                <span className="rank-auto" title="Automatisations IA actives">
                  <IconZap width={13} height={13} />
                </span>
              ) : (
                <span className="rank-auto rank-auto-off" />
              )}
            </li>
          ))}
        </ol>
      </Card>

      <h2 className="section-title section-gap">Détail par centre</h2>
      <div className="table-wrap">
        <table className="data-table data-table-compact">
          <thead>
            <tr>
              <th>Centre</th>
              <th className="num">Leads</th>
              <th className="num">Devis</th>
              <th className="num">Conversion</th>
              <th className="num">CA du mois</th>
              <th className="num">vs N-1</th>
            </tr>
          </thead>
          <tbody>
            {[...data.centres]
              .sort((a, b) => b.ca - a.ca)
              .map((c) => (
                <tr key={c.ville} className={`row-static ${c.me ? 'row-me' : ''}`}>
                  <td>
                    <span className="cell-primary">Motortech {c.ville}</span>
                    {c.me && <span className="me-tag">Vous</span>}
                  </td>
                  <td className="num">{formatNumber(c.leads)}</td>
                  <td className="num">{c.devis}</td>
                  <td className={`num ${c.me ? 'text-accent cell-primary' : ''}`}>{c.conversion} %</td>
                  <td className="num cell-primary">{formatEurosRound(c.ca)}</td>
                  <td className={`num ${c.evol >= 0 ? 'text-success' : 'text-danger'}`}>
                    {c.evol > 0 ? '+' : ''}
                    {c.evol} %
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="page-footnote">Données réseau consolidées chaque nuit · valeurs de démonstration.</p>
    </div>
  );
}
