// Barres verticales simples ; les créneaux « fermés » sont rayés et en accent
// pour montrer ce que l'IA récupère quand le centre ne décroche pas.
export default function BarChart({ data, height = 160, highlightKey = 'ferme', formatValue = String }) {
  const max = Math.max(...data.map((d) => d.n));
  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((d, i) => (
        <div className="bar-col" key={d.label} title={`${d.label} : ${formatValue(d.n)}`}>
          <span className="bar-value">{formatValue(d.n)}</span>
          <div className="bar-track">
            <div
              className={`bar-fill ${d[highlightKey] ? 'bar-fill-accent' : ''}`}
              style={{ '--bar-ratio': d.n / max, '--stagger-i': i }}
            />
          </div>
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
