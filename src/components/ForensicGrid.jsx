export default function ForensicGrid({ flags = [] }) {
  const fired = flags.filter((f) => f.fired).length
  const total = flags.length
  return (
    <div className="card">
      {fired === 0 ? (
        <>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700,
            color: 'var(--green)' }}>{total}/{total}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>All flags clear</div>
        </>
      ) : (
        <div style={{ fontSize: 14, color: 'var(--warn)', fontWeight: 500, marginBottom: 10 }}>
          Review required — {fired} flag{fired > 1 ? 's' : ''} fired
        </div>
      )}
      <div className="grid-forensic">
        {flags.map((f, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--border)',
            borderRadius: 6, padding: '6px 8px', fontSize: 11, color: '#555',
            display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="dot" style={{ width: 6, height: 6,
              background: f.fired ? '#E84040' : '#2D7A4F', flexShrink: 0 }} />
            {f.label}
          </div>
        ))}
      </div>
    </div>
  )
}
