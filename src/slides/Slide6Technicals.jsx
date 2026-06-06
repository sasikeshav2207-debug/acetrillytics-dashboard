import { Area, AreaChart, Line, ComposedChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { COLORS, disp, num, frame, serif, mono } from './_shared'

export default function Slide6Technicals({ data }) {
  const m = data?.metrics || {}
  const closes = (data?.charts?.closes || []).slice(-126)  // ~6 months
  const sma200 = num(m.sma_200_daily)
  const series = closes.map((c) => ({ ...c, sma200 }))
  const positive = (closes[closes.length - 1]?.close ?? 0) >= (closes[0]?.close ?? 0)
  const stroke = positive ? COLORS.green : COLORS.red

  const px = num(m.latest_close)
  const lo = num(m.low_52w)
  const hi = num(m.high_52w)
  const pos52 = (px != null && lo != null && hi != null && hi > lo)
    ? `${(((px - lo) / (hi - lo)) * 100).toFixed(0)}%` : '—'

  const callouts = [
    ['Latest Close', disp(m.latest_close)],
    ['RSI (14)', disp(m.rsi_14_daily)],
    ['MACD Hist', disp(m.macd_hist_daily)],
    ['52W Position', pos52],
  ]

  return (
    <div style={{ ...frame(), padding: 48 }}>
      <h1 style={{ fontFamily: serif, fontSize: 24, margin: '0 0 16px' }}>Technical Picture</h1>
      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="s6fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={48} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} width={48} />
            <Area type="monotone" dataKey="close" stroke={stroke} strokeWidth={1.5}
              fill="url(#s6fill)" isAnimationActive={false} dot={false} />
            {sma200 != null && (
              <Line type="monotone" dataKey="sma200" stroke={COLORS.navy} strokeWidth={1}
                strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        {callouts.map(([label, value]) => (
          <div key={label} style={{ flex: 1, background: COLORS.surface,
            border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontFamily: mono, fontSize: 24 }}>{value}</div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8,
              color: COLORS.muted, marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
