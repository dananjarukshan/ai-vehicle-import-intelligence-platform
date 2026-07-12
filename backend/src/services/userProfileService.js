// ============================================================================
// USER PROFILE SERVICE
// ============================================================================
// File: src/services/userProfileService.js
//
// PURPOSE:
// Provides a function to look up a user's profile from the public.user_profiles
// table in Supabase. This is used during authentication to fetch the user's
// role after their identity has been verified by Supabase Auth.
//
// WHY IS THIS SEPARATE FROM vehicleService.js?
// Each service file focuses on one concern (Single Responsibility Principle).
// - vehicleService.js: manages vehicle data
// - userProfileService.js: manages user profile lookups
//
// IMPORTANT SECURITY NOTE:
// The role that controls authorization comes exclusively from this service.
// We NEVER use:
//   - The role from the JWT user_metadata (could be manipulated)
//   - A role from req.body, req.query, or headers (user-controlled)
// Only the role stored in our own database is trusted.
// ============================================================================

// Import the existing database client (uses SERVICE_ROLE_KEY — backend only)
// This client bypasses Row Level Security so we can read any user profile.
const { supabase } = require('../config/supabaseClient');

/**
 * Fetches a user profile from the public.user_profiles table by user ID.
 *
 * HOW IT WORKS:
 * 1. Queries the user_profiles table for a row matching the given ID
 * 2. Returns only the fields we need (id, email, role) — nothing else
 * 3. Returns null if no profile exists (user has no record in our system)
 * 4. Throws if a real database error occurs (not just "not found")
 *
 * WHY maybeSingle()?
 * - .single() throws an error if 0 rows are found → too aggressive for us
 * - .maybeSingle() returns null if 0 rows found → we handle this gracefully
 *
 * @param {string} userId - The Supabase Auth user ID (UUID) to look up.
 * @returns {Promise<{id: string, email: string, role: string}|null>}
 *   The profile object, or null if not found.
 * @throws {Error} If a database-level error occurs.
 */
async function getUserProfileById(userId) {
  // Query the user_profiles table
  const { data, error } = await supabase
    .from('user_profiles')        // table in public schema
    .select('id, email, role')    // only fetch the fields we need
    .eq('id', userId)             // match the authenticated user's ID
    .maybeSingle();               // returns null if not found (does not throw)

  // If Supabase reports a real database error, throw it upward.
  // The caller (authenticate middleware) will catch it and forward to errorHandler.
  if (error) {
    throw error;
  }

  // Return the profile data, or null if the user has no profile record.
  return data;
}

// Export so authenticate middleware can import and use it
module.exports = {
  getUserProfileById,
};
