import { getSession, signOut } from './authService'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

/** An API error with safe HTTP and backend details for the UI. */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'API_ERROR', errors = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

/**
 * Send one authenticated request to the Express API.
 * The current token is read from Supabase for every request and is never logged.
 */
export async function apiRequest(path, options = {}) {
  if (!apiBaseUrl) {
    throw new ApiError('The API URL is not configured.', {
      code: 'API_CONFIGURATION_ERROR',
    })
  }

  const { data, error: sessionError } = await getSession()
  const accessToken = data?.session?.access_token

  if (sessionError || !accessToken) {
    throw new ApiError('Your session has expired. Please sign in again.', {
      status: 401,
      code: 'AUTHENTICATION_REQUIRED',
    })
  }

  const { body, headers: suppliedHeaders, ...fetchOptions } = options
  const headers = new Headers(suppliedHeaders)
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${accessToken}`)

  let requestBody = body
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...fetchOptions,
      headers,
      body: requestBody,
    })
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.', {
      code: 'NETWORK_ERROR',
    })
  }

  const responseText = await response.text()
  let payload = null

  if (responseText) {
    try {
      payload = JSON.parse(responseText)
    } catch {
      throw new ApiError('The server returned an invalid response.', {
        status: response.status,
        code: 'INVALID_API_RESPONSE',
      })
    }
  }

  if (!response.ok) {
    const statusMessage =
      response.status === 401
        ? 'Your session has expired. Please sign in again.'
        : response.status === 403
          ? 'You do not have permission to perform this action.'
          : 'The request could not be completed.'

    if (response.status === 401) {
      // A rejected backend session is invalid locally too. Supabase clears it safely.
      await signOut().catch(() => {})
    }

    throw new ApiError(payload?.message || statusMessage, {
      status: response.status,
      code: payload?.code || `HTTP_${response.status}`,
      errors: payload?.errors || null,
    })
  }

  if (!payload) {
    throw new ApiError('The server returned an empty response.', {
      status: response.status,
      code: 'EMPTY_API_RESPONSE',
    })
  }

  return payload
}
