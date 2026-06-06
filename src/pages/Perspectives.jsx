import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { COLORS } from '../lib/format'

const STANCE = {
  bull: ['#D4EDDA', '#1A4731'], neutral: ['#F0F0F0', '#555'], bear: ['#FDECEA', '#7A1A1A'],
}
function Badge({ stance }) {
  const [bg, fg] = STANCE[stance] || STANCE.neutral
  return <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 500,
    padding: '2px 10px', borderRadius: 999, textTransform: 'capitalize' }}>{stance || '—'}</span>
}

export default function Perspectives() {
  const [companies, setCompanies] = useState([])
  const [isin, setIsin] = useState('')
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.getCompanies().then(setCompanies).catch((e) => setError(e.message)) }, [])

  const run = async (value) => {
    setIsin(value); setOut(null); setError('')
    if (!value) return
    setBusy(true)
    try {
      setOut(await api.getPerspectives(value))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const lenses = out?.lenses || []

  return (
    <div>
      <h1>Perspectives — multiple analytical lenses</h1>
      <p className="muted" style={{ fontSize: 13 }}>
        How different schools of investors would read the same company, from its own verified
        data. A learning aid — analytical opinion, not verified fact, not advice.
      </p>
      <select className="input" style={{ maxWidth: 360 }} value={isin}
        onChange={(e) => run(e.target.value)}>
        <option value="">Select a company…</option>
        {companies.map((c) => (
          <option key={c.isin} value={c.isin}>{c.nse_symbol || c.isin} — {c.name}</option>
        ))}
      </select>

      {busy && <div style={{ marginTop: 16 }} className="muted">Reading through each lens (LLM)…</div>}
      {error && <div style={{ color: COLORS.red, fontSize: 13, marginTop: 12 }}>{error}</div>}

      {lenses.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
            {lenses.map((l, i) => (
              <div key={i} className="card" style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 6 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{l.lens}</h3>
                  <Badge stance={l.stance} />
                </div>
                <div style={{ fontStyle: 'italic', fontSize: 13, color: '#444', marginBottom: 8 }}>
                  {l.summary}
                </div>
                {l.bull_points?.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.green }}>For</div>
                    <ul style={{ margin: '4px 0 8px', paddingLeft: 18, fontSize: 12 }}>
                      {l.bull_points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  </>
                )}
                {l.bear_points?.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.red }}>Against</div>
                    <ul style={{ margin: '4px 0 8px', paddingLeft: 18, fontSize: 12 }}>
                      {l.bear_points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  </>
                )}
                {l.metrics_emphasised?.length > 0 && (
                  <div style={{ fontSize: 11, color: COLORS.muted }}>
                    Watches: {l.metrics_emphasised.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
          {out.disagreements?.length > 0 && (
            <>
              <h3>Where they disagree</h3>
              <ul style={{ fontSize: 13 }}>
                {out.disagreements.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </>
          )}
          {out.what_to_watch?.length > 0 && (
            <>
              <h3>What would resolve the debate</h3>
              <ul style={{ fontSize: 13 }}>
                {out.what_to_watch.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  )
}
