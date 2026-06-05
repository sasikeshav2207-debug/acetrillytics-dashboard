import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { supabase } from '../lib/supabase'
import MetricCard from '../components/MetricCard.jsx'
import ForensicGrid from '../components/ForensicGrid.jsx'
import KillBar from '../components/KillBar.jsx'

function disp(m) {
  if (!m || !m.available || m.value == null) return '—'
  const v = m.value
  if (m.unit === '%') return `${v.toFixed(2)}%`
  if (m.unit === 'x') return `${v.toFixed(2)}x`
  if (m.unit === 'INR_cr') return `${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })} cr`
  return v.toFixed(2)
}

const HEADLINE = [['pe_ttm', 'P/E (TTM)'], ['pb_ratio', 'P/B'], ['ev_ebitda', 'EV/EBITDA'],
  ['roce', 'ROCE'], ['roe', 'ROE'], ['opm', 'OPM']]

export default function Company() {
  const { isin } = useParams()
  const [state, setState] = useState(null)

  useEffect(() => {
    (async () => {
      const { data: theses } = await supabase.from('thesis').select('*').eq('isin', isin)
      const t = (theses || []).sort((a, b) => (b.version || 0) - (a.version || 0))[0]
      if (!t) { setState({ missing: true }); return }
      const [{ data: metrics }, { data: flags }, { data: kills }, { data: golden }] =
        await Promise.all([
          supabase.from('thesis_snapshot_metric').select('*').eq('thesis_id', t.thesis_id),
          supabase.from('thesis_snapshot_flag').select('*').eq('thesis_id', t.thesis_id),
          supabase.from('thesis_kill_criterion').select('*').eq('thesis_id', t.thesis_id),
          supabase.from('golden_records').select('field,period_label,value')
            .eq('isin', isin).in('field', ['revenue', 'pat']).eq('period_basis', 'FY'),
        ])
      const m = {}
      for (const row of metrics || []) m[row.name] = row
      const byFy = {}
      for (const r of golden || []) {
        byFy[r.period_label] = byFy[r.period_label] || { fy: r.period_label }
        byFy[r.period_label][r.field] = r.value
      }
      const chart = Object.values(byFy)
        .sort((a, b) => (parseInt(a.fy.replace(/\D/g, '')) - parseInt(b.fy.replace(/\D/g, ''))))
      setState({ t, m, flags: flags || [], kills: kills || [], chart })
    })()
  }, [isin])

  if (!state) return <div>Loading…</div>
  if (state.missing) return <div><h1>{isin}</h1><p className="muted">No thesis found.</p></div>
  const { t, m, flags, kills, chart } = state

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: 0 }}>{t.ticker}</h1>
        <div className="muted" style={{ fontSize: 13 }}>
          Last close <span className="mono">{disp(m.latest_close)}</span> · {t.target_fy}
        </div>
      </div>
      <div className="kicker" style={{ marginTop: 4 }}>{isin}</div>

      <div className="grid-metrics" style={{ marginTop: 16 }}>
        {HEADLINE.map(([key, label]) => (
          <MetricCard key={key} label={label} value={disp(m[key])}
            status={m[key]?.available ? 'neutral' : 'neutral'} />
        ))}
      </div>

      <h3 style={{ marginTop: 24 }}>Revenue &amp; PAT by fiscal year</h3>
      <div className="card" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DE" />
            <XAxis dataKey="fy" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#1E2764" fill="#1E2764" fillOpacity={0.12} />
            <Area type="monotone" dataKey="pat" stroke="#B8863A" fill="#B8863A" fillOpacity={0.18} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <h3 style={{ marginTop: 24 }}>Forensic health</h3>
      <ForensicGrid flags={flags.map((f) => ({
        label: f.code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        fired: f.fired,
      }))} />

      <h3 style={{ marginTop: 24 }}>Kill criteria</h3>
      <div className="card">
        {kills.length === 0 && <div className="muted">No kill criteria recorded.</div>}
        {kills.map((k, i) => (
          <KillBar key={i} label={k.target} threshold={k.threshold}
            currentVal={m[k.target]?.available ? m[k.target].value : null}
            comparator={k.comparator} available={!!m[k.target]?.available} />
        ))}
      </div>
    </div>
  )
}
