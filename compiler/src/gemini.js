/**
 * Gemini API client — handles text generation and image generation.
 */
import fetch from 'node-fetch';

const THINKING_BUDGETS = { high: 24576, medium: 8192, low: 1024 };
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 8000];
const TIMEOUT_MS = 120000;

/**
 * Call Gemini text model.
 */
async function callText({ prompt, systemInstruction, thinkingLevel = 'medium', responseJson = false, maxOutputTokens = 4096 }) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_TEXT_MODEL || 'gemini-3-flash-preview';
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const generationConfig = {
    maxOutputTokens,
    thinkingConfig: { thinkingBudget: THINKING_BUDGETS[thinkingLevel] || THINKING_BUDGETS.medium },
  };
  if (responseJson) generationConfig.responseMimeType = 'application/json';

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  return await callWithRetry(url, body);
}

/**
 * Call Gemini with multimodal input (text + image).
 */
async function callVision({ parts, systemInstruction, thinkingLevel = 'low', maxOutputTokens = 4096 }) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_TEXT_MODEL || 'gemini-3-flash-preview';
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const body = {
    contents: [{ parts }],
    generationConfig: {
      maxOutputTokens,
      thinkingConfig: { thinkingBudget: THINKING_BUDGETS[thinkingLevel] || THINKING_BUDGETS.low },
    },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  return await callWithRetry(url, body);
}

/**
 * Generate an image using Gemini image model.
 */
async function generateImage(prompt) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_IMAGE_MODEL || 'nano-banana-pro-preview';
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  };

  const res = await fetchWithTimeout(url, body);
  const data = await res.json();
  
  if (data.error) throw new Error(`Image gen: ${data.error.message}`);
  
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData);
  if (!imagePart) throw new Error('No image returned from model');

  return {
    buffer: Buffer.from(imagePart.inlineData.data, 'base64'),
    mimeType: imagePart.inlineData.mimeType || 'image/jpeg',
    textResponse: parts.find(p => p.text)?.text || null,
  };
}

/**
 * Core fetch with retry logic.
 */
async function callWithRetry(url, body) {
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, body);

      if (res.status === 429 || res.status === 503) {
        lastError = new Error(`Gemini ${res.status}`);
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini ${res.status}: ${errText.substring(0, 200)}`);
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      if (!candidate?.content?.parts) throw new Error('Empty response');

      const textParts = candidate.content.parts.filter(p => p.text !== undefined && !p.thought);
      let text = textParts.map(p => p.text).join('');
      text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      return text;
    } catch (err) {
      lastError = err;
      const retryable = err.name === 'AbortError' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT';
      if (retryable && attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

async function fetchWithTimeout(url, body) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export { callText, callVision, generateImage };
