import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

/**
 * Hide role-specific UI routes using the role returned by /auth/me.
 * Express still performs the real authorization for every API operation.
 */
export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { role, profileLoading } = useAuth()

  if (profileLoading) return <LoadingSpinner label="Checking permissions…" fullPage />
  if (!allowedRoles.includes(role)) return <Navigate to="/forbidden" replace />

  return children ?? <Outlet />
}
