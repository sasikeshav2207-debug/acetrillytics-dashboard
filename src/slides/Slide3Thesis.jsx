import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { COLORS, num, serif } from './_shared'
import { RangeBar, SlideFrame } from './_widgets'

export default function Slide3Thesis({ data }) {
  const t = data?.thesis || {}
  const m = data?.metrics || {}
  const closes = (data?.charts?.closes || []).slice(-252)
  const first = closes[0]?.close
  const last = closes[closes.length - 1]?.close ?? num(m.latest_close)
  const ret = (first && last) ? ((last - first) / first) * 100 : null
  const positive = (ret ?? 0) >= 0
  const stroke = positive ? COLORS.green : COLORS.red
  const points = (t.scenarios || []).map((s) => `${s.name}: ${s.rationale}`)
    .filter(Boolean).slice(0, 3)

  return (
    <SlideFrame theme="cream" kicker="The call" title="Thesis" page={3}>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: '0 0 56%' }}>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 22, lineHeight: 1.5,
            color: COLORS.text }}>{t.thesis_statement || 'No thesis statement.'}</div>
          <ul style={{ marginTop: 22, paddingLeft: 20, fontSize: 14, lineHeight: 1.9,
            color: '#333' }}>
            {points.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        <div style={{ flex: '0 0 40%' }}>
          <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 16,
            padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
                color: COLORS.muted }}>Price — last 1Y</span>
              <span className="mono" style={{ fontSize: 16, color: stroke }}>
                {ret == null ? '—' : `${ret >= 0 ? '+' : ''}${ret.toFixed(1)}%`}</span>
            </div>
            <div style={{ height: 200, marginTop: 6 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={closes} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="s3fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="close" stroke={stroke} strokeWidth={2}
                    fill="url(#s3fill)" isAnimationActive={false} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 14 }}>
              <RangeBar low={num(m.low_52w)} high={num(m.high_52w)} cur={num(m.latest_close)} />
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  )
}
