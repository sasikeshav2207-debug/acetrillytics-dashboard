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
