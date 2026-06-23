module.exports = {
  GROQ_API_KEY: process.env.GROQ_API_KEY,

  GROQ_BASE_URL: "https://api.groq.com/openai/v1/chat/completions",

  // Text model (for normal Q&A)
  TEXT_MODEL: "llama-3.1-8b-instant",

  // Vision model (for image solving)
  VISION_MODEL: "llama-3.2-11b-vision-preview"
};
