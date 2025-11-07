const API_BASE = "https://akinx-ai-1.onrender.com";

const chatBtn = document.getElementById("chatBtn");
const speakBtn = document.getElementById("speakBtn");
const imageBtn = document.getElementById("imageBtn");
const promptInput = document.getElementById("prompt");
const responseBox = document.getElementById("response");
const resultImg = document.getElementById("resultImg");
const ttsAudio = document.getElementById("ttsAudio");

// 💬 CHAT
chatBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return alert("Enter a question first!");

  responseBox.innerHTML = "Thinking...";
  resultImg.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (data.response) {
      responseBox.innerHTML = data.response.replace(/\n/g, "<br>");
    } else {
      responseBox.innerHTML = "❌ Error: " + (data.error || "No response");
    }
  } catch (err) {
    responseBox.innerHTML = "⚠️ Failed: " + err.message;
  }
});

// 🔊 SPEECH
speakBtn.addEventListener("click", async () => {
  const text = responseBox.textContent || promptInput.value;
  if (!text) return alert("Ask something first!");

  ttsAudio.hidden = true;

  try {
    const res = await fetch(`${API_BASE}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    ttsAudio.src = url;
    ttsAudio.hidden = false;
    ttsAudio.play();
  } catch (err) {
    alert("Speech failed: " + err.message);
  }
});

// 🎨 IMAGE
imageBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return alert("Enter image prompt!");

  responseBox.innerHTML = "🎨 Generating image...";
  resultImg.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/api/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.image_base64) {
      resultImg.src = `data:image/png;base64,${data.image_base64}`;
      resultImg.style.display = "block";
      responseBox.innerHTML = "✅ Image generated below:";
    } else {
      responseBox.innerHTML = "❌ Error: " + (data.error || "Failed");
    }
  } catch (err) {
    responseBox.innerHTML = "⚠️ Image error: " + err.message;
  }
});
