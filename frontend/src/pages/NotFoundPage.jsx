import { Link } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

/** Friendly fallback for unknown application routes. */
export default function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="status-page">
      <div className="status-code">404</div>
      <p className="eyebrow">Page not found</p>
      <h1>That route does not exist.</h1>
      <p>The link may be outdated, or the address may have been entered incorrectly.</p>
      <Link className="button button--primary" to={isAuthenticated ? '/dashboard' : '/login'}>
        {isAuthenticated ? 'Go to dashboard' : 'Go to login'}
      </Link>
    </main>
  )
}
