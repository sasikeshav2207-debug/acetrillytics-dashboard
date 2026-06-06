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

function RequireAuth() {
  const [session, setSession] = useState(undefined) // undefined = still loading
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  if (session === undefined) return <div className="container">Loading…</div>
  if (!session) return <Navigate to="/" replace />
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
