import { afterEach, describe, expect, it, vi } from 'vitest'

const validValues = {
  VITE_SUPABASE_URL: 'https://example.supabase.co/',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'publishable-test-key',
  VITE_API_BASE_URL: 'https://api.example.com/api/v1/',
}

async function importEnvironment(values = validValues) {
  vi.resetModules()
  Object.entries(values).forEach(([name, value]) => vi.stubEnv(name, value))
  return import('./env')
}

describe('frontend environment configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('validates and normalizes browser-safe values', async () => {
    const { env } = await importEnvironment()

    expect(env.supabaseUrl).toBe('https://example.supabase.co')
    expect(env.supabasePublishableKey).toBe('publishable-test-key')
    expect(env.apiBaseUrl).toBe('https://api.example.com/api/v1')
    expect(env.mode).toBeTypeOf('string')
  })

  it('fails early and names missing values', async () => {
    await expect(importEnvironment({ ...validValues, VITE_API_BASE_URL: '' })).rejects.toThrow(
      'Missing frontend configuration: VITE_API_BASE_URL',
    )
  })
})
