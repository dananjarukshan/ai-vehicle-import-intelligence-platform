import { supabase } from '../lib/supabaseClient'

/** Sign in with Supabase email/password authentication. */
export function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

/** End the current Supabase session. */
export function signOut() {
  return supabase.auth.signOut()
}

/** Read the session managed by Supabase. */
export function getSession() {
  return supabase.auth.getSession()
}

/** Subscribe to login, logout, and token refresh events. */
export function subscribeToAuthChanges(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
