/**
 * Maps Perigon story categories/topics + article title to PropPulse display categories.
 * Perigon returns topics as objects {name, score} — extract names before calling.
 * Title is the most reliable signal since Perigon topics are often missing.
 * @param {string[]} categories - already extracted name strings
 * @param {string[]} topics    - already extracted name strings
 * @param {string}   title
 * @returns {'Rates' | 'Trends' | 'Local Data'}
 */
function mapCategory(categories = [], topics = [], title = '') {
  const text = [...categories, ...topics, title].join(' ').toLowerCase()
  if (/mortgage|refinanc|interest rate|fed |federal reserve|treasury yield/.test(text)) return 'Rates'
  if (/median|inventory|listing|pending sale|home sale|home price|affordab|housing start|new home|days on market|foreclos/.test(text)) return 'Trends'
  return 'Trends'
}

module.exports = { mapCategory }
