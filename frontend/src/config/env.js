const requiredEnvironmentValues = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
}

const missingEnvironmentValues = Object.entries(requiredEnvironmentValues)
  .filter(([, value]) => !value?.trim())
  .map(([name]) => name)

if (missingEnvironmentValues.length > 0) {
  throw new Error(
    `Missing frontend configuration: ${missingEnvironmentValues.join(', ')}. Copy .env.example to .env and provide each value.`,
  )
}

/** Validated, browser-safe Vite configuration. Never add backend secrets here. */
export const env = Object.freeze({
  supabaseUrl: requiredEnvironmentValues.VITE_SUPABASE_URL.trim().replace(/\/$/, ''),
  supabasePublishableKey: requiredEnvironmentValues.VITE_SUPABASE_PUBLISHABLE_KEY.trim(),
  apiBaseUrl: requiredEnvironmentValues.VITE_API_BASE_URL.trim().replace(/\/$/, ''),
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
})
