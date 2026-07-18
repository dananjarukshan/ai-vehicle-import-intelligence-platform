import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../../contexts/AuthContext'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../../contexts/AuthContext', () => ({ useAuth: vi.fn() }))

function LoginProbe() {
  const location = useLocation()
  return <div>Login page from {location.state?.from?.pathname || 'none'}</div>
}

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route path="/private" element={<ProtectedRoute><div>Protected content</div></ProtectedRoute>} />
        <Route path="/login" element={<LoginProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading without protected content while auth initializes', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true, profileLoading: false })
    renderProtected()
    expect(screen.getByRole('status')).toHaveTextContent('Checking your session')
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('waits for the authenticated backend profile', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false, profileLoading: true })
    renderProtected()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects unauthenticated users and preserves the requested path', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false, profileLoading: false })
    renderProtected()
    expect(screen.getByText('Login page from /private')).toBeInTheDocument()
  })

  it('renders protected children after authentication resolves', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false, profileLoading: false })
    renderProtected()
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
