export default function KillBar({ label, threshold, currentVal, comparator, available = true }) {
  let fill = '0%', color = '#ccc', statusText = 'No data — monitoring'
  if (available && currentVal != null && threshold != null) {
    if (comparator === '<' || comparator === '<=') {
      const safe = currentVal >= threshold
      fill = `${Math.min(100, Math.round((currentVal / threshold) * 100))}%`
      color = safe ? '#2D7A4F' : '#B8863A'
      statusText = safe
        ? `Clear — ${currentVal.toFixed(2)} vs ${threshold}`
        : `Flagged — ${currentVal.toFixed(2)} below ${threshold}`
    } else {
      const breach = (comparator === '>' && currentVal <= threshold) ||
        (comparator === '>=' && currentVal < threshold) ||
        (comparator === '==' && currentVal !== threshold) ||
        (comparator === '!=' && currentVal === threshold)
      fill = '100%'
      color = breach ? '#B8863A' : '#2D7A4F'
      statusText = `${breach ? 'Flagged' : 'Clear'} — ${currentVal.toFixed(2)} vs ${threshold}`
    }
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ fontWeight: 500, color: '#333' }}>{label}</span>
        <span className="mono" style={{ color }}>{statusText}</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: fill, background: color, borderRadius: 2 }} />
      </div>
    </div>
  )
}
