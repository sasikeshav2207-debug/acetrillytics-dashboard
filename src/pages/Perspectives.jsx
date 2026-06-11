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

// Verbatim management quotes from the last few earnings calls, grouped by call (newest first).
function ManagementSays({ says, note }) {
  const calls = says || []
  return (
    <div style={{ marginTop: 18 }}>
      <h3 style={{ margin: '0 0 4px' }}>What did management say?</h3>
      <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
        Verbatim quotes from the last {calls.length || 'few'} earnings call{calls.length === 1 ? '' : 's'},
        straight from the BSE transcripts — management representations, not verified facts.
      </div>
      {calls.length === 0 && (
        <div className="muted" style={{ fontSize: 13 }}>
          {note || 'No earnings-call transcripts available for this company yet.'}
        </div>
      )}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {calls.map((c, i) => (
          <div key={i} className="card" style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 8 }}>
              <strong style={{ fontSize: 13 }}>{c.source_date || 'Call'}</strong>
              <span style={{ fontSize: 11, color: COLORS.muted, maxWidth: 180, textAlign: 'right',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={c.source_doc}>{c.source_doc}</span>
            </div>
            {(c.quotes || []).map((q, j) => (
              <div key={j} style={{ marginBottom: 10, borderLeft: `3px solid ${COLORS.gold}`,
                paddingLeft: 10 }}>
                <div style={{ fontSize: 13, fontStyle: 'italic', color: '#333' }}>“{q.text}”</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                  {q.topic}{q.speaker ? ` · ${q.speaker}` : ''}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const DRAFTS_KEY = 'erb_perspectives_drafts'
const loadDrafts = () => {
  try { return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]') } catch { return [] }
}
const saveDrafts = (list) => {
  try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(list)) } catch { /* quota */ }
}

export default function Perspectives() {
  const [companies, setCompanies] = useState([])
  const [isin, setIsin] = useState('')
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState(null)
  const [error, setError] = useState('')
  const [drafts, setDrafts] = useState([])
  const [savedNote, setSavedNote] = useState('')

  useEffect(() => {
    api.getCompanies().then(setCompanies).catch((e) => setError(e.message))
    setDrafts(loadDrafts())
  }, [])

  const tickerFor = (i) => companies.find((c) => c.isin === i)?.nse_symbol || i

  const draftForIsin = (i) => drafts.find((d) => d.isin === i)

  // Persist generated commentary so we never pay for the same LLM run twice. One draft per
  // company (newest replaces older), so revisiting a company reuses the saved copy.
  const persist = (value, output) => {
    const entry = { id: Date.now(), isin: value, label: tickerFor(value),
      savedAt: new Date().toISOString().slice(0, 16).replace('T', ' '), out: output }
    const next = [entry, ...drafts.filter((d) => d.isin !== value)].slice(0, 50)
    setDrafts(next); saveDrafts(next)
  }

  const run = async (value, { force = false } = {}) => {
    setIsin(value); setError(''); setSavedNote('')
    if (!value) { setOut(null); return }
    // Reuse the saved commentary instead of spending tokens again, unless forced.
    const cached = force ? null : draftForIsin(value)
    if (cached) {
      setOut(cached.out)
      setSavedNote(`Loaded saved commentary (${cached.savedAt}) — no tokens used.`)
      return
    }
    setOut(null); setBusy(true)
    try {
      const result = await api.getPerspectives(value)
      setOut(result)
      persist(value, result)          // auto-save every generated run
      setSavedNote('Generated and saved to drafts.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const openDraft = (d) => { setIsin(d.isin); setOut(d.out); setError(''); setSavedNote('') }

  const deleteDraft = (id) => {
    const next = drafts.filter((d) => d.id !== id)
    setDrafts(next); saveDrafts(next)
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

      {drafts.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6,
            color: COLORS.muted, marginBottom: 6 }}>Saved drafts</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {drafts.map((d) => (
              <span key={d.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                border: `1px solid ${COLORS.border}`, borderRadius: 999, padding: '4px 10px',
                fontSize: 12 }}>
                <span style={{ cursor: 'pointer', color: COLORS.gold }}
                  onClick={() => openDraft(d)}>{d.label} · {d.savedAt}</span>
                <span style={{ cursor: 'pointer', color: COLORS.muted }}
                  onClick={() => deleteDraft(d.id)} title="Delete">✕</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {busy && <div style={{ marginTop: 16 }} className="muted">Reading through each lens (LLM)…</div>}
      {error && <div style={{ color: COLORS.red, fontSize: 13, marginTop: 12 }}>{error}</div>}

      {lenses.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => run(isin, { force: true })}
              disabled={busy || !isin}
              title="Discard the saved copy and run the LLM again (uses tokens)">
              Regenerate (uses tokens)</button>
            {savedNote && <span style={{ fontSize: 12, color: COLORS.green }}>{savedNote}</span>}
          </div>

          <ManagementSays says={out.management_says} note={out.management_note} />

          <h3 style={{ marginTop: 22 }}>How different investors would read it</h3>
          <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
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
