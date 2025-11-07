// js/app.js
// ✅ AkinX AI - connected to Render backend
// Frontend now calls your backend (https://akinx-ai-1.onrender.com)
// Backend securely uses your OpenAI, ElevenLabs, and Stability API keys

const API_BASE = "https://akinx-ai-1.onrender.com"; // your live backend URL

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

// Chat completion with OpenAI (via backend)
async function callAkinXChat(prompt) {
  setStatus("Thinking...");
  const resp = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error("Server error: " + txt);
  }

  const data = await resp.json();
  setStatus("AI responded.");
  return data.response || "No response received.";
}

// Text-to-speech via backend
async function callAkinXTTS(text) {
  setStatus("Speaking...");
  const resp = await fetch(`${API_BASE}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error("TTS error: " + txt);
  }

  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
  setStatus("Voice playing...");
}

// Image generation via backend
async function callAkinXImage(prompt) {
  setStatus("Generating image...");
  const resp = await fetch(`${API_BASE}/api/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error("Image generation error: " + txt);
  }

  const data = await resp.json();
  let imgData = "";

  if (data.image_base64) {
    imgData = "data:image/png;base64," + data.image_base64;
  } else if (data.image_url) {
    imgData = data.image_url;
  } else {
    document.getElementById("image-area").innerText = "No image data.";
    return;
  }

  const img = document.createElement("img");
  img.src = imgData;
  img.style.maxWidth = "100%";
  const area = document.getElementById("image-area");
  area.innerHTML = "";
  area.appendChild(img);
  setStatus("Image ready.");
}

// Event handlers for UI buttons
document.getElementById("ask").onclick = async () => {
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) return alert("Enter a prompt first.");
  document.getElementById("response").innerText = "Thinking...";
  try {
    const reply = await callAkinXChat(prompt);
    document.getElementById("response").innerText = reply;
  } catch (e) {
    document.getElementById("response").innerText = "Error: " + e.message;
    setStatus("Error occurred. Check console.");
    console.error(e);
  }
};

document.getElementById("ask-and-speak").onclick = async () => {
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) return alert("Enter a prompt first.");
  document.getElementById("response").innerText = "Thinking...";
  try {
    const reply = await callAkinXChat(prompt);
    document.getElementById("response").innerText = reply;
    await callAkinXTTS(reply);
  } catch (e) {
    document.getElementById("response").innerText = "Error: " + e.message;
    setStatus("Error occurred. Check console.");
    console.error(e);
  }
};

document.getElementById("image-gen").onclick = async () => {
  const prompt = document.getElementById("prompt").value.trim() || "A futuristic AI landscape";
  try {
    await callAkinXImage(prompt);
  } catch (e) {
    document.getElementById("response").innerText = "Error: " + e.message;
    setStatus("Error occurred. Check console.");
    console.error(e);
  }
};

setStatus("Ready ✅ AkinX AI frontend connected to backend!");
