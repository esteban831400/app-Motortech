// Formats français utilisés partout dans l'app : « 1 250,00 € », « 14 nov. 2026 ».

const euro2 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
const euro0 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('fr-FR');
const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const dateShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' });
const weekdayShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const monthLong = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' });

// Les dates ISO "AAAA-MM-JJ" sont lues en heure locale (évite le décalage UTC).
export function parseDate(value) {
  if (value instanceof Date) return value;
  const [d, t] = String(value).split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h = 0, min = 0] = (t ?? '').split(':').map(Number);
  return new Date(y, m - 1, day, h, min);
}

export const formatEuros = (v) => euro2.format(v);
export const formatEurosRound = (v) => euro0.format(v);
export const formatNumber = (v) => num.format(v);
export const formatPercent = (v, digits = 0) => `${num.format(Number(v.toFixed(digits)))} %`;
export const formatDate = (v) => dateFmt.format(parseDate(v));
export const formatDateShort = (v) => dateShort.format(parseDate(v));
export const formatWeekday = (v) => weekday.format(parseDate(v));
export const formatWeekdayShort = (v) => weekdayShort.format(parseDate(v)).replace('.', '');
export const formatMonth = (v) => {
  const s = monthLong.format(parseDate(v));
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const formatMonthShort = (v) => monthShort.format(parseDate(v)).replace('.', '');

export function formatTime(v) {
  const d = parseDate(v);
  return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDateTime(v) {
  return `${formatDate(v)} · ${formatTime(v)}`;
}

// « 4 h 30 » à partir de minutes
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

// « il y a 12 min », « hier à 18h02 »… relatif à l'horloge de démo.
export function formatRelative(v, now) {
  const d = parseDate(v);
  const diff = Math.round((now - d) / 60000);
  if (diff < 1) return "à l'instant";
  if (diff < 60) return `il y a ${diff} min`;
  if (diff < 60 * 6) return `il y a ${Math.floor(diff / 60)} h`;
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `aujourd'hui à ${formatTime(d)}`;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return `hier à ${formatTime(d)}`;
  return `${formatDateShort(d)} à ${formatTime(d)}`;
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export function plural(n, one, many) {
  return `${formatNumber(n)} ${n > 1 ? many : one}`;
}
