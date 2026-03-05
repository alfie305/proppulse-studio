const admin = require('firebase-admin')

// Initialize once — Cloud Run provides GOOGLE_APPLICATION_CREDENTIALS automatically
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

/**
 * Writes stories to newsCache/{market}.
 * @param {string} market - 'national' or a city name
 * @param {object[]} stories
 */
async function writeNewsCache(market, stories) {
  await db.collection('newsCache').doc(market).set({
    stories,
    fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
  })
}

module.exports = { writeNewsCache, db, admin }
