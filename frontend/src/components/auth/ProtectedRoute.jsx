import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

/** Require a valid Supabase session and backend profile before rendering a route. */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, profileLoading } = useAuth()
  const location = useLocation()

  if (loading || (isAuthenticated && profileLoading)) {
    return <LoadingSpinner label="Checking your session…" fullPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ?? <Outlet />
}
