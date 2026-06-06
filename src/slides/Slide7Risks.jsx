import { COLORS, mono } from './_shared'
import { SlideFrame } from './_widgets'

function killState(k, metrics) {
  const m = metrics[k.target]
  const cur = (m && m.available) ? m.value : null
  if (cur == null || k.threshold == null) {
    return { color: '#BBB', bg: '#F4F4F4', text: 'No data', cur: '—', fill: 0 }
  }
  let breach = false
  if (k.comparator === '<' || k.comparator === '<=') breach = cur < k.threshold
  else if (k.comparator === '>' || k.comparator === '>=') breach = cur > k.threshold
  const fill = Math.max(8, Math.min(100, k.threshold ? (cur / k.threshold) * 100 : 50))
  return breach
    ? { color: COLORS.red, bg: '#FDECEA', text: 'At risk', cur: cur.toFixed(2), fill }
    : { color: COLORS.green, bg: '#fff', text: 'Clear', cur: cur.toFixed(2), fill }
}

export default function Slide7Risks({ data }) {
  const t = data?.thesis || {}
  const metrics = data?.metrics || {}
  const commentary = (t.management_commentary || []).slice(0, 3)
  const kills = (t.kill_criteria || []).slice(0, 4)
  return (
    <SlideFrame theme="cream" kicker="What could break it" title="Pipeline & Kill Criteria" page={7}>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: '0 0 48%' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
            color: COLORS.muted, marginBottom: 14 }}>Management commentary</div>
          <div style={{ position: 'relative', paddingLeft: 22 }}>
            <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 2,
              background: COLORS.border }} />
            {commentary.length === 0 && <div style={{ color: COLORS.muted }}>No commentary.</div>}
            {commentary.map((c, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
                <div style={{ position: 'absolute', left: -21, top: 4, width: 11, height: 11,
                  borderRadius: '50%', background: COLORS.gold, border: '2px solid #fff' }} />
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>“{c.text}”</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>
                  — {c.source_doc} · {c.source_date} [{c.topic}]</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: '0 0 48%' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
            color: COLORS.muted, marginBottom: 14 }}>Kill criteria</div>
          {kills.length === 0 && <div style={{ color: COLORS.muted }}>No kill criteria.</div>}
          {kills.map((k, i) => {
            const s = killState(k, metrics)
            return (
              <div key={i} style={{ background: s.bg, border: `1px solid ${COLORS.border}`,
                borderLeft: `4px solid ${s.color}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {k.target} {k.comparator} {k.threshold}</span>
                  <span className="mono" style={{ fontSize: 12, color: s.color }}>
                    {s.cur} · {s.text}</span>
                </div>
                <div style={{ height: 5, background: COLORS.border, borderRadius: 3, marginTop: 8 }}>
                  <div style={{ height: '100%', width: `${s.fill}%`, background: s.color,
                    borderRadius: 3 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SlideFrame>
  )
}
