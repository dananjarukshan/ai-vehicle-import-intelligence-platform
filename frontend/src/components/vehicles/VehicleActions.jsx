/** Render only the mutation controls permitted by the backend profile role. */
export default function VehicleActions({ vehicle, role, onEdit, onEstimate, onDelete }) {
  if (role === 'viewer') return null

  const canWrite = role === 'analyst' || role === 'admin'
  if (!canWrite) return null

  const vehicleName = `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'vehicle'

  return (
    <div className="vehicle-actions">
      <button className="table-action" type="button" onClick={() => onEdit(vehicle)} aria-label={`Edit ${vehicleName}`}>
        Edit
      </button>
      <button className="table-action" type="button" onClick={() => onEstimate(vehicle)} aria-label={`Estimate price for ${vehicleName}`}>
        Estimate
      </button>
      {role === 'admin' && (
        <button className="table-action table-action--danger" type="button" onClick={() => onDelete(vehicle)} aria-label={`Delete ${vehicleName}`}>
          Delete
        </button>
      )}
    </div>
  )
}
