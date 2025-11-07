# AkinX-AI — GitHub Pages demo (Client-side)

This repository contains a simple, **client-side** demo of **AkinX AI** that runs entirely in a browser and is ready for GitHub Pages.

## What it includes
- `index.html` — single-page frontend app
- `js/app.js` — client-side logic: calls OpenAI, ElevenLabs, and Stability APIs using keys supplied by the user in their browser.
- `.env.example` — template for local development (do NOT commit secrets)
- `.gitignore`
- `README.md` (this file)
- `LICENSE` — MIT

## Important security notes
- **Do NOT** commit real API keys to your repo.
- Client-side calls require the user's API key to be present in the browser (localStorage). Anyone who inspects network requests could see that key while your browser uses it.
- For a proper public product where you don't want users to paste keys, you need a backend (server or serverless) that stores keys securely (for example: GitHub Secrets + a server deployed to Render / Vercel / Cloudflare Workers). See the "Optional: Secure backend" section below.

## Quick setup — GitHub Pages (client-only)
1. Copy all files to your `AkinX-AI` repository (or replace existing files).
2. Commit and push to `main` branch.
3. In your repo, go to **Settings → Pages** and set source to `main` branch (root) and save.
4. Visit the GitHub Pages URL (shown in the Pages settings).
5. On the page: paste your personal API keys in the inputs:
   - OpenAI: `sk-...`
   - ElevenLabs: `eleven-...`
   - Stability: `your_stability_key` stored as `STABILITY_KEY` in localStorage (use DevTools console or modify UI)
6. Use the UI to ask questions and generate images.

## How to store secrets (for local dev or Actions)
- Locally: create a `.env` file (never commit)
  ```
  OPENAI_API_KEY=sk-...
  ELEVENLABS_API_KEY=eleven-...
  STABILITY_KEY=...
  ```
- GitHub Actions: use **Settings → Secrets and variables → Actions** to add repository secrets. Actions can read these values during workflows but they remain encrypted.

## Optional: Secure backend (recommended for public use)
A secure architecture runs a small server (Node, Cloudflare Worker, or serverless) that:
- stores provider API keys on the server (or via GitHub Secrets passed during CI)
- exposes a **limited** proxy endpoint for the frontend
- adds rate limits and authentication

I can provide a sample `server/proxy.js` and a GitHub Actions workflow to deploy it to a chosen hosting provider — tell me which host you'd like (Render, Vercel, Cloudflare Workers).

## Troubleshooting
- If requests fail, open browser DevTools → Network to inspect requests and responses.
- Many APIs require CORS headers; calling some provider endpoints directly from the browser may be blocked by CORS. If you see CORS errors, you must use a server-side proxy.

## Next steps I can do for you
- Add a simple Express proxy server (`server/`) that reads API keys from environment variables and forwards requests safely.
- Add a GitHub Actions workflow that deploys the static site to GitHub Pages automatically.
- Create a deployable Cloudflare Worker example and show how to store secrets securely.

