/**
 * Converts an ISO date string to a human-readable recency string.
 * @param {string} isoDate
 * @returns {string} e.g. '2h ago', '1d ago'
 */
function formatRecency(isoDate) {
  if (!isoDate) return 'recently'
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

module.exports = { formatRecency }
