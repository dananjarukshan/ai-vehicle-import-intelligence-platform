import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './apiClient'
import {
  createVehicle,
  deleteVehicle,
  estimateVehiclePrice,
  getVehicleById,
  getVehicles,
  updateVehicle,
} from './vehicleApi'

vi.mock('./apiClient', () => ({ apiRequest: vi.fn() }))

describe('vehicleApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('gets vehicles without adding empty query parameters', () => {
    getVehicles()
    expect(apiRequest).toHaveBeenCalledWith('/vehicles')
  })

  it('encodes all supported query parameters', () => {
    getVehicles({
      page: 2,
      limit: 5,
      make: 'Toyota & Lexus',
      model: 'Prius Prime',
      year: 2020,
      search: 'hybrid car',
      sortBy: 'auction_price',
      sortOrder: 'desc',
    })

    expect(apiRequest).toHaveBeenCalledWith(
      '/vehicles?page=2&limit=5&make=Toyota+%26+Lexus&model=Prius+Prime&year=2020&search=hybrid+car&sortBy=auction_price&sortOrder=desc',
    )
  })

  it('omits null, undefined, and empty query values', () => {
    getVehicles({ page: 1, make: '', model: null, search: undefined })
    expect(apiRequest).toHaveBeenCalledWith('/vehicles?page=1')
  })

  it('gets one safely encoded vehicle ID', () => {
    getVehicleById('vehicle/id')
    expect(apiRequest).toHaveBeenCalledWith('/vehicles/vehicle%2Fid')
  })

  it('creates a vehicle with POST and the provided body', () => {
    const body = { make: 'Toyota', model: 'Prius', year: 2019 }
    createVehicle(body)
    expect(apiRequest).toHaveBeenCalledWith('/vehicles', { method: 'POST', body })
  })

  it('updates a vehicle with PUT and the provided body', () => {
    const body = { mileage: 90000 }
    updateVehicle('vehicle-id', body)
    expect(apiRequest).toHaveBeenCalledWith('/vehicles/vehicle-id', { method: 'PUT', body })
  })

  it('deletes a vehicle with DELETE', () => {
    deleteVehicle('vehicle-id')
    expect(apiRequest).toHaveBeenCalledWith('/vehicles/vehicle-id', { method: 'DELETE' })
  })

  it('estimates a vehicle with POST and formula options', () => {
    const body = { exchange_rate: 1.5 }
    estimateVehiclePrice('vehicle-id', body)
    expect(apiRequest).toHaveBeenCalledWith('/vehicles/vehicle-id/estimate', { method: 'POST', body })
  })

  it('delegates authentication completely to apiClient', () => {
    createVehicle({ make: 'Toyota' })
    const requestOptions = apiRequest.mock.calls[0][1]
    expect(requestOptions).not.toHaveProperty('headers')
    expect(JSON.stringify(requestOptions)).not.toMatch(/token|authorization/i)
  })
})
