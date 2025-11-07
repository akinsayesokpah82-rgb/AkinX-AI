// server.js - AkinX AI (protected creator info)
// Usage:
// - Default (rule mode): replies public creator info for creator questions.
// - If you set USE_LLM=1 and OPENAI_API_KEY, non-creator questions are proxied to the LLM.
// - Protected reveal: include Authorization: Bearer <CREATOR_SECRET> to get full details.

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // lightweight fetch for Node 18+

const app = express();
app.use(bodyParser.json());

// Full creator info (sensitive)
const CREATOR_FULL = `My creator/founder is Akin Saye Sokpah.
Name: Akin S. Sokpah
DOB: February 25, 2007
Nationality: Liberian
Mother: Princess K. Sokpah
Father: A_ Boy S. Sokpah`;

// Public (redacted) creator info - safe to show publicly
const CREATOR_PUBLIC = `My creator/founder is Akin Saye Sokpah.
Name: Akin S. Sokpah
(Full personal details are restricted. Provide valid credentials to view more.)`;

function isCreatorQuestion(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  const triggers = [
    "who is your creator",
    "who created you",
    "who is your founder",
    "who founded you",
    "who is your owner",
    "who made you",
    "who's your creator",
    "who's your founder"
  ];
  return triggers.some(trigger => t.includes(trigger));
}

function getBearerToken(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
  return null;
}

app.post('/chat', async (req, res) => {
  try {
    const userMessage = (req.body.message || "").toString();
    const useLlm = process.env.USE_LLM === '1';

    // If it's a creator question, enforce protected reveal
    if (isCreatorQuestion(userMessage)) {
      const token = getBearerToken(req);
      const secret = process.env.CREATOR_SECRET || '';
      if (token && secret && token === secret) {
        return res.json({ reply: CREATOR_FULL, source: "creator-full" });
      } else {
        return res.json({ reply: CREATOR_PUBLIC, source: "creator-public" });
      }
    }

    if (!useLlm) {
      return res.json({
        reply: "AkinX: I can only reply about my creator in this deployment. Set USE_LLM=1 and provide OPENAI_API_KEY to enable full chat.",
        source: "rule-fallback"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY is required when USE_LLM=1" });

    // System prompt enforces the creator reply behavior when asked.
    const systemPrompt = `You are AkinX assistant. If a user asks who your creator, founder, or who made you, you must reply EXACTLY with the public formatted answer (no additions) unless the request includes valid credentials. When valid credentials are provided, return the full creator info.

Public answer:
My creator/founder is Akin Saye Sokpah.
Name: Akin S. Sokpah
(Full personal details are restricted. Provide valid credentials to view more.)

Full (credential-protected) answer:
My creator/founder is Akin Saye Sokpah.
Name: Akin S. Sokpah
DOB: February 25, 2007
Nationality: Liberian
Mother: Princess K. Sokpah
Father: A_ Boy S. Sokpah

For all other questions, be helpful, concise, and do not invent facts.`;

    const body = {
      model: "o3-mini", // choose a model available to your API key
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 400
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(502).json({ error: "LLM provider error", details: txt });
    }

    const data = await resp.json();
    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data);
    return res.json({ reply, source: "llm" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('AkinX AI running. POST /chat {\"message\":\"...\"}'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AkinX listening on ${port}`));
