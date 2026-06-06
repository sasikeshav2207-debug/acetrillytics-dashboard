import { Bar, BarChart, Cell, LabelList, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { COLORS, disp } from './_shared'
import { SlideFrame } from './_widgets'

const RATIOS = [['opm', 'OPM'], ['npm', 'NPM'], ['roce', 'ROCE'], ['roe', 'ROE'],
  ['debt_equity', 'D/E']]

export default function Slide4Financials({ data }) {
  const m = data?.metrics || {}
  const pnl = data?.charts?.annual_pnl || { years: [], revenue: [], pat: [] }
  const chartData = (pnl.years || []).map((fy, i) => ({
    fy, revenue: pnl.revenue?.[i] ?? null, pat: pnl.pat?.[i] ?? null,
  }))
  return (
    <SlideFrame theme="cream" kicker="Performance" title="Financials at a Glance" page={4}>
      <div style={{ display: 'flex', gap: 28 }}>
        <div style={{ flex: '0 0 58%' }}>
          <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`,
            borderRadius: 16, padding: '16px 12px', height: 440 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 4, left: 4 }}
                barGap={4}>
                <XAxis dataKey="fy" tick={{ fontSize: 12, fontFamily: 'DM Sans' }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" fill={COLORS.navy} radius={[4, 4, 0, 0]}
                  isAnimationActive={false}>
                  <LabelList dataKey="revenue" position="top" style={{ fontSize: 9, fill: COLORS.muted }} />
                </Bar>
                <Bar dataKey="pat" name="PAT" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {chartData.map((r, i) => (
                    <Cell key={i} fill={(r.pat ?? 0) < 0 ? COLORS.red : COLORS.gold} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ flex: '0 0 40%' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
            color: COLORS.muted, marginBottom: 10 }}>Key ratios</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {RATIOS.map(([key, label]) => (
              <div key={key} style={{ background: '#fff', border: `1px solid ${COLORS.border}`,
                borderRadius: 12, padding: '12px 14px' }}>
                <div className="mono" style={{ fontSize: 22, color: COLORS.navy }}>{disp(m[key])}</div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8,
                  color: COLORS.muted, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  )
}
