// ============================================================================
// VEHICLE SERVICE
// ============================================================================
// File: src/services/vehicleService.js
//
// PURPOSE:
// This service file handles all database interactions related to Vehicles.
// It acts as the direct link to the Supabase PostgreSQL database.
//
// WHAT IS A SERVICE?
// A Service is a layer containing "Business Logic" or "Data Access Logic".
// It is responsible for:
// 1. Interacting with databases or external APIs.
// 2. Formatting, processing, or transforming raw data.
// 3. Ensuring data rules are followed before sending it back.
//
// WHY USE A SERVICE LAYER?
// By isolating database logic here, we prevent other parts of the application
// (like routes or controllers) from needing to know details about Supabase.
// If we ever switch databases (e.g., from Supabase to MongoDB), we only need 
// to change code in this service file, leaving controllers and routes untouched!
//
// ============================================================================

// Import the configured Supabase client.
// The double dot (..) goes up one level out of 'services' and into 'src',
// then into 'config' to get the client setup we created.
const { supabase } = require('../config/supabaseClient');

/**
 * Fetches all vehicle records from the 'vehicles' table in Supabase.
 * 
 * WHY IS THIS FUNCTION ASYNC?
 * Querying a database requires sending a request over the internet to Supabase.
 * This takes time (milliseconds to seconds). JavaScript is single-threaded, meaning
 * it normally blocks other code from running while waiting. 
 * By marking this function as `async`, we tell JavaScript that it returns a Promise 
 * (a placeholder for future data) and can pause using the `await` keyword.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of vehicle objects.
 * @throws {Error} Throws a detailed error if the database query fails.
 */
async function getAllVehicles() {
  try {
    // We send a query to Supabase and wait for it to finish using `await`.
    // Let's break down this Supabase query:
    // 
    // 1. `supabase.from('vehicles')`
    //    Tells the client we want to query the 'vehicles' table.
    //
    // 2. `.select('*')`
    //    The '*' is a wildcard meaning "all columns". This fetches every field 
    //    for each vehicle (like id, brand, model, price, created_at, etc.).
    //
    // 3. `.order('created_at', { ascending: false })`
    //    Orders the returned rows by the 'created_at' timestamp.
    //    `ascending: false` sorts them in descending order, meaning the most
    //    recently created/added vehicles will appear first in the array.
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    // Supabase returns an object containing 'data' and 'error'.
    // If 'error' is not null, it means the query failed (e.g., table does not exist,
    // network issue, or authentication/permissions failure).
    if (error) {
      // We throw a new error with a clear message including the database error info.
      // Throwing stops execution here and sends the error to the controller's catch block.
      throw new Error(`Supabase Query Error: ${error.message} (Code: ${error.code})`);
    }

    // If there is no error, 'data' is a JavaScript array containing the records.
    // We return it to whoever called this function (the controller).
    return data;
  } catch (err) {
    // If any exception happens inside the try block (or if we threw an error above),
    // it gets caught here. We log it to the server console for debugging.
    console.error('Error occurred in getAllVehicles Service:', err.message);
    
    // We re-throw the error so that the controller layer knows something went wrong
    // and can return a 500 error code to the client.
    throw err;
  }
}

// Export the service functions so they can be imported in the controllers.
module.exports = {
  getAllVehicles,
};
