import { COLORS, NAVY_GRAD, SLIDE_H, SLIDE_W, serif, mono } from './_shared'

export default function Slide8Closing({ data }) {
  const t = data?.thesis || {}
  const phrase = (t.thesis_statement || '').split(/[.;]/)[0].trim() || 'Defensible. Falsifiable.'
  return (
    <div style={{ width: SLIDE_W, height: SLIDE_H, background: NAVY_GRAD, position: 'relative',
      overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: 'absolute', top: '34%', left: 0, right: 0, padding: '0 130px',
        textAlign: 'center' }}>
        <div style={{ width: 56, height: 4, background: COLORS.gold, margin: '0 auto 28px' }} />
        <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 30, color: COLORS.cream,
          lineHeight: 1.5 }}>“{phrase}.”</div>
        <div style={{ fontFamily: mono, fontSize: 13, color: COLORS.gold, marginTop: 22 }}>
          {t.thesis_id || ''}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 36, right: 72, fontFamily: serif, fontSize: 20,
        color: COLORS.cream }}>Acetrillytics <span style={{ color: COLORS.gold }}>Research</span></div>
      <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center',
        fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6E76A8' }}>
        Numbers are deterministic · Narration is reviewed · Not investment advice</div>
    </div>
  )
}
