/**
 * Generates a random test email address
 * Format: test-[random string]@example.com
 * 
 * @returns A random email address for testing
 * @example
 * const email = generateEmail(); // test-x7f9q2@example.com
 */
export function generateEmail(): string {
  return `test-${Math.random().toString(36).substring(2)}@example.com`;
} 