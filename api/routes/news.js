const express = require('express')
const { fetchStories } = require('../services/newsapi')
const { writeNewsCache, db } = require('../services/firestore')

const router = express.Router()

/**
 * Queries Firestore for all unique marketAreas across all agents.
 * @returns {Promise<string[]>}
 */
async function getAllAgentMarkets() {
  const snap = await db.collection('agents').get()
  const marketSet = new Set()
  snap.forEach(doc => {
    (doc.data().marketAreas ?? []).forEach(m => marketSet.add(m))
  })
  return [...marketSet]
}

/**
 * POST /news/refresh
 * Triggered by Cloud Scheduler daily at 6am UTC.
 * Validates CRON_SECRET bearer token, then fetches + caches stories for all markets.
 * Budget: 150 req/month ÷ 30 days = 5/day → national (1) + up to 4 local markets.
 */
router.post('/refresh', async (req, res) => {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.authorization || ''

  if (!secret || auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const localMarkets = await getAllAgentMarkets()

  // Budget cap: shuffle and take max 4 local markets per run (5 total including national)
  const shuffled = localMarkets.sort(() => Math.random() - 0.5)
  const markets = ['national', ...shuffled.slice(0, 4)]

  const results = await Promise.allSettled(
    markets.map(async (market) => {
      const stories = await fetchStories(market)
      await writeNewsCache(market, stories)
      return { market, count: stories.length }
    })
  )

  const summary = results.map((r, i) => ({
    market: markets[i],
    status: r.status,
    ...(r.status === 'fulfilled' ? { count: r.value.count } : { error: r.reason?.message }),
  }))

  const failed = summary.filter(s => s.status === 'rejected')
  const statusCode = failed.length === markets.length ? 500 : 200

  return res.status(statusCode).json({ summary })
})

module.exports = router
