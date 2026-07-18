import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../contexts/AuthContext'
import LoginPage from './LoginPage'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))

const login = vi.fn()

function renderLogin(initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard destination</div>} />
        <Route path="/vehicles" element={<div>Vehicles destination</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ login, isAuthenticated: false, loading: false })
    login.mockResolvedValue({})
  })

  it('renders accessible credentials and submit controls', () => {
    renderLogin()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows required validation for an empty form', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Email and password are required.')
    expect(login).not.toHaveBeenCalled()
  })

  it('accepts typed credentials and submits trimmed email', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText('Email address'), ' analyst@example.com ')
    await user.type(screen.getByLabelText('Password'), 'safe-test-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(login).toHaveBeenCalledWith('analyst@example.com', 'safe-test-password'))
  })

  it('redirects to the dashboard after successful login', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText('Email address'), 'viewer@example.com')
    await user.type(screen.getByLabelText('Password'), 'safe-test-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Dashboard destination')).toBeInTheDocument()
  })

  it('returns to the originally requested protected route', async () => {
    const user = userEvent.setup()
    renderLogin({ pathname: '/login', state: { from: { pathname: '/vehicles' } } })
    await user.type(screen.getByLabelText('Email address'), 'viewer@example.com')
    await user.type(screen.getByLabelText('Password'), 'safe-test-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Vehicles destination')).toBeInTheDocument()
  })

  it('displays a safe login failure without printing the password', async () => {
    const user = userEvent.setup()
    login.mockRejectedValue(new Error('The email or password is incorrect.'))
    renderLogin()
    await user.type(screen.getByLabelText('Email address'), 'viewer@example.com')
    await user.type(screen.getByLabelText('Password'), 'private-value-123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('The email or password is incorrect.')
    expect(screen.getByRole('alert')).not.toHaveTextContent('private-value-123')
  })

  it('does not render a role selector', () => {
    renderLogin()
    expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('redirects an already authenticated user away from login', () => {
    useAuth.mockReturnValue({ login, isAuthenticated: true, loading: false })
    renderLogin()
    expect(screen.getByText('Dashboard destination')).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
  })
})
