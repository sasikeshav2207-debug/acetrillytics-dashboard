import { COLORS, frame, serif, mono } from './_shared'

export default function Slide8Closing({ data }) {
  const t = data?.thesis || {}
  // A short closing phrase — first sentence of the thesis statement.
  const phrase = (t.thesis_statement || '').split(/[.;]/)[0].trim() || 'Defensible. Falsifiable.'
  return (
    <div style={frame(COLORS.navy)}>
      <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, padding: '0 120px',
        textAlign: 'center' }}>
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 28, color: COLORS.cream,
          lineHeight: 1.5 }}>
          “{phrase}.”
        </div>
        <div style={{ fontFamily: mono, fontSize: 12, color: COLORS.gold, marginTop: 16 }}>
          {t.thesis_id || ''}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 28, right: 36, fontFamily: serif, fontSize: 18,
        color: COLORS.cream }}>
        Acetrillytics <span style={{ color: COLORS.gold }}>Research</span>
      </div>
    </div>
  )
}
