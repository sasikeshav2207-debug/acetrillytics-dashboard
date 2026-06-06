import { COLORS, disp, frame, serif, mono } from './_shared'

const MULTIPLES = [['pe_ttm', 'P/E'], ['pb_ratio', 'P/B'], ['ev_ebitda', 'EV/EBITDA'],
  ['ps_ratio', 'P/S']]
const SCN_COLOR = { bull: COLORS.green, base: COLORS.gold, bear: COLORS.red }

export default function Slide5Valuation({ data }) {
  const m = data?.metrics || {}
  const scenarios = data?.thesis?.scenarios || []
  const order = ['bull', 'base', 'bear']
  const sorted = [...scenarios].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  return (
    <div style={{ ...frame(), padding: 48, display: 'flex', gap: 28 }}>
      <div style={{ flex: '0 0 38%' }}>
        <h1 style={{ fontFamily: serif, fontSize: 24, margin: '0 0 16px' }}>Valuation &amp; Scenarios</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono }}>
          <tbody>
            {MULTIPLES.map(([key, label]) => (
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
      <div style={{ flex: '0 0 58%' }}>
        <div style={{ display: 'flex', gap: 14, marginTop: 56 }}>
          {sorted.map((s) => (
            <div key={s.name} style={{ flex: 1, background: COLORS.surface,
              border: `2px solid ${SCN_COLOR[s.name] || COLORS.border}`, borderRadius: 14,
              padding: 16, minHeight: 320 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                color: SCN_COLOR[s.name] || COLORS.text, letterSpacing: 1 }}>{s.name}</div>
              <div style={{ fontFamily: mono, fontSize: 12, margin: '10px 0' }}>
                {Object.entries(s.key_metrics || {}).map(([k, v]) => (
                  <div key={k}>{k}: <b>{String(v)}</b></div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{s.rationale}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: COLORS.red, fontWeight: 600, marginTop: 12,
          letterSpacing: 0.5 }}>AUTHOR PROJECTIONS — NOT FACTS</div>
      </div>
    </div>
  )
}
