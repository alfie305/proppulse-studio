const { Storage } = require('@google-cloud/storage')

const storage = new Storage({ projectId: process.env.FIREBASE_PROJECT_ID })
const BUCKET = process.env.GCS_BUCKET_NAME

/**
 * Upload a PNG buffer to GCS under the agent-scoped path and return a signed URL.
 * Path: /agents/{agentId}/generated/{filename}
 * Filename convention: {agentId}_{campaignType}_{platformId}_{timestamp}_{variant}.png
 */
async function uploadAsset(agentId, filename, buffer) {
  const gcsPath = `agents/${agentId}/generated/${filename}`
  const file = storage.bucket(BUCKET).file(gcsPath)

  await file.save(buffer, {
    contentType: 'image/png',
    resumable: false,
    metadata: { cacheControl: 'public, max-age=604800' },
  })

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  return url
}

module.exports = { uploadAsset }
