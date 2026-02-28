/**
 * Format seconds into MM:SS display
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Truncate wallet address: 0x1234...abcd
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format rating score to 1 decimal
 */
export function formatRating(score: number): string {
  return score.toFixed(1)
}

/**
 * Get star display array for rating
 */
export function getStarArray(score: number, max = 5): boolean[] {
  return Array.from({ length: max }, (_, i) => i < Math.round(score))
}
