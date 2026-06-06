// Reusable slide design-system: a themed full-bleed frame + infographic widgets.
// All 1280x720, self-contained, print-friendly (no animations).
import { COLORS, CREAM_GRAD, NAVY_GRAD, SLIDE_H, SLIDE_W, serif, mono } from './_shared'

// ---- Themed frame with a header band + gold accent rule + page marker ----
export function SlideFrame({ theme = 'cream', kicker, title, page, children, pad = 56 }) {
  const dark = theme === 'navy'
  const bg = dark ? NAVY_GRAD : CREAM_GRAD
  const ink = dark ? COLORS.cream : COLORS.text
  const sub = dark ? '#AEB4DA' : COLORS.muted
  return (
    <div style={{ width: SLIDE_W, height: SLIDE_H, background: bg, position: 'relative',
      overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", color: ink, boxSizing: 'border-box',
      padding: pad }}>
      {/* gold accent bar, top-left */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: '100%',
        background: `linear-gradient(${COLORS.gold}, ${dark ? '#6E5224' : '#E3C68A'})` }} />
      {(title || kicker) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          borderBottom: `1px solid ${dark ? '#3A4178' : COLORS.border}`, paddingBottom: 12,
          marginBottom: 22 }}>
          <div>
            {kicker && <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
              color: COLORS.gold, marginBottom: 4 }}>{kicker}</div>}
            <h1 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, margin: 0,
              color: ink }}>{title}</h1>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: sub }}>
            <div style={{ fontFamily: serif, fontSize: 14 }}>
              Acetrillytics <span style={{ color: COLORS.gold }}>Research</span>
            </div>
            {page && <div className="mono" style={{ marginTop: 2 }}>{page} / 8</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

// ---- Big-number stat card with optional trend arrow + accent ----
export function StatCard({ label, value, sub, accent = COLORS.gold, trend, dark = false,
  big = 46 }) {
  const arrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''
  const arrowColor = trend === 'up' ? COLORS.green : trend === 'down' ? COLORS.red : accent
  return (
    <div style={{ position: 'relative', background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
      border: `1px solid ${dark ? '#3A4178' : COLORS.border}`, borderRadius: 16, padding: '20px 22px',
      boxShadow: dark ? 'none' : '0 1px 3px rgba(20,26,69,0.06)' }}>
      <div style={{ position: 'absolute', top: 18, right: 18, width: 9, height: 9,
        borderRadius: '50%', background: accent }} />
      <div style={{ fontFamily: mono, fontSize: big, fontWeight: 500, lineHeight: 1,
        color: dark ? COLORS.cream : COLORS.navy }}>
        {arrow && <span style={{ fontSize: big * 0.42, color: arrowColor, marginRight: 8 }}>{arrow}</span>}
        {value}
      </div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
        color: dark ? '#AEB4DA' : COLORS.muted, marginTop: 12 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: dark ? '#8A90BE' : COLORS.muted,
        marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ---- 52-week range bar with current-price dot ----
export function RangeBar({ low, high, cur }) {
  if (low == null || high == null || cur == null || high <= low) return null
  const pct = Math.min(100, Math.max(0, ((cur - low) / (high - low)) * 100))
  const gain = low ? ((cur - low) / low) * 100 : null
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11,
        color: COLORS.muted, marginBottom: 6 }}>
        <span>52W Low ₹{low.toFixed(0)}</span><span>52W High ₹{high.toFixed(0)}</span>
      </div>
      <div style={{ position: 'relative', height: 8, borderRadius: 4,
        background: 'linear-gradient(90deg,#E84040,#E3C68A,#2D7A4F)' }}>
        <div style={{ position: 'absolute', left: `calc(${pct}% - 8px)`, top: -4, width: 16,
          height: 16, borderRadius: '50%', background: COLORS.navy, border: '3px solid #fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
      </div>
      {gain != null && <div style={{ fontSize: 11, color: COLORS.green, marginTop: 6 }}>
        +{gain.toFixed(1)}% from 52W low</div>}
    </div>
  )
}

// ---- RSI semicircle gauge (0-100) ----
export function RSIGauge({ value }) {
  const v = (value == null) ? null : Math.max(0, Math.min(100, value))
  const ang = v == null ? 180 : 180 - (v / 100) * 180  // 0->left(180deg), 100->right(0deg)
  const r = 80, cx = 100, cy = 100
  const rad = (ang * Math.PI) / 180
  const nx = cx + r * Math.cos(rad), ny = cy - r * Math.sin(rad)
  const arc = (a0, a1, color) => {
    const p0 = [cx + r * Math.cos((a0 * Math.PI) / 180), cy - r * Math.sin((a0 * Math.PI) / 180)]
    const p1 = [cx + r * Math.cos((a1 * Math.PI) / 180), cy - r * Math.sin((a1 * Math.PI) / 180)]
    return <path d={`M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`}
      stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" />
  }
  return (
    <svg viewBox="0 0 200 120" style={{ width: 220 }}>
      {arc(180, 126, COLORS.green)}{/* 0-30 oversold/bullish */}
      {arc(126, 54, '#C9A84C')}{/* 30-70 neutral */}
      {arc(54, 0, COLORS.red)}{/* 70-100 overbought */}
      {v != null && <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={COLORS.navy} strokeWidth={3} />}
      {v != null && <circle cx={cx} cy={cy} r={6} fill={COLORS.navy} />}
      <text x={cx} y={cy - 22} textAnchor="middle" fontFamily="DM Mono"
        fontSize={26} fill={COLORS.navy}>{v == null ? '—' : v.toFixed(0)}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={11} fill={COLORS.muted}>RSI (14)</text>
    </svg>
  )
}

export function Callout({ label, value, dark = false }) {
  return (
    <div style={{ flex: 1, background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
      border: `1px solid ${dark ? '#3A4178' : COLORS.border}`, borderRadius: 12, padding: 16 }}>
      <div className="mono" style={{ fontSize: 22, color: dark ? COLORS.cream : COLORS.navy }}>
        {value}</div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8,
        color: COLORS.muted, marginTop: 6 }}>{label}</div>
    </div>
  )
}
