// Courbe de banc de puissance : puissance (ch) et couple (Nm), avant / après.
// Les courbes sont modélisées à partir des pics mesurés (forme réaliste d'un
// moteur turbo : couple en plateau, puissance qui culmine haut dans les tours).
import useElementWidth from '../../hooks/useElementWidth';

const PAD = { top: 18, right: 46, bottom: 30, left: 46 };

function curves({ chAvant, chApres, nmAvant, nmApres, rpmMax = 6500 }) {
  const rpmMin = Math.round(rpmMax * 0.25 / 100) * 100;
  const pts = 60;
  const build = (peakNm, peakCh, gainShift = 0) =>
    Array.from({ length: pts }, (_, i) => {
      const t = i / (pts - 1);
      const rpm = rpmMin + t * (rpmMax - rpmMin);
      // Couple : montée rapide, plateau puis décroissance
      const rise = 1 - Math.exp(-(t + 0.05) * (7 - gainShift));
      const fall = t > 0.55 ? 1 - ((t - 0.55) / 0.45) ** 1.6 * 0.38 : 1;
      const nm = peakNm * rise * fall;
      // Puissance (ch) = couple × régime / 7023, recalée sur le pic mesuré
      const ch = (nm * rpm) / 7023;
      return { rpm, nm, ch };
    });
  const scale = (arr, peakCh) => {
    const m = Math.max(...arr.map((p) => p.ch));
    return arr.map((p) => ({ ...p, ch: (p.ch / m) * peakCh }));
  };
  return {
    avant: scale(build(nmAvant, chAvant), chAvant),
    apres: scale(build(nmApres, chApres, 0.6), chApres),
    rpmMin,
    rpmMax,
  };
}

export default function DynoChart({ mesure, height = 260, compact = false }) {
  const [ref, measured] = useElementWidth(compact ? 260 : 640);
  const W = Math.max(240, measured);
  const { avant, apres, rpmMin, rpmMax } = curves(mesure);
  const ph = height - PAD.top - PAD.bottom;
  const pw = W - PAD.left - PAD.right;
  const chMax = Math.ceil((mesure.chApres * 1.15) / 50) * 50 || 60;
  const nmMax = Math.ceil((mesure.nmApres * 1.15) / 50) * 50 || 70;
  const x = (rpm) => PAD.left + ((rpm - rpmMin) / (rpmMax - rpmMin)) * pw;
  const yCh = (v) => PAD.top + ph - (v / chMax) * ph;
  const yNm = (v) => PAD.top + ph - (v / nmMax) * ph;
  const line = (arr, key, y) => arr.map((p, i) => `${i ? 'L' : 'M'}${x(p.rpm).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className={`dyno ${compact ? 'dyno-compact' : ''}`} ref={ref}>
      {!compact && (
        <div className="chart-legend">
          <span className="chart-legend-item">
            <span className="chart-legend-swatch" style={{ borderColor: 'var(--acc)' }} /> Puissance après
          </span>
          <span className="chart-legend-item">
            <span className="chart-legend-swatch chart-legend-swatch-dashed" style={{ borderColor: 'var(--acc)' }} /> Couple après
          </span>
          <span className="chart-legend-item">
            <span className="chart-legend-swatch" style={{ borderColor: 'var(--chart-series-2)' }} /> Origine
          </span>
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${height}`} className="chart-svg dyno-svg" role="img" aria-label="Courbe de puissance et de couple">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + ph * (1 - t)} y2={PAD.top + ph * (1 - t)} className="chart-gridline" />
            {!compact && (
              <>
                <text x={PAD.left - 8} y={PAD.top + ph * (1 - t) + 4} textAnchor="end" className="chart-axis-label">
                  {Math.round(chMax * t)}
                </text>
                <text x={W - PAD.right + 8} y={PAD.top + ph * (1 - t) + 4} className="chart-axis-label">
                  {Math.round(nmMax * t)}
                </text>
              </>
            )}
          </g>
        ))}
        {!compact && (
          <>
            <text x={PAD.left - 8} y={10} textAnchor="end" className="chart-axis-label dyno-unit">ch</text>
            <text x={W - PAD.right + 8} y={10} className="chart-axis-label dyno-unit">Nm</text>
            {(W >= 480 ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.5, 1]).map((t) => {
              const rpm = Math.round((rpmMin + t * (rpmMax - rpmMin)) / 100) * 100;
              return (
                <text key={t} x={x(rpm)} y={height - 8} textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'} className="chart-axis-label">
                  {rpm.toLocaleString('fr-FR')} tr/min
                </text>
              );
            })}
          </>
        )}
        <path d={line(avant, 'nm', yNm)} className="dyno-line dyno-before" strokeDasharray="5 4" />
        <path d={line(avant, 'ch', yCh)} className="dyno-line dyno-before" />
        <path d={`${line(apres, 'ch', yCh)} L${x(rpmMax)} ${yCh(0)} L${x(rpmMin)} ${yCh(0)} Z`} className="chart-area" style={{ fill: 'var(--acc)' }} />
        <path d={line(apres, 'nm', yNm)} className="dyno-line dyno-after" strokeDasharray="5 4" />
        <path d={line(apres, 'ch', yCh)} className="dyno-line dyno-after dyno-draw" />
      </svg>
    </div>
  );
}
