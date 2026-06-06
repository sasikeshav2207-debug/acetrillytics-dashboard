// Polls GET /api/reports/status/{thesis_id} every 10s while a report is generating.
// Returns {status, reportStatus, reportFiles, reportUrls, isComplete, error, refresh}.
// Stops polling once report_status is 'complete' (or on error).
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

const POLL_MS = 10000

export function useReportJob(thesisId, { enabled = true } = {}) {
  const [status, setStatus] = useState(null)        // thesis lifecycle status
  const [reportStatus, setReportStatus] = useState('pending')
  const [reportFiles, setReportFiles] = useState([])
  const [reportUrls, setReportUrls] = useState(null)
  const [error, setError] = useState(null)
  const timer = useRef(null)

  const isComplete = reportStatus === 'complete'

  const check = useCallback(async () => {
    if (!thesisId) return
    try {
      const s = await api.getReportStatus(thesisId)
      setStatus(s.status)
      setReportStatus(s.report_status)
      setReportFiles(s.report_files || [])
      if (s.report_status === 'complete') {
        try {
          setReportUrls(await api.getSignedUrls(thesisId))
        } catch {
          /* signed urls best-effort */
        }
      }
      return s.report_status
    } catch (e) {
      setError(e.message)
      return 'error'
    }
  }, [thesisId])

  useEffect(() => {
    if (!enabled || !thesisId) return undefined
    let cancelled = false
    const tick = async () => {
      const rs = await check()
      if (cancelled) return
      if (rs === 'complete' || rs === 'error') return
      timer.current = setTimeout(tick, POLL_MS)
    }
    tick()
    return () => {
      cancelled = true
      if (timer.current) clearTimeout(timer.current)
    }
  }, [enabled, thesisId, check])

  return { status, reportStatus, reportFiles, reportUrls, isComplete, error, refresh: check }
}

export default useReportJob
