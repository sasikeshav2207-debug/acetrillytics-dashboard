import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav('/dashboard') })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') nav('/dashboard')
    })
    return () => sub.subscription.unsubscribe()
  }, [nav])

  const sendLink = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center' }}>
      <div style={{ maxWidth: 420, width: '100%', padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontSize: 34, margin: 0 }}>
          Acetrillytics <span style={{ color: 'var(--gold)' }}>Research</span>
        </h1>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: '#333',
          margin: '12px 0 28px' }}>
          Every number sourced. Every thesis falsifiable.
        </p>
        {sent ? (
          <div className="card">Check your email for the sign-in link.</div>
        ) : (
          <>
            <input className="input" type="email" placeholder="you@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} />
            <button className="btn" style={{ marginTop: 12, width: '100%' }}
              onClick={sendLink} disabled={!email}>Send magic link</button>
            {error && <div style={{ color: '#E84040', fontSize: 12, marginTop: 10 }}>{error}</div>}
          </>
        )}
        <div className="kicker" style={{ marginTop: 28 }}>Personal research — not investment advice</div>
      </div>
    </div>
  )
}
