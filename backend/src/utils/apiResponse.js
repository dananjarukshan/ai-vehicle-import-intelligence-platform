// ============================================================================
// API RESPONSE HELPER
// ============================================================================
// File: src/utils/apiResponse.js
//
// PURPOSE:
// This file provides two small reusable helper functions that build and send
// consistent HTTP responses throughout the entire application.
//
// WHY IS THIS USEFUL?
// Without a helper, every controller function has to write out the same
// res.status(...).json({ success: true, ... }) pattern by hand over and over.
// If we ever want to change the response shape (e.g. add a timestamp field),
// we would have to update dozens of places. With a helper, we change it in
// ONE place and every endpoint automatically gets the improvement.
//
// WHAT IS A "UTILITY" FILE?
// A utility (utils) file contains small, general-purpose helper functions that
// are not tied to any specific feature. They are designed to be imported and
// reused anywhere in the project.
// ============================================================================

/**
 * Sends a standardised success JSON response.
 *
 * WHY A FUNCTION INSTEAD OF AN OBJECT?
 * We need to call res.status() and res.json() on the Express response object.
 * A plain object cannot do that — only a function can receive `res` as a
 * parameter and call those methods on it.
 *
 * @param {express.Response} res        - The Express response object.
 * @param {number}           statusCode - The HTTP status code (e.g. 200, 201).
 * @param {string}           message    - A human-readable success message.
 * @param {*}               [data]      - The payload to return (object, array, etc.). Defaults to null.
 * @param {Object}          [meta]      - Optional metadata (e.g. { count: 5 }). Only included when not null.
 */
function sendSuccess(res, statusCode, message, data = null, meta = null) {
  // Build the base response body that is always present
  const body = {
    success: true,
    message,
    data,
  };

  // Only attach 'meta' when the caller passed a non-null value.
  // This keeps the response clean for endpoints that don't need extra metadata.
  if (meta !== null) {
    body.meta = meta;
  }

  // Send the HTTP response with the chosen status code and JSON body
  return res.status(statusCode).json(body);
}

/**
 * Sends a standardised error JSON response.
 *
 * @param {express.Response} res        - The Express response object.
 * @param {number}           statusCode - The HTTP error status code (e.g. 400, 404, 500).
 * @param {string}           message    - A human-readable error message.
 * @param {Array}           [errors]    - Optional list of detailed error strings. Only included when not null.
 */
function sendError(res, statusCode, message, errors = null) {
  // Build the base error body
  const body = {
    success: false,
    message,
  };

  // Only attach 'errors' when the caller passed a non-null value.
  // For simple 500 errors we usually only have a message, not a list of errors.
  if (errors !== null) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
}

// Export both helpers so they can be imported in controllers and middleware.
module.exports = {
  sendSuccess,
  sendError,
};
