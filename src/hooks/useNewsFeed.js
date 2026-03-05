import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { NEWS_STORIES } from '../data/mockData'

/**
 * Reads newsCache from Firestore for the agent's market areas.
 * Falls back to mock data if Firestore is unavailable or cache is empty.
 *
 * @param {string[]} marketAreas - agent's selected market areas
 * @returns {{ stories: object[], loading: boolean }}
 */
export function useNewsFeed(marketAreas) {
  const [stories, setStories] = useState(NEWS_STORIES)
  const [loading, setLoading] = useState(true)

  // Join to a stable primitive for the dependency array
  const marketsKey = ['national', ...marketAreas].join(',')

  useEffect(() => {
    let cancelled = false

    async function loadFromFirestore() {
      setLoading(true)
      const markets = marketsKey.split(',')

      const snaps = await Promise.all(
        markets.map(m => getDoc(doc(db, 'newsCache', m)))
      )

      if (cancelled) return

      const live = snaps
        .filter(s => s.exists())
        .flatMap(s => s.data().stories)

      if (live.length > 0) {
        setStories(live)
      }
      setLoading(false)
    }

    loadFromFirestore().catch(() => {
      if (!cancelled) setLoading(false)
      // Keep mock data on any error
    })

    return () => {
      cancelled = true
    }
  }, [marketsKey])

  return { stories, loading }
}
