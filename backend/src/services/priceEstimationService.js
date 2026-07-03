// ============================================================================
// PRICE ESTIMATION SERVICE
// ============================================================================
// File: src/services/priceEstimationService.js
//
// PURPOSE:
// This service contains the calculation logic for estimating vehicle import
// costs and selling prices.
//
// WHY IS THIS A SERVICE?
// The controller should not contain the math itself. By keeping the formula in
// a separate service, the calculation can be reused, tested, and updated in one
// place without changing the HTTP layer.
// ============================================================================

/**
 * Rounds a value to the nearest whole number.
 *
 * This helper keeps the calculation code easier to read and makes it obvious
 * that all money values in this demo are stored as whole numbers.
 *
 * @param {number} value - The number to round.
 * @returns {number} The rounded whole number.
 */
function roundMoney(value) {
  return Math.round(value);
}

/**
 * Calculates the estimated import cost and selling price for a vehicle.
 *
 * DEMO NOTE:
 * This formula is intentionally simple and is meant for demonstration and
 * product prototyping only. It does not replace a real tax, duty, or customs
 * calculation used by an official authority.
 *
 * @param {Object} vehicle - The vehicle record retrieved from the database.
 * @param {Object} [estimateOptions={}] - Optional cost and rate inputs.
 * @returns {Object} An object containing the estimated prices and a breakdown.
 * @throws {Error} If the vehicle does not contain a valid auction_price.
 */
function calculateVehicleEstimate(vehicle, estimateOptions = {}) {
  // Read the auction price from the stored vehicle record.
  const auctionPrice = Number(vehicle?.auction_price);

  // Fail fast if the base auction price is missing or invalid.
  if (!Number.isFinite(auctionPrice) || auctionPrice < 0) {
    throw new Error('Cannot calculate vehicle estimate because auction_price is missing or invalid.');
  }

  // Apply safe defaults so the caller can send only the values they want to override.
  const {
    exchange_rate = 1,
    freight_cost = 0,
    insurance_cost = 0,
    clearance_cost = 0,
    duty_rate = 0,
    vat_rate = 0,
    profit_margin_rate = 0,
    other_costs = 0,
  } = estimateOptions;

  // Step 1: Convert the auction price into local currency.
  const auctionPriceLocal = auctionPrice * exchange_rate;

  // Step 2: Add the main landing costs before duty and VAT.
  const baseImportCost = auctionPriceLocal + freight_cost + insurance_cost + clearance_cost + other_costs;

  // Step 3: Calculate duty using the base import cost.
  const dutyAmount = baseImportCost * duty_rate;

  // Step 4: Calculate VAT after duty has been added.
  const vatAmount = (baseImportCost + dutyAmount) * vat_rate;

  // Step 5: Add all taxes to get the total import cost.
  const estimatedImportCost = baseImportCost + dutyAmount + vatAmount;

  // Step 6: Add the profit margin to get the estimated selling price.
  const profitAmount = estimatedImportCost * profit_margin_rate;
  const estimatedSellingPrice = estimatedImportCost + profitAmount;

  // Round the monetary values to whole numbers for a clean demo response.
  return {
    estimated_import_cost: roundMoney(estimatedImportCost),
    estimated_selling_price: roundMoney(estimatedSellingPrice),
    breakdown: {
      auction_price: roundMoney(auctionPrice),
      exchange_rate,
      auction_price_local: roundMoney(auctionPriceLocal),
      freight_cost: roundMoney(freight_cost),
      insurance_cost: roundMoney(insurance_cost),
      clearance_cost: roundMoney(clearance_cost),
      other_costs: roundMoney(other_costs),
      base_import_cost: roundMoney(baseImportCost),
      duty_rate,
      duty_amount: roundMoney(dutyAmount),
      vat_rate,
      vat_amount: roundMoney(vatAmount),
      profit_margin_rate,
      profit_amount: roundMoney(profitAmount),
    },
  };
}

// Export the calculator so the controller can use it.
module.exports = {
  calculateVehicleEstimate,
};