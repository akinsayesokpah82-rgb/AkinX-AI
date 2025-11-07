// js/app.js
// Lightweight client-side app for AkinX AI (demo).
// This demo expects each user to provide their own API keys (stored in localStorage).
// It demonstrates calling OpenAI Chat Completions, ElevenLabs TTS, and Stability image generation (all client-side).
// IMPORTANT: Calls from the browser expose the user's key to network observers and CORS; only use keys you trust and understand.
//
// For production with public users, run a server/proxy that stores keys securely (GitHub Secrets used with Actions can help build/deploy a secure backend).

function setStatus(s){ document.getElementById('status').innerText = s; }

document.getElementById('save-keys').onclick = () => {
  localStorage.setItem('OPENAI_KEY', document.getElementById('openai-key').value.trim());
  localStorage.setItem('ELEVEN_KEY', document.getElementById('eleven-key').value.trim());
  setStatus('Keys saved locally in your browser (localStorage).');
};
document.getElementById('clear-keys').onclick = () => {
  localStorage.removeItem('OPENAI_KEY'); localStorage.removeItem('ELEVEN_KEY');
  setStatus('Keys cleared.');
};
document.getElementById('openai-key').value = localStorage.getItem('OPENAI_KEY') || '';
document.getElementById('eleven-key').value = localStorage.getItem('ELEVEN_KEY') || '';

async function callOpenAI(prompt){
  const key = localStorage.getItem('OPENAI_KEY');
  if(!key){ alert('Please save your OpenAI key first.'); return null; }
  setStatus('Calling OpenAI...');
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{role:"user", content: prompt}],
      max_tokens: 600
    })
  });
  if(!resp.ok){
    const txt = await resp.text();
    throw new Error('OpenAI error: ' + txt);
  }
  const data = await resp.json();
  const out = data.choices?.[0]?.message?.content || JSON.stringify(data);
  setStatus('OpenAI returned response.');
  return out;
}

async function callElevenLabsSpeak(text){
  const key = localStorage.getItem('ELEVEN_KEY');
  if(!key){ alert('Please save your ElevenLabs key first.'); return null; }
  setStatus('Calling ElevenLabs TTS...');
  // Example endpoint - ElevenLabs API may require a voice id and updated path.
  const voice = "alloy";
  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({text})
  });
  if(!resp.ok){
    const txt = await resp.text();
    throw new Error('ElevenLabs error: ' + txt);
  }
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
  setStatus('Playing audio from ElevenLabs.');
  return true;
}

async function callStabilityImage(prompt){
  const key = localStorage.getItem('STABILITY_KEY') || localStorage.getItem('STABILITY_AI_API') || '';
  if(!key){ alert('Please save your Stability API key in localStorage as STABILITY_KEY or STABILITY_AI_API.'); return null; }
  setStatus('Calling Stability AI image generation...');
  // Stability's API endpoint and payload may differ; this is a generic example.
  const resp = await fetch('https://api.stability.ai/v1/generation/text-to-image', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + key
    },
    body: JSON.stringify({
      text_prompts: [{text: prompt}],
      cfg_scale: 7,
      height: 512,
      width: 512,
      samples: 1
    })
  });
  if(!resp.ok){
    const txt = await resp.text();
    throw new Error('Stability error: ' + txt);
  }
  const data = await resp.json();
  // response handling may differ; some APIs return base64 images, others return URLs.
  // Try to handle common patterns:
  let imgData = '';
  if(data.artifacts && data.artifacts[0] && data.artifacts[0].base64){
    imgData = 'data:image/png;base64,' + data.artifacts[0].base64;
  } else if(data.images && data.images[0]){
    imgData = data.images[0];
  } else if(data.output && data.output[0] && data.output[0].image){
    imgData = 'data:image/png;base64,' + data.output[0].image;
  } else {
    // fallback: stringify
    document.getElementById('image-area').innerText = JSON.stringify(data);
    setStatus('Stability returned data (see console).');
    return;
  }
  const img = document.createElement('img');
  img.src = imgData;
  img.style.maxWidth = '100%';
  const area = document.getElementById('image-area');
  area.innerHTML = '';
  area.appendChild(img);
  setStatus('Image generated.');
}

document.getElementById('ask').onclick = async () => {
  const p = document.getElementById('prompt').value;
  document.getElementById('response').innerText = 'Thinking...';
  try{
    const out = await callOpenAI(p);
    document.getElementById('response').innerText = out;
  }catch(e){
    document.getElementById('response').innerText = 'Error: ' + e.message;
    setStatus('Error - check console for details.');
    console.error(e);
  }
};

document.getElementById('ask-and-speak').onclick = async () => {
  const p = document.getElementById('prompt').value;
  document.getElementById('response').innerText = 'Thinking...';
  try{
    const out = await callOpenAI(p);
    document.getElementById('response').innerText = out;
    await callElevenLabsSpeak(out);
  }catch(e){
    document.getElementById('response').innerText = 'Error: ' + e.message;
    setStatus('Error - check console for details.');
    console.error(e);
  }
};

document.getElementById('image-gen').onclick = async () => {
  const p = document.getElementById('prompt').value || 'A scenic landscape, ultra-detailed';
  try{
    await callStabilityImage(p);
  }catch(e){
    document.getElementById('response').innerText = 'Error: ' + e.message;
    setStatus('Error - check console for details.');
    console.error(e);
  }
};
