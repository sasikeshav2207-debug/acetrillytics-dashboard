import { COLORS, disp, num, mono } from './_shared'
import { SlideFrame } from './_widgets'

// key, label, bar scale max (%), good-when-high?, context fn
const CELLS = [
  { key: 'revenue_cagr_3y', label: 'Revenue CAGR · 3Y', max: 30, hi: true,
    ctx: (v) => v == null ? 'Not available' : v >= 0 ? 'Top line compounding' : 'Top line contracting' },
  { key: 'pat_cagr_3y', label: 'PAT CAGR · 3Y', max: 30, hi: true,
    ctx: (v) => v == null ? 'Not available' : v >= 0 ? 'Earnings compounding' : 'Earnings contracting' },
  { key: 'roe', label: 'Return on Equity', max: 30, hi: true,
    ctx: (v) => v == null ? 'Not available' : v >= 15 ? 'Strong returns' : 'Moderate returns' },
  { key: 'opm', label: 'Operating Margin', max: 40, hi: true,
    ctx: (v) => v == null ? 'Not available' : v >= 15 ? 'Healthy profitability' : 'Thin margins' },
  { key: 'cfo_pat', label: 'CFO / PAT', max: 1.5, hi: true,
    ctx: (v) => v == null ? 'Not available' : v >= 0.9 ? 'Cash-backed earnings' : 'Watch cash conversion' },
  { key: 'debt_equity', label: 'Debt / Equity', max: 2, hi: false,
    ctx: (v) => v == null ? 'Not available' : v < 0.75 ? 'Comfortable leverage'
      : v <= 1.5 ? 'Moderate leverage' : 'High leverage' },
]

function StatBar({ cell, m }) {
  const v = num(m[cell.key])
  // fill 0-100 normalised to the metric's scale; for "lower is better", invert.
  let fill = 0
  let color = COLORS.muted
  if (v != null) {
    const raw = Math.max(0, Math.min(100, (v / cell.max) * 100))
    fill = cell.hi ? raw : Math.max(6, 100 - raw)
    if (cell.hi) color = v < 0 ? COLORS.red : v >= cell.max * 0.5 ? COLORS.green : COLORS.gold
    else color = v < 0.75 ? COLORS.green : v <= 1.5 ? COLORS.gold : COLORS.red
  }
  const arrow = v == null ? '' : (cell.hi ? (v >= 0 ? '▲' : '▼') : (v < 1 ? '▼' : '▲'))
  return (
    <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 16,
      padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
        color: COLORS.muted }}>{cell.label}</div>
      <div style={{ fontFamily: mono, fontSize: 40, fontWeight: 500, color: COLORS.navy,
        lineHeight: 1, margin: '6px 0 12px' }}>
        {arrow && <span style={{ fontSize: 17, color, marginRight: 8 }}>{arrow}</span>}
        {disp(m[cell.key])}
      </div>
      <div style={{ height: 6, background: COLORS.border, borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${fill}%`, background: color, borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>{cell.ctx(v)}</div>
    </div>
  )
}

export default function Slide2Snapshot({ data }) {
  const m = data?.metrics || {}
  const t = data?.thesis || {}
  return (
    <SlideFrame theme="cream" kicker="At a glance" title="Investment Snapshot" page={2}>
      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: -10, marginBottom: 16 }}>
        {t.ticker || ''} · latest reported figures from the deterministic engine
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)', gap: 18, height: 430 }}>
        {CELLS.map((c) => <StatBar key={c.key} cell={c} m={m} />)}
      </div>
    </SlideFrame>
  )
}
