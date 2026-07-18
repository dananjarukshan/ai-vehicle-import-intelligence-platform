import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { mockVehicle } from '../../test/testUtils'
import VehicleTable from './VehicleTable'

const actions = { onEdit: vi.fn(), onEstimate: vi.fn(), onDelete: vi.fn() }

describe('VehicleTable', () => {
  it('shows loading and empty states', () => {
    const { rerender } = render(<VehicleTable vehicles={[]} role="viewer" loading {...actions} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading vehicles')
    rerender(<VehicleTable vehicles={[]} role="viewer" loading={false} {...actions} />)
    expect(screen.getByText('No vehicles found')).toBeInTheDocument()
  })

  it('renders stable vehicle data and null estimates', () => {
    render(<VehicleTable vehicles={[mockVehicle]} role="viewer" loading={false} {...actions} />)
    expect(screen.getByRole('rowheader', { name: 'Toyota' })).toBeInTheDocument()
    expect(screen.getByText('Prius')).toBeInTheDocument()
    expect(screen.getByText('85,000 km')).toBeInTheDocument()
    expect(screen.getAllByText('Not estimated')).toHaveLength(2)
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument()
  })

  it('adds the actions column for write roles', () => {
    render(<VehicleTable vehicles={[mockVehicle]} role="admin" loading={false} {...actions} />)
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete toyota prius/i })).toBeInTheDocument()
  })
})
