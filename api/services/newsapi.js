const { mapCategory } = require('../utils/categoryMapper')
const { formatRecency } = require('../utils/formatRecency')

// NewsAPI.ai (Event Registry) — keyword-in-title queries give precise market intelligence
const BASE_URL = 'https://eventregistry.org/api/v1/article/getArticles'

// Market intelligence keywords — article title must contain at least one.
// Free tier cap: 15 total words. Current count: 13. All housing-specific phrases.
const NATIONAL_KEYWORDS = [
  'mortgage',       // 1 — mortgage rates, mortgage lender, etc.
  'home prices',    // 2,3
  'housing market', // 4,5
  'home sales',     // 6,7
  'housing starts', // 8,9
  'foreclosure',    // 10
  'refinance',      // 11
  'homebuyer',      // 12
  'home buyers',    // 13,14  ← catches "first-time home buyers" etc
]

/**
 * Enforce diversity: max `cap` articles per category.
 */
function diversify(articles, cap = 4) {
  const counts = {}
  return articles.filter(a => {
    counts[a.category] = counts[a.category] || 0
    if (counts[a.category] < cap) { counts[a.category]++; return true }
    return false
  })
}

/**
 * Fetches market-intelligence articles from NewsAPI.ai.
 * @param {string} market - 'national' or 'City, ST'
 * @returns {Promise<object[]>}
 */
async function fetchStories(market) {
  const apiKey = process.env.NEWSAPI_KEY
  if (!apiKey) throw new Error('NEWSAPI_KEY not set')

  let queryObj

  if (market === 'national') {
    queryObj = {
      $query: {
        $and: [
          {
            // Title must contain at least one market-intelligence keyword
            $or: NATIONAL_KEYWORDS.map(kw => ({ keyword: kw, keywordLoc: 'title' })),
          },
          { sourceLocationUri: 'http://en.wikipedia.org/wiki/United_States' },
          { lang: 'eng' },
        ],
      },
      $filter: {
        isDuplicate: 'skipDuplicates',
        dataType: ['news'],
      },
    }
  } else {
    // Use full city name; if multi-word (e.g. "Miami Beach"), also try first word as fallback
    const fullCity = market.split(',')[0].trim()
    const shortCity = fullCity.split(' ')[0] // "Miami" from "Miami Beach"
    const cityKeywords = fullCity === shortCity
      ? [{ keyword: fullCity, keywordLoc: 'title' }]
      : [
          { keyword: fullCity, keywordLoc: 'title' },
          { keyword: shortCity, keywordLoc: 'title' },
        ]

    queryObj = {
      $query: {
        $and: [
          { $or: cityKeywords },
          {
            $or: [
              { keyword: 'real estate', keywordLoc: 'title' },
              { keyword: 'home prices', keywordLoc: 'title' },
              { keyword: 'housing market', keywordLoc: 'title' },
              { keyword: 'housing', keywordLoc: 'title' },
            ],
          },
          { lang: 'eng' },
        ],
      },
      $filter: {
        isDuplicate: 'skipDuplicates',
        dataType: ['news'],
      },
    }
  }

  const payload = {
    action: 'getArticles',
    query: queryObj,
    articlesPage: 1,
    articlesCount: market === 'national' ? 20 : 10,
    articlesSortBy: 'date',
    articlesSortByAsc: false,
    resultType: 'articles',
    apiKey,
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NewsAPI ${res.status}: ${text}`)
  }

  const data = await res.json()
  const rawArticles = data.articles?.results || []
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000

  const mapped = rawArticles.map(article => {
    const catNames = (article.categories || []).map(c => c.label?.eng || c.uri || '')
    return {
      id: article.url || article.uri,
      headline: article.title || '',
      summary: article.body ? article.body.slice(0, 280).replace(/\n/g, ' ') : '',
      source: article.source?.title || 'NewsAPI',
      recency: formatRecency(article.dateTime || article.date),
      category: mapCategory(catNames, [], article.title || ''),
      hot: new Date(article.dateTime || article.date).getTime() > sixHoursAgo,
      market: market === 'national' ? null : market,
    }
  })

  if (market === 'national') {
    return diversify(mapped, 4).slice(0, 10)
  }
  return mapped.slice(0, 5)
}

module.exports = { fetchStories }
