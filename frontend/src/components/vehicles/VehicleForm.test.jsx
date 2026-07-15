import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockVehicle } from '../../test/testUtils'
import VehicleForm from './VehicleForm'

describe('VehicleForm', () => {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    onSubmit.mockResolvedValue(undefined)
  })

  it('renders all create fields and marks make, model, and year required', () => {
    render(<VehicleForm onSubmit={onSubmit} onCancel={onCancel} />)
    expect(screen.getByLabelText(/^Make/)).toBeRequired()
    expect(screen.getByLabelText(/^Model/)).toBeRequired()
    expect(screen.getByLabelText(/^Year/)).toBeRequired()
    expect(screen.getByLabelText(/Mileage/)).not.toBeRequired()
    expect(screen.getByRole('button', { name: /create vehicle/i })).toBeInTheDocument()
  })

  it('shows client errors when required fields are empty', async () => {
    const user = userEvent.setup()
    render(<VehicleForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /create vehicle/i }))
    expect(screen.getByText('Make is required.')).toBeInTheDocument()
    expect(screen.getByText('Model is required.')).toBeInTheDocument()
    expect(screen.getByText('Year is required.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('trims strings, converts numbers, and omits blank optional fields', async () => {
    const user = userEvent.setup()
    render(<VehicleForm onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText(/^Make/), '  Toyota  ')
    await user.type(screen.getByLabelText(/^Model/), '  Prius  ')
    await user.type(screen.getByLabelText(/^Year/), '2019')
    await user.type(screen.getByLabelText(/Mileage/), '85000')
    await user.type(screen.getByLabelText(/Auction grade/), ' 4.5 ')
    await user.type(screen.getByLabelText(/^Auction price/), '1250000')
    await user.click(screen.getByRole('button', { name: /create vehicle/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      make: 'Toyota',
      model: 'Prius',
      year: 2019,
      mileage: 85000,
      auction_grade: '4.5',
      auction_price: 1250000,
    }))
  })

  it('displays backend validation errors', () => {
    render(<VehicleForm onSubmit={onSubmit} onCancel={onCancel} serverErrors={["'year' must be valid."]} />)
    expect(screen.getByRole('alert')).toHaveTextContent("'year' must be valid.")
  })

  it('disables submission while saving', () => {
    render(<VehicleForm onSubmit={onSubmit} onCancel={onCancel} loading />)
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('prefills every editable field in edit mode', () => {
    render(<VehicleForm mode="edit" initialVehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    expect(screen.getByLabelText(/^Make/)).toHaveValue('Toyota')
    expect(screen.getByLabelText(/^Model/)).toHaveValue('Prius')
    expect(screen.getByLabelText(/^Year/)).toHaveValue(2019)
    expect(screen.getByLabelText(/Mileage/)).toHaveValue(85000)
    expect(screen.getByLabelText(/Auction grade/)).toHaveValue('4.5')
  })

  it('submits editable fields without id or created_at in edit mode', async () => {
    const user = userEvent.setup()
    render(<VehicleForm mode="edit" initialVehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    const mileage = screen.getByLabelText(/Mileage/)
    await user.clear(mileage)
    await user.type(mileage, '90000')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const payload = onSubmit.mock.calls[0][0]
    expect(payload).toMatchObject({ make: 'Toyota', model: 'Prius', year: 2019, mileage: 90000 })
    expect(payload).not.toHaveProperty('id')
    expect(payload).not.toHaveProperty('created_at')
  })

  it('calls onCancel from edit mode', async () => {
    const user = userEvent.setup()
    render(<VehicleForm mode="edit" initialVehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
