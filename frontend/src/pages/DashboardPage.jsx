import { useCallback, useEffect, useState } from 'react'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { getVehicles } from '../services/vehicleApi'

const permissionSummaries = {
  viewer: 'You can browse the vehicle inventory and review individual records.',
  analyst: 'You can browse, add, update, and estimate vehicles. Editing tools arrive in a future phase.',
  admin: 'You have full vehicle access, including deletion. Administration tools arrive in a future phase.',
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
    </div>
  )
}
