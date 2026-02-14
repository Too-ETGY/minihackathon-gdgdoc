require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("[geminiClient] GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Returns a configured Gemini generative model instance.
 * @param {string} modelName - Gemini model to use (default: "gemini-2.0-flash")
 * @returns {import("@google/genai").GenerativeModel}
 */
function getModel(modelName = "gemini-2.5-flash") {
  return ai.models;
}

/**
 * Generates content using the Gemini model.
 * @param {string} prompt
 * @param {string} modelName
 * @returns {Promise<string>} raw response text
 */
async function generateContent(prompt, modelName = "gemini-2.5-flash") {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return response.text;
}

module.exports = { generateContent };