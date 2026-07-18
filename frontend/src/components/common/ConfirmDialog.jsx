import Modal from './Modal'

/** Reusable confirmation dialog for destructive or sensitive operations. */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
  danger = false,
  errorMessage = '',
}) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel} closeDisabled={loading} size="small">
      <div className="confirm-dialog">
        <div className={danger ? 'confirm-icon confirm-icon--danger' : 'confirm-icon'} aria-hidden="true">!</div>
        <p>{message}</p>
        {errorMessage && <div className="confirm-error" role="alert">{errorMessage}</div>}
        <div className="modal-actions">
          <button className="button button--secondary" type="button" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={danger ? 'button button--danger' : 'button button--primary'}
            type="button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
