import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest } from '../services/apiClient'
import {
  getSession,
  signIn,
  signOut,
  subscribeToAuthChanges,
} from '../services/authService'

const AuthContext = createContext(null)

/** Provide Supabase session state and the backend-authoritative user profile. */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const profileRequestId = useRef(0)

  // Supabase owns session initialization and persistence.
  useEffect(() => {
    let isMounted = true

    getSession()
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) setAuthError('We could not restore your session. Please sign in again.')
        setSession(data?.session ?? null)
      })
      .catch(() => {
        if (isMounted) setAuthError('We could not restore your session. Please sign in again.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    // Keep this callback synchronous; profile loading happens in the effect below.
    const { data: subscriptionData } = subscribeToAuthChanges((_event, nextSession) => {
      if (!isMounted) return
      setSession(nextSession)
      setLoading(false)
      if (!nextSession) {
        setProfile(null)
        setAuthError('')
      }
    })

    return () => {
      isMounted = false
      subscriptionData.subscription.unsubscribe()
    }
  }, [])

  const loadProfile = useCallback(async () => {
    if (!session?.access_token) {
      setProfile(null)
      setProfileLoading(false)
      return null
    }

    const requestId = ++profileRequestId.current
    setProfileLoading(true)
    setAuthError('')

    try {
      const response = await apiRequest('/auth/me')
      if (requestId !== profileRequestId.current) return null

      const nextProfile = {
        id: response.data.id,
        email: response.data.email,
        role: response.data.role,
      }
      setProfile(nextProfile)
      return nextProfile
    } catch (error) {
      if (requestId === profileRequestId.current) {
        setProfile(null)
        setAuthError(error.message || 'We could not load your account profile.')
      }
      return null
    } finally {
      if (requestId === profileRequestId.current) setProfileLoading(false)
    }
  }, [session?.access_token])

  // Fetch the trusted role from Express whenever the authenticated session changes.
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const login = useCallback(async (email, password) => {
    setAuthError('')
    const { data, error } = await signIn(email, password)

    if (error) {
      const safeMessage =
        error.status === 400 || error.status === 401
          ? 'The email or password is incorrect.'
          : 'We could not sign you in. Please try again.'
      setAuthError(safeMessage)
      throw new Error(safeMessage)
    }

    setSession(data.session)
    return data.session
  }, [])

  const logout = useCallback(async () => {
    setAuthError('')
    const { error } = await signOut()
    if (error) {
      const safeMessage = 'We could not sign you out. Please try again.'
      setAuthError(safeMessage)
      throw new Error(safeMessage)
    }
    setSession(null)
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: profile,
      profile,
      role: profile?.role ?? null,
      loading,
      profileLoading,
      authError,
      login,
      logout,
      refreshProfile: loadProfile,
      isAuthenticated: Boolean(session),
    }),
    [session, profile, loading, profileLoading, authError, login, logout, loadProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Read authentication state from the nearest provider. */
// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
