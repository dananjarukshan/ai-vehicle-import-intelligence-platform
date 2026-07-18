import { useEffect, useRef } from 'react'

const carImages = [
  '/backgrounds/car-hero-1.jpg',
  '/backgrounds/car-hero-2.jpg',
  '/backgrounds/car-hero-3.jpg',
  '/backgrounds/car-hero-4.jpg',
]

/** Decorative automotive backdrop with pointer-reactive depth and reduced-motion support. */
export default function DynamicCarBackground({ variant = 'dashboard' }) {
  const backgroundRef = useRef(null)

  useEffect(() => {
    const element = backgroundRef.current
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!element || prefersReducedMotion) return undefined

    let animationFrame = null

    function handlePointerMove(event) {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 18
        const y = (event.clientY / window.innerHeight - 0.5) * 12
        element.style.setProperty('--cursor-x', `${x.toFixed(2)}px`)
        element.style.setProperty('--cursor-y', `${y.toFixed(2)}px`)
        animationFrame = null
      })
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <div
      ref={backgroundRef}
      className={`dynamic-car-background dynamic-car-background--${variant}`}
      aria-hidden="true"
    >
      <div className="dynamic-car-background__images">
        {carImages.map((image, index) => (
          <div
            className={`dynamic-car-background__image dynamic-car-background__image--${index + 1}`}
            style={{ backgroundImage: `url(${image})` }}
            key={image}
          />
        ))}
      </div>
      <div className="dynamic-car-background__glow dynamic-car-background__glow--one" />
      <div className="dynamic-car-background__glow dynamic-car-background__glow--two" />
      <div className="dynamic-car-background__grid" />
      <div className="dynamic-car-background__streak" />
      <div className="dynamic-car-background__shade" />
    </div>
  )
}
