import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { COLORS, frame, serif } from './_shared'

export default function Slide3Thesis({ data }) {
  const t = data?.thesis || {}
  const closes = (data?.charts?.closes || []).slice(-252)
  const first = closes[0]?.close
  const last = closes[closes.length - 1]?.close
  const positive = (last ?? 0) >= (first ?? 0)
  const stroke = positive ? COLORS.green : COLORS.red
  // Up to three short variant-perception bullets from the kill rationale / scenarios.
  const points = (t.scenarios || []).map((s) => `${s.name}: ${s.rationale}`)
    .filter(Boolean).slice(0, 3)

  return (
    <div style={{ ...frame(), padding: 48, display: 'flex', gap: 32 }}>
      <div style={{ flex: '0 0 58%' }}>
        <h1 style={{ fontFamily: serif, fontSize: 24, margin: '0 0 20px' }}>Thesis</h1>
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 20, lineHeight: 1.5 }}>
          {t.thesis_statement || 'No thesis statement.'}
        </div>
        <ul style={{ marginTop: 24, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
          {points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
      <div style={{ flex: '0 0 38%', alignSelf: 'center' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
          color: COLORS.muted, marginBottom: 8 }}>Price — last 1Y</div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={closes}>
              <defs>
                <linearGradient id="s3fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="close" stroke={stroke} strokeWidth={1.5}
                fill="url(#s3fill)" isAnimationActive={false} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
