import { COLORS, NAVY_GRAD, SLIDE_H, SLIDE_W, serif, mono } from './_shared'

export default function Slide1Cover({ data }) {
  const t = data?.thesis || {}
  return (
    <div style={{ width: SLIDE_W, height: SLIDE_H, background: NAVY_GRAD, position: 'relative',
      overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
      {/* decorative gold rule + corner accents */}
      <div style={{ position: 'absolute', top: 64, left: 72, width: 64, height: 4,
        background: COLORS.gold }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 320, height: 320,
        background: 'radial-gradient(circle at 100% 0%, rgba(184,134,58,0.20), transparent 70%)' }} />
      <div style={{ position: 'absolute', top: '34%', left: 72 }}>
        <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
          color: COLORS.gold, marginBottom: 14 }}>Equity Research · Investment Thesis</div>
        <div style={{ fontFamily: serif, fontSize: 72, fontWeight: 700, color: COLORS.cream,
          lineHeight: 1 }}>{t.ticker || t.isin || 'Company'}</div>
        <div style={{ fontFamily: mono, fontSize: 22, color: COLORS.gold, marginTop: 16 }}>
          {t.isin || ''}{t.target_fy ? `  ·  Target FY${t.target_fy}` : ''}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 36, left: 72, fontFamily: mono, fontSize: 13,
        color: '#AEB4DA' }}>{(t.created_at || '').slice(0, 10)} · v{t.version ?? 1} · {t.author || ''}</div>
      <div style={{ position: 'absolute', bottom: 36, right: 72, fontFamily: serif, fontSize: 20,
        color: COLORS.cream }}>Acetrillytics <span style={{ color: COLORS.gold }}>Research</span></div>
      <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center',
        fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6E76A8' }}>
        Confidential — Personal Research Only · Not Investment Advice</div>
    </div>
  )
}
