import { COLORS, frame, serif, mono } from './_shared'

export default function Slide1Cover({ data }) {
  const t = data?.thesis || {}
  return (
    <div style={frame(COLORS.navy)}>
      <div style={{ position: 'absolute', top: '38%', left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: serif, fontSize: 48, color: COLORS.cream, fontWeight: 700 }}>
          {t.ticker || t.isin || 'Company'}
        </div>
        <div style={{ fontFamily: mono, fontSize: 24, color: COLORS.gold, marginTop: 8 }}>
          {t.isin || ''}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 28, left: 36, fontFamily: mono, fontSize: 13,
        color: '#A9B0D0' }}>
        {(t.created_at || '').slice(0, 10)} · v{t.version ?? 1}
      </div>
      <div style={{ position: 'absolute', bottom: 28, right: 36, fontFamily: serif, fontSize: 18,
        color: COLORS.cream }}>
        Acetrillytics <span style={{ color: COLORS.gold }}>Research</span>
      </div>
      <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
        fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#7C84A8' }}>
        Confidential — Personal Research Only
      </div>
    </div>
  )
}
