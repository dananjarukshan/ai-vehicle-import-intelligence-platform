import { useCallback, useEffect, useState } from 'react'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ErrorMessage from '../components/common/ErrorMessage'
import Modal from '../components/common/Modal'
import EstimateForm from '../components/vehicles/EstimateForm'
import VehicleForm from '../components/vehicles/VehicleForm'
import VehicleTable from '../components/vehicles/VehicleTable'
import { useAuth } from '../contexts/AuthContext'
import {
  createVehicle,
  deleteVehicle,
  estimateVehiclePrice,
  getVehicles,
  updateVehicle,
} from '../services/vehicleApi'

const PAGE_SIZE = 10

/** Convert an ApiError into safe strings while preserving backend validation details. */
function getErrorMessages(error) {
  const validationMessages = Array.isArray(error?.errors)
    ? error.errors
        .map((item) => {
          if (typeof item === 'string') return item
          if (typeof item?.message !== 'string') return null
          return item.field ? `${item.field}: ${item.message}` : item.message
        })
        .filter(Boolean)
    : []

  return validationMessages.length > 0
    ? validationMessages
    : [error?.message || 'The request could not be completed.']
}

/** Vehicle CRUD and formula-estimation workspace. */
export default function VehiclesPage() {
  const { role } = useAuth()
  const [page, setPage] = useState(1)
  const [vehicles, setVehicles] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [mutationLoading, setMutationLoading] = useState(false)
  const [mutationErrors, setMutationErrors] = useState([])
  const [estimateResult, setEstimateResult] = useState(null)

  const canWrite = role === 'analyst' || role === 'admin'

  const loadVehicles = useCallback(async () => {
    setLoading(true)
    setPageError('')
    try {
      const response = await getVehicles({ page, limit: PAGE_SIZE })
      setVehicles(Array.isArray(response.data) ? response.data : [])
      setMeta(response.meta ?? null)
    } catch (error) {
      setVehicles([])
      setMeta(null)
      setPageError(error.message || 'Vehicles could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const closeModal = useCallback(() => {
    if (mutationLoading) return
    setActiveModal(null)
    setSelectedVehicle(null)
    setMutationErrors([])
    setEstimateResult(null)
  }, [mutationLoading])

  function openModal(type, vehicle = null) {
    setSelectedVehicle(vehicle)
    setActiveModal(type)
    setMutationErrors([])
    setEstimateResult(null)
    setPageError('')
    setSuccessMessage('')
  }

  async function handleCreate(vehicleData) {
    if (mutationLoading) return
    setMutationLoading(true)
    setMutationErrors([])
    try {
      const response = await createVehicle(vehicleData)
      setActiveModal(null)
      setSelectedVehicle(null)
      setSuccessMessage(response.message || 'Vehicle created successfully.')
      await loadVehicles()
    } catch (error) {
      setMutationErrors(getErrorMessages(error))
    } finally {
      setMutationLoading(false)
    }
  }

  async function handleUpdate(vehicleData) {
    if (!selectedVehicle || mutationLoading) return
    setMutationLoading(true)
    setMutationErrors([])
    try {
      const response = await updateVehicle(selectedVehicle.id, vehicleData)
      setActiveModal(null)
      setSelectedVehicle(null)
      setSuccessMessage(response.message || 'Vehicle updated successfully.')
      await loadVehicles()
    } catch (error) {
      setMutationErrors(getErrorMessages(error))
    } finally {
      setMutationLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedVehicle || mutationLoading) return
    setMutationLoading(true)
    setMutationErrors([])
    try {
      const response = await deleteVehicle(selectedVehicle.id)
      const shouldMoveBack = vehicles.length === 1 && page > 1
      setActiveModal(null)
      setSelectedVehicle(null)
      setSuccessMessage(response.message || 'Vehicle deleted successfully.')

      if (shouldMoveBack) setPage((current) => Math.max(1, current - 1))
      else await loadVehicles()
    } catch (error) {
      setMutationErrors(getErrorMessages(error))
    } finally {
      setMutationLoading(false)
    }
  }

  async function handleEstimate(estimateOptions) {
    if (!selectedVehicle || mutationLoading) return
    setMutationLoading(true)
    setMutationErrors([])
    try {
      const response = await estimateVehiclePrice(selectedVehicle.id, estimateOptions)
      setEstimateResult(response)
      setSelectedVehicle(response.data)
      setSuccessMessage(response.message || 'Vehicle price estimated successfully.')
      await loadVehicles()
    } catch (error) {
      setMutationErrors(getErrorMessages(error))
    } finally {
      setMutationLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading page-heading--vehicles">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Vehicle records</h2>
          <p>Manage auction data and run formula-based price estimates.</p>
        </div>
        <div className="action-toolbar">
          {canWrite && (
            <button className="button button--primary" type="button" onClick={() => openModal('create')}>
              Create Vehicle
            </button>
          )}
        </div>
      </section>

      {successMessage && (
        <div className="success-message" role="status">
          <span aria-hidden="true">✓</span>
          <p>{successMessage}</p>
          <button type="button" aria-label="Dismiss success message" onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}
      {pageError && <ErrorMessage message={pageError} onRetry={loadVehicles} />}

      <section className="content-card table-card" aria-busy={loading}>
        <div className="table-card__header">
          <div>
            <h3>All vehicles</h3>
            <p>{meta ? `${meta.total.toLocaleString()} total records` : 'Inventory records'}</p>
          </div>
          <span className="read-mode">{canWrite ? 'Management access' : 'Read-only access'}</span>
        </div>

        <VehicleTable
          vehicles={vehicles}
          role={role}
          loading={loading}
          onEdit={(vehicle) => openModal('edit', vehicle)}
          onEstimate={(vehicle) => openModal('estimate', vehicle)}
          onDelete={(vehicle) => openModal('delete', vehicle)}
        />

        {meta && vehicles.length > 0 && !loading && (
          <div className="pagination" aria-label="Vehicle pagination">
            <p>Page <strong>{meta.page}</strong> of <strong>{Math.max(meta.totalPages, 1)}</strong></p>
            <div>
              <button className="button button--secondary button--small" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!meta.hasPrevPage}>Previous</button>
              <button className="button button--secondary button--small" type="button" onClick={() => setPage((value) => value + 1)} disabled={!meta.hasNextPage}>Next</button>
            </div>
          </div>
        )}
      </section>

      <Modal isOpen={activeModal === 'create'} title="Create Vehicle" onClose={closeModal} closeDisabled={mutationLoading} size="large">
        <VehicleForm mode="create" onSubmit={handleCreate} onCancel={closeModal} loading={mutationLoading} serverErrors={mutationErrors} />
      </Modal>

      <Modal isOpen={activeModal === 'edit'} title="Edit Vehicle" onClose={closeModal} closeDisabled={mutationLoading} size="large">
        {selectedVehicle && (
          <VehicleForm mode="edit" initialVehicle={selectedVehicle} onSubmit={handleUpdate} onCancel={closeModal} loading={mutationLoading} serverErrors={mutationErrors} />
        )}
      </Modal>

      <Modal isOpen={activeModal === 'estimate'} title="Run Estimate" onClose={closeModal} closeDisabled={mutationLoading} size="large">
        {selectedVehicle && (
          <EstimateForm vehicle={selectedVehicle} onSubmit={handleEstimate} onCancel={closeModal} loading={mutationLoading} serverErrors={mutationErrors} result={estimateResult} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={activeModal === 'delete'}
        title="Delete Vehicle"
        message={selectedVehicle ? `Permanently delete ${selectedVehicle.make} ${selectedVehicle.model}? This action cannot be undone.` : ''}
        confirmLabel="Delete Vehicle"
        loading={mutationLoading}
        onConfirm={handleDelete}
        onCancel={closeModal}
        danger
        errorMessage={mutationErrors.join(' ')}
      />
    </div>
  )
}
