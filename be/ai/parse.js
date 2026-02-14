/**
 * Parses and validates the raw text response from Gemini.
 * Falls back to a safe default if parsing fails.
 *
 * @param {string} rawText - Raw text returned by the Gemini model
 * @returns {{ canPass: boolean, score: number, reason: string }}
 */
function parseHazardResponse(rawText) {
  try {
    const cleaned = rawText.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      canPass: Boolean(parsed.canPass),
      score: Number(parsed.score),
      reason: String(parsed.reason),
    };
  } catch (err) {
    console.error("[parseHazardResponse] Failed to parse AI response:", err.message);
    console.error("[parseHazardResponse] Raw response was:", rawText);

    return {
      canPass: false,
      score: 0,
      reason: "AI response could not be parsed — defaulting to blocked for safety.",
    };
  }
}

module.exports = { parseHazardResponse };