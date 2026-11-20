import { useEffect, useMemo, useRef, useState } from 'react';
import { animateProgress, cssDurationMs, prefersReducedMotion } from '../../utils/motion';
import useElementWidth from '../../hooks/useElementWidth';

const PADDING = { top: 16, right: 16, bottom: 28, left: 44 };

// Généralisation de l'EvolutionChart d'Appesteban : N séries, axes formatés.
// 331 points échantillonnés = PPCM(2, 5, 11) + 1 : la courbe passe exactement
// par chaque point pour 3, 6 ou 12 valeurs, ce qui permet le morphing animé
// d'une période à l'autre sans changer la structure du path.
const SAMPLES = 331;

function niceMax(v) {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((x) => n <= x);
  return step * pow;
}

export default function LineChart({ data, series, height = 240, formatValue = String, formatAxis = formatValue, area = true, yMin = 0 }) {
  const svgRef = useRef(null);
  const [wrapRef, measured] = useElementWidth();
  const WIDTH = Math.max(280, measured);
  const [hoverIndex, setHoverIndex] = useState(null);
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;

  const yMax = yMin + niceMax((Math.max(...data.flatMap((d) => series.map((s) => d[s.key] ?? 0))) - yMin) * 1.08);
  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const xAt = (i) => PADDING.left + i * xStep;
  const yAt = (v) => PADDING.top + plotHeight - ((v - yMin) / (yMax - yMin)) * plotHeight;
  const sampleX = (s) => PADDING.left + (s / (SAMPLES - 1)) * plotWidth;

  const target = useMemo(() => {
    const out = {};
    for (const s of series) {
      const values = data.map((d) => d[s.key] ?? 0);
      const n = values.length;
      out[s.key] = Array.from({ length: SAMPLES }, (_, k) => {
        if (n < 2) return yAt(values[0] ?? 0);
        const t = (k / (SAMPLES - 1)) * (n - 1);
        const i = Math.min(n - 2, Math.floor(t));
        return yAt(values[i] + (values[i + 1] - values[i]) * (t - i));
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, yMax, yMin, height, WIDTH]);

  const [shape, setShape] = useState(target);
  const shapeRef = useRef(target);

  useEffect(() => {
    const from = shapeRef.current;
    if (from === target) return undefined;
    if (prefersReducedMotion()) {
      shapeRef.current = target;
      setShape(target);
      return undefined;
    }
    return animateProgress(cssDurationMs('--dur-chart', 550), (p) => {
      const next = {};
      for (const key of Object.keys(target)) {
        const a = from[key] ?? target[key];
        next[key] = target[key].map((y, k) => a[k] + (y - a[k]) * p);
      }
      shapeRef.current = p === 1 ? target : next;
      setShape(p === 1 ? target : next);
    });
  }, [target]);

  const pathFrom = (ys) => ys.map((y, k) => `${k === 0 ? 'M' : 'L'} ${sampleX(k).toFixed(2)} ${y.toFixed(2)}`).join(' ');

  const updateHover = (clientX) => {
    const svg = svgRef.current;
    if (!svg || xStep === 0) return;
    const rect = svg.getBoundingClientRect();
    const x = (clientX - rect.left) * (WIDTH / rect.width);
    setHoverIndex(Math.min(data.length - 1, Math.max(0, Math.round((x - PADDING.left) / xStep))));
  };

  const main = series[0];
  const mainLine = shape[main.key] ? pathFrom(shape[main.key]) : '';
  const areaPath = `${mainLine} L ${sampleX(SAMPLES - 1)} ${yAt(yMin)} L ${sampleX(0)} ${yAt(yMin)} Z`;
  const grid = [yMin, (yMin + yMax) / 2, yMax];
  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const periodKey = `${data.length}-${data[0]?.key}`;

  return (
    <div className="chart-fluid" ref={wrapRef}>
      <div className="chart-wrap chart-wrap-fluid">
        <div className="chart-legend">
          {series.map((s) => (
            <span className="chart-legend-item" key={s.key}>
              <span
                className={`chart-legend-swatch ${s.dashed ? 'chart-legend-swatch-dashed' : ''}`}
                style={{ borderColor: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${height}`}
          className="chart-svg"
          onMouseMove={(e) => updateHover(e.clientX)}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchStart={(e) => updateHover(e.touches[0].clientX)}
          onTouchMove={(e) => updateHover(e.touches[0].clientX)}
          onTouchEnd={() => setHoverIndex(null)}
        >
          {grid.map((g) => (
            <g key={g}>
              <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={yAt(g)} y2={yAt(g)} className="chart-gridline" />
              <text x={PADDING.left - 8} y={yAt(g) + 4} className="chart-axis-label" textAnchor="end">
                {formatAxis(g)}
              </text>
            </g>
          ))}
          {area && <path d={areaPath} className="chart-area" style={{ fill: main.color }} />}
          {series.map((s) => (
            <path
              key={s.key}
              d={shape[s.key] ? pathFrom(shape[s.key]) : ''}
              className="chart-line"
              style={{ stroke: s.color }}
              fill="none"
              strokeDasharray={s.dashed ? '5 4' : undefined}
            />
          ))}
          <g key={periodKey} className="chart-points">
            {data.map((d, i) => (
              <g key={d.key}>
                {series.map((s) => (
                  <circle
                    key={s.key}
                    cx={xAt(i)}
                    cy={yAt(d[s.key] ?? 0)}
                    r={hoverIndex === i ? 5 : s.dashed ? 0 : 3.5}
                    className="chart-dot"
                    style={{ fill: s.color }}
                  />
                ))}
                {(WIDTH >= 460 || data.length <= 6 || i % 2 === 0) && (
                  <text x={xAt(i)} y={height - 8} textAnchor="middle" className="chart-axis-label">
                    {d.label}
                  </text>
                )}
              </g>
            ))}
          </g>
          {hoverIndex !== null && (
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={PADDING.top}
              y2={height - PADDING.bottom}
              className="chart-crosshair"
            />
          )}
        </svg>
        {hovered && (
          <div
            className="chart-tooltip"
            style={{ left: `${Math.min(84, Math.max(16, (xAt(hoverIndex) / WIDTH) * 100))}%` }}
          >
            <div className="chart-tooltip-date">{hovered.tooltipLabel ?? hovered.label}</div>
            {series.map((s) => (
              <div className="chart-tooltip-row" key={s.key}>
                <span
                  className={`chart-legend-swatch ${s.dashed ? 'chart-legend-swatch-dashed' : ''}`}
                  style={{ borderColor: s.color }}
                />
                {s.label} : {formatValue(hovered[s.key] ?? 0)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
