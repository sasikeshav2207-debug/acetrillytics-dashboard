import { COLORS, disp, mono } from './_shared'
import { SlideFrame } from './_widgets'

const MULTIPLES = [['pe_ttm', 'P/E'], ['pb_ratio', 'P/B'], ['ev_ebitda', 'EV/EBITDA'],
  ['ps_ratio', 'P/S']]
const SCN = { bull: ['#2D7A4F', '#EAF5EE'], base: ['#B8863A', '#FBF4E6'], bear: ['#E84040', '#FDECEA'] }

export default function Slide5Valuation({ data }) {
  const m = data?.metrics || {}
  const scenarios = data?.thesis?.scenarios || []
  const order = ['bull', 'base', 'bear']
  const sorted = [...scenarios].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  return (
    <SlideFrame theme="cream" kicker="What it's worth" title="Valuation & Scenarios" page={5}>
      <div style={{ display: 'flex', gap: 28 }}>
        <div style={{ flex: '0 0 34%' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
            color: COLORS.muted, marginBottom: 10 }}>Multiples</div>
          {MULTIPLES.map(([key, label]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', background: '#fff', border: `1px solid ${COLORS.border}`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 10 }}>
              <span style={{ fontSize: 13 }}>{label}</span>
              <span className="mono" style={{ fontSize: 18, color: COLORS.navy }}>{disp(m[key])}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: '0 0 62%' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {sorted.map((s) => {
              const [edge, bg] = SCN[s.name] || [COLORS.border, '#fff']
              return (
                <div key={s.name} style={{ flex: 1, background: bg,
                  borderTop: `4px solid ${edge}`, border: `1px solid ${COLORS.border}`,
                  borderRadius: 14, padding: 18, minHeight: 360 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
                    color: edge, letterSpacing: 1 }}>{s.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 12, margin: '12px 0',
                    lineHeight: 1.7 }}>
                    {Object.entries(s.key_metrics || {}).map(([k, v]) => (
                      <div key={k}>{k}: <b>{String(v)}</b></div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{s.rationale}</div>
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 11, color: COLORS.red, fontWeight: 700, marginTop: 14,
            letterSpacing: 0.5 }}>AUTHOR PROJECTIONS — NOT FACTS</div>
        </div>
      </div>
    </SlideFrame>
  )
}
