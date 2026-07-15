/** A small accessible loading indicator shared by routes and pages. */
export default function LoadingSpinner({ label = 'Loading…', fullPage = false }) {
  return (
    <div className={fullPage ? 'loading-state loading-state--full' : 'loading-state'} role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
