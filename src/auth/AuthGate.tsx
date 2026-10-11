import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

type Mode = 'signin' | 'signup' | 'reset'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  return { session, loading }
}

export const displayName = (s: Session): string =>
  (s.user.user_metadata?.username as string | undefined) || s.user.email?.split('@')[0] || 'Player'

export const signOut = () => supabase.auth.signOut()

/** Shows the login page until a user is signed in, then renders the game. */
export function AuthGate({ children }: { children: (s: Session) => ReactNode }) {
  const { session, loading } = useSession()
  if (loading) return <div className="setup"><div className="setup-card note">Loading…</div></div>
  if (!session) return <LoginPage />
  return <>{children(session)}</>
}

function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const switchMode = (m: Mode) => {
    setMode(m)
    setError(null)
    setInfo(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      } else if (mode === 'signup') {
        if (password.length < 6) throw new Error('Password must be at least 6 characters.')
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { username: username.trim() || undefined }, emailRedirectTo: window.location.origin },
        })
        if (error) throw error
        if (!data.session) setInfo('Account created. Check your email to confirm it, then sign in.')
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setInfo('If that email has an account, a reset link is on its way.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="setup">
      <form className="setup-card auth" onSubmit={submit}>
        <h1 className="logo">
          XING<span>♠ ♥ ♦ ♣</span>
        </h1>
        <p className="tagline">
          {mode === 'signin' ? 'Sign in to play' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
        </p>

        {mode === 'signup' && (
          <label className="field">
            <span>Player name</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} autoComplete="nickname" />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        {mode !== 'reset' && (
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>
        )}

        {error && <p className="auth-msg err" role="alert">{error}</p>}
        {info && <p className="auth-msg ok" role="status">{info}</p>}

        <div className="row">
          <button className="btn primary big" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
          </button>
        </div>
        <div className="auth-links">
          {mode !== 'signin' && <button type="button" onClick={() => switchMode('signin')}>Back to sign in</button>}
          {mode === 'signin' && <button type="button" onClick={() => switchMode('signup')}>Create account</button>}
          {mode === 'signin' && <button type="button" onClick={() => switchMode('reset')}>Forgot password?</button>}
        </div>
      </form>
    </div>
  )
}
