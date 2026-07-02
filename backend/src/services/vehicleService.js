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

/**
 * Fetches a single vehicle record by its ID from the 'vehicles' table in Supabase.
 * 
 * WHY IS THIS FUNCTION ASYNC?
 * Just like getAllVehicles, querying a specific vehicle by ID involves making a request 
 * across the network to Supabase. This takes time, so we make this function asynchronous 
 * and use the `await` keyword to wait for the database response.
 * 
 * @param {string|number} id - The unique ID of the vehicle we want to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the vehicle object, or null if not found.
 * @throws {Error} Throws a detailed error if the database query fails.
 */
async function getVehicleById(id) {
  try {
    // We send a query to Supabase and wait for it to finish.
    // Let's break down this query:
    //
    // 1. `supabase.from('vehicles')`
    //    Tells Supabase we want to query the 'vehicles' table.
    //
    // 2. `.select('*')`
    //    Instructs Supabase to retrieve all columns for the matched record.
    //
    // 3. `.eq('id', id)`
    //    This is a filter condition. 'eq' stands for "equal". It tells Supabase to only 
    //    return records where the 'id' column matches the 'id' parameter we passed in.
    //
    // 4. `.maybeSingle()`
    //    Tells Supabase that we expect either one record or no record at all.
    //    Normally, if you query and find nothing, Supabase might not return null or might throw.
    //    Using `.maybeSingle()` ensures that:
    //    - If 1 row is found, it returns that single object (not an array of objects).
    //    - If 0 rows are found, it returns `null` (without throwing an error).
    //    - If more than 1 row is found, it throws an error (since ID should be unique).
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    // If Supabase encountered a database or network error, it will populate the error object.
    if (error) {
      throw new Error(`Supabase Query Error: ${error.message} (Code: ${error.code})`);
    }

    // If successful, data will be the vehicle object, or null if no vehicle matched the ID.
    return data;
  } catch (err) {
    // Log the error to the server console for debugging purposes.
    console.error(`Error occurred in getVehicleById Service for ID ${id}:`, err.message);
    
    // Propagate the error up to the controller layer.
    throw err;
  }
}

/**
 * Inserts a new vehicle record into the 'vehicles' table in Supabase.
 * 
 * WHY IS THIS FUNCTION ASYNC?
 * Inserting data into the database requires communicating with the Supabase server 
 * over the network. This network call is asynchronous, meaning it doesn't resolve 
 * instantly. By using `async` and `await`, we pause execution here until the 
 * insert operation completes and returns the result.
 * 
 * @param {Object} vehicleData - The vehicle information to insert (make, model, year, etc.).
 * @returns {Promise<Object>} A promise that resolves to the newly created vehicle object.
 * @throws {Error} Throws a detailed error if the database insert fails.
 */
async function createVehicle(vehicleData) {
  try {
    // We send an insert request to Supabase and wait for it to complete.
    // Let's break down this Supabase query:
    //
    // 1. `supabase.from('vehicles')`
    //    Tells Supabase we want to interact with the 'vehicles' table.
    //
    // 2. `.insert(vehicleData)`
    //    Inserts the provided object containing the new vehicle's fields into the database.
    //
    // 3. `.select()`
    //    Instructs Supabase to return the actual record that was inserted. By default, 
    //    an insert query does not return the inserted data unless we explicitly chain `.select()`.
    //
    // 4. `.single()`
    //    Tells Supabase that we expect a single row to be returned, so format the 
    //    returned data as a single JSON object instead of an array of objects.
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicleData)
      .select()
      .single();

    // If Supabase encountered an error (e.g. database schema mismatch or permission issue),
    // it returns an error object which we check and throw.
    if (error) {
      throw new Error(`Supabase Insert Error: ${error.message} (Code: ${error.code})`);
    }

    // Return the inserted vehicle record back to the controller.
    return data;
  } catch (err) {
    // Log the error to the server console for debugging.
    console.error('Error occurred in createVehicle Service:', err.message);
    
    // Propagate the error to the controller so it can send a 500 status code.
    throw err;
  }
}

