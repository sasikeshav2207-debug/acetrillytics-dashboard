import { COLORS, disp, frame, serif, mono } from './_shared'

const CELLS = [
  ['revenue_cagr_3y', 'Revenue CAGR 3Y'], ['pat_cagr_3y', 'PAT CAGR 3Y'], ['roe', 'ROE'],
  ['debt_equity', 'Debt / Equity'], ['opm', 'OPM'], ['gross_margin', 'Gross Margin'],
]

export default function Slide2Snapshot({ data }) {
  const m = data?.metrics || {}
  return (
    <div style={{ ...frame(), padding: 48 }}>
      <h1 style={{ fontFamily: serif, fontSize: 24, margin: '0 0 28px' }}>Investment Snapshot</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)', gap: 20, height: 540 }}>
        {CELLS.map(([key, label]) => (
          <div key={key} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column',
            justifyContent: 'center' }}>
            <div style={{ fontFamily: mono, fontSize: 52, fontWeight: 500, color: COLORS.gold }}>
              {disp(m[key])}
            </div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
              color: COLORS.muted, marginTop: 8 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
