const STATUS = {
  up: { bg: '#D4EDDA', text: '#1A4731', dot: '#2D7A4F' },
  warn: { bg: '#FFF3CD', text: '#7A4E1A', dot: '#B8863A' },
  neutral: { bg: '#F5F3EE', text: '#333', dot: '#888' },
}

export default function MetricCard({ label, value, sub, status = 'neutral' }) {
  const c = STATUS[status] || STATUS.neutral
  return (
    <div style={{ background: c.bg, border: '1px solid var(--border)', borderRadius: 10,
      padding: '14px 16px', minWidth: 120 }}>
      <span className="dot" style={{ background: c.dot, marginRight: 6 }} />
      <div className="mono" style={{ fontSize: 20, fontWeight: 500, color: c.text }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.7px',
        color: 'var(--muted)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}
