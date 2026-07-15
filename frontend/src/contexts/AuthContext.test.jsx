import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../services/apiClient'
import { getSession, signIn, signOut, subscribeToAuthChanges } from '../services/authService'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../services/authService', () => ({
  getSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  subscribeToAuthChanges: vi.fn(),
}))

vi.mock('../services/apiClient', () => ({ apiRequest: vi.fn() }))

const backendProfile = { id: 'analyst-id', email: 'analyst@example.com', role: 'analyst' }
const mockSession = { access_token: 'mock-session-marker' }
let authChangeCallback
let unsubscribe

function AuthConsumer() {
  const auth = useAuth()

  return (
    <div>
      <output aria-label="loading">{String(auth.loading)}</output>
      <output aria-label="authenticated">{String(auth.isAuthenticated)}</output>
      <output aria-label="role">{auth.role || 'none'}</output>
      <output aria-label="profile">{JSON.stringify(auth.user)}</output>
      <output aria-label="auth error">{auth.authError || 'none'}</output>
      <button type="button" onClick={() => auth.login('analyst@example.com', 'mock-password').catch(() => {})}>Login action</button>
      <button type="button" onClick={() => auth.logout().catch(() => {})}>Logout action</button>
      <button type="button" onClick={() => auth.refreshProfile()}>Refresh profile</button>
    </div>
  )
}

function renderProvider() {
  return render(<AuthProvider><AuthConsumer /></AuthProvider>)
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authChangeCallback = undefined
    unsubscribe = vi.fn()
    getSession.mockResolvedValue({ data: { session: null }, error: null })
    signIn.mockResolvedValue({ data: { session: mockSession }, error: null })
    signOut.mockResolvedValue({ error: null })
    apiRequest.mockResolvedValue({ success: true, data: backendProfile })
    subscribeToAuthChanges.mockImplementation((callback) => {
      authChangeCallback = callback
      return { data: { subscription: { unsubscribe } } }
    })
  })

  it('starts loading and resolves the initial state', async () => {
    let resolveSession
    getSession.mockReturnValue(new Promise((resolve) => { resolveSession = resolve }))
    renderProvider()
    expect(screen.getByLabelText('loading')).toHaveTextContent('true')
    await act(async () => resolveSession({ data: { session: null }, error: null }))
    await waitFor(() => expect(screen.getByLabelText('loading')).toHaveTextContent('false'))
  })

  it('is unauthenticated when Supabase has no session', async () => {
    renderProvider()
    await waitFor(() => expect(screen.getByLabelText('loading')).toHaveTextContent('false'))
    expect(screen.getByLabelText('authenticated')).toHaveTextContent('false')
    expect(screen.getByLabelText('profile')).toHaveTextContent('null')
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('loads the backend profile for an existing session', async () => {
    getSession.mockResolvedValue({ data: { session: mockSession }, error: null })
    renderProvider()
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith('/auth/me'))
    expect(screen.getByLabelText('role')).toHaveTextContent('analyst')
    expect(screen.getByLabelText('profile')).toHaveTextContent('analyst@example.com')
  })

  it('calls authService signIn and stores the successful session', async () => {
    const user = userEvent.setup()
    renderProvider()
    await waitFor(() => expect(screen.getByLabelText('loading')).toHaveTextContent('false'))
    await user.click(screen.getByRole('button', { name: 'Login action' }))
    expect(signIn).toHaveBeenCalledWith('analyst@example.com', 'mock-password')
    await waitFor(() => expect(screen.getByLabelText('authenticated')).toHaveTextContent('true'))
  })

  it('exposes a safe message for failed login', async () => {
    const user = userEvent.setup()
    signIn.mockResolvedValue({ data: { session: null }, error: { status: 400, message: 'Internal Supabase detail' } })
    renderProvider()
    await user.click(screen.getByRole('button', { name: 'Login action' }))
    expect(await screen.findByLabelText('auth error')).toHaveTextContent('The email or password is incorrect.')
    expect(screen.getByLabelText('auth error')).not.toHaveTextContent('Internal Supabase detail')
  })

  it('calls signOut and clears the profile and session', async () => {
    const user = userEvent.setup()
    getSession.mockResolvedValue({ data: { session: mockSession }, error: null })
    renderProvider()
    await waitFor(() => expect(screen.getByLabelText('role')).toHaveTextContent('analyst'))
    await user.click(screen.getByRole('button', { name: 'Logout action' }))
    expect(signOut).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.getByLabelText('authenticated')).toHaveTextContent('false'))
    expect(screen.getByLabelText('profile')).toHaveTextContent('null')
  })

  it('updates session and profile after an auth-state event', async () => {
    renderProvider()
    await waitFor(() => expect(authChangeCallback).toBeTypeOf('function'))
    act(() => authChangeCallback('SIGNED_IN', mockSession))
    await waitFor(() => expect(screen.getByLabelText('role')).toHaveTextContent('analyst'))
    expect(screen.getByLabelText('authenticated')).toHaveTextContent('true')
  })

  it('keeps the access token out of the backend profile object', async () => {
    getSession.mockResolvedValue({ data: { session: mockSession }, error: null })
    renderProvider()
    await waitFor(() => expect(screen.getByLabelText('role')).toHaveTextContent('analyst'))
    expect(screen.getByLabelText('profile')).not.toHaveTextContent('mock-session-marker')
    expect(JSON.parse(screen.getByLabelText('profile').textContent)).toEqual(backendProfile)
  })

  it('takes the role from /auth/me rather than login input', async () => {
    const user = userEvent.setup()
    apiRequest.mockResolvedValue({ success: true, data: { ...backendProfile, role: 'admin' } })
    renderProvider()
    await user.click(screen.getByRole('button', { name: 'Login action' }))
    await waitFor(() => expect(screen.getByLabelText('role')).toHaveTextContent('admin'))
    expect(signIn).toHaveBeenCalledWith('analyst@example.com', 'mock-password')
  })

  it('refreshes /auth/me when a session exists', async () => {
    const user = userEvent.setup()
    getSession.mockResolvedValue({ data: { session: mockSession }, error: null })
    renderProvider()
    await waitFor(() => expect(apiRequest).toHaveBeenCalledTimes(1))
    await user.click(screen.getByRole('button', { name: 'Refresh profile' }))
    await waitFor(() => expect(apiRequest).toHaveBeenCalledTimes(2))
    expect(apiRequest).toHaveBeenLastCalledWith('/auth/me')
  })

  it('unsubscribes from auth changes when the provider unmounts', () => {
    const { unmount } = renderProvider()
    unmount()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
