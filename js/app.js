// js/app.js
// Frontend for AkinX AI connected to Render backend
// Backend URL: https://akinx-ai-1.onrender.com
// No API keys stored on the client; all requests are securely proxied via backend

const BASE_URL = "https://akinx-ai-1.onrender.com";

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

// Handle chat
document.getElementById("ask").onclick = async () => {
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) return alert("Enter a message first!");

  document.getElementById("response").innerText = "Thinking...";
  setStatus("Talking to AkinX AI...");

  try {
    const resp = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();

    document.getElementById("response").innerText = data.reply || data.output || "No response.";
    setStatus("AkinX AI replied!");
  } catch (err) {
    console.error(err);
    document.getElementById("response").innerText = "Error: " + err.message;
    setStatus("Error talking to backend.");
  }
};

// Handle chat + speech
document.getElementById("ask-and-speak").onclick = async () => {
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) return alert("Enter a message first!");

  document.getElementById("response").innerText = "Thinking...";
  setStatus("Talking + generating speech...");

  try {
    const resp = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    const text = data.reply || data.output || "No response.";

    document.getElementById("response").innerText = text;

    // Send text to backend for TTS
    const tts = await fetch(`${BASE_URL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!tts.ok) throw new Error(await tts.text());
    const blob = await tts.blob();
    const audioURL = URL.createObjectURL(blob);
    new Audio(audioURL).play();

    setStatus("Audio playing from backend.");
  } catch (err) {
    console.error(err);
    document.getElementById("response").innerText = "Error: " + err.message;
    setStatus("Error generating voice.");
  }
};

// Handle image generation
document.getElementById("image-gen").onclick = async () => {
  const prompt = document.getElementById("prompt").value.trim() || "A futuristic cityscape, ultra-detailed";
  document.getElementById("image-area").innerHTML = "";
  setStatus("Generating image...");

  try {
    const resp = await fetch(`${BASE_URL}/api/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();

    let imgSrc = "";
    if (data.image) imgSrc = `data:image/png;base64,${data.image}`;
    else if (data.url) imgSrc = data.url;

    const img = document.createElement("img");
    img.src = imgSrc;
    img.style.maxWidth = "100%";
    document.getElementById("image-area").appendChild(img);
    setStatus("Image generated!");
  } catch (err) {
    console.error(err);
    document.getElementById("response").innerText = "Error: " + err.message;
    setStatus("Error generating image.");
  }
};
