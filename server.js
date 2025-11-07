// server.js
// ✅ AkinX AI Backend — Secure, Multi-API Integration

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

const PORT = process.env.PORT || 10000;

// 🔐 Environment Variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const STABILITY_API_KEY =
  process.env.STABILITY_API_KEY || process.env.STABILITY_AI_API;

// 🧠 OpenAI Chat
app.post("/api/chat", async (req, res) => {
  try {
    const prompt = req.body.prompt || "Hello from AkinX AI!";
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are AkinX AI, a helpful assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
      }),
    });
    if (!r.ok) return res.status(500).send(await r.text());
    const d = await r.json();
    res.json({ response: d.choices?.[0]?.message?.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🔊 ElevenLabs Speech
app.post("/api/tts", async (req, res) => {
  try {
    const text = req.body.text || "Hello from AkinX AI!";
    const voice = "alloy";
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    if (!r.ok) return res.status(500).send(await r.text());
    const audio = await r.arrayBuffer();
    res.set({ "Content-Type": "audio/mpeg" });
    res.send(Buffer.from(audio));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🎨 Stability AI Images
app.post("/api/image", async (req, res) => {
  try {
    const prompt = req.body.prompt || "A futuristic AI concept art";
    const r = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image",
      {
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
      }
    );
    if (!r.ok) return res.status(500).send(await r.text());
    const d = await r.json();
    res.json({ image_base64: d.artifacts?.[0]?.base64 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Root test
app.get("/", (_, res) => res.send("🧠 AkinX AI backend is running successfully!"));

app.listen(PORT, () => console.log(`✅ AkinX AI running on port ${PORT}`));
