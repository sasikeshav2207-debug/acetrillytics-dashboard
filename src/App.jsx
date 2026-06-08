import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Nav from './components/Nav.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Company from './pages/Company.jsx'
import Reports from './pages/Reports.jsx'
import NewResearch from './pages/NewResearch.jsx'
import AddCompany from './pages/AddCompany.jsx'
import ImportAngelOne from './pages/ImportAngelOne.jsx'
import Perspectives from './pages/Perspectives.jsx'
import Slides from './pages/Slides.jsx'

const ALLOWED_EMAIL = (import.meta.env.VITE_ALLOWED_EMAIL || '').trim().toLowerCase()

function SetPassword({ onDone }) {
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const save = async () => {
    setErr(''); setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    if (error) setErr(error.message)
    else onDone()
  }
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '16vh' }}>
      <h1 style={{ marginBottom: 8 }}>Set your password</h1>
      <p className="muted">Choose a password for future sign-ins.</p>
      <div style={{ maxWidth: 360, margin: '16px auto 0' }}>
        <input className="input" type="password" placeholder="New password" value={pw}
          autoComplete="new-password" onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && pw && save()} />
        <button className="btn" style={{ marginTop: 12, width: '100%' }}
          onClick={save} disabled={busy || pw.length < 6}>
          {busy ? 'Saving…' : 'Save password'}</button>
        {err && <div style={{ color: '#E84040', fontSize: 12, marginTop: 12 }}>{err}</div>}
      </div>
    </div>
  )
}

function RequireAuth() {
  const [session, setSession] = useState(undefined) // undefined = still loading
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <div className="container">Loading…</div>
  if (!session) return <Navigate to="/" replace />
  // Optional single-user gate: if VITE_ALLOWED_EMAIL is set, anyone else is denied + signed out.
  const email = (session.user?.email || '').toLowerCase()
  if (ALLOWED_EMAIL && email !== ALLOWED_EMAIL) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '18vh' }}>
        <h1 style={{ marginBottom: 8 }}>Access denied</h1>
        <p className="muted">This account ({session.user?.email}) is not authorized.</p>
        <button className="btn" style={{ marginTop: 16 }}
          onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    )
  }
  return (
    <>
      <Nav />
      <div className="container"><Outlet /></div>
    </>
  )
}

export default function App() {
  const [recovery, setRecovery] = useState(false)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])
  if (recovery) return <SetPassword onDone={() => setRecovery(false)} />
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* Slide renderer — NO auth guard (rendered headlessly by Puppeteer with injected data) */}
      <Route path="/slides/:thesisId/:slideNumber" element={<Slides />} />
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/companies" element={<Dashboard />} />
        <Route path="/company/:isin" element={<Company />} />
        <Route path="/new-research" element={<NewResearch />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/add-company" element={<AddCompany />} />
        <Route path="/import-angelone" element={<ImportAngelOne />} />
        <Route path="/perspectives" element={<Perspectives />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
