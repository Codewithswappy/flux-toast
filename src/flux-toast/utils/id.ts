let counter = 0;

/**
 * Generate a unique toast ID.
 * Uses a monotonically increasing counter + timestamp for uniqueness.
 * Avoids crypto/uuid dependencies for tree-shaking.
 */
export function generateId(): string {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return `flux-toast-${Date.now()}-${counter}`;
}

/**
 * Generate a fingerprint for duplicate detection.
 * Combines type + title + description for grouping.
 */
export function generateFingerprint(
  type: string,
  title?: string,
  description?: string
): string {
  return `${type}::${title ?? ""}::${description ?? ""}`;
}
