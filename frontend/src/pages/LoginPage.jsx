import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import ErrorMessage from '../components/common/ErrorMessage'
import DynamicCarBackground from '../components/common/DynamicCarBackground'
import { useAuth } from '../contexts/AuthContext'

/** Email/password sign-in page backed exclusively by Supabase Auth. */
export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const requestedPath = location.state?.from?.pathname
  const destination = requestedPath?.startsWith('/') ? requestedPath : '/dashboard'

  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password) {
      setErrorMessage('Email and password are required.')
      return
    }

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(destination, { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <DynamicCarBackground variant="login" />
      <section className="login-intro" aria-label="Application introduction">
        <div className="brand-mark" aria-hidden="true">AV</div>
        <p className="eyebrow">AI-powered import decisions</p>
        <h1>Move from auction data to confident pricing.</h1>
        <p>Review vehicle records, import estimates, and selling-price intelligence in one secure workspace.</p>
        <div className="login-stat">
          <strong>Role-aware access</strong>
          <span>Each account sees the tools approved by the backend.</span>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div>
            <p className="eyebrow">Secure workspace</p>
            <h2>Welcome back</h2>
            <p className="muted">Sign in with your assigned account to continue.</p>
          </div>

          <ErrorMessage message={errorMessage} />

          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button className="button button--primary button--full" type="submit" disabled={submitting || loading}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="form-help">Access is managed by your platform administrator.</p>
        </form>
      </section>
    </main>
  )
}
