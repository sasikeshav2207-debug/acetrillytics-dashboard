// FastAPI client. Reads VITE_API_URL (fallback http://localhost:8000), attaches the
// Supabase session JWT as a Bearer token on every request, and exposes typed methods for
// each backend endpoint.
import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function authHeaders(extra = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = await authHeaders(isForm ? {} : { 'Content-Type': 'application/json' })
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body != null ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`
    try {
      const j = await res.json()
      if (j?.detail) detail = j.detail
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // health (no auth needed, but harmless to send a token)
  health: () => request('/api/health'),

  // companies
  getCompanies: () => request('/api/companies'),
  searchSecurities: (q) => request(`/api/securities/search?q=${encodeURIComponent(q)}`),
  createCompany: (data) => request('/api/companies', { method: 'POST', body: data }),
  getMetrics: (isin) => request(`/api/companies/${isin}/metrics`),
  getFlags: (isin) => request(`/api/companies/${isin}/flags`),
  getShareholding: (isin) => request(`/api/companies/${isin}/shareholding`),
  earningsDraft: (isin, targetFy) =>
    request(`/api/companies/${isin}/earnings-draft?target_fy=${targetFy || 0}`, { method: 'POST' }),
  draftFromText: (isin, transcript, targetFy) =>
    request(`/api/companies/${isin}/draft-from-text`,
      { method: 'POST', body: { transcript, target_fy: targetFy || 0 } }),
  uploadFundamentals: (isin, file, opts = {}) => {
    const form = new FormData()
    form.append('file', file)
    const qs = new URLSearchParams(opts).toString()
    return request(`/api/companies/${isin}/fundamentals${qs ? `?${qs}` : ''}`,
      { method: 'POST', body: form, isForm: true })
  },

  // theses
  getTheses: () => request('/api/theses'),
  getThesis: (thesisId) => request(`/api/theses/${thesisId}`),
  createThesis: (data) => request('/api/theses', { method: 'POST', body: data }),
  snapshotThesis: (thesisId) => request(`/api/theses/${thesisId}/snapshot`, { method: 'POST' }),

  // reports
  generateReport: (thesisId) =>
    request('/api/reports/generate', { method: 'POST', body: { thesis_id: thesisId } }),
  getReportStatus: (thesisId) => request(`/api/reports/status/${thesisId}`),
  getSignedUrls: (thesisId) => request(`/api/reports/${thesisId}/signed-urls`),

  // data
  importOHLCV: (isin, totp, opts = {}) =>
    request('/api/ohlcv/import', { method: 'POST', body: { isin, totp_code: totp, ...opts } }),
  getPerspectives: (isin) => request(`/api/perspectives/${isin}`, { method: 'POST' }),
}

export default api
