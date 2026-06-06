import { disp, num } from './_shared'
import { SlideFrame, StatCard } from './_widgets'

const CELLS = [
  ['revenue_cagr_3y', 'Revenue CAGR 3Y', 'pos'], ['pat_cagr_3y', 'PAT CAGR 3Y', 'pos'],
  ['roe', 'ROE', 'pos'], ['debt_equity', 'Debt / Equity', 'lowgood'],
  ['opm', 'OPM', 'pos'], ['gross_margin', 'Gross Margin', 'pos'],
]

export default function Slide2Snapshot({ data }) {
  const m = data?.metrics || {}
  const trendOf = (key, kind) => {
    const v = num(m[key])
    if (v == null) return undefined
    if (kind === 'lowgood') return v < 1 ? 'up' : 'down'
    return v >= 0 ? 'up' : 'down'
  }
  return (
    <SlideFrame theme="cream" kicker="At a glance" title="Investment Snapshot" page={2}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)', gap: 22, height: 470 }}>
        {CELLS.map(([key, label, kind]) => (
          <StatCard key={key} label={label} value={disp(m[key])}
            trend={trendOf(key, kind)} big={48} />
        ))}
      </div>
    </SlideFrame>
  )
}
