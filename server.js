// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("🧠 AkinX AI backend is running successfully!");
});

// =======================
// 1️⃣ OPENAI CHAT ENDPOINT
// =======================
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// 2️⃣ ELEVENLABS TTS ENDPOINT
// ==========================
app.post("/api/tts", async (req, res) => {
  const { text } = req.body;
  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );
    const audioBuffer = await response.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// 3️⃣ STABILITY IMAGE ENDPOINT
// ==============================
app.post("/api/image", async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/ultra", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STABILITY_AI_API}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: "1:1",
        output_format: "base64",
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ AkinX AI server running on port ${PORT}`));
