import { useState } from 'react'
import { COLORS, num } from '../lib/format'

const BADGE = {
  Bullish: ['#D4EDDA', '#1A4731'], 'Mildly Bullish': ['#FFF3CD', '#7A4E1A'],
  Neutral: ['#F0F0F0', '#555'], 'Mildly Bearish': ['#FFE5CC', '#7A3E1A'],
  Bearish: ['#FDECEA', '#7A1A1A'], '—': ['#F0F0F0', '#999'],
}
function Badge({ status }) {
  const [bg, fg] = BADGE[status] || BADGE['—']
  return <span style={{ background: bg, color: fg, fontSize: 10, fontWeight: 500,
    padding: '2px 8px', borderRadius: 999 }}>{status}</span>
}

function rsiStatus(v) {
  if (v == null) return '—'
  if (v >= 70) return 'Mildly Bearish'
  if (v <= 30) return 'Mildly Bullish'
  if (v >= 55) return 'Mildly Bullish'
  if (v <= 45) return 'Mildly Bearish'
  return 'Neutral'
}

export default function TechnicalsTab({ metrics }) {
  const [maType, setMaType] = useState('Simple')
  const price = num(metrics.latest_close)
  const sma = { 5: null, 10: null, 20: null, 50: num(metrics.sma_50_daily), 100: null,
    200: num(metrics.sma_200_daily) }
  const exp = maType === 'Exponential'  // engine has no EMA → all blank under that tab

  const below = Object.entries(sma).filter(([, v]) => v != null && price != null && price < v)
    .map(([k]) => `${k} SMA`)
  const above = Object.entries(sma).filter(([, v]) => v != null && price != null && price >= v)
    .map(([k]) => `${k} SMA`)
  const insight = (above.length || below.length)
    ? `Price is trading ${above.length ? 'above ' + above.join(', ') : ''}`
      + `${above.length && below.length ? ' and ' : ''}`
      + `${below.length ? 'below ' + below.join(', ') : ''}.`
    : 'Insufficient moving-average data.'

  const up = num(metrics.bollinger_upper_daily), mid = num(metrics.bollinger_mid_daily),
    low = num(metrics.bollinger_lower_daily)
  let bbStatus = '—', dotPct = 50
  if (up != null && low != null && price != null && up > low) {
    dotPct = Math.min(100, Math.max(0, ((price - low) / (up - low)) * 100))
    bbStatus = price > up ? 'Mildly Bearish' : (price < low ? 'Mildly Bullish' : 'Neutral')
  }

  const cell = (k) => {
    const v = exp ? null : sma[k]
    const color = (v != null && price != null) ? (price < v ? COLORS.red : COLORS.green)
      : COLORS.muted
    return (
      <div key={k} style={{ textAlign: 'center', padding: '8px 4px',
        border: `1px solid ${COLORS.border}`, borderRadius: 6 }}>
        <div style={{ fontSize: 10, color: COLORS.muted }}>{k}</div>
        <div className="mono" style={{ fontSize: 13, color }}>{v != null ? v.toFixed(1) : '—'}</div>
      </div>
    )
  }

  const indicator = (name, value, status) => (
    <div key={name} style={{ display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${COLORS.border}` }}>
      <span style={{ fontSize: 12 }}>{name}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="mono" style={{ fontSize: 12 }}>{value}</span>
        <Badge status={status} />
      </span>
    </div>
  )
  const rsi = num(metrics.rsi_14_daily)

  return (
    <div>
      {/* Section A — Moving averages */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        {['Simple', 'Exponential'].map((t) => (
          <span key={t} onClick={() => setMaType(t)} style={{ cursor: 'pointer', fontSize: 13,
            paddingBottom: 3, color: maType === t ? COLORS.gold : COLORS.muted,
            borderBottom: maType === t ? `2px solid ${COLORS.gold}` : 'none' }}>{t}</span>
        ))}
      </div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6 }}>
          {[5, 10, 20, 50, 100, 200].map(cell)}
        </div>
        <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 10 }}>
          {exp ? 'Exponential moving averages are not computed.' : insight}
        </div>
      </div>

      {/* Section B — Bollinger bands */}
      <h3 style={{ marginTop: 22 }}>Bollinger bands</h3>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Badge status={bbStatus} />
        <div style={{ position: 'relative', width: 14, height: 120, background:
          `linear-gradient(${COLORS.green}, ${COLORS.border}, ${COLORS.red})`, borderRadius: 7 }}>
          {bbStatus !== '—' && (
            <div style={{ position: 'absolute', left: -3, width: 20, height: 20, borderRadius: '50%',
              background: COLORS.navy, border: '2px solid #fff',
              bottom: `calc(${dotPct}% - 10px)` }} />
          )}
        </div>
        <div className="mono" style={{ fontSize: 12, lineHeight: 1.9 }}>
          <div>Upper ₹{up?.toFixed(2) ?? '—'}</div>
          <div>Middle ₹{mid?.toFixed(2) ?? '—'}</div>
          <div>Lower ₹{low?.toFixed(2) ?? '—'}</div>
        </div>
      </div>

      {/* Section C — Indicator grid */}
      <h3 style={{ marginTop: 22 }}>Indicators</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        <div className="card">
          <div className="kicker" style={{ marginBottom: 4 }}>Momentum</div>
          {indicator('RSI (14)', rsi != null ? rsi.toFixed(1) : '—', rsiStatus(rsi))}
          {indicator('Stochastic (14)', '—', '—')}
          {indicator('CCI (14)', '—', '—')}
        </div>
        <div className="card">
          <div className="kicker" style={{ marginBottom: 4 }}>Volume</div>
          {indicator('OBV', '—', '—')}
          {indicator('MFI', '—', '—')}
          {indicator('VWAP', '—', '—')}
        </div>
      </div>
      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>
        Indicators shown as "—" are not yet computed by the engine.
      </div>
    </div>
  )
}
