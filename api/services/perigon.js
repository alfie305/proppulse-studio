const { mapCategory } = require('../utils/categoryMapper')
const { formatRecency } = require('../utils/formatRecency')

// Free-tier endpoint: /v1/all (Articles). Budget: 150 req/month ≈ 5/day max.
const BASE_URL = 'https://api.goperigon.com/v1/all'

// Keywords that indicate a housing/market-relevant article (title must match at least one)
const RELEVANT_RE = /mortgage|home price|housing market|inventory|real estate market|median (home|sale|list)|affordab|refinanc|interest rate|fed |federal reserve|foreclos|home sale|pending sale|housing start|new home sale|rental market|rent price|home value|listing price/i

// Keywords that flag low-quality / irrelevant content regardless of topic tag
const GARBAGE_RE = /stock (under|out)perform|earnings call|q[1-4] 20\d\d earnings|\bjob (opening|listing|posting)\b|scripture|blockchain|bitcoin|crypto|ai-powered|talent acquisition|airport|pollutant|water treatment|thriller|squatter|boogievision|capital rock|1045 capital/i

/**
 * Extract string names from Perigon topic/category arrays.
 * Perigon returns these as objects {name, score} — not plain strings.
 */
function extractNames(arr = []) {
  return arr.map(x => (typeof x === 'string' ? x : x?.name ?? '')).filter(Boolean)
}

/**
 * Deduplicate articles with highly similar headlines (same story, different outlet).
 * Uses word-overlap ratio on words longer than 4 chars.
 */
function deduplicateByTitle(articles) {
  const seen = []
  return articles.filter(a => {
    const words = new Set(
      a.headline.toLowerCase().split(/\W+/).filter(w => w.length > 4)
    )
    for (const s of seen) {
      const overlap = [...s].filter(w => words.has(w)).length
      if (overlap / Math.max(s.size, words.size, 1) > 0.55) return false
    }
    seen.push(words)
    return true
  })
}

/**
 * Enforce category diversity: max `cap` articles per category.
 */
function diversify(articles, cap = 3) {
  const counts = {}
  return articles.filter(a => {
    counts[a.category] = (counts[a.category] || 0)
    if (counts[a.category] < cap) { counts[a.category]++; return true }
    return false
  })
}

/**
 * Fetches articles from Perigon for a given market.
 * @param {string} market - 'national' or a city/state string (e.g. 'Miami Beach, FL')
 * @returns {Promise<object[]>}
 */
async function fetchStories(market) {
  const apiKey = process.env.PERIGON_API_KEY
  if (!apiKey) throw new Error('PERIGON_API_KEY not set')

  const params = new URLSearchParams({
    country: 'us',
    language: 'en',
    sortBy: 'date',
    showReprints: 'false',
  })

  if (market === 'national') {
    // Broad RE topic + market-intelligence keywords → fetch 25, curate down to 10
    params.set('topic', 'Real Estate')
    params.set('q', 'home prices inventory mortgage rates median sale affordability housing market')
    params.set('size', '25')
  } else {
    const cityName = market.split(',')[0].trim()
    params.set('q', `"${cityName}" home prices housing market real estate`)
    params.set('size', '10')
  }

  params.set('from', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

  const url = `${BASE_URL}?${params.toString()}`
  const res = await fetch(url, { headers: { 'x-api-key': apiKey } })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Perigon ${res.status}: ${body}`)
  }

  const data = await res.json()
  const rawArticles = data.articles || []
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000

  const mapped = rawArticles.map(article => {
    const topicNames = extractNames(article.topics)
    const catNames = extractNames(article.categories)
    return {
      id: article.url || article.title,
      headline: article.title || '',
      summary: article.description || '',
      source: article.source?.name || 'Perigon',
      recency: formatRecency(article.publishedAt),
      category: mapCategory(catNames, topicNames, article.title || ''),
      hot: new Date(article.publishedAt).getTime() > sixHoursAgo,
      market: market === 'national' ? null : market,
    }
  })

  if (market === 'national') {
    // 1. Keep only housing/market-relevant articles
    const relevant = mapped.filter(a => RELEVANT_RE.test(a.headline) && !GARBAGE_RE.test(a.headline))
    // 2. Remove near-duplicate headlines (same story, different outlet)
    const deduped = deduplicateByTitle(relevant)
    // 3. Enforce diversity: max 3 per category, return up to 10
    return diversify(deduped, 3).slice(0, 10)
  }

  // Local: just filter garbage, deduplicate, return up to 5
  const relevant = mapped.filter(a => !GARBAGE_RE.test(a.headline))
  return deduplicateByTitle(relevant).slice(0, 5)
}

module.exports = { fetchStories }
