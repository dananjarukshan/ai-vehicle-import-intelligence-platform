import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { mockVehicle } from '../../test/testUtils'
import VehicleActions from './VehicleActions'

function renderActions(role) {
  const callbacks = { onEdit: vi.fn(), onEstimate: vi.fn(), onDelete: vi.fn() }
  render(<VehicleActions vehicle={mockVehicle} role={role} {...callbacks} />)
  return callbacks
}

describe('VehicleActions', () => {
  it('shows no mutation actions for a viewer', () => {
    renderActions('viewer')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows Edit and Estimate but not Delete for an analyst', () => {
    renderActions('analyst')
    expect(screen.getByRole('button', { name: /edit toyota prius/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /estimate price for toyota prius/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('shows all mutation actions for an admin', () => {
    renderActions('admin')
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /estimate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('calls each admin action with the selected vehicle', async () => {
    const user = userEvent.setup()
    const callbacks = renderActions('admin')

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.click(screen.getByRole('button', { name: /estimate/i }))
    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(callbacks.onEdit).toHaveBeenCalledWith(mockVehicle)
    expect(callbacks.onEstimate).toHaveBeenCalledWith(mockVehicle)
    expect(callbacks.onDelete).toHaveBeenCalledWith(mockVehicle)
  })

  it('shows no actions for an unknown or missing role', () => {
    const { rerender } = render(<VehicleActions vehicle={mockVehicle} role="unknown" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<VehicleActions vehicle={mockVehicle} role={null} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
