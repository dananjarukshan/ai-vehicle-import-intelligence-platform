import LoadingSpinner from '../common/LoadingSpinner'
import VehicleActions from './VehicleActions'

/** Format a stored number without assuming a currency symbol. */
function formatNumber(value, emptyLabel = '—') {
  if (value === null || value === undefined || value === '') return emptyLabel
  const number = Number(value)
  return Number.isFinite(number) ? number.toLocaleString() : String(value)
}

/** Responsive vehicle table with role-aware mutation actions. */
export default function VehicleTable({ vehicles, role, loading, onEdit, onEstimate, onDelete }) {
  const showActions = role === 'analyst' || role === 'admin'

  if (loading) return <LoadingSpinner label="Loading vehicles…" />

  if (vehicles.length === 0) {
    return (
      <div className="empty-state">
        <div aria-hidden="true">◇</div>
        <h3>No vehicles found</h3>
        <p>The inventory does not contain any records on this page.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Make</th>
            <th scope="col">Model</th>
            <th scope="col">Year</th>
            <th scope="col">Mileage</th>
            <th scope="col">Auction grade</th>
            <th scope="col">Auction price</th>
            <th scope="col">Estimated import cost</th>
            <th scope="col">Estimated selling price</th>
            {showActions && <th scope="col">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <th scope="row"><strong>{vehicle.make || '—'}</strong></th>
              <td>{vehicle.model || '—'}</td>
              <td>{vehicle.year ?? '—'}</td>
              <td>{vehicle.mileage == null ? '—' : `${formatNumber(vehicle.mileage)} km`}</td>
              <td><span className="grade-badge">{vehicle.auction_grade ?? '—'}</span></td>
              <td>{formatNumber(vehicle.auction_price)}</td>
              <td className={vehicle.estimated_import_cost == null ? 'muted-cell' : ''}>
                {formatNumber(vehicle.estimated_import_cost, 'Not estimated')}
              </td>
              <td className={vehicle.estimated_selling_price == null ? 'muted-cell' : ''}>
                {formatNumber(vehicle.estimated_selling_price, 'Not estimated')}
              </td>
              {showActions && (
                <td>
                  <VehicleActions
                    vehicle={vehicle}
                    role={role}
                    onEdit={onEdit}
                    onEstimate={onEstimate}
                    onDelete={onDelete}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
