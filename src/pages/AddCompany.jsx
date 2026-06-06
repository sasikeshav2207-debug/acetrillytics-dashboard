import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { COLORS } from '../lib/format'

const label = { fontSize: 12, color: COLORS.muted, display: 'block', marginBottom: 4 }

export default function AddCompany() {
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState([])
  const [searched, setSearched] = useState(false)
  const [manual, setManual] = useState({ isin: '', name: '', nse_symbol: '', bse_code: '' })
  const [registered, setRegistered] = useState([])
  const [selectedIsin, setSelectedIsin] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)

  const loadRegistered = () => api.getCompanies().then(setRegistered).catch(() => {})
  useEffect(() => { loadRegistered() }, [])

  const search = async () => {
    setError(''); setSearched(true)
    try {
      const { data, error: e } = await supabase
        .from('entity_master')
        .select('isin,name,nse_symbol,bse_code')
        .or(`name.ilike.%${query}%,nse_symbol.ilike.%${query}%,isin.ilike.%${query}%`)
        .limit(20)
      if (e) throw e
      setMatches(data || [])
    } catch (e) {
      setError(e.message)
    }
  }

  const register = async (c) => {
    setError(''); setMsg('')
    try {
      const out = await api.createCompany({
        isin: c.isin, name: c.name, nse_symbol: c.nse_symbol || '',
        bse_code: c.bse_code || '',
      })
      setMsg(`Registered ${out.nse_symbol || out.isin}.`)
      setSelectedIsin(out.isin)
      loadRegistered()
    } catch (e) {
      setError(e.message)
    }
  }

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
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Company name, NSE symbol, or ISIN"
            value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()} />
          <button className="btn" onClick={search} disabled={!query.trim()}>Search</button>
        </div>
        {matches.length > 0 && (
          <table style={{ marginTop: 12 }}>
            <thead><tr><th>Name</th><th>NSE</th><th>ISIN</th><th /></tr></thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.isin}>
                  <td>{m.name}</td>
                  <td className="mono">{m.nse_symbol || '—'}</td>
                  <td className="mono">{m.isin}</td>
                  <td><button className="btn btn-ghost" onClick={() => register(m)}>Register</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {searched && matches.length === 0 && (
          <div style={{ marginTop: 12 }}>
            <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
              No matches — add manually:
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['isin', 'name', 'nse_symbol', 'bse_code'].map((f) => (
                <input key={f} className="input" style={{ flex: 1, minWidth: 120 }} placeholder={f}
                  value={manual[f]} onChange={(e) => setManual({ ...manual, [f]: e.target.value })} />
              ))}
              <button className="btn" disabled={!manual.isin || !manual.name}
                onClick={() => register(manual)}>Register</button>
            </div>
          </div>
        )}
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
