/**
 * Utility functions for the frontend application
 */

/**
 * Safely converts a value to a number and formats it with toFixed
 * @param value - The value to convert and format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatPrice(value: any, decimals: number = 2): string {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return num.toFixed(decimals);
}

/**
 * Safely converts a value to a number
 * @param value - The value to convert
 * @returns Number value
 */
export function toNumber(value: any): number {
  return typeof value === 'number' ? value : parseFloat(value) || 0;
}

/**
 * Formats a currency value with dollar sign
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(value: any, decimals: number = 2): string {
  return `$${formatPrice(value, decimals)}`;
}