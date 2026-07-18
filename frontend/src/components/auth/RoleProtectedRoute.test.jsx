import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../../contexts/AuthContext'
import RoleProtectedRoute from './RoleProtectedRoute'

vi.mock('../../contexts/AuthContext', () => ({ useAuth: vi.fn() }))

function renderRoleRoute(allowedRoles) {
  return render(
    <MemoryRouter initialEntries={['/role-page']}>
      <Routes>
        <Route path="/role-page" element={<RoleProtectedRoute allowedRoles={allowedRoles}><div>Allowed content</div></RoleProtectedRoute>} />
        <Route path="/forbidden" element={<div>Forbidden page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RoleProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([
    ['viewer', ['viewer']],
    ['analyst', ['analyst']],
    ['admin', ['admin']],
  ])('allows a %s on its permitted route', (role, allowedRoles) => {
    useAuth.mockReturnValue({ role, profileLoading: false })
    renderRoleRoute(allowedRoles)
    expect(screen.getByText('Allowed content')).toBeInTheDocument()
  })

  it.each([
    ['viewer', ['analyst', 'admin']],
    ['analyst', ['admin']],
    [null, ['viewer', 'analyst', 'admin']],
  ])('denies role %s when it is not allowed', (role, allowedRoles) => {
    useAuth.mockReturnValue({ role, profileLoading: false })
    renderRoleRoute(allowedRoles)
    expect(screen.getByText('Forbidden page')).toBeInTheDocument()
    expect(screen.queryByText('Allowed content')).not.toBeInTheDocument()
  })

  it('shows permission loading before deciding', () => {
    useAuth.mockReturnValue({ role: null, profileLoading: true })
    renderRoleRoute(['admin'])
    expect(screen.getByRole('status')).toHaveTextContent('Checking permissions')
  })

  it('uses only the role returned by AuthContext', () => {
    useAuth.mockReturnValue({ role: 'viewer', profileLoading: false })
    window.history.replaceState({}, '', '/role-page?role=admin')
    renderRoleRoute(['admin'])
    expect(screen.getByText('Forbidden page')).toBeInTheDocument()
  })
})
