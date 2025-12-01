/**
 * Price Utility
 *
 * Utility functions for price calculations including early bird pricing logic
 */

export interface EarlyBirdPriceData {
  earlyBirdPrice: number | null;
  earlyBirdPriceStartDate: Date | null;
  earlyBirdPriceEndDate: Date | null;
  normalPrice: number;
}

/**
 * Calculate the effective price for a course based on early bird period
 *
 * @param priceData - Course price data including normal price and early bird information
 * @param currentDate - Current date/time (defaults to now)
 * @returns The effective price to use (early bird price if applicable, otherwise normal price)
 *
 * @example
 * ```typescript
 * const price = calculateEffectivePrice({
 *   normalPrice: 2000,
 *   earlyBirdPrice: 1500,
 *   earlyBirdPriceStartDate: new Date('2024-01-01'),
 *   earlyBirdPriceEndDate: new Date('2024-01-31')
 * });
 * // Returns 1500 if current date is between Jan 1-31, otherwise 2000
 * ```
 */
export function calculateEffectivePrice(
  priceData: EarlyBirdPriceData,
  currentDate: Date = new Date(),
): number {
  const {
    normalPrice,
    earlyBirdPrice,
    earlyBirdPriceStartDate,
    earlyBirdPriceEndDate,
  } = priceData;

  // Default to normal price
  let effectivePrice = normalPrice;

  // Check if early bird pricing is configured
  if (
    earlyBirdPrice === null ||
    earlyBirdPriceStartDate === null ||
    earlyBirdPriceEndDate === null
  ) {
    return effectivePrice;
  }

  // Validate early bird price is less than normal price (business rule)
  if (earlyBirdPrice >= normalPrice) {
    // Early bird price should be cheaper, if not, use normal price
    return effectivePrice;
  }

  // Validate date range (start date should be before end date)
  if (earlyBirdPriceStartDate >= earlyBirdPriceEndDate) {
    // Invalid date range, use normal price
    return effectivePrice;
  }

  // Check if current date is within early bird period
  const isWithinEarlyBirdPeriod =
    currentDate >= earlyBirdPriceStartDate &&
    currentDate <= earlyBirdPriceEndDate;

  if (isWithinEarlyBirdPeriod) {
    effectivePrice = earlyBirdPrice;
  }

  return effectivePrice;
}

/**
 * Check if a course is currently in early bird period
 *
 * @param priceData - Course price data
 * @param currentDate - Current date/time (defaults to now)
 * @returns true if currently in early bird period, false otherwise
 */
export function isInEarlyBirdPeriod(
  priceData: EarlyBirdPriceData,
  currentDate: Date = new Date(),
): boolean {
  const { earlyBirdPrice, earlyBirdPriceStartDate, earlyBirdPriceEndDate } =
    priceData;

  if (
    earlyBirdPrice === null ||
    earlyBirdPriceStartDate === null ||
    earlyBirdPriceEndDate === null
  ) {
    return false;
  }

  if (earlyBirdPriceStartDate >= earlyBirdPriceEndDate) {
    return false;
  }

  return (
    currentDate >= earlyBirdPriceStartDate &&
    currentDate <= earlyBirdPriceEndDate
  );
}
