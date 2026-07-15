import { apiRequest } from './apiClient'

/** Fetch one page of vehicles using the backend pagination contract. */
export function getVehicles({ page = 1, limit = 10 } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  return apiRequest(`/vehicles?${query.toString()}`)
}
