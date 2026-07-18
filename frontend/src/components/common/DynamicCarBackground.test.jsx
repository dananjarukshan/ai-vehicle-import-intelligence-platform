import { fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DynamicCarBackground from './DynamicCarBackground'

describe('DynamicCarBackground', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the supplied car images as a decorative, non-interactive layer', () => {
    const { container } = render(<DynamicCarBackground variant="login" />)
    const background = container.firstElementChild
    const images = container.querySelectorAll('.dynamic-car-background__image')

    expect(background).toHaveAttribute('aria-hidden', 'true')
    expect(background).toHaveClass('dynamic-car-background--login')
    expect(images).toHaveLength(4)
    expect(images[0]).toHaveStyle({ backgroundImage: 'url(/backgrounds/car-hero-1.jpg)' })
    expect(images[3]).toHaveStyle({ backgroundImage: 'url(/backgrounds/car-hero-4.jpg)' })
  })

  it('updates cursor variables after pointer movement when motion is allowed', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false })
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback()
      return 1
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const { container } = render(<DynamicCarBackground />)
    fireEvent.pointerMove(window, { clientX: window.innerWidth, clientY: window.innerHeight })

    expect(container.firstElementChild.style.getPropertyValue('--cursor-x')).toBe('9.00px')
    expect(container.firstElementChild.style.getPropertyValue('--cursor-y')).toBe('6.00px')
  })

  it('does not subscribe to pointer movement when reduced motion is preferred', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true })
    const addEventListener = vi.spyOn(window, 'addEventListener')

    render(<DynamicCarBackground />)

    expect(addEventListener).not.toHaveBeenCalledWith('pointermove', expect.any(Function), expect.anything())
  })
})
