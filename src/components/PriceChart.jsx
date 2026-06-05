import { useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { COLORS } from '../lib/format'

const PERIODS = [['1D', 1], ['1W', 5], ['1M', 21], ['3M', 63], ['1Y', 252], ['Max', 99999]]

// closes: [{date, close}] sorted ascending. metrics: latest_close / high_52w / low_52w numbers.
export default function PriceChart({ closes = [], latestClose, week52High, week52Low }) {
  const [period, setPeriod] = useState('1Y')
  const [exchange, setExchange] = useState('NSE')

  const n = PERIODS.find((p) => p[0] === period)[1]
  const data = closes.slice(Math.max(0, closes.length - n))
  const first = data[0]?.close
  const last = data[data.length - 1]?.close ?? latestClose
  const ret = first && last ? ((last - first) / first) * 100 : null
  const positive = (ret ?? 0) >= 0
  const stroke = positive ? COLORS.green : COLORS.red
  const high = data.length ? Math.max(...data.map((d) => d.close)) : null
  const low = data.length ? Math.min(...data.map((d) => d.close)) : null

  const pos = (latestClose != null && week52High != null && week52Low != null
    && week52High > week52Low)
    ? ((latestClose - week52Low) / (week52High - week52Low)) * 100 : null
  const gainFromLow = (latestClose != null && week52Low) ? ((latestClose - week52Low) / week52Low)
    * 100 : null

  const pill = (active) => ({
    fontSize: 12, padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
    border: `1px solid ${active ? COLORS.gold : COLORS.border}`,
    background: active ? COLORS.gold : 'transparent', color: active ? '#fff' : COLORS.muted,
  })
  const toggle = (active) => ({
    fontSize: 12, padding: '4px 14px', cursor: 'pointer', border: 'none',
    background: active ? COLORS.teal : 'transparent', color: active ? '#fff' : COLORS.muted,
    borderRadius: 999,
  })

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 2, border: `1px solid ${COLORS.border}`,
          borderRadius: 999, padding: 2 }}>
          {['NSE', 'BSE'].map((x) => (
            <button key={x} style={toggle(exchange === x)}
              onClick={() => setExchange(x)}>{x}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PERIODS.map(([label]) => (
            <button key={label} style={pill(period === label)}
              onClick={() => setPeriod(label)}>{label}</button>
          ))}
        </div>
      </div>

      {exchange === 'BSE' ? (
        <div className="muted" style={{ fontSize: 12, padding: '40px 0', textAlign: 'center' }}>
          BSE series not loaded — showing NSE only.
        </div>
      ) : (
        <>
          <div className="mono" style={{ display: 'flex', gap: 18, fontSize: 12,
            margin: '12px 0', color: COLORS.muted }}>
            <span style={{ color: stroke }}>{ret == null ? '—' : `${ret >= 0 ? '+' : ''}${ret.toFixed(2)}%`}</span>
            <span>High ₹{high?.toFixed(2) ?? '—'}</span>
            <span>Low ₹{low?.toFixed(2) ?? '—'}</span>
            <span>Open ₹{first?.toFixed(2) ?? '—'}</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="pcFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={40} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} width={44} />
                <Tooltip />
                <Area type="monotone" dataKey="close" stroke={stroke} fill="url(#pcFill)"
                  strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {pos != null && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11,
            color: COLORS.muted }}>
            <span>52W Low ₹{week52Low.toFixed(2)}</span>
            <span>52W High ₹{week52High.toFixed(2)}</span>
          </div>
          <div style={{ position: 'relative', height: 6, background: COLORS.border,
            borderRadius: 3, margin: '6px 0' }}>
            <div style={{ position: 'absolute', left: `calc(${Math.min(100, Math.max(0, pos))}% - 6px)`,
              top: -3, width: 12, height: 12, borderRadius: '50%', background: COLORS.gold,
              border: '2px solid #fff' }} />
          </div>
          {gainFromLow != null && (
            <div style={{ fontSize: 11, color: COLORS.green }}>
              +{gainFromLow.toFixed(1)}% from 52W low
            </div>
          )}
        </div>
      )}
    </div>
  )
}
