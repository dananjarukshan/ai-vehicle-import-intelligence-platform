import { apiRequest } from './apiClient'

/** Build an encoded query string while omitting empty filters. */
function buildQueryString(queryOptions = {}) {
  const query = new URLSearchParams()

  Object.entries(queryOptions).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

/** Fetch vehicles using the backend filters and pagination contract. */
export function getVehicles(queryOptions = {}) {
  return apiRequest(`/vehicles${buildQueryString(queryOptions)}`)
}

/** Fetch one vehicle by its stable database ID. */
export function getVehicleById(id) {
  return apiRequest(`/vehicles/${encodeURIComponent(id)}`)
}

/** Create a vehicle. Authorization and validation are enforced by Express. */
export function createVehicle(vehicleData) {
  return apiRequest('/vehicles', { method: 'POST', body: vehicleData })
}

/** Update allowed vehicle fields for one vehicle. */
export function updateVehicle(id, vehicleData) {
  return apiRequest(`/vehicles/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: vehicleData,
  })
}

/** Permanently delete a vehicle. The backend restricts this to admins. */
export function deleteVehicle(id) {
  return apiRequest(`/vehicles/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** Run the backend's formula-based price estimate for one vehicle. */
export function estimateVehiclePrice(id, estimateOptions) {
  return apiRequest(`/vehicles/${encodeURIComponent(id)}/estimate`, {
    method: 'POST',
    body: estimateOptions,
  })
}
