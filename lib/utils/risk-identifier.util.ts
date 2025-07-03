/**
 * Generates a unique risk identifier by combining project ID and risk ID
 * Format: 4-digit project ID + 4-digit risk ID
 * Example: Project ID 123, Risk ID 456 -> "01230456"
 *
 * Limitations:
 * - Maximum 9,999 projects (0000-9999)
 * - Maximum 9,999 risks per project (0000-9999)
 * - Total maximum unique identifiers: 99,980,001
 * - No validation for project/risk existence
 * - Throws error if projectId or riskId exceeds 9999
 *
 * @param projectId - The ID of the project (will be padded to 4 digits)
 * @param riskId - The ID of the risk (will be padded to 4 digits)
 * @returns A string containing the combined 8-digit identifier
 * @throws {Error} If projectId or riskId exceeds maximum allowed value of 9999
 */
export function generateRiskIdentifier(
  projectId: number,
  riskId: number,
): string {
  const MAX_ID = 9999;

  if (projectId > MAX_ID) {
    throw new Error(
      `Project ID ${projectId} exceeds maximum allowed value of ${MAX_ID}`,
    );
  }

  if (riskId > MAX_ID) {
    throw new Error(
      `Risk ID ${riskId} exceeds maximum allowed value of ${MAX_ID}`,
    );
  }

  // Pad both IDs to 4 digits with leading zeros
  const paddedProjectId = projectId.toString().padStart(4, '0');
  const paddedRiskId = riskId.toString().padStart(4, '0');

  // Combine them to create the 8-digit identifier
  return `${paddedProjectId}${paddedRiskId}`;
}
