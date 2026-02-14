/**
 * Builds the AI prompt for hazard passability evaluation.
 *
 * @param {Object} hazard
 * @param {string} hazard.type          - e.g. "broken_sidewalk", "steep_slope", "construction"
 * @param {string} hazard.description   - Human-readable description from the reporter
 * @param {number} [hazard.severity]    - Severity level 1–5 (1 = minor, 5 = impassable)
 * @param {number} [hazard.radius]      - Affected radius in meters
 *
 * @param {Object} userProfile
 * @param {number} userProfile.age              - Age in years
 * @param {string[]} userProfile.conditions     - e.g. ["weak knees", "limited stamina"]
 * @param {string[]} userProfile.mobilityAids   - e.g. ["cane"], ["wheelchair"], []
 * @param {string} [userProfile.distanceType]   - "short" | "medium" | "long"
 *
 * @returns {string} The full prompt string to send to Gemini
 */
function buildHazardPrompt(hazard, userProfile) {
  const severity = hazard.severity ?? "unknown";
  const radius = hazard.radius != null ? `${hazard.radius} meters` : "unknown";
  const conditions = userProfile.conditions?.join(", ") || "none specified";
  const aids = userProfile.mobilityAids?.join(", ") || "none";
  const distance = userProfile.distanceType || "medium";

  return `
You are an accessibility safety evaluator for a disability-aware navigation app.

Given a reported hazard on a route and a user's mobility profile, decide if the user can safely pass through the hazard.

## Hazard
- Type: ${hazard.type}
- Description: ${hazard.description}
- Severity (1=minor, 5=impassable): ${severity}
- Affected radius: ${radius}

## User Profile
- Age: ${userProfile.age} years old
- Medical conditions: ${conditions}
- Mobility aids used: ${aids}
- Trip distance type: ${distance}

## Instructions
Evaluate whether this specific user can safely pass through this hazard.
Consider how each condition and mobility aid interacts with the hazard type and severity.

Respond ONLY with a valid JSON object in this exact format:
{
  "canPass": true or false,
  "score": <integer 0 to 100, where 100 = completely safe, 0 = completely impassable for this user>,
  "reason": "<one concise sentence explaining the decision>"
}

Do not include any text outside the JSON object.
`.trim();
}

module.exports = { buildHazardPrompt };