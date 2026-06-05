import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis }
  from 'recharts'
import { COLORS } from '../lib/format'

const SERIES = [
  ['promoter', 'Promoters', '#C2185B'], ['fii', 'FII', '#1976D2'], ['dii', 'DII', '#00897B'],
  ['mf', 'MF', '#2D7A4F'], ['public', 'Public', '#B8863A'],
]

// data: [{quarter, promoter, fii, dii, mf, public}] sorted; empty => not loaded.
export default function ShareholdingTab({ data = [] }) {
  if (!data.length) {
    return <div className="card muted">Shareholding data not yet loaded.</div>
  }
  const latest = data[data.length - 1]
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        marginBottom: 10 }}>
        <span className="badge">{latest.quarter}</span>
        {SERIES.map(([k, label, color]) => latest[k] != null && (
          <span key={k} style={{ fontSize: 12, color: COLORS.muted }}>
            <span className="dot" style={{ background: color }} /> {label} {latest[k]?.toFixed(1)}%
          </span>
        ))}
      </div>
      <div className="card" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            {SERIES.map(([k, label, color]) => (
              <Line key={k} type="monotone" dataKey={k} name={label} stroke={color}
                strokeWidth={2} dot={{ r: 2 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: 12, color: COLORS.gold, marginTop: 8 }}>View details →</div>
    </div>
  )
}
