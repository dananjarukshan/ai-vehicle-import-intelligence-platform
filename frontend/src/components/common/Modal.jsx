import { useEffect, useId, useRef } from 'react'

/** Accessible modal shell shared by forms and confirmation dialogs. */
export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  closeDisabled = false,
  size = 'medium',
}) {
  const titleId = useId()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Move focus to the first usable control, or to the dialog itself.
    const focusTimer = window.setTimeout(() => {
      const firstControl = dialogRef.current?.querySelector(
        'input:not(:disabled), button:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
      )
      ;(firstControl || dialogRef.current)?.focus()
    }, 0)

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !closeDisabled) {
        onClose()
        return
      }

      // Keep keyboard focus inside the open dialog. This prevents Tab from
      // moving to dashboard controls hidden behind the modal backdrop.
      if (event.key === 'Tab') {
        const focusableControls = Array.from(
          dialogRef.current?.querySelectorAll(
            'a[href], input:not(:disabled), button:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => !element.hasAttribute('hidden'))

        if (focusableControls.length === 0) {
          event.preventDefault()
          dialogRef.current?.focus()
          return
        }

        const firstControl = focusableControls[0]
        const lastControl = focusableControls[focusableControls.length - 1]

        if (event.shiftKey && document.activeElement === firstControl) {
          event.preventDefault()
          lastControl.focus()
        } else if (!event.shiftKey && document.activeElement === lastControl) {
          event.preventDefault()
          firstControl.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [isOpen, closeDisabled, onClose])

  if (!isOpen) return null

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !closeDisabled) onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <section
        ref={dialogRef}
        className={`modal-card modal-card--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={closeDisabled}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            className="modal-close"
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
            disabled={closeDisabled}
          >
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  )
}
