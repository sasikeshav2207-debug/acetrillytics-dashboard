// Shared constants + helpers for the report slide components. All slides are exactly
// 1280x720 and self-contained (data comes from window.__SLIDE_DATA__, no API calls).
export const COLORS = {
  navy: '#1E2764', gold: '#B8863A', green: '#2D7A4F', red: '#E84040',
  cream: '#FAFAF8', surface: '#F5F3EE', border: '#E8E4DE', text: '#1A1A2E', muted: '#666',
}

export const SLIDE_W = 1280
export const SLIDE_H = 720

// A metric map entry is {value, unit, available}.
export function disp(m) {
  if (!m || !m.available || m.value == null) return '—'
  return fmt(m.value, m.unit)
}

export function fmt(v, unit) {
  if (v == null) return '—'
  if (unit === '%') return `${v.toFixed(2)}%`
  if (unit === 'x') return `${v.toFixed(2)}x`
  if (unit === 'INR_cr') return `${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })} cr`
  if (unit === 'INR/share') return `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  return Number(v).toFixed(2)
}

export function num(m) {
  return (m && m.available && m.value != null) ? m.value : null
}

// Full-bleed slide frame.
export function frame(bg = COLORS.cream) {
  return {
    width: SLIDE_W, height: SLIDE_H, background: bg, overflow: 'hidden',
    position: 'relative', fontFamily: "'DM Sans', sans-serif", color: COLORS.text,
    boxSizing: 'border-box',
  }
}

export const serif = "'Playfair Display', serif"
export const mono = "'DM Mono', monospace"

// Background treatments for varied, designer themes (not flat blue everywhere).
export const NAVY_GRAD = 'linear-gradient(135deg, #232C6B 0%, #141A45 55%, #0B0F2B 100%)'
export const CREAM_GRAD =
  'radial-gradient(1100px 600px at 100% -10%, #FFFDF7 0%, #FAF7F0 55%, #F3EEE4 100%)'
export const navyInk = '#0B0F2B'
