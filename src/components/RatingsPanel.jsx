import { num } from '../lib/format'

const BADGE = {
  'Very Strong': ['#D4EDDA', '#1A4731'], Strong: ['#D4EDDA', '#1A4731'],
  Bullish: ['#D4EDDA', '#1A4731'], High: ['#D4EDDA', '#1A4731'], active: ['#D4EDDA', '#1A4731'],
  Moderate: ['#FFF3CD', '#7A4E1A'], Neutral: ['#F0F0F0', '#555'], draft: ['#FFF3CD', '#7A4E1A'],
  Weak: ['#FDECEA', '#7A1A1A'], Bearish: ['#FDECEA', '#7A1A1A'], Low: ['#FDECEA', '#7A1A1A'],
  killed: ['#FDECEA', '#7A1A1A'], superseded: ['#F0F0F0', '#555'],
  'No data': ['#F0F0F0', '#555'],
}

function badge(label) {
  const [bg, fg] = BADGE[label] || ['#F0F0F0', '#555']
  return (
    <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 500, padding: '2px 10px',
      borderRadius: 999 }}>{label}</span>
  )
}

function financialStrength(m) {
  const roe = num(m.roe), roce = num(m.roce), de = num(m.debt_equity)
  if (roe == null && roce == null && de == null) return ['No data', 'Returns / leverage not available']
  const strong = (roe ?? 0) > 15 && (roce ?? 0) > 15 && (de ?? 99) < 0.5
  const ok = (roe ?? 0) > 12 && (roce ?? 0) > 12 && (de ?? 99) < 1
  if (strong) return ['Very Strong', 'High returns on capital, low leverage']
  if (ok) return ['Strong', 'Healthy returns, contained leverage']
  if ((de ?? 0) > 1.5) return ['Weak', 'Elevated leverage']
  return ['Moderate', 'Mixed returns / leverage']
}

function earningsQuality(m) {
  const c = num(m.cfo_pat)
  if (c == null) return ['No data', 'CFO/PAT not available']
  if (c >= 0.9) return ['Strong', `Cash converts well (CFO/PAT ${c.toFixed(2)}x)`]
  if (c >= 0.6) return ['Moderate', `Moderate cash conversion (${c.toFixed(2)}x)`]
  return ['Weak', `Low cash conversion (${c.toFixed(2)}x)`]
}

function technicalTrend(m) {
  const px = num(m.latest_close), sma = num(m.sma_200_daily)
  if (px == null || sma == null) return ['No data', '200-day SMA not available']
  return px >= sma ? ['Bullish', 'Price above its 200-day average']
    : ['Bearish', 'Price below its 200-day average']
}

export default function RatingsPanel({ metrics, status }) {
  const cards = [
    ['Financial Strength', ...financialStrength(metrics)],
    ['Earnings Quality', ...earningsQuality(metrics)],
    ['Thesis Status', status || 'No data', 'Current lifecycle state of the thesis'],
    ['Technical Trend', ...technicalTrend(metrics)],
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {cards.map(([title, label, note]) => (
        <div key={title} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{title}</div>
            <span style={{ color: 'var(--muted)' }}>→</span>
          </div>
          <div style={{ margin: '8px 0' }}>{badge(label)}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{note}</div>
        </div>
      ))}
    </div>
  )
}
