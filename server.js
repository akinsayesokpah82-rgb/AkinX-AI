// server.js
// ✅ AkinX AI Backend - Node.js Express Server
// Uses GitHub or Render environment secrets securely for API access.

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

const PORT = process.env.PORT || 10000;

// ===============================
// 🔐 Load environment variables
// ===============================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const STABILITY_API_KEY =
  process.env.STABILITY_API_KEY || process.env.STABILITY_AI_API;

// ===============================
// 🧠 ROUTE: Chat Completion (OpenAI)
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const prompt = req.body.prompt || "Hello, AkinX AI!";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are AkinX AI, a helpful and smart assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: "OpenAI error", details: errorText });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "No response received.";
    res.json({ response: message });
  } catch (error) {
    res.status(500).json({ error: "Chat route failed", details: error.message });
  }
});

// ===============================
// 🔊 ROUTE: Text-to-Speech (ElevenLabs)
// ===============================
app.post("/api/tts", async (req, res) => {
  try {
    const text = req.body.text || "Hello from AkinX AI!";
    const voice = "alloy"; // You can replace with any available voice ID
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: "TTS error", details: errorText });
    }

    const audioBuffer = await response.arrayBuffer();
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength,
    });
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).json({ error: "TTS route failed", details: error.message });
  }
});

// ===============================
// 🎨 ROUTE: Image Generation (Stability AI)
// ===============================
app.post("/api/image", async (req, res) => {
  try {
    const prompt = req.body.prompt || "A futuristic AI landscape";
    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        samples: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: "Image generation error", details: errorText });
    }

    const data = await response.json();
    const imageBase64 = data.artifacts?.[0]?.base64 || null;
    if (!imageBase64) {
      return res.status(500).json({ error: "No image returned." });
    }

    res.json({ image_base64: imageBase64 });
  } catch (error) {
    res.status(500).json({ error: "Image route failed", details: error.message });
  }
});

// ===============================
// 🧠 Root Test Route
// ===============================
app.get("/", (req, res) => {
  res.send("🧠 AkinX AI backend is running successfully!");
});

// ===============================
// 🚀 Start Server
// ===============================
app.listen(PORT, () => {
  console.log(`✅ AkinX AI server running on port ${PORT}`);
});
