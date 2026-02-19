/**
 * OpenAI Image Generation client — GPT Image models.
 * 
 * Uses the Images API: POST /v1/images/generations
 * Supports gpt-image-1.5 (best quality) and gpt-image-1.
 */
import fetch from 'node-fetch';

const TIMEOUT_MS = 120000;
const MAX_RETRIES = 2;
const RETRY_DELAYS = [2000, 5000];

const OPENAI_MODELS = {
  'gpt-image-1': {
    id: 'gpt-image-1',
    displayName: 'GPT Image 1',
    sizes: ['1024x1024', '1536x1024', '1024x1536', 'auto'],
    qualities: ['low', 'medium', 'high', 'auto'],
  },
  'gpt-image-1.5': {
    id: 'gpt-image-1.5',
    displayName: 'GPT Image 1.5',
    sizes: ['1024x1024', '1536x1024', '1024x1536', 'auto'],
    qualities: ['low', 'medium', 'high', 'auto'],
  },
};

function getApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');
  return key;
}

/**
 * Generate an image using OpenAI's GPT Image models.
 * 
 * @param {string} prompt - The generation prompt
 * @param {object} options
 * @param {string} options.model - 'gpt-image-1' or 'gpt-image-1.5' (default: 'gpt-image-1.5')
 * @param {string} options.size - Image size (default: '1536x1024' for landscape)
 * @param {string} options.quality - 'low'|'medium'|'high'|'auto' (default: 'high')
 * @param {string} options.output_format - 'png'|'jpeg'|'webp' (default: 'png')
 * @returns {{ buffer: Buffer, mimeType: string, revisedPrompt: string|null }}
 */
async function generateOpenAI(prompt, options = {}) {
  const apiKey = getApiKey();
  const model = options.model || 'gpt-image-1.5';
  const size = options.size || '1536x1024';
  const quality = options.quality || 'high';

  const body = {
    model,
    prompt,
    n: 1,
    size,
    quality,
  };

  const url = 'https://api.openai.com/v1/images/generations';

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (res.status === 429 || res.status === 503) {
          lastError = new Error(`OpenAI ${res.status}`);
          if (attempt < MAX_RETRIES) { await sleep(RETRY_DELAYS[attempt]); continue; }
          throw lastError;
        }

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`OpenAI ${res.status}: ${errText.substring(0, 300)}`);
        }

        const data = await res.json();
        const imageData = data.data?.[0];
        if (!imageData) throw new Error('No image returned from OpenAI');

        // GPT Image models return b64_json by default
        if (imageData.b64_json) {
          return {
            buffer: Buffer.from(imageData.b64_json, 'base64'),
            mimeType: 'image/png',
            revisedPrompt: imageData.revised_prompt || null,
            textResponse: imageData.revised_prompt || null,
          };
        }

        // If URL is returned, download it
        if (imageData.url) {
          const imgRes = await fetch(imageData.url);
          if (!imgRes.ok) throw new Error(`Failed to download OpenAI image: ${imgRes.status}`);
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          return {
            buffer,
            mimeType: 'image/png',
            revisedPrompt: imageData.revised_prompt || null,
            textResponse: imageData.revised_prompt || null,
          };
        }

        throw new Error('OpenAI returned neither b64_json nor url');
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError' && attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }
      if (attempt === MAX_RETRIES) throw err;
    }
  }
  throw lastError;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export { generateOpenAI, OPENAI_MODELS };
