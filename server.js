const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");

const {
  GROQ_API_KEY,
  GROQ_BASE_URL,
  TEXT_MODEL,
  VISION_MODEL
} = require("./config");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 🧠 SYSTEM PROMPT
const SYSTEM_PROMPT = `
You are AmarShiksha AI, a friendly teacher for Bangladeshi students.
- Explain in simple, clear steps
- Focus on Bangladesh studies when relevant
- Be helpful, structured, and educational
`;

// =======================
// 📘 TEXT Q&A ROUTE
// =======================
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const response = await axios.post(
      GROQ_BASE_URL,
      {
        model: TEXT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      answer: response.data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({
      error: "Failed to get AI response",
      details: err.message
    });
  }
});

// =======================
// 🖼️ IMAGE Q&A ROUTE
// =======================
app.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const imgBase64 = fs.readFileSync(req.file.path).toString("base64");

    const response = await axios.post(
      GROQ_BASE_URL,
      {
        model: VISION_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Solve this question from the image. Give final answer and short explanation."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imgBase64}`
                }
              }
            ]
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    fs.unlinkSync(req.file.path);

    res.json({
      answer: response.data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({
      error: "Image processing failed",
      details: err.message
    });
  }
});

// =======================
// 🌐 HEALTH CHECK
// =======================
app.get("/", (req, res) => {
  res.send("🚀 AmarShiksha AI Backend is running");
});

// =======================
// 🚀 START SERVER (RENDER SAFE)
// =======================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
