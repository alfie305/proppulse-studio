const express = require('express')
const crypto = require('crypto')
const { admin, db } = require('../services/firestore')
const { reserveCredits, releaseCredits } = require('../services/credits')
const { buildPrompt, generateVariant } = require('../services/gemini')
const { stampContact } = require('../services/sharp')
const { uploadAsset } = require('../services/gcs')

const router = express.Router()

const CREDITS_PER_GEN = 12

// 6 variants distributed across 4 platform formats
const VARIANT_PLATFORMS = [
  { id: 'instagram-feed',  label: 'Instagram Feed',  dims: '2048×2048' },
  { id: 'instagram-story', label: 'Instagram Story', dims: '1080×1920' },
  { id: 'linkedin',        label: 'LinkedIn',        dims: '1200×1500' },
  { id: 'email-flyer',     label: 'Email Flyer',     dims: '600×900'   },
  { id: 'instagram-feed',  label: 'Instagram Feed',  dims: '2048×2048' },
  { id: 'instagram-story', label: 'Instagram Story', dims: '1080×1920' },
]

router.post('/', async (req, res) => {
  // 1. Authenticate — extract and verify Firebase ID token
  const authHeader = req.headers.authorization ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Bearer token' })
  }
  const idToken = authHeader.slice(7)

  let uid
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    uid = decoded.uid
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  // 2. Load agent doc — all queries scoped by uid (agentId)
  const agentRef = db.collection('agents').doc(uid)
  const agentSnap = await agentRef.get()
  if (!agentSnap.exists) {
    return res.status(404).json({ error: 'Agent profile not found' })
  }
  const agent = agentSnap.data()

  // 3. Hard credit cap — block before any API call
  if ((agent.credits ?? 0) < CREDITS_PER_GEN) {
    return res.status(402).json({
      error: 'Insufficient credits',
      creditsRemaining: agent.credits ?? 0,
    })
  }

  const { campaignType, theme, primaryColor, newsHook } = req.body
  if (!campaignType) {
    return res.status(400).json({ error: 'campaignType is required' })
  }

  // 4. Reserve credits (transactional — throws if insufficient)
  try {
    await reserveCredits(uid, CREDITS_PER_GEN)
  } catch (err) {
    return res.status(402).json({ error: err.message, creditsRemaining: agent.credits ?? 0 })
  }

  const genId = crypto.randomUUID()
  const timestamp = Date.now()
  const assets = []

  try {
    // 5. Build prompt — no contact PII per CLAUDE.md §4
    const prompt = buildPrompt(
      campaignType,
      theme ?? 'luxury-dark',
      primaryColor ?? '#2bee79',
      newsHook ?? null,
    )

    // 6. Generate 6 variants sequentially (avoid rate limits)
    for (let i = 0; i < 6; i++) {
      const platform = VARIANT_PLATFORMS[i]
      const variantNum = i + 1

      const imageBuffer = await generateVariant(prompt, variantNum)

      // 7. Stamp contact text via Sharp — NOT via prompt (CLAUDE.md §1.1)
      const stamped = await stampContact(imageBuffer, {
        name:      agent.name,
        phone:     agent.phone,
        license:   agent.license,
        brokerage: agent.brokerage,
      })

      // 8. Upload to GCS under agent-scoped path (CLAUDE.md §1.2, §6)
      const filename = `${uid}_${campaignType}_${platform.id}_${timestamp}_${variantNum}.png`
      const url = await uploadAsset(uid, filename, stamped)

      assets.push({
        id:         `${genId}-${variantNum}`,
        variant:    variantNum,
        platform:   platform.label,
        platformId: platform.id,
        dims:       platform.dims,
        url,
      })
    }

    // 9. Write generation metadata — scoped by agentId (CLAUDE.md §1.2)
    await db
      .collection('generations')
      .doc(uid)
      .collection('items')
      .doc(genId)
      .set({
        genId,
        agentId: uid,
        campaignType,
        theme:    theme ?? 'luxury-dark',
        newsHook: newsHook ?? null,
        assetCount: 6,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        assets: assets.map(({ variant, platform, platformId, url }) => ({
          variant, platform, platformId, url,
        })),
      })

  } catch (err) {
    // Release credits on any failure (CLAUDE.md §1.3)
    await releaseCredits(uid, CREDITS_PER_GEN).catch((releaseErr) => {
      console.error('CRITICAL: credit release failed', releaseErr)
    })
    console.error('Generation failed:', err)
    return res.status(500).json({ error: 'Generation failed', details: err.message })
  }

  // 10. Return assets + server-authoritative credit count
  const updatedSnap = await agentRef.get()
  const creditsRemaining = updatedSnap.data().credits ?? 0

  res.json({ assets, creditsRemaining, genId })
})

module.exports = router
