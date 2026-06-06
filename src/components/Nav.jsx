import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const LINKS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/companies', label: 'Companies' },
  { to: '/new-research', label: 'New Research' },
  { to: '/reports', label: 'Reports' },
  { to: '/add-company', label: 'Add Company' },
  { to: '/import-angelone', label: 'Import AngelOne' },
  { to: '/perspectives', label: 'Perspectives' },
]

export default function Nav() {
  const loc = useLocation()
  const nav = useNavigate()
  const signOut = async () => {
    await supabase.auth.signOut()
    nav('/')
  }
  return (
    <nav style={{ borderBottom: '1px solid var(--border)', background: '#fff' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '14px 24px' }}>
        <Link to="/dashboard" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20,
          fontWeight: 700 }}>
          Acetrillytics <span style={{ color: 'var(--gold)' }}>Research</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} style={{
              fontSize: 13,
              color: loc.pathname.startsWith(l.to) ? 'var(--gold)' : 'var(--muted)',
              fontWeight: loc.pathname.startsWith(l.to) ? 500 : 400,
              borderBottom: loc.pathname.startsWith(l.to) ? '2px solid var(--gold)' : 'none',
              paddingBottom: 2,
            }}>{l.label}</Link>
          ))}
          <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
        </div>
      </div>
    </nav>
  )
}
