const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Build image generation prompt. MUST NOT include contact PII (per CLAUDE.md §4).
 */
function buildPrompt(campaignType, theme, primaryColor, newsHook) {
  const newsContext = newsHook
    ? `News context: ${newsHook.title ?? newsHook.headline} — ${newsHook.summary} (Source: ${newsHook.source}, ${newsHook.recency})`
    : 'News context: General real estate market conditions'

  return `Create a professional real estate marketing image.
Campaign: ${campaignType}
Visual theme: ${theme}
Brand accent color: ${primaryColor}
Style: high-end, editorial, real estate professional
${newsContext}
Output: square composition, clean layout, room for text overlay at bottom 20%`
}

/**
 * Call Gemini image generation for one variant.
 * Returns a PNG Buffer.
 */
async function generateVariant(prompt, variantSeed) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-preview-image-generation',
    generationConfig: {
      responseModalities: ['IMAGE'],
    },
  })

  const fullPrompt = `${prompt}\nVariation seed: ${variantSeed}`
  const result = await model.generateContent(fullPrompt)

  const parts = result.response.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find((p) => p.inlineData)
  if (!imagePart) throw new Error('Gemini returned no image data')

  return Buffer.from(imagePart.inlineData.data, 'base64')
}

module.exports = { buildPrompt, generateVariant }
