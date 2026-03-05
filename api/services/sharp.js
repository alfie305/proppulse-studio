const sharp = require('sharp')

const PLATFORMS = {
  'instagram-feed':  { width: 2048, height: 2048 },
  'instagram-story': { width: 1080, height: 1920 },
  'linkedin':        { width: 1200, height: 1500 },
  'email-flyer':     { width: 600,  height: 900  },
}

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Stamp contact info as a semi-transparent footer bar.
 * Reads agent.{ name, phone, license, brokerage }.
 * Contact text is stamped via Sharp — NOT in the image generation prompt.
 */
async function stampContact(imageBuffer, agent) {
  const meta = await sharp(imageBuffer).metadata()
  const w = meta.width
  const h = meta.height
  const barH = Math.round(h * 0.18)

  const nameSize   = Math.round(barH * 0.28)
  const detailSize = Math.round(barH * 0.20)
  const phoneSize  = Math.round(barH * 0.18)

  const svg = `<svg width="${w}" height="${barH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${barH}" fill="rgba(0,0,0,0.72)"/>
  <text x="40" y="${Math.round(barH * 0.38)}" font-family="Arial, Helvetica, sans-serif"
    font-size="${nameSize}" font-weight="bold" fill="white">${escapeXml(agent.name)}</text>
  <text x="40" y="${Math.round(barH * 0.66)}" font-family="Arial, Helvetica, sans-serif"
    font-size="${detailSize}" fill="#cccccc">${escapeXml(agent.license)} · ${escapeXml(agent.brokerage)}</text>
  <text x="40" y="${Math.round(barH * 0.90)}" font-family="Arial, Helvetica, sans-serif"
    font-size="${phoneSize}" fill="#aaaaaa">${escapeXml(agent.phone)}</text>
</svg>`

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), gravity: 'south' }])
    .png()
    .toBuffer()
}

/**
 * Resize a master 2048×2048 buffer to the target platform dimensions.
 */
async function resizeForPlatform(buffer, platformId) {
  const dims = PLATFORMS[platformId]
  if (!dims) throw new Error(`Unknown platformId: ${platformId}`)
  return sharp(buffer)
    .resize(dims.width, dims.height, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer()
}

module.exports = { stampContact, resizeForPlatform, PLATFORMS }
