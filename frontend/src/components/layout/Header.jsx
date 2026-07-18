import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'

/** Dashboard header with verified identity and a safe logout action. */
export default function Header() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    setIsLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error.message)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Import intelligence workspace</p>
        <h1>AI Vehicle Price Estimation</h1>
      </div>

      <div className="account-area">
        <div className="account-copy">
          <strong>{user?.email || 'Authenticated user'}</strong>
          <span className={`role-badge role-badge--${role || 'unknown'}`}>{role || 'loading'}</span>
        </div>
        <button className="button button--secondary" type="button" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? 'Signing out…' : 'Logout'}
        </button>
        {logoutError && <span className="inline-error" role="alert">{logoutError}</span>}
      </div>
    </header>
  )
}
