import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { COLORS } from '../lib/format'

const label = { fontSize: 12, color: COLORS.muted, display: 'block', marginBottom: 4 }

export default function AddCompany() {
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState([])
  const [searching, setSearching] = useState(false)
  const [picked, setPicked] = useState(null)        // {isin,name,nse_symbol,bse_code}
  const [registered, setRegistered] = useState([])
  const [selectedIsin, setSelectedIsin] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const debounce = useRef(null)

  const loadRegistered = () => api.getCompanies().then(setRegistered).catch(() => {})
  useEffect(() => { loadRegistered() }, [])

  // Debounced securities-master typeahead (300ms).
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!query.trim() || picked) { setMatches([]); return undefined }
    debounce.current = setTimeout(async () => {
      setSearching(true); setError('')
      try {
        setMatches(await api.searchSecurities(query.trim()))
      } catch (e) {
        setError(e.message)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => debounce.current && clearTimeout(debounce.current)
  }, [query, picked])

  const choose = (m) => {
    setPicked({ isin: m.isin, name: m.name, nse_symbol: m.nse_symbol || '',
      bse_code: m.bse_code || '' })
    setQuery(`${m.nse_symbol || m.isin} — ${m.name}`)
    setMatches([])
  }

  const register = async () => {
    if (!picked) return
    setError(''); setMsg('')
    try {
      const out = await api.createCompany(picked)
      setMsg(`Registered ${out.nse_symbol || out.isin}.`)
      setSelectedIsin(out.isin)
      setPicked(null); setQuery('')
      loadRegistered()
    } catch (e) {
      setError(e.message)
    }
  }

  const setField = (k, v) => setPicked((p) => ({ ...(p || {}), [k]: v }))

  const upload = async () => {
    if (!selectedIsin || !file) return
    setUploading(true); setError(''); setMsg('')
    try {
      const out = await api.uploadFundamentals(selectedIsin, file)
      setMsg(`${out.records_loaded} records loaded (${out.period_range}).`)
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h1>Add Company</h1>
      {error && <div style={{ color: COLORS.red, fontSize: 13, marginBottom: 10 }}>{error}</div>}
      {msg && <div style={{ color: COLORS.green, fontSize: 13, marginBottom: 10 }}>{msg}</div>}

      <h3>Search &amp; register</h3>
      <div className="card" style={{ marginBottom: 16 }}>
        <label style={label}>Search the NSE securities master (name, symbol, or ISIN)</label>
        <div style={{ position: 'relative' }}>
          <input className="input" placeholder="Start typing… e.g. Zydus, ZYDUSLIFE, INE010B01027"
            value={query} onChange={(e) => { setPicked(null); setQuery(e.target.value) }} />
          {matches.length > 0 && (
            <div style={{ position: 'absolute', zIndex: 10, left: 0, right: 0, background: '#fff',
              border: `1px solid ${COLORS.border}`, borderRadius: 8, marginTop: 4,
              maxHeight: 280, overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              {matches.map((m) => (
                <div key={m.isin} onClick={() => choose(m)} style={{ padding: '8px 12px',
                  cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 13 }}>{m.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: COLORS.muted }}>
                    {m.nse_symbol || '—'} · {m.isin}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {searching && <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>Searching…</div>}
        {!picked && query.trim() && !searching && matches.length === 0 && (
          <button className="btn btn-ghost" style={{ marginTop: 8 }}
            onClick={() => setPicked({ isin: '', name: '', nse_symbol: '', bse_code: '' })}>
            Not found — add manually
          </button>
        )}

        {picked && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['isin', 'ISIN'], ['name', 'Name'], ['nse_symbol', 'NSE symbol'],
                ['bse_code', 'BSE code']].map(([f, ph]) => (
                <input key={f} className="input" style={{ flex: 1, minWidth: 130 }} placeholder={ph}
                  value={picked[f] || ''} onChange={(e) => setField(f, e.target.value)} />
              ))}
            </div>
            <button className="btn" style={{ marginTop: 10 }} disabled={!picked.isin || !picked.name}
              onClick={register}>Register Company</button>
          </div>
        )}
        <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
          Not in the list? Type the ISIN and name above to register manually.
        </div>
      </div>

      <h3>Load fundamentals</h3>
      <div className="card">
        <label style={label}>Registered company</label>
        <select className="input" value={selectedIsin}
          onChange={(e) => setSelectedIsin(e.target.value)}>
          <option value="">Select…</option>
          {registered.map((c) => (
            <option key={c.isin} value={c.isin}>{c.nse_symbol || c.isin} — {c.name}</option>
          ))}
        </select>
        <label style={{ ...label, marginTop: 12 }}>Upload Screener Excel (.xlsx)</label>
        <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div style={{ marginTop: 12 }}>
          <button className="btn" disabled={!selectedIsin || !file || uploading}
            onClick={upload}>{uploading ? 'Loading…' : 'Load fundamentals'}</button>
        </div>
      </div>
    </div>
  )
}
