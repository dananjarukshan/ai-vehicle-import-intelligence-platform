import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../contexts/AuthContext'
import {
  createVehicle,
  deleteVehicle,
  estimateVehiclePrice,
  getVehicles,
  updateVehicle,
} from '../services/vehicleApi'
import {
  mockEstimateResponse,
  mockPagination,
  mockVehicle,
  mockVehicleListResponse,
} from '../test/testUtils'
import VehiclesPage from './VehiclesPage'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../services/vehicleApi', () => ({
  getVehicles: vi.fn(),
  createVehicle: vi.fn(),
  updateVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
  estimateVehiclePrice: vi.fn(),
}))

const mutationResponse = { success: true, message: 'Operation completed.', data: mockVehicle }

function setRole(role) {
  useAuth.mockReturnValue({ role })
}

async function renderLoadedPage(role = 'viewer') {
  setRole(role)
  render(<VehiclesPage />)
  await screen.findByRole('rowheader', { name: 'Toyota' })
}

async function fillRequiredVehicleFields(user) {
  await user.type(screen.getByLabelText(/^Make/), 'Honda')
  await user.type(screen.getByLabelText(/^Model/), 'Vezel')
  await user.type(screen.getByLabelText(/^Year/), '2021')
}

describe('VehiclesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setRole('viewer')
    getVehicles.mockResolvedValue(mockVehicleListResponse)
    createVehicle.mockResolvedValue(mutationResponse)
    updateVehicle.mockResolvedValue(mutationResponse)
    deleteVehicle.mockResolvedValue(mutationResponse)
    estimateVehiclePrice.mockResolvedValue(mockEstimateResponse)
  })

  it('shows the initial loading state', () => {
    getVehicles.mockReturnValue(new Promise(() => {}))
    render(<VehiclesPage />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading vehicles')
  })

  it('renders vehicle records and null estimate labels', async () => {
    await renderLoadedPage()
    expect(screen.getByText('Prius')).toBeInTheDocument()
    expect(screen.getByText('85,000 km')).toBeInTheDocument()
    expect(screen.getAllByText('Not estimated')).toHaveLength(2)
  })

  it('renders the empty state', async () => {
    getVehicles.mockResolvedValue({
      success: true,
      data: [],
      meta: { ...mockPagination, total: 0, count: 0, totalPages: 0 },
    })
    render(<VehiclesPage />)
    expect(await screen.findByText('No vehicles found')).toBeInTheDocument()
  })

  it('shows a safe list API error', async () => {
    getVehicles.mockRejectedValue(new Error('Vehicles are temporarily unavailable.'))
    render(<VehiclesPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Vehicles are temporarily unavailable.')
  })

  it('renders pagination and requests the next page', async () => {
    const firstPage = {
      ...mockVehicleListResponse,
      meta: { ...mockPagination, total: 2, totalPages: 2, hasNextPage: true },
    }
    const secondPage = {
      ...mockVehicleListResponse,
      meta: { ...mockPagination, total: 2, page: 2, totalPages: 2, hasPrevPage: true },
    }
    getVehicles.mockResolvedValueOnce(firstPage).mockResolvedValueOnce(secondPage)
    const user = userEvent.setup()
    await renderLoadedPage()
    expect(screen.getByText(/Page/)).toHaveTextContent('Page 1 of 2')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(getVehicles).toHaveBeenCalledWith({ page: 2, limit: 10 }))
    expect(await screen.findByText(/Page/)).toHaveTextContent('Page 2 of 2')
  })

  it('shows read-only controls for a viewer', async () => {
    await renderLoadedPage('viewer')
    expect(screen.getByText('Read-only access')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add vehicle/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /estimate/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('shows Add, Edit, and Estimate but not Delete for an analyst', async () => {
    await renderLoadedPage('analyst')
    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit toyota prius/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /estimate price for toyota prius/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('shows every management control for an admin', async () => {
    await renderLoadedPage('admin')
    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /estimate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete toyota prius/i })).toBeInTheDocument()
  })

  it('opens the create modal and completes a successful create', async () => {
    const user = userEvent.setup()
    await renderLoadedPage('analyst')
    await user.click(screen.getByRole('button', { name: /add vehicle/i }))
    expect(screen.getByRole('dialog', { name: 'Add vehicle' })).toBeInTheDocument()
    await fillRequiredVehicleFields(user)
    await user.click(screen.getByRole('button', { name: 'Create vehicle' }))
    await waitFor(() => expect(createVehicle).toHaveBeenCalledWith({ make: 'Honda', model: 'Vezel', year: 2021 }))
    await waitFor(() => expect(getVehicles).toHaveBeenCalledTimes(2))
    expect(screen.getByRole('status')).toHaveTextContent('Operation completed.')
  })

  it('displays backend validation details from create', async () => {
    const error = Object.assign(new Error('Validation failed.'), { errors: ["model: 'model' is required."] })
    createVehicle.mockRejectedValue(error)
    const user = userEvent.setup()
    await renderLoadedPage('analyst')
    await user.click(screen.getByRole('button', { name: /add vehicle/i }))
    await fillRequiredVehicleFields(user)
    await user.click(screen.getByRole('button', { name: 'Create vehicle' }))
    expect(await screen.findByRole('alert')).toHaveTextContent("model: 'model' is required.")
  })

  it('opens edit with current values and refreshes after update', async () => {
    const user = userEvent.setup()
    await renderLoadedPage('analyst')
    await user.click(screen.getByRole('button', { name: /edit toyota prius/i }))
    expect(screen.getByRole('dialog', { name: 'Edit vehicle' })).toBeInTheDocument()
    const mileage = screen.getByLabelText(/Mileage/)
    await user.clear(mileage)
    await user.type(mileage, '90000')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(updateVehicle).toHaveBeenCalledWith(
      mockVehicle.id,
      expect.objectContaining({ mileage: 90000 }),
    ))
    await waitFor(() => expect(getVehicles).toHaveBeenCalledTimes(2))
  })

  it('opens estimate, calculates with defaults, displays results, and refreshes', async () => {
    const user = userEvent.setup()
    await renderLoadedPage('analyst')
    await user.click(screen.getByRole('button', { name: /estimate price for toyota prius/i }))
    expect(screen.getByRole('dialog', { name: 'Estimate vehicle price' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Calculate estimate' }))
    await waitFor(() => expect(estimateVehiclePrice).toHaveBeenCalledWith(mockVehicle.id, {}))
    expect(await screen.findByText('Estimate calculated')).toBeInTheDocument()
    await waitFor(() => expect(getVehicles).toHaveBeenCalledTimes(2))
  })

  it('opens confirmation, deletes only after confirm, and refreshes', async () => {
    const user = userEvent.setup()
    await renderLoadedPage('admin')
    await user.click(screen.getByRole('button', { name: /delete toyota prius/i }))
    expect(screen.getByRole('dialog', { name: 'Delete vehicle' })).toHaveTextContent('Toyota Prius')
    expect(deleteVehicle).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Delete vehicle' }))
    await waitFor(() => expect(deleteVehicle).toHaveBeenCalledWith(mockVehicle.id))
    await waitFor(() => expect(getVehicles).toHaveBeenCalledTimes(2))
  })

  it.each([
    [403, 'You do not have permission to perform this action.'],
    [401, 'Your session has expired. Please sign in again.'],
  ])('handles a %s mutation error safely', async (status, message) => {
    createVehicle.mockRejectedValue(Object.assign(new Error(message), { status }))
    const user = userEvent.setup()
    await renderLoadedPage('analyst')
    await user.click(screen.getByRole('button', { name: /add vehicle/i }))
    await fillRequiredVehicleFields(user)
    await user.click(screen.getByRole('button', { name: 'Create vehicle' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.queryByText(/access.?token/i)).not.toBeInTheDocument()
  })

  it('never renders token or stack properties from an API error', async () => {
    const error = Object.assign(new Error('Safe public message.'), {
      stack: 'private stack trace',
      token: 'private-token-marker',
    })
    getVehicles.mockRejectedValue(error)
    render(<VehiclesPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Safe public message.')
    expect(document.body).not.toHaveTextContent('private stack trace')
    expect(document.body).not.toHaveTextContent('private-token-marker')
  })

  it('moves to the previous page after deleting the only record on a later page', async () => {
    getVehicles
      .mockResolvedValueOnce({
        ...mockVehicleListResponse,
        meta: { ...mockPagination, total: 2, totalPages: 2, hasNextPage: true },
      })
      .mockResolvedValueOnce({
        ...mockVehicleListResponse,
        meta: { ...mockPagination, total: 2, page: 2, totalPages: 2, hasPrevPage: true },
      })
      .mockResolvedValueOnce(mockVehicleListResponse)
    setRole('admin')
    const user = userEvent.setup()
    render(<VehiclesPage />)
    await screen.findByRole('rowheader', { name: 'Toyota' })

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(getVehicles).toHaveBeenCalledWith({ page: 2, limit: 10 }))
    await user.click(screen.getByRole('button', { name: /delete toyota prius/i }))
    await user.click(screen.getByRole('button', { name: 'Delete vehicle' }))
    await waitFor(() => expect(getVehicles).toHaveBeenCalledWith({ page: 1, limit: 10 }))
  })
})
