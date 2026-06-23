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

const SYSTEM_PROMPT = `
You are AmarShiksha AI, a friendly teacher for Bangladeshi students.
Explain clearly, simply, and step-by-step when needed.
Focus on Bangladesh studies when relevant.
`;

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

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

    res.json({ answer: response.data.choices[0].message.content });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/image", upload.single("image"), async (req, res) => {
  try {
    const img = fs.readFileSync(req.file.path).toString("base64");

    const response = await axios.post(
      GROQ_BASE_URL,
      {
        model: VISION_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Solve this image question" },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${img}` } }
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

    res.json({ answer: response.data.choices[0].message.content });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));