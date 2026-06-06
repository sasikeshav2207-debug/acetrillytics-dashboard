import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { COLORS } from '../lib/format'
import { useReportJob } from '../hooks/useReportJob'

const DRAFT_KEY = 'erb_newresearch_draft'  // browser autosave so work survives refresh/failed submit
const STEPS = ['Company', 'Thesis', 'Kill Criteria', 'Scenarios', 'Commentary']
const TARGET_FYS = [2027, 2028, 2029]
const METRICS = ['interest_coverage', 'debt_equity', 'cfo_pat', 'revenue_cagr_3y', 'pat_cagr_3y',
  'roce', 'roe', 'opm', 'npm', 'pe_ttm', 'pb_ratio', 'ev_ebitda', 'gross_margin']
const COMPARATORS = ['<', '<=', '>', '>=', '==', '!=']
const TOPICS = ['guidance', 'pipeline', 'capex', 'm&a', 'capacity', 'regulatory', 'other']
const DEFAULT_KILLS = [
  { target: 'interest_coverage', comparator: '<', threshold: 1.5, rationale: 'Debt servicing at risk' },
  { target: 'debt_equity', comparator: '>', threshold: 1.5, rationale: 'Leverage too high' },
  { target: 'cfo_pat', comparator: '<', threshold: 0.6, rationale: 'Poor cash conversion' },
  { target: 'revenue_cagr_3y', comparator: '<', threshold: 0, rationale: 'Top line contracting' },
]

const cardStyle = { marginBottom: 12 }
const label = { fontSize: 12, color: COLORS.muted, display: 'block', marginBottom: 4 }

function StepBar({ step }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
          color: i === step ? COLORS.gold : (i < step ? COLORS.green : COLORS.muted),
          fontWeight: i === step ? 600 : 400,
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 11,
            border: `1px solid ${i === step ? COLORS.gold : COLORS.border}`,
            background: i < step ? COLORS.green : 'transparent',
            color: i < step ? '#fff' : 'inherit',
          }}>{i < step ? '✓' : i + 1}</span>
          {s}
        </div>
      ))}
    </div>
  )
}

export default function NewResearch() {
  const nav = useNavigate()
  const [companies, setCompanies] = useState([])
  const [step, setStep] = useState(0)
  const [authorEmail, setAuthorEmail] = useState('')

  // form state
  const [isin, setIsin] = useState('')
  const [targetFy, setTargetFy] = useState(TARGET_FYS[0])
  const [thesisStatement, setThesisStatement] = useState('')
  const [killRationale, setKillRationale] = useState('')
  const [kills, setKills] = useState(DEFAULT_KILLS)
  const [scenarios, setScenarios] = useState({
    bull: { assumptions: '', key_metrics: '', rationale: '' },
    base: { assumptions: '', key_metrics: '', rationale: '' },
    bear: { assumptions: '', key_metrics: '', rationale: '' },
  })
  const [scenarioTab, setScenarioTab] = useState('bull')
  const [commentary, setCommentary] = useState([])

  // earnings-call auto-draft state
  const [drafting, setDrafting] = useState(false)
  const [draftSource, setDraftSource] = useState('')
  const [draftError, setDraftError] = useState('')
  const [transcript, setTranscript] = useState('')
  const [showPaste, setShowPaste] = useState(false)

  // submission state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [thesisId, setThesisId] = useState(null)
  const job = useReportJob(thesisId, { enabled: !!thesisId })

  const [restored, setRestored] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    api.getCompanies().then(setCompanies).catch((e) => setError(e.message))
    supabase.auth.getSession().then(({ data }) => setAuthorEmail(data?.session?.user?.email || ''))
    // Restore any auto-saved draft (survives refresh / failed submit).
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
      if (d) {
        if (d.isin) setIsin(d.isin)
        if (d.targetFy) setTargetFy(d.targetFy)
        if (d.thesisStatement) setThesisStatement(d.thesisStatement)
        if (d.killRationale) setKillRationale(d.killRationale)
        if (Array.isArray(d.kills) && d.kills.length) setKills(d.kills)
        if (d.scenarios) setScenarios(d.scenarios)
        if (Array.isArray(d.commentary) && d.commentary.length) setCommentary(d.commentary)
        if (d.commentary?.length || d.thesisStatement) setRestored(true)
      }
    } catch { /* ignore corrupt draft */ }
    loadedRef.current = true
  }, [])

  // Auto-save the whole form on any change (skipped until the restore pass has run).
  useEffect(() => {
    if (!loadedRef.current) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        isin, targetFy, thesisStatement, killRationale, kills, scenarios, commentary,
      }))
    } catch { /* quota / private mode */ }
  }, [isin, targetFy, thesisStatement, killRationale, kills, scenarios, commentary])

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    setRestored(false)
  }

  const ticker = useMemo(
    () => companies.find((c) => c.isin === isin)?.nse_symbol || '', [companies, isin])

  const applyDraft = (d) => {
    const items = (d.commentary || []).map((c) => ({
      text: c.text || '', source_doc: c.source_doc || d.source_doc || '',
      source_date: (c.source_date || d.source_date || '').slice(0, 10),
      topic: TOPICS.includes(c.topic) ? c.topic : 'other',
      target_date: (c.target_date || '').slice(0, 10),
    })).filter((c) => c.text)
    if (items.length) setCommentary(items)
    if (!thesisStatement && d.thesis_statement) setThesisStatement(d.thesis_statement)
    setDraftSource(`${d.source_doc || 'source'}${d.source_date ? ` (${d.source_date})` : ''}`
      + ` — ${items.length} commentary item(s) drafted. Review every quote.`)
  }

  const draftFromEarnings = async () => {
    if (!isin) { setDraftError('Pick a company first (Step 1).'); return }
    setDrafting(true); setDraftError(''); setDraftSource('')
    try {
      applyDraft(await api.earningsDraft(isin, Number(targetFy)))
    } catch (e) {
      setDraftError(e.message)
    } finally {
      setDrafting(false)
    }
  }

  const draftFromPaste = async () => {
    if (!isin) { setDraftError('Pick a company first (Step 1).'); return }
    if (!transcript.trim()) { setDraftError('Paste the transcript text first.'); return }
    setDrafting(true); setDraftError(''); setDraftSource('')
    try {
      applyDraft(await api.draftFromText(isin, transcript, Number(targetFy)))
    } catch (e) {
      setDraftError(e.message)
    } finally {
      setDrafting(false)
    }
  }

  const canNext = () => {
    if (step === 0) return !!isin
    if (step === 1) return thesisStatement.trim().length >= 50
    if (step === 2) return kills.some((k) => k.target && k.threshold !== '' && k.threshold != null)
    return true
  }

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const body = {
        isin,
        ticker,
        thesis_statement: thesisStatement,
        kill_rationale: killRationale,
        target_fy: Number(targetFy),
        author: authorEmail || 'Acetrillytics Research',
        kill_criteria: kills
          .filter((k) => k.target && k.threshold !== '' && k.threshold != null)
          .map((k) => ({ kind: 'metric', target: k.target, comparator: k.comparator,
            threshold: Number(k.threshold), rationale: k.rationale })),
        scenarios,
        management_commentary: commentary.map((c) => ({
          text: c.text, source_doc: c.source_doc, source_date: c.source_date || null,
          topic: c.topic || 'other', target_date: c.target_date || null,
        })),
      }
      const created = await api.createThesis(body)
      setThesisId(created.thesis_id)
      clearDraft()  // success — discard the autosaved draft
      await api.generateReport(created.thesis_id)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ---- After submission: progress + downloads ----
  if (thesisId) {
    return (
      <div>
        <h1>New Research</h1>
        <div className="card" style={{ maxWidth: 640 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>
            Thesis created → <span className="mono">{thesisId}</span>
          </div>
          {!job.isComplete ? (
            <div style={{ color: COLORS.muted }}>
              <span className="dot" style={{ background: COLORS.gold }} /> Report generating…
              this runs in the background (GitHub Actions) and usually takes a few minutes.
            </div>
          ) : (
            <div>
              <div style={{ color: COLORS.green, marginBottom: 10 }}>Report ready.</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['pdf', 'pptx', 'excel', 'docx'].map((f) => job.reportUrls?.[f] && (
                  <a key={f} className="btn btn-ghost" href={job.reportUrls[f]}
                    target="_blank" rel="noreferrer">{f.toUpperCase()}</a>
                ))}
              </div>
            </div>
          )}
          {job.error && <div style={{ color: COLORS.red, marginTop: 8 }}>{job.error}</div>}
          <div style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => nav('/reports')}>Go to Reports</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>New Research</h1>
      <StepBar step={step} />
      <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>
        {restored
          ? '↩ Restored your saved draft. '
          : 'Your entries auto-save in this browser. '}
        <span style={{ color: COLORS.gold, cursor: 'pointer' }} onClick={clearDraft}>
          Clear saved draft
        </span>
      </div>
      {error && <div style={{ color: COLORS.red, fontSize: 13, marginBottom: 10 }}>{error}</div>}

      {step === 0 && (
        <div className="card" style={cardStyle}>
          <label style={label}>Company</label>
          {companies.length === 0 ? (
            <div className="muted">Add a company first.</div>
          ) : (
            <select className="input" value={isin} onChange={(e) => setIsin(e.target.value)}>
              <option value="">Select a company…</option>
              {companies.map((c) => (
                <option key={c.isin} value={c.isin}>
                  {c.nse_symbol || c.isin} — {c.name}
                </option>
              ))}
            </select>
          )}
          <label style={{ ...label, marginTop: 12 }}>Target FY</label>
          <select className="input" value={targetFy} onChange={(e) => setTargetFy(e.target.value)}>
            {TARGET_FYS.map((fy) => <option key={fy} value={fy}>FY{fy}</option>)}
          </select>
        </div>
      )}

      {step === 1 && (
        <div className="card" style={cardStyle}>
          <label style={label}>Thesis statement (min 50 chars)</label>
          <textarea className="input" rows={5} value={thesisStatement}
            onChange={(e) => setThesisStatement(e.target.value)}
            placeholder="The market is mispricing … because …" />
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
            {thesisStatement.trim().length}/50
          </div>
          <label style={{ ...label, marginTop: 12 }}>Kill rationale</label>
          <textarea className="input" rows={3} value={killRationale}
            onChange={(e) => setKillRationale(e.target.value)} />
          <label style={{ ...label, marginTop: 12 }}>Author</label>
          <input className="input" value={authorEmail} readOnly />
        </div>
      )}

      {step === 2 && (
        <div className="card" style={cardStyle}>
          <label style={label}>Kill criteria — conditions that would falsify the thesis</label>
          {kills.map((k, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <select className="input" style={{ flex: 2 }} value={k.target}
                onChange={(e) => setKills(kills.map((x, j) => j === i
                  ? { ...x, target: e.target.value } : x))}>
                {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="input" style={{ width: 70 }} value={k.comparator}
                onChange={(e) => setKills(kills.map((x, j) => j === i
                  ? { ...x, comparator: e.target.value } : x))}>
                {COMPARATORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="input" style={{ width: 90 }} type="number" value={k.threshold}
                onChange={(e) => setKills(kills.map((x, j) => j === i
                  ? { ...x, threshold: e.target.value } : x))} />
              <input className="input" style={{ flex: 2 }} value={k.rationale}
                placeholder="rationale"
                onChange={(e) => setKills(kills.map((x, j) => j === i
                  ? { ...x, rationale: e.target.value } : x))} />
              <button className="btn btn-ghost" onClick={() =>
                setKills(kills.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button className="btn btn-ghost" style={{ marginTop: 6 }} onClick={() =>
            setKills([...kills, { target: METRICS[0], comparator: '<', threshold: 0, rationale: '' }])}>
            + Add criterion
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="card" style={cardStyle}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            {['bull', 'base', 'bear'].map((t) => (
              <span key={t} onClick={() => setScenarioTab(t)} style={{
                cursor: 'pointer', fontSize: 13, textTransform: 'capitalize', paddingBottom: 3,
                color: scenarioTab === t ? COLORS.gold : COLORS.muted,
                borderBottom: scenarioTab === t ? `2px solid ${COLORS.gold}` : 'none',
              }}>{t}</span>
            ))}
          </div>
          {['assumptions', 'key_metrics', 'rationale'].map((field) => (
            <div key={field} style={{ marginBottom: 8 }}>
              <label style={label}>
                {field === 'key_metrics' ? "Key metrics (one 'name = value' per line)"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <textarea className="input" rows={field === 'key_metrics' ? 3 : 2}
                value={scenarios[scenarioTab][field]}
                onChange={(e) => setScenarios({
                  ...scenarios,
                  [scenarioTab]: { ...scenarios[scenarioTab], [field]: e.target.value },
                })} />
            </div>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="card" style={cardStyle}>
          <label style={label}>Management commentary (verbatim, with source)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            marginBottom: 10 }}>
            <button className="btn btn-ghost" disabled={drafting || !isin}
              onClick={draftFromEarnings}>
              {drafting ? 'Fetching from BSE…' : 'Auto-fetch from latest earnings call (BSE)'}
            </button>
            <span style={{ fontSize: 12, color: COLORS.gold, cursor: 'pointer' }}
              onClick={() => setShowPaste((v) => !v)}>
              {showPaste ? 'Hide paste box' : 'or paste transcript'}
            </span>
            <span style={{ fontSize: 11, color: COLORS.muted }}>
              Searches BSE up to ~3 years back and drafts verbatim quotes — review each.
            </span>
          </div>
          {showPaste && (
            <div style={{ marginBottom: 10 }}>
              <textarea className="input" rows={5} placeholder="Paste the earnings-call transcript text here…"
                value={transcript} onChange={(e) => setTranscript(e.target.value)} />
              <button className="btn btn-ghost" style={{ marginTop: 6 }}
                disabled={drafting || !transcript.trim()} onClick={draftFromPaste}>
                {drafting ? 'Drafting…' : 'Draft from pasted transcript'}
              </button>
            </div>
          )}
          {draftSource && (
            <div style={{ fontSize: 12, color: COLORS.green, marginBottom: 8 }}>{draftSource}</div>
          )}
          {draftError && (
            <div style={{ fontSize: 12, color: COLORS.red, marginBottom: 8 }}>{draftError}</div>
          )}
          {commentary.map((c, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8,
              marginBottom: 8 }}>
              <textarea className="input" rows={2} placeholder="Verbatim quote" value={c.text}
                onChange={(e) => setCommentary(commentary.map((x, j) => j === i
                  ? { ...x, text: e.target.value } : x))} />
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                <input className="input" style={{ flex: 2 }} placeholder="Source doc"
                  value={c.source_doc || ''}
                  onChange={(e) => setCommentary(commentary.map((x, j) => j === i
                    ? { ...x, source_doc: e.target.value } : x))} />
                <input className="input" style={{ width: 150 }} type="date"
                  value={c.source_date || ''}
                  onChange={(e) => setCommentary(commentary.map((x, j) => j === i
                    ? { ...x, source_date: e.target.value } : x))} />
                <select className="input" style={{ width: 130 }} value={c.topic || 'other'}
                  onChange={(e) => setCommentary(commentary.map((x, j) => j === i
                    ? { ...x, topic: e.target.value } : x))}>
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input className="input" style={{ width: 150 }} type="date"
                  placeholder="target date" value={c.target_date || ''}
                  onChange={(e) => setCommentary(commentary.map((x, j) => j === i
                    ? { ...x, target_date: e.target.value } : x))} />
                <button className="btn btn-ghost" onClick={() =>
                  setCommentary(commentary.filter((_, j) => j !== i))}>✕</button>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={() => setCommentary([...commentary,
            { text: '', source_doc: '', source_date: '', topic: 'other', target_date: '' }])}>
            + Add commentary
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button className="btn btn-ghost" disabled={step === 0}
          onClick={() => setStep(step - 1)}>Back</button>
        {step < STEPS.length - 1 ? (
          <button className="btn" disabled={!canNext()}
            onClick={() => setStep(step + 1)}>Next</button>
        ) : (
          <button className="btn" disabled={submitting}
            onClick={submit}>{submitting ? 'Creating…' : 'Create Thesis & Generate Report'}</button>
        )}
      </div>
    </div>
  )
}
