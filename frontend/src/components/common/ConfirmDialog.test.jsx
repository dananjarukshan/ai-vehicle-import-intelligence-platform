import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ConfirmDialog from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('calls confirm and cancel actions', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog isOpen title="Delete vehicle" message="Continue?" confirmLabel="Delete vehicle" onConfirm={onConfirm} onCancel={onCancel} danger />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete vehicle' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('disables confirm and cancel while loading', () => {
    render(<ConfirmDialog isOpen title="Delete" message="Continue?" loading onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('shows a safe operation error', () => {
    render(<ConfirmDialog isOpen title="Delete" message="Continue?" errorMessage="Permission denied." onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Permission denied.')
  })
})
