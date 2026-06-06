import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { COLORS } from '../lib/format'

const label = { fontSize: 12, color: COLORS.muted, display: 'block', marginBottom: 4 }

export default function ImportAngelOne() {
  const [companies, setCompanies] = useState([])
  const [isin, setIsin] = useState('')
  const [totp, setTotp] = useState('')
  const [years, setYears] = useState(4)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.getCompanies().then(setCompanies).catch((e) => setError(e.message)) }, [])

  const run = async () => {
    setBusy(true); setError(''); setResult(null)
    try {
      const out = await api.importOHLCV(isin, totp, { years: Number(years) })
      setResult(out)
    } catch (e) {
      const m = e.message || ''
      setError(/totp|otp|expired/i.test(m) ? `Expired TOTP — try again. (${m})` : m)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1>Import from Angel One</h1>
      <div className="card" style={{ maxWidth: 520 }}>
        <label style={label}>Company</label>
        <select className="input" value={isin} onChange={(e) => setIsin(e.target.value)}>
          <option value="">Select a registered company…</option>
          {companies.map((c) => (
            <option key={c.isin} value={c.isin}>{c.nse_symbol || c.isin} — {c.name}</option>
          ))}
        </select>

        <label style={{ ...label, marginTop: 12 }}>TOTP code</label>
        <input className="input" inputMode="numeric" maxLength={6} value={totp}
          placeholder="6-digit code" onChange={(e) => setTotp(e.target.value.trim())} />
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
          Open your authenticator app and enter the current 6-digit code for Angel One.
        </div>

        <label style={{ ...label, marginTop: 12 }}>Years of history</label>
        <input className="input" type="number" min={1} max={15} value={years}
          onChange={(e) => setYears(e.target.value)} />

        <div style={{ marginTop: 16 }}>
          <button className="btn" disabled={!isin || totp.length < 6 || busy}
            onClick={run}>{busy ? 'Importing…' : 'Import OHLCV'}</button>
        </div>

        {error && <div style={{ color: COLORS.red, fontSize: 13, marginTop: 12 }}>{error}</div>}
        {result && (
          <div style={{ color: COLORS.green, fontSize: 13, marginTop: 12 }}>
            {result.records_imported} bars imported ({result.date_range}).
          </div>
        )}
      </div>
    </div>
  )
}
