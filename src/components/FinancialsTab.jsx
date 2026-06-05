import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { COLORS, disp, num } from '../lib/format'

function GrowthCard({ label, metric, goodWhenHigh = true }) {
  const v = num(metric)
  let arrow = '', color = COLORS.muted, context = 'Not available'
  if (v != null) {
    const positive = v >= 0
    if (goodWhenHigh) {
      arrow = positive ? '↑' : '↓'
      color = positive ? COLORS.green : COLORS.red
      context = positive ? 'Growing over the period' : 'Contracting over the period'
    } else { // debt/equity: lower is better
      arrow = v < 1 ? '↓' : '↑'
      color = v < 0.75 ? COLORS.green : (v <= 1.5 ? COLORS.gold : COLORS.red)
      context = v < 0.75 ? 'Comfortable leverage' : (v <= 1.5 ? 'Moderate leverage' : 'High leverage')
    }
  }
  return (
    <div className="card" style={{ flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: 12, color: COLORS.muted }}>{label}</div>
      <div style={{ fontSize: 11, color: COLORS.muted }}>Over recent years</div>
      <div className="mono" style={{ fontSize: 26, fontWeight: 500, color, marginTop: 6 }}>
        {arrow} {disp(metric)}
      </div>
      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{context}</div>
    </div>
  )
}

export default function FinancialsTab({ metrics, fy = [] }) {
  const hasOp = fy.some((r) => r.op_profit != null)
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <GrowthCard label="Revenue CAGR 3Y" metric={metrics.revenue_cagr_3y} />
        <GrowthCard label="PAT CAGR 3Y" metric={metrics.pat_cagr_3y} />
        <GrowthCard label="Debt / Equity" metric={metrics.debt_equity} goodWhenHigh={false} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        margin: '22px 0 8px' }}>
        <h3 style={{ margin: 0 }}>P&amp;L summary</h3>
        <span style={{ fontSize: 12, color: COLORS.gold }}>View financial statements →</span>
      </div>
      {fy.length === 0 ? (
        <div className="card muted">Annual financials not loaded.</div>
      ) : (
        <div className="card" style={{ height: 40 + fy.length * 64 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={fy} margin={{ top: 6, right: 56, bottom: 0, left: 8 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="fy" tick={{ fontSize: 11 }} width={56} />
              <Tooltip />
              <Bar dataKey="revenue" name="Revenue" fill={COLORS.navy} radius={[0, 3, 3, 0]}>
                <LabelList dataKey="revenue" position="right" style={{ fontSize: 9 }} />
              </Bar>
              {hasOp && (
                <Bar dataKey="op_profit" name="Operating Profit" fill="#5B8DB8"
                  radius={[0, 3, 3, 0]} />
              )}
              <Bar dataKey="pat" name="PAT" radius={[0, 3, 3, 0]}>
                {fy.map((r, i) => (
                  <Cell key={i} fill={(r.pat ?? 0) < 0 ? COLORS.red : COLORS.green} />
                ))}
                <LabelList dataKey="pat" position="right" style={{ fontSize: 9 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: COLORS.muted, marginTop: 8 }}>
        <span><span className="dot" style={{ background: COLORS.navy }} /> Revenue</span>
        {hasOp && <span><span className="dot" style={{ background: '#5B8DB8' }} /> Operating Profit</span>}
        <span><span className="dot" style={{ background: COLORS.green }} /> PAT</span>
      </div>
    </div>
  )
}
