import { useCallback, useEffect, useState } from 'react'
import ErrorMessage from '../components/common/ErrorMessage'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { getVehicles } from '../services/vehicleApi'

const PAGE_SIZE = 10

/** Format stored numeric values without inventing a currency code. */
function formatAmount(value) {
  if (value === null || value === undefined || value === '') return 'Not estimated'
  const number = Number(value)
  return Number.isFinite(number) ? number.toLocaleString() : String(value)
}

/** Format mileage as a readable kilometre value. */
function formatMileage(value) {
  if (value === null || value === undefined || value === '') return '—'
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toLocaleString()} km` : String(value)
}

/** Paginated, authenticated vehicle inventory using the backend response shape. */
export default function VehiclesPage() {
  const { role } = useAuth()
  const [page, setPage] = useState(1)
  const [vehicles, setVehicles] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadVehicles = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const response = await getVehicles({ page, limit: PAGE_SIZE })
      setVehicles(Array.isArray(response.data) ? response.data : [])
      setMeta(response.meta ?? null)
    } catch (error) {
      setVehicles([])
      setMeta(null)
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const canWrite = role === 'analyst' || role === 'admin'

  return (
    <div className="page-stack">
      <section className="page-heading page-heading--vehicles">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Vehicle records</h2>
          <p>Authenticated auction and price-estimation data.</p>
        </div>
        {canWrite && <button className="button button--primary" type="button" disabled>Add vehicle · Coming soon</button>}
      </section>

      {errorMessage && <ErrorMessage message={errorMessage} onRetry={loadVehicles} />}

      <section className="content-card table-card" aria-busy={loading}>
        <div className="table-card__header">
          <div>
            <h3>All vehicles</h3>
            <p>{meta ? `${meta.total.toLocaleString()} total records` : 'Inventory records'}</p>
          </div>
          <span className="read-mode">{canWrite ? 'Actions preview' : 'Read-only access'}</span>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading vehicles…" />
        ) : vehicles.length === 0 && !errorMessage ? (
          <div className="empty-state">
            <div aria-hidden="true">◇</div>
            <h3>No vehicles found</h3>
            <p>The inventory does not contain any records on this page.</p>
          </div>
        ) : vehicles.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Year</th>
                  <th>Mileage</th>
                  <th>Auction grade</th>
                  <th>Auction price</th>
                  <th>Import cost</th>
                  <th>Selling price</th>
                  {canWrite && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td><strong>{vehicle.make || '—'}</strong><span>{vehicle.model || '—'}</span></td>
                    <td>{vehicle.year ?? '—'}</td>
                    <td>{formatMileage(vehicle.mileage)}</td>
                    <td><span className="grade-badge">{vehicle.auction_grade ?? '—'}</span></td>
                    <td>{formatAmount(vehicle.auction_price)}</td>
                    <td className={vehicle.estimated_import_cost == null ? 'muted-cell' : ''}>{formatAmount(vehicle.estimated_import_cost)}</td>
                    <td className={vehicle.estimated_selling_price == null ? 'muted-cell' : ''}>{formatAmount(vehicle.estimated_selling_price)}</td>
                    {canWrite && (
                      <td><button className="table-action" type="button" disabled>Manage soon</button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {meta && vehicles.length > 0 && (
          <div className="pagination" aria-label="Vehicle pagination">
            <p>Page <strong>{meta.page}</strong> of <strong>{Math.max(meta.totalPages, 1)}</strong></p>
            <div>
              <button className="button button--secondary button--small" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!meta.hasPrevPage || loading}>Previous</button>
              <button className="button button--secondary button--small" type="button" onClick={() => setPage((value) => value + 1)} disabled={!meta.hasNextPage || loading}>Next</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
