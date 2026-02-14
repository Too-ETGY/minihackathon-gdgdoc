require("dotenv").config();
const { checkHazardPassability } = require("./index");

// ── Mock hazard (as your friends' collision system would send) ────────────────
const hazard = {
  type: "broken_sidewalk",
  description: "small cracks no the sides, but wide sidewalks, not too bad",
  severity: 2,
  radius: 15,
};

// ── Mock user profile ─────────────────────────────────────────────────────────
const userProfile = {
  age: 72,
  conditions: ["weak knees", "limited stamina", "balance issues"],
  mobilityAids: ["cane"],
  distanceType: "medium",
};

// ── Run ───────────────────────────────────────────────────────────────────────
async function run() {
  console.log("Testing checkHazardPassability...\n");
  console.log("Hazard:", hazard);
  console.log("User:", userProfile);
  console.log("\nCalling AI...\n");

  const result = await checkHazardPassability(hazard, userProfile);

  console.log("Result:", result);
  console.log("\n--- Decision:", result.canPass ? "✅ CAN PASS" : "🚫 BLOCKED");
  console.log("--- Score:   ", result.score + "/100");
  console.log("--- Reason:  ", result.reason);
}

run();