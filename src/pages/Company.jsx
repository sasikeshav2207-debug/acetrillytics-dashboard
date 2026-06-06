import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
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
const SH_FIELDS = ['promoter_holding', 'fii_holding', 'dii_holding', 'mf_holding', 'public_holding']

export default function Company() {
  const { isin } = useParams()
  const [tab, setTab] = useState('Overview')
  const [s, setS] = useState(null)

  useEffect(() => {
    (async () => {
      const { data: theses } = await supabase.from('thesis').select('*').eq('isin', isin)
      const t = (theses || []).sort((a, b) => (b.version || 0) - (a.version || 0))[0]
      if (!t) { setS({ missing: true }); return }
      const tid = t.thesis_id
      const [metricsR, flagsR, killsR, scenR, commR, goldR, closeR, shR] = await Promise.all([
        supabase.from('thesis_snapshot_metric').select('*').eq('thesis_id', tid),
        supabase.from('thesis_snapshot_flag').select('*').eq('thesis_id', tid),
        supabase.from('thesis_kill_criterion').select('*').eq('thesis_id', tid),
        supabase.from('thesis_scenario').select('*').eq('thesis_id', tid),
        supabase.from('thesis_management_commentary').select('*').eq('thesis_id', tid),
        supabase.from('golden_records').select('field,period_label,value')
          .eq('isin', isin).in('field', ['revenue', 'pat', 'ebit']).eq('period_basis', 'FY'),
        supabase.from('golden_records').select('period_label,value')
          .eq('isin', isin).eq('field', 'close').eq('period_basis', 'POINT')
          .order('period_label', { ascending: false }).limit(1000),
        supabase.from('golden_records').select('field,period_label,value')
          .eq('isin', isin).in('field', SH_FIELDS),
      ])
      const m = {}
      for (const r of metricsR.data || []) m[r.name] = r
      // Annual P&L
      const byFy = {}
      for (const r of goldR.data || []) {
        byFy[r.period_label] = byFy[r.period_label] || { fy: r.period_label }
        byFy[r.period_label][r.field === 'ebit' ? 'op_profit' : r.field] = r.value
      }
      const fy = Object.values(byFy).sort((a, b) =>
        parseInt(a.fy.replace(/\D/g, '')) - parseInt(b.fy.replace(/\D/g, '')))
      // Price closes ascending
      const closes = (closeR.data || []).map((r) => ({
        date: r.period_label.replace(/^AT/, ''), close: r.value,
      })).sort((a, b) => a.date.localeCompare(b.date))
      // Shareholding (likely empty)
      const shByQ = {}
      for (const r of shR.data || []) {
        shByQ[r.period_label] = shByQ[r.period_label] || { quarter: r.period_label }
        shByQ[r.period_label][r.field.replace('_holding', '')] = r.value
      }
      const shareholding = Object.values(shByQ)
      setS({ t, m, flags: flagsR.data || [], kills: killsR.data || [],
        scenarios: scenR.data || [], commentary: commR.data || [], fy, closes, shareholding })
    })()
  }, [isin])

  if (!s) return <div>Loading…</div>
  if (s.missing) return <div><h1>{isin}</h1><p className="muted">No thesis found.</p></div>
  const { t, m } = s

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: 0 }}>{t.ticker}</h1>
        <div className="muted" style={{ fontSize: 13 }}>
          Last close <span className="mono">{disp(m.latest_close)}</span> · {t.target_fy}
        </div>
      </div>
      <div className="kicker" style={{ marginTop: 4 }}>{isin}</div>

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
          <RatingsPanel metrics={m} status={t.status} />
        </div>
      )}
      {tab === 'Financials' && <FinancialsTab metrics={m} fy={s.fy} />}
      {tab === 'Shareholding' && <ShareholdingTab isin={isin} />}
      {tab === 'Technicals' && <TechnicalsTab metrics={m} />}
      {tab === 'Thesis' && (
        <ThesisTab thesis={t} kills={s.kills} scenarios={s.scenarios}
          commentary={s.commentary} metrics={m} />
      )}
    </div>
  )
}
