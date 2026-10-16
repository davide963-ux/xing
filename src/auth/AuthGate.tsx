import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { sq } from '../i18n/sq'
import { SuitRow } from '../ui/Icon'
import { Landing } from '../ui/Landing'
import { PrivacyLink } from '../ui/Panels'
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
  (s.user.user_metadata?.username as string | undefined) || s.user.email?.split('@')[0] || 'Lojtar'

export const signOut = () => supabase.auth.signOut()

/** Landing page -> login/sign-up -> game. */
export function AuthGate({ children }: { children: (s: Session) => ReactNode }) {
  const { session, loading } = useSession()
  const [view, setView] = useState<'landing' | Mode>('landing')
  if (loading)
    return (
      <div className="setup">
        <div className="setup-card note">{sq.common.loading}</div>
      </div>
    )
  if (session) return <>{children(session)}</>
  if (view === 'landing') return <Landing onPlay={() => setView('signup')} onLogin={() => setView('signin')} />
  return <LoginPage initial={view} onHome={() => setView('landing')} />
}

/** Translate Supabase's (English) auth errors. */
function friendlyError(message: string): string {
  const m = message.toLowerCase()
  const e = sq.auth.errors
  if (m.includes('invalid login')) return e.invalid
  if (m.includes('not confirmed')) return e.unconfirmed
  if (m.includes('already registered') || m.includes('already been registered')) return e.exists
  if (m.includes('rate limit') || m.includes('too many')) return e.rate
  if (m.includes('at least 6')) return sq.auth.shortPassword
  return e.generic
}

function LoginPage({ initial, onHome }: { initial: Mode; onHome: () => void }) {
  const [mode, setMode] = useState<Mode>(initial)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const a = sq.auth

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
        if (password.length < 6) throw new Error('at least 6')
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { username: username.trim() || undefined }, emailRedirectTo: window.location.origin },
        })
        if (error) throw error
        if (!data.session) setInfo(a.created)
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setInfo(a.resetSent)
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : ''))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="setup">
      <form className="setup-card auth" onSubmit={submit}>
        <h1 className="logo">
          XING<span><SuitRow /></span>
        </h1>
        <p className="tagline">{mode === 'signin' ? a.signinTitle : mode === 'signup' ? a.signupTitle : a.resetTitle}</p>

        {mode === 'signup' && (
          <label className="field">
            <span>{a.username}</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} autoComplete="nickname" />
          </label>
        )}
        <label className="field">
          <span>{a.email}</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        {mode !== 'reset' && (
          <label className="field">
            <span>{a.password}</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>
        )}

        {error && (
          <p className="auth-msg err" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="auth-msg ok" role="status">
            {info}
          </p>
        )}

        <div className="row">
          <button className="btn primary big" type="submit" disabled={busy}>
            {busy ? a.wait : mode === 'signin' ? a.signin : mode === 'signup' ? a.signup : a.sendReset}
          </button>
        </div>
        <div className="auth-links">
          {mode !== 'signin' && (
            <button type="button" onClick={() => switchMode('signin')}>
              {a.back}
            </button>
          )}
          {mode === 'signin' && (
            <button type="button" onClick={() => switchMode('signup')}>
              {a.create}
            </button>
          )}
          {mode === 'signin' && (
            <button type="button" onClick={() => switchMode('reset')}>
              {a.forgot}
            </button>
          )}
          <button type="button" onClick={onHome}>
            {a.home}
          </button>
          <PrivacyLink />
        </div>
      </form>
    </div>
  )
}
