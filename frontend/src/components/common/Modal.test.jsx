import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
  it('does not render when closed', () => {
    render(<Modal isOpen={false} title="Hidden" onClose={vi.fn()}>Content</Modal>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders accessible title and children when open', () => {
    render(<Modal isOpen title="Vehicle details" onClose={vi.fn()}><p>Dialog content</p></Modal>)
    expect(screen.getByRole('dialog', { name: 'Vehicle details' })).toBeInTheDocument()
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  it('calls onClose from the close button and Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal isOpen title="Vehicle details" onClose={onClose}>Content</Modal>)
    await user.click(screen.getByRole('button', { name: /close vehicle details/i }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('closes on backdrop but not on inside mouse clicks', () => {
    const onClose = vi.fn()
    render(<Modal isOpen title="Vehicle details" onClose={onClose}><button type="button">Inside</button></Modal>)
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Inside' }))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('disables closing while processing', () => {
    const onClose = vi.fn()
    render(<Modal isOpen title="Vehicle details" onClose={onClose} closeDisabled>Content</Modal>)
    expect(screen.getByRole('button', { name: /close/i })).toBeDisabled()
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement)
    expect(onClose).not.toHaveBeenCalled()
  })
})
