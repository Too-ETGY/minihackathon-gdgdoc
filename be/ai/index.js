const { generateContent } = require("./client");
const { buildHazardPrompt } = require("./prompt");
const { parseHazardResponse } = require("./parse");

/**
 * Evaluates whether a user can safely pass through a reported hazard.
 *
 * @param {Object} hazard - The reported hazard/casualty object
 * @param {string} hazard.type          - e.g. "broken_sidewalk", "steep_slope", "construction"
 * @param {string} hazard.description   - Human-readable description from the reporter
 * @param {number} [hazard.severity]    - Severity 1–5 (1 = minor, 5 = impassable)
 * @param {number} [hazard.radius]      - Affected radius in meters
 *
 * @param {Object} userProfile - The user's mobility profile
 * @param {number} userProfile.age              - Age in years
 * @param {string[]} userProfile.conditions     - e.g. ["weak knees", "limited stamina"]
 * @param {string[]} userProfile.mobilityAids   - e.g. ["cane"], ["wheelchair"], []
 * @param {string} [userProfile.distanceType]   - "short" | "medium" | "long"
 *
 * @returns {Promise<{ canPass: boolean, score: number, reason: string }>}
 */

const defaultUserProfile = {
  age: 72,
  conditions: ["weak knees", "limited stamina", "balance issues"],
  mobilityAids: ["cane"],
  distanceType: "medium",
};

async function checkHazardPassability(hazard, userProfile = defaultUserProfile) {
  try {
    const prompt = buildHazardPrompt(hazard, userProfile);
    const rawText = await generateContent(prompt);
    return parseHazardResponse(rawText);
  } catch (err) {
    console.error("[checkHazardPassability] Unexpected error:", err.message);
    return {
      canPass: false,
      score: 0,
      reason: "AI scoring unavailable — defaulting to blocked for safety.",
    };
  }
}

module.exports = { checkHazardPassability };