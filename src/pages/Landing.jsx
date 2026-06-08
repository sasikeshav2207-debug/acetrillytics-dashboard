import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav('/dashboard') })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') nav('/dashboard')
    })
    return () => sub.subscription.unsubscribe()
  }, [nav])

  const signIn = async () => {
    setError(''); setMsg(''); setBusy(true)
    const { error: e } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (e) setError(e.message)  // nav happens via onAuthStateChange
  }

  const resetPassword = async () => {
    if (!email) { setError('Enter your email first.'); return }
    setError(''); setBusy(true)
    const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    setBusy(false)
    if (e) setError(e.message)
    else setMsg('Check your email for a link to set your password, then sign in.')
  }

  const magicLink = async () => {
    if (!email) { setError('Enter your email first.'); return }
    setError(''); setBusy(true)
    const { error: e } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: window.location.origin },
    })
    setBusy(false)
    if (e) setError(e.message)
    else setMsg('Check your email for a one-time sign-in link.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center' }}>
      <div style={{ maxWidth: 420, width: '100%', padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 34, margin: 0 }}>
          Acetrillytics <span style={{ color: 'var(--gold)' }}>Research</span>
        </h1>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: '#333',
          margin: '12px 0 24px' }}>Every number sourced. Every thesis falsifiable.</p>

        <input className="input" type="email" placeholder="you@email.com" value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <input className="input" type="password" placeholder="Password" value={password}
          style={{ marginTop: 10 }} autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && signIn()} />
        <button className="btn" style={{ marginTop: 12, width: '100%' }}
          onClick={signIn} disabled={busy || !email || !password}>
          {busy ? 'Signing in…' : 'Sign in'}</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12,
          fontSize: 12 }}>
          <span style={{ color: 'var(--gold)', cursor: 'pointer' }}
            onClick={resetPassword}>Set / reset password</span>
          <span style={{ color: 'var(--muted)', cursor: 'pointer' }}
            onClick={magicLink}>Email me a link instead</span>
        </div>

        {error && <div style={{ color: '#E84040', fontSize: 12, marginTop: 12 }}>{error}</div>}
        {msg && <div style={{ color: 'var(--green)', fontSize: 12, marginTop: 12 }}>{msg}</div>}
        <div className="kicker" style={{ marginTop: 28 }}>Personal research — not investment advice</div>
      </div>
    </div>
  )
}
