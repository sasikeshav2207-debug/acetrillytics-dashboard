import { COLORS, num, frame, serif, mono } from './_shared'

function killState(k, metrics) {
  const m = metrics[k.target]
  const cur = (m && m.available) ? m.value : null
  if (cur == null || k.threshold == null) return { color: '#BBB', bg: '#F5F5F5',
    text: 'No data', cur: '—' }
  let breach = false
  if (k.comparator === '<' || k.comparator === '<=') breach = cur < k.threshold
  else if (k.comparator === '>' || k.comparator === '>=') breach = cur > k.threshold
  else breach = false
  return breach
    ? { color: COLORS.gold, bg: '#FFF3CD', text: 'Near / firing', cur: cur.toFixed(2) }
    : { color: COLORS.green, bg: '#fff', text: 'Clear', cur: cur.toFixed(2) }
}

export default function Slide7Risks({ data }) {
  const t = data?.thesis || {}
  const metrics = data?.metrics || {}
  const commentary = (t.management_commentary || []).slice(0, 3)
  const kills = (t.kill_criteria || []).slice(0, 4)
  return (
    <div style={{ ...frame(), padding: 48, display: 'flex', gap: 32 }}>
      <div style={{ flex: '0 0 48%' }}>
        <h1 style={{ fontFamily: serif, fontSize: 24, margin: '0 0 20px' }}>Pipeline</h1>
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          <div style={{ position: 'absolute', left: 5, top: 4, bottom: 4, width: 2,
            background: COLORS.border }} />
          {commentary.length === 0 && <div style={{ color: COLORS.muted }}>No commentary.</div>}
          {commentary.map((c, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 22 }}>
              <div style={{ position: 'absolute', left: -19, top: 4, width: 10, height: 10,
                borderRadius: '50%', background: COLORS.gold }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.text}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                {c.source_doc} · {c.source_date} [{c.topic}]
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: '0 0 48%' }}>
        <h1 style={{ fontFamily: serif, fontSize: 24, margin: '0 0 20px' }}>Kill Criteria</h1>
        {kills.length === 0 && <div style={{ color: COLORS.muted }}>No kill criteria.</div>}
        {kills.map((k, i) => {
          const s = killState(k, metrics)
          return (
            <div key={i} style={{ background: s.bg, border: `1px solid ${COLORS.border}`,
              borderLeft: `4px solid ${s.color}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {k.target} {k.comparator} {k.threshold}
                </span>
                <span style={{ fontFamily: mono, fontSize: 12, color: s.color }}>
                  {s.cur} · {s.text}
                </span>
              </div>
              {k.rationale && (
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{k.rationale}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
