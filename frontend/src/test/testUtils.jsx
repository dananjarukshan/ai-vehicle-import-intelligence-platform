import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { AuthContext } from '../contexts/AuthContextDefinition'

export const viewerUser = { id: 'viewer-id', email: 'viewer@example.com', role: 'viewer' }
export const analystUser = { id: 'analyst-id', email: 'analyst@example.com', role: 'analyst' }
export const adminUser = { id: 'admin-id', email: 'admin@example.com', role: 'admin' }

export const mockVehicle = {
  id: '11111111-1111-4111-8111-111111111111',
  make: 'Toyota',
  model: 'Prius',
  year: 2019,
  mileage: 85000,
  auction_grade: '4.5',
  auction_price: 1250000,
  estimated_import_cost: null,
  estimated_selling_price: null,
  created_at: '2026-06-08T13:22:26.112738',
}

export const mockPagination = {
  total: 1,
  count: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
}

export const mockVehicleListResponse = {
  success: true,
  message: 'Vehicles fetched successfully.',
  data: [mockVehicle],
  meta: mockPagination,
}

export const mockEstimateResponse = {
  success: true,
  message: 'Vehicle price estimated successfully.',
  data: {
    ...mockVehicle,
    estimated_import_cost: 1700000,
    estimated_selling_price: 1955000,
  },
  meta: {
    auction_price_local: 1400000,
    base_import_cost: 1500000,
    duty_amount: 150000,
    vat_amount: 50000,
    profit_amount: 255000,
  },
}

/** Build the value normally exposed by AuthProvider using a safe mock user. */
export function createMockAuthValue(user = viewerUser, overrides = {}) {
  return {
    session: user ? {} : null,
    user,
    profile: user,
    role: user?.role ?? null,
    loading: false,
    profileLoading: false,
    authError: '',
    login: vi.fn(),
    logout: vi.fn(),
    refreshProfile: vi.fn(),
    isAuthenticated: Boolean(user),
    ...overrides,
  }
}

/** Render UI inside a MemoryRouter for isolated route tests. */
export function renderWithRouter(ui, { initialEntries = ['/'], ...options } = {}) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>, options)
}

/** Render UI with a controlled AuthContext value and MemoryRouter. */
export function renderWithAuth(ui, authValue, { initialEntries = ['/'], ...options } = {}) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
    options,
  )
}
