import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { getVehicles } from '../services/vehicleApi'

const permissionSummaries = {
  viewer: 'You can browse the vehicle inventory and review individual records.',
  analyst: 'You can browse, add, update, and estimate vehicles. Editing tools arrive in a future phase.',
  admin: 'You have full vehicle access, including deletion. Administration tools arrive in a future phase.',
}

const quickActions = {
  viewer: [
    { title: 'Browse inventory', description: 'Review auction and estimate data.', label: 'View Vehicles' },
  ],
  analyst: [
    { title: 'Manage inventory', description: 'Create or update vehicle records.', label: 'Manage Vehicles' },
    { title: 'Run an estimate', description: 'Calculate import and selling prices.', label: 'Open Estimator' },
  ],
  admin: [
    { title: 'Manage inventory', description: 'Create, update, or remove records.', label: 'Manage Vehicles' },
    { title: 'Pricing controls', description: 'Run estimates with configurable costs.', label: 'Open Estimator' },
  ],
}

/** Account overview with live inventory count from vehicle pagination metadata. */
export default function DashboardPage() {
  const { user, role, authError } = useAuth()
  const [vehicleCount, setVehicleCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadVehicleCount = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const response = await getVehicles({ page: 1, limit: 1 })
      setVehicleCount(response.meta?.total ?? null)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVehicleCount()
  }, [loadVehicleCount])

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}.</h2>
          <p>Here is a quick view of your import intelligence workspace.</p>
        </div>
        <span className={`role-badge role-badge--${role}`}>{role}</span>
      </section>

      {authError && <ErrorMessage message={authError} />}

      <section className="metric-grid" aria-label="Workspace summary">
        <article className="metric-card metric-card--accent">
          <p>Vehicle records</p>
          {loading ? <LoadingSpinner label="Counting vehicles…" /> : <strong>{vehicleCount ?? '—'}</strong>}
          <span>Available in the authenticated inventory</span>
        </article>
        <article className="metric-card">
          <p>Signed in as</p>
          <strong className="metric-card__email">{user?.email || '—'}</strong>
          <span>Identity verified through Supabase</span>
        </article>
        <article className="metric-card">
          <p>Access level</p>
          <strong className="capitalize">{role || '—'}</strong>
          <span>Loaded from the protected backend profile</span>
        </article>
      </section>

      {errorMessage && <ErrorMessage message={errorMessage} onRetry={loadVehicleCount} />}

      <section className="content-card permission-card">
        <div className="permission-icon" aria-hidden="true">✓</div>
        <div>
          <p className="eyebrow">Your permissions</p>
          <h3>{permissionSummaries[role] || 'Your account permissions are loading.'}</h3>
          <p>The backend validates your role again before every protected operation.</p>
        </div>
      </section>

      <section className="quick-actions" aria-labelledby="quick-actions-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Quick actions</p>
            <h3 id="quick-actions-title">Continue your work</h3>
          </div>
        </div>
        <div className="quick-actions__grid">
          {(quickActions[role] || []).map((action) => (
            <article className="quick-action-card" key={action.title}>
              <div className="quick-action-card__icon" aria-hidden="true">↗</div>
              <h4>{action.title}</h4>
              <p>{action.description}</p>
              <Link className="button button--secondary button--small" to="/vehicles">
                {action.label}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
