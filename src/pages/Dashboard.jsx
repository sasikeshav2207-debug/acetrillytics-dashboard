import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function fmt(m) {
  if (!m || !m.available || m.value == null) return '—'
  const v = m.value
  if (m.unit === '%') return `${v.toFixed(2)}%`
  if (m.unit === 'x') return `${v.toFixed(2)}x`
  return v.toFixed(2)
}

const STATUS_COLOR = { active: '#2D7A4F', killed: '#E84040', superseded: '#888', draft: '#B8863A' }

export default function Dashboard() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    (async () => {
      const { data: theses } = await supabase.from('thesis').select('*')
      // Latest thesis per ISIN (highest version).
      const latest = {}
      for (const t of theses || []) {
        if (!latest[t.isin] || (t.version || 0) > (latest[t.isin].version || 0)) latest[t.isin] = t
      }
      const chosen = Object.values(latest)
      const ids = chosen.map((t) => t.thesis_id)
      const { data: metrics } = ids.length
        ? await supabase.from('thesis_snapshot_metric').select('*')
            .in('thesis_id', ids).in('name', ['revenue_cagr_3y', 'roe', 'cfo_pat'])
        : { data: [] }
      const { data: flags } = ids.length
        ? await supabase.from('thesis_snapshot_flag').select('thesis_id,fired')
            .in('thesis_id', ids).eq('fired', true)
        : { data: [] }
      const firedByThesis = {}
      for (const f of flags || []) firedByThesis[f.thesis_id] = (firedByThesis[f.thesis_id] || 0) + 1
      setCards(chosen.map((t) => {
        const m = {}
        for (const row of metrics || []) if (row.thesis_id === t.thesis_id) m[row.name] = row
        return { t, m, fired: firedByThesis[t.thesis_id] || 0 }
      }))
      setLoading(false)
    })()
  }, [])

  if (loading) return <div>Loading…</div>
  if (!cards.length) return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">No theses yet. Sync your local data to Supabase to populate this.</p>
    </div>
  )

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid-cards" style={{ marginTop: 16 }}>
        {cards.map(({ t, m, fired }) => (
          <div key={t.thesis_id} className="card card-hover"
            onClick={() => nav(`/company/${t.isin}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{t.ticker}</h3>
              <span className="badge" style={{ color: STATUS_COLOR[t.status] || '#888',
                borderColor: STATUS_COLOR[t.status] || 'var(--border)' }}>{t.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 14, margin: '14px 0' }}>
              {[['Rev CAGR 3Y', 'revenue_cagr_3y'], ['ROE', 'roe'], ['CFO/PAT', 'cfo_pat']]
                .map(([label, key]) => (
                <div key={key}>
                  <div className="mono" style={{ fontSize: 16 }}>{fmt(m[key])}</div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.6px',
                    color: 'var(--muted)' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
              color: 'var(--muted)' }}>
              <span className="dot" style={{ background: fired ? '#E84040' : '#2D7A4F' }} />
              {fired ? `${fired} forensic flag(s)` : 'Forensic clear'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
