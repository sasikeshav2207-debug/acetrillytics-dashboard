// Display helpers shared across tabs. A "metric" is a thesis_snapshot_metric row
// {name, available, value, unit, ...}. No business logic — formatting only.
export function disp(m) {
  if (!m || !m.available || m.value == null) return '—'
  return fmt(m.value, m.unit)
}

export function fmt(v, unit) {
  if (v == null) return '—'
  if (unit === '%') return `${v.toFixed(2)}%`
  if (unit === 'x') return `${v.toFixed(2)}x`
  if (unit === 'INR_cr') return `${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })} cr`
  if (unit === 'INR/share') return `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  return v.toFixed(2)
}

export function num(m) {
  return (m && m.available && m.value != null) ? m.value : null
}

export const COLORS = {
  navy: '#1E2764', gold: '#B8863A', green: '#2D7A4F', red: '#E84040', teal: '#2A9D8F',
  muted: '#666', border: '#E8E4DE', surface: '#F5F3EE',
}