/**
 * Updates an existing vehicle record in the 'vehicles' table in Supabase.
 * 
 * WHY IS THIS FUNCTION ASYNC?
 * Just like fetching or creating records, updating a row in the database involves 
 * a network request to the remote Supabase database. This takes time, so we make this 
 * function asynchronous and use `await` to pause execution until the response returns.
 * 
 * @param {string|number} id - The unique ID of the vehicle we want to update.
 * @param {Object} updateData - The object containing the columns and values we want to update.
 * @returns {Promise<Object|null>} A promise that resolves to the updated vehicle object, or null if not found.
 * @throws {Error} Throws a detailed error if the database update fails.
 */
async function updateVehicle(id, updateData) {
  try {
    // We send an update query to Supabase and wait for it to complete.
    // Let's break down this query:
    //
    // 1. `supabase.from('vehicles')`
    //    Specifies that we are interacting with the 'vehicles' table.
    //
    // 2. `.update(updateData)`
    //    Tells Supabase to perform an UPDATE statement, modifying only the fields 
    //    present in the `updateData` object (e.g. updating mileage or price).
    //
    // 3. `.eq('id', id)`
    //    This is the WHERE clause filter. We tell Supabase to only update the row where 
    //    the 'id' column matches the specific ID we passed.
    //
    // 4. `.select()`
    //    Chaining `.select()` is required so that Supabase returns the details of the 
    //    newly updated database row.
    //
    // 5. `.maybeSingle()`
    //    Specifies that we expect either one updated record or no record at all (if the ID doesn't exist).
    //    - If the row exists and was updated, it returns that single updated object.
    //    - If no row matched the ID, it returns `null` (rather than raising an error).
    const { data, error } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    // If Supabase encountered an error (like schema or constraint violation), we throw it.
    if (error) {
      throw new Error(`Supabase Update Error: ${error.message} (Code: ${error.code})`);
    }

    // Return the updated vehicle object (or null if no record was found/updated).
    return data;
  } catch (err) {
    // Log the error to the server console.
    console.error(`Error occurred in updateVehicle Service for ID ${id}:`, err.message);
    
    // Propagate the error to the controller.
    throw err;
  }
}

/**
 * Deletes a vehicle record from the 'vehicles' table in Supabase.
 * 
 * WHY IS THIS FUNCTION ASYNC?
 * Deleting a record from the database requires communicating with the Supabase server 
 * over the network. Because this network request takes time to complete, we mark the 
 * function as `async` and use the `await` keyword.
 * 
 * @param {string|number} id - The unique ID of the vehicle to be deleted.
 * @returns {Promise<Object|null>} A promise that resolves to the deleted vehicle object, or null if not found.
 * @throws {Error} Throws a detailed error if the database delete fails.
 */
async function deleteVehicle(id) {
  try {
    // We send a delete request to Supabase and wait for it to finish.
    // Let's break down this query:
    //
    // 1. `supabase.from('vehicles')`
    //    Tells Supabase we want to interact with the 'vehicles' table.
    //
    // 2. `.delete()`
    //    Specifies that this is a DELETE operation to remove data.
    //
    // 3. `.eq('id', id)`
    //    The filter constraint. This ensures we only delete the specific row where 
    //    the 'id' column matches the ID we passed. Without this filter, it would delete all rows!
    //
    // 4. `.select()`
    //    Instructs Supabase to return the row details of the deleted record.
    //
    // 5. `.maybeSingle()`
    //    Configures the query to expect at most one matching deleted row.
    //    - If the row existed and was deleted, it returns that single deleted object.
    //    - If no row matched the ID, it returns `null` (without throwing an error).
    const { data, error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    // If Supabase encountered a database or network error, we throw it.
    if (error) {
      throw new Error(`Supabase Delete Error: ${error.message} (Code: ${error.code})`);
    }

    // Return the deleted vehicle object (or null if the vehicle did not exist).
    return data;
  } catch (err) {
    // Log the error to the server console.
    console.error(`Error occurred in deleteVehicle Service for ID ${id}:`, err.message);
    
    // Propagate the error to the controller.
    throw err;
  }
}

// Export the service functions so they can be imported in the controllers.
module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};




