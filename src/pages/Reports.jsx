import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { COLORS } from '../lib/format'

const FILES = [['PDF', 'pdf'], ['PPT', 'pptx'], ['Excel', 'excel'], ['DOCX', 'docx']]
const STATUS_COLOR = { active: COLORS.green, killed: COLORS.red, superseded: '#888',
  draft: COLORS.gold }

export default function Reports() {
  const [rows, setRows] = useState(null)
  const [busy, setBusy] = useState({})
  const [error, setError] = useState('')
  const timer = useRef(null)

  const load = useCallback(async () => {
    try {
      const theses = await api.getTheses()
      // Attach signed urls per thesis (best-effort, parallel).
      const withUrls = await Promise.all(theses.map(async (t) => {
        let urls = {}
        try { urls = await api.getSignedUrls(t.thesis_id) } catch { /* none yet */ }
        return { ...t, urls }
      }))
      setRows(withUrls)
      return withUrls
    } catch (e) {
      setError(e.message)
      return []
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      const r = await load()
      if (cancelled) return
      // Keep refreshing while any thesis still lacks all four files.
      const anyPending = r.some((t) => FILES.some(([, f]) => !t.urls?.[f]))
      if (anyPending) timer.current = setTimeout(tick, 30000)
    }
    tick()
    return () => { cancelled = true; if (timer.current) clearTimeout(timer.current) }
  }, [load])

  const regenerate = async (thesisId) => {
    setBusy((b) => ({ ...b, [thesisId]: true }))
    setError('')
    try {
      await api.generateReport(thesisId)
      setTimeout(load, 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy((b) => ({ ...b, [thesisId]: false }))
    }
  }

  if (!rows) return <div>Loading…</div>
  if (!rows.length) return <div><h1>Reports</h1><p className="muted">No theses yet.</p></div>

  return (
    <div>
      <h1>Reports</h1>
      {error && <div style={{ color: COLORS.red, fontSize: 13, marginBottom: 10 }}>{error}</div>}
      <table style={{ marginTop: 16 }}>
        <thead>
          <tr><th>Company</th><th>Date</th><th>Version</th><th>Status</th><th>Downloads</th></tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.thesis_id}>
              <td>{t.ticker}</td>
              <td className="mono">{(t.created_at || '').slice(0, 10)}</td>
              <td className="mono">v{t.version}</td>
              <td>
                <span className="badge" style={{ color: STATUS_COLOR[t.status] || '#888',
                  borderColor: STATUS_COLOR[t.status] || COLORS.border }}>{t.status}</span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {FILES.map(([labelTxt, fmt]) => (
                    t.urls?.[fmt] ? (
                      <a key={fmt} className="btn btn-ghost"
                        style={{ fontSize: 12, padding: '5px 10px' }}
                        href={t.urls[fmt]} target="_blank" rel="noreferrer">{labelTxt}</a>
                    ) : (
                      <span key={fmt} style={{ fontSize: 12, color: COLORS.muted }}>{labelTxt} —</span>
                    )
                  ))}
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }}
                    disabled={busy[t.thesis_id]} onClick={() => regenerate(t.thesis_id)}>
                    {busy[t.thesis_id] ? '…' : 'Regenerate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
