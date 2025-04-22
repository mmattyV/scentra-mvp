/**
 * Formats a numeric price value as a USD currency string
 * @param price The numeric price to format
 * @returns Formatted price string with dollar sign and two decimal places
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}
