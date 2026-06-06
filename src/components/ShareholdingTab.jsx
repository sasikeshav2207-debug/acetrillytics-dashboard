import { useEffect, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis }
  from 'recharts'
import { COLORS } from '../lib/format'
import { api } from '../lib/api'

const SERIES = [
  ['promoter', 'Promoters', '#C2185B'], ['fii', 'FII', '#1976D2'], ['dii', 'DII', '#00897B'],
  ['mf', 'MF', '#2D7A4F'], ['public', 'Public', '#B8863A'],
]

// Fetches fresh shareholding from BSE (via the API) on mount, then renders the 5-series chart.
export default function ShareholdingTab({ isin }) {
  const [rows, setRows] = useState(null)   // null = loading
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setRows(null); setError('')
    api.getShareholding(isin)
      .then((res) => {
        if (cancelled) return
        const quarters = res.quarters || []
        const series = res.series || {}
        // Pivot {series:{promoter:[...]}, quarters:[...]} -> [{quarter, promoter, fii, ...}]
        setRows(quarters.map((q, i) => ({
          quarter: q,
          promoter: series.promoter?.[i] ?? null,
          fii: series.fii?.[i] ?? null,
          dii: series.dii?.[i] ?? null,
          mf: series.mf?.[i] ?? null,
          public: series.public?.[i] ?? null,
        })))
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [isin])

  if (error) {
    return <div className="card muted">BSE data unavailable — try again later.</div>
  }
  if (rows === null) {
    return (
      <div className="card muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="dot" style={{ background: COLORS.gold }} /> Fetching from BSE…
      </div>
    )
  }
  if (!rows.length) {
    return <div className="card muted">No shareholding data available for this company.</div>
  }

  const latest = rows[rows.length - 1]
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
          <LineChart data={rows} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {SERIES.map(([k, label, color]) => (
              <Line key={k} type="monotone" dataKey={k} name={label} stroke={color}
                strokeWidth={2} dot={{ r: 2 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
