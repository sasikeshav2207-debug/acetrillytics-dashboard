import { Area, ComposedChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { COLORS, disp, num } from './_shared'
import { Callout, RSIGauge, SlideFrame } from './_widgets'

export default function Slide6Technicals({ data }) {
  const m = data?.metrics || {}
  const closes = (data?.charts?.closes || []).slice(-126)
  const sma200 = num(m.sma_200_daily)
  const series = closes.map((c) => ({ ...c, sma200 }))
  const positive = (closes[closes.length - 1]?.close ?? 0) >= (closes[0]?.close ?? 0)
  const stroke = positive ? COLORS.green : COLORS.red
  const px = num(m.latest_close), lo = num(m.low_52w), hi = num(m.high_52w)
  const pos52 = (px != null && lo != null && hi != null && hi > lo)
    ? `${(((px - lo) / (hi - lo)) * 100).toFixed(0)}%` : '—'

  return (
    <SlideFrame theme="cream" kicker="Price action" title="Technical Picture" page={6}>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: '0 0 64%', background: '#fff', border: `1px solid ${COLORS.border}`,
          borderRadius: 16, padding: 16, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="s6fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={50}
                axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} width={46}
                axisLine={false} tickLine={false} />
              <Area type="monotone" dataKey="close" stroke={stroke} strokeWidth={2}
                fill="url(#s6fill)" isAnimationActive={false} dot={false} />
              {sma200 != null && <Line type="monotone" dataKey="sma200" stroke={COLORS.navy}
                strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: '0 0 32%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#fff',
          border: `1px solid ${COLORS.border}`, borderRadius: 16 }}>
          <RSIGauge value={num(m.rsi_14_daily)} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 22 }}>
        <Callout label="Latest Close" value={disp(m.latest_close)} />
        <Callout label="SMA 200" value={disp(m.sma_200_daily)} />
        <Callout label="MACD Hist" value={disp(m.macd_histogram_daily)} />
        <Callout label="52W Position" value={pos52} />
      </div>
    </SlideFrame>
  )
}
