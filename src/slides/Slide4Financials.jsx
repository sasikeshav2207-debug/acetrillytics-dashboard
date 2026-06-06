import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { COLORS, disp, frame, serif, mono } from './_shared'

const RATIOS = [['opm', 'OPM'], ['npm', 'NPM'], ['roce', 'ROCE'], ['roe', 'ROE'],
  ['debt_equity', 'D/E']]

export default function Slide4Financials({ data }) {
  const m = data?.metrics || {}
  const pnl = data?.charts?.annual_pnl || { years: [], revenue: [], pat: [] }
  const chartData = (pnl.years || []).map((fy, i) => ({
    fy, revenue: pnl.revenue?.[i] ?? null, pat: pnl.pat?.[i] ?? null,
  }))
  return (
    <div style={{ ...frame(), padding: 48, display: 'flex', gap: 28 }}>
      <div style={{ flex: '0 0 55%' }}>
        <h1 style={{ fontFamily: serif, fontSize: 24, margin: '0 0 16px' }}>Financials at a Glance</h1>
        <div style={{ height: 520 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <XAxis dataKey="fy" tick={{ fontSize: 12, fontFamily: 'DM Sans' }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Bar dataKey="revenue" name="Revenue" fill={COLORS.navy} isAnimationActive={false} />
              <Bar dataKey="pat" name="PAT" isAnimationActive={false}>
                {chartData.map((r, i) => (
                  <Cell key={i} fill={(r.pat ?? 0) < 0 ? COLORS.red : COLORS.gold} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 12, color: COLORS.muted }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10,
            background: COLORS.navy, borderRadius: 2 }} /> Revenue</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10,
            background: COLORS.gold, borderRadius: 2 }} /> PAT</span>
        </div>
      </div>
      <div style={{ flex: '0 0 42%', alignSelf: 'center' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
          color: COLORS.muted, marginBottom: 10 }}>Key ratios</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono }}>
          <tbody>
            {RATIOS.map(([key, label]) => (
              <tr key={key} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px 8px', fontFamily: 'DM Sans', fontSize: 13 }}>{label}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: 16 }}>
                  {disp(m[key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
