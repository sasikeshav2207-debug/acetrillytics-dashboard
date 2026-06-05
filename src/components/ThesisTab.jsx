import { COLORS } from '../lib/format'
import KillBar from './KillBar.jsx'

export default function ThesisTab({ thesis, kills = [], scenarios = [], commentary = [], metrics = {} }) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Thesis</h3>
      <div className="card" style={{ fontStyle: 'italic', lineHeight: 1.55 }}>
        {thesis?.thesis_statement || 'No thesis statement.'}
      </div>

      <h3 style={{ marginTop: 22 }}>Kill criteria</h3>
      <div className="card">
        {kills.length === 0 && <div className="muted">No kill criteria recorded.</div>}
        {kills.map((k, i) => (
          <KillBar key={i} label={k.target} threshold={k.threshold}
            currentVal={metrics[k.target]?.available ? metrics[k.target].value : null}
            comparator={k.comparator} available={!!metrics[k.target]?.available} />
        ))}
        {thesis?.kill_rationale && (
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8 }}>{thesis.kill_rationale}</div>
        )}
      </div>

      <h3 style={{ marginTop: 22 }}>Scenarios</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {scenarios.length === 0 && <div className="card muted" style={{ flex: 1 }}>No scenarios.</div>}
        {scenarios.map((s, i) => {
          const km = s.key_metrics_json || {}
          return (
            <div key={i} className="card" style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 600, textTransform: 'uppercase', color: COLORS.navy }}>
                {s.scenario}
              </div>
              <div className="mono" style={{ fontSize: 13, margin: '8px 0' }}>
                {Object.entries(km).map(([k, v]) => (
                  <div key={k}>{k}: <b>{String(v)}</b></div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>{s.rationale}</div>
            </div>
          )
        })}
      </div>
      {scenarios.length > 0 && (
        <div style={{ fontSize: 11, color: COLORS.red, fontWeight: 500, marginTop: 8 }}>
          AUTHOR PROJECTIONS — NOT FACTS
        </div>
      )}

      <h3 style={{ marginTop: 22 }}>Management commentary</h3>
      <div className="card">
        {commentary.length === 0 && <div className="muted">No commentary recorded.</div>}
        {commentary.map((c, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontStyle: 'italic' }}>“{c.text}”</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>
              — {c.source_doc}, {c.source_date} [{c.topic}]
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
