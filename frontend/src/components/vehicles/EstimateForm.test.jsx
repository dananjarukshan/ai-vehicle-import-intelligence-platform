import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockEstimateResponse, mockVehicle } from '../../test/testUtils'
import EstimateForm from './EstimateForm'

describe('EstimateForm', () => {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    onSubmit.mockResolvedValue(undefined)
  })

  it('renders the selected vehicle, auction price, and every estimate field', () => {
    render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    expect(screen.getByText('Toyota Prius')).toBeInTheDocument()
    expect(screen.getByText('1,250,000')).toBeInTheDocument()
    for (const label of ['Exchange rate', 'Freight cost', 'Insurance cost', 'Clearance cost', 'Duty rate', 'VAT rate', 'Profit margin rate', 'Other costs']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
  })

  it('allows an empty form so backend defaults can be used', async () => {
    const user = userEvent.setup()
    render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /run estimate/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({}))
  })

  it('converts non-empty inputs to numbers', async () => {
    const user = userEvent.setup()
    render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('Exchange rate'), '1.25')
    await user.type(screen.getByLabelText('Freight cost'), '5000')
    await user.type(screen.getByLabelText('Duty rate'), '0.18')
    await user.click(screen.getByRole('button', { name: /run estimate/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      exchange_rate: 1.25,
      freight_cost: 5000,
      duty_rate: 0.18,
    }))
  })

  it('rejects negative costs before submission', async () => {
    const user = userEvent.setup()
    render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('Freight cost'), '-10')
    await user.click(screen.getByRole('button', { name: /run estimate/i }))
    expect(screen.getByText('Freight cost cannot be negative.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects an exchange rate of zero', async () => {
    const user = userEvent.setup()
    render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    await user.type(screen.getByLabelText('Exchange rate'), '0')
    await user.click(screen.getByRole('button', { name: /run estimate/i }))
    expect(screen.getByText('Exchange rate must be greater than zero.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('explains decimal percentage rate input', () => {
    render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    expect(screen.getAllByText('Enter as a decimal: 0.18 means 18%.')).toHaveLength(3)
  })

  it('displays backend validation errors', () => {
    render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} serverErrors={["'duty_rate' must be valid."]} />)
    expect(screen.getByRole('alert')).toHaveTextContent("'duty_rate' must be valid.")
  })

  it('displays the updated vehicle and direct meta breakdown', () => {
    render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} result={mockEstimateResponse} />)
    expect(screen.getByText('Estimate calculated')).toBeInTheDocument()
    for (const value of ['1,700,000', '1,955,000', '1,400,000', '1,500,000', '150,000', '50,000', '255,000']) {
      expect(screen.getByText(value)).toBeInTheDocument()
    }
  })

  it('disables controls while calculating', () => {
    render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} loading />)
    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('calls cancel, or close after a result', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    rerender(<EstimateForm vehicle={mockVehicle} onSubmit={onSubmit} onCancel={onCancel} result={mockEstimateResponse} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onCancel).toHaveBeenCalledTimes(2)
  })
})
