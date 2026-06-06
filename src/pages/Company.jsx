import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { COLORS, disp, num } from '../lib/format'
import MetricCard from '../components/MetricCard.jsx'
import PriceChart from '../components/PriceChart.jsx'
import RatingsPanel from '../components/RatingsPanel.jsx'
import FinancialsTab from '../components/FinancialsTab.jsx'
import TechnicalsTab from '../components/TechnicalsTab.jsx'
import ShareholdingTab from '../components/ShareholdingTab.jsx'
import ThesisTab from '../components/ThesisTab.jsx'

const TABS = ['Overview', 'Financials', 'Shareholding', 'Technicals', 'Thesis']
const HEADLINE = [['pe_ttm', 'P/E (TTM)'], ['pb_ratio', 'P/B'], ['ev_ebitda', 'EV/EBITDA'],
  ['roce', 'ROCE'], ['roe', 'ROE'], ['opm', 'OPM']]

export default function Company() {
  const { isin } = useParams()
  const [tab, setTab] = useState('Overview')
  const [s, setS] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // LIVE metrics from the API (latest REPORTED fiscal year) — not the frozen thesis
      // snapshot, so growth/leverage/valuation always reflect current reported data.
      const m = {}
      let period = ''
      try {
        const ms = await api.getMetrics(isin)
        period = ms.period || ''
        for (const r of ms.metrics || []) {
          m[r.name] = { name: r.name, available: r.available, value: r.value, unit: r.unit }
        }
      } catch (e) {
        if (!cancelled) setErr(e.message)
      }
      // Thesis (optional) — for the Thesis tab + status pill. Children from Supabase.
      const { data: theses } = await supabase.from('thesis').select('*').eq('isin', isin)
      const t = (theses || []).sort((a, b) => (b.version || 0) - (a.version || 0))[0] || null
      let kills = [], scenarios = [], commentary = []
      if (t) {
        const tid = t.thesis_id
        const [killsR, scenR, commR] = await Promise.all([
          supabase.from('thesis_kill_criterion').select('*').eq('thesis_id', tid),
          supabase.from('thesis_scenario').select('*').eq('thesis_id', tid),
          supabase.from('thesis_management_commentary').select('*').eq('thesis_id', tid),
        ])
        kills = killsR.data || []; scenarios = scenR.data || []; commentary = commR.data || []
      }
      // Annual P&L + price closes from the golden store (live).
      const [goldR, closeR] = await Promise.all([
        supabase.from('golden_records').select('field,period_label,value')
          .eq('isin', isin).in('field', ['revenue', 'pat', 'ebit']).eq('period_basis', 'FY'),
        supabase.from('golden_records').select('period_label,value')
          .eq('isin', isin).eq('field', 'close').eq('period_basis', 'POINT')
          .order('period_label', { ascending: false }).limit(2000),
      ])
      const byFy = {}
      for (const r of goldR.data || []) {
        byFy[r.period_label] = byFy[r.period_label] || { fy: r.period_label }
        byFy[r.period_label][r.field === 'ebit' ? 'op_profit' : r.field] = r.value
      }
      const fy = Object.values(byFy).sort((a, b) =>
        parseInt(a.fy.replace(/\D/g, '')) - parseInt(b.fy.replace(/\D/g, '')))
      const closes = (closeR.data || []).map((r) => ({
        date: r.period_label.replace(/^AT/, ''), close: r.value,
      })).sort((a, b) => a.date.localeCompare(b.date))
      if (!cancelled) setS({ t, m, period, kills, scenarios, commentary, fy, closes })
    })()
    return () => { cancelled = true }
  }, [isin])

  if (!s) return <div>Loading…</div>
  const { t, m, period } = s
  const ticker = t?.ticker || isin

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: 0 }}>{ticker}</h1>
        <div className="muted" style={{ fontSize: 13 }}>
          Last close <span className="mono">{disp(m.latest_close)}</span>{period ? ` · ${period}` : ''}
        </div>
      </div>
      <div className="kicker" style={{ marginTop: 4 }}>{isin}</div>
      {err && <div style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>{err}</div>}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 22, borderBottom: `1px solid ${COLORS.border}`,
        margin: '16px 0 20px' }}>
        {TABS.map((x) => (
          <span key={x} onClick={() => setTab(x)} style={{ cursor: 'pointer', fontSize: 14,
            paddingBottom: 8, color: tab === x ? COLORS.gold : COLORS.muted,
            fontWeight: tab === x ? 500 : 400,
            borderBottom: tab === x ? `2px solid ${COLORS.gold}` : '2px solid transparent' }}>
            {x}
          </span>
        ))}
      </div>

      {tab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
          <div>
            <PriceChart closes={s.closes} latestClose={num(m.latest_close)}
              week52High={num(m.high_52w)} week52Low={num(m.low_52w)} />
            <div className="grid-metrics" style={{ marginTop: 16 }}>
              {HEADLINE.map(([k, label]) => (
                <MetricCard key={k} label={label} value={disp(m[k])} />
              ))}
            </div>
          </div>
          <RatingsPanel metrics={m} status={t?.status || 'No data'} />
        </div>
      )}
      {tab === 'Financials' && <FinancialsTab metrics={m} fy={s.fy} />}
      {tab === 'Shareholding' && <ShareholdingTab isin={isin} />}
      {tab === 'Technicals' && <TechnicalsTab metrics={m} />}
      {tab === 'Thesis' && (
        t ? (
          <ThesisTab thesis={t} kills={s.kills} scenarios={s.scenarios}
            commentary={s.commentary} metrics={m} />
        ) : (
          <div className="card muted">No thesis recorded for this company yet.</div>
        )
      )}
    </div>
  )
}
