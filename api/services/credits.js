const { db, admin } = require('./firestore')

/**
 * Reserve credits atomically. Throws if agent has insufficient credits.
 * Decrement is the "confirm" — no separate confirm step needed.
 */
async function reserveCredits(agentId, amount) {
  const ref = db.collection('agents').doc(agentId)
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) throw new Error('Agent not found')
    const credits = snap.data().credits ?? 0
    if (credits < amount) throw new Error('Insufficient credits')
    tx.update(ref, { credits: admin.firestore.FieldValue.increment(-amount) })
  })
}

/**
 * Release credits back on failure.
 */
async function releaseCredits(agentId, amount) {
  const ref = db.collection('agents').doc(agentId)
  await db.runTransaction(async (tx) => {
    tx.update(ref, { credits: admin.firestore.FieldValue.increment(amount) })
  })
}

module.exports = { reserveCredits, releaseCredits }
