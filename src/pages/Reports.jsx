import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'research-reports'
const FILES = [['PDF', 'report.pdf'], ['PPT', 'report.pptx'], ['Excel', 'model.xlsx'],
  ['DOCX', 'report.docx']]

export default function Reports() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('thesis').select('*').order('created_at', { ascending: false })
      setRows(data || [])
    })()
  }, [])

  const download = async (thesisId, filename) => {
    const { data, error } = await supabase.storage.from(BUCKET)
      .createSignedUrl(`${thesisId}/${filename}`, 3600)
    if (error || !data) { alert(`Not available: ${error?.message || 'missing file'}`); return }
    window.open(data.signedUrl, '_blank')
  }

  if (!rows) return <div>Loading…</div>
  if (!rows.length) return <div><h1>Reports</h1><p className="muted">No theses yet.</p></div>

  return (
    <div>
      <h1>Reports</h1>
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
              <td>{t.status}</td>
              <td>
                <div style={{ display: 'flex', gap: 8 }}>
                  {FILES.map(([label, fname]) => (
                    <button key={fname} className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }}
                      onClick={() => download(t.thesis_id, fname)}>{label}</button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
