/**
 * Multi-Auditor System — scores images using multiple LLM judges for consensus.
 * 
 * Auditors: Gemini Flash, Gemini Pro, GPT-4o
 * Each uses identical scoring criteria for fair comparison.
 */
import fetch from 'node-fetch';

const TIMEOUT_MS = 120000;

// ── Shared Audit Prompt ──────────────────────────────────────────────

function buildAuditPrompt(brief) {
  return `You are an expert cinematography judge evaluating an AI-generated image.

BRIEF: "${brief}"

Score this image on these criteria:
1. **overall_score** (0-100): Overall quality and brief match
2. **composition** (0-10): Framing, rule of thirds, visual balance, depth
3. **lighting** (0-10): Light sources, shadows, contrast, atmosphere
4. **color** (0-10): Palette, harmony, grading, temperature
5. **realism** (0-10): Physical plausibility, texture detail, no artifacts
6. **mood** (0-10): Emotional tone, atmosphere, matches intended feeling
7. **brief_adherence** (0-10): Does the image match what was asked for? Every element accounted for?

Also provide:
- **strengths**: array of 2-3 things done well
- **weaknesses**: array of 2-3 issues
- **summary**: 1-2 sentence assessment

Respond with ONLY valid JSON:
{
  "overall_score": <0-100>,
  "dimensions": {
    "composition": <0-10>,
    "lighting": <0-10>,
    "color": <0-10>,
    "realism": <0-10>,
    "mood": <0-10>,
    "brief_adherence": <0-10>
  },
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "summary": "..."
}`;
}

// ── Gemini Auditor ───────────────────────────────────────────────────

async function auditWithGemini(imageBase64, mimeType, brief, model) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const prompt = buildAuditPrompt(brief);

  const body = {
    contents: [{
      parts: [
        { inlineData: { mimeType: mimeType || 'image/png', data: imageBase64 } },
        { text: prompt }
      ]
    }],
    generationConfig: {
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 1024 },
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini ${model} ${res.status}: ${errText.substring(0, 200)}`);
    }
    const data = await res.json();
    const textParts = (data.candidates?.[0]?.content?.parts || []).filter(p => p.text && !p.thought);
    let text = textParts.map(p => p.text).join('');
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    return parseAuditJSON(text);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── GPT Auditor ──────────────────────────────────────────────────────

async function auditWithGPT(imageBase64, mimeType, brief) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');

  const prompt = buildAuditPrompt(brief);
  const dataUrl = `data:${mimeType || 'image/png'};base64,${imageBase64}`;

  const body = {
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: dataUrl } }
      ]
    }],
    max_tokens: 2048,
    temperature: 0.3,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      // Try fallback model
      if (res.status === 404 || errText.includes('model_not_found')) {
        body.model = 'gpt-4o-mini';
        const res2 = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify(body),
        });
        if (!res2.ok) throw new Error(`GPT fallback ${res2.status}: ${(await res2.text()).substring(0, 200)}`);
        const data2 = await res2.json();
        return parseAuditJSON(data2.choices?.[0]?.message?.content || '');
      }
      throw new Error(`GPT ${res.status}: ${errText.substring(0, 200)}`);
    }
    const data = await res.json();
    return parseAuditJSON(data.choices?.[0]?.message?.content || '');
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── JSON Parser ──────────────────────────────────────────────────────

function parseAuditJSON(text) {
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  try {
    return normalizeScores(JSON.parse(text));
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return normalizeScores(JSON.parse(match[0]));
    throw new Error('Could not parse audit JSON');
  }
}

function normalizeScores(parsed) {
  return {
    overall_score: Math.min(100, Math.max(0, parsed.overall_score || 0)),
    dimensions: {
      composition: clamp10(parsed.dimensions?.composition),
      lighting: clamp10(parsed.dimensions?.lighting),
      color: clamp10(parsed.dimensions?.color),
      realism: clamp10(parsed.dimensions?.realism),
      mood: clamp10(parsed.dimensions?.mood),
      brief_adherence: clamp10(parsed.dimensions?.brief_adherence),
    },
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    summary: parsed.summary || '',
  };
}

function clamp10(v) { return Math.min(10, Math.max(0, Number(v) || 0)); }

// ── Auditor Registry ─────────────────────────────────────────────────

const AUDITORS = {
  gemini_flash: {
    name: 'Gemini 3 Flash',
    fn: (img, mime, brief) => auditWithGemini(img, mime, brief, 'gemini-3-flash-preview'),
  },
  gemini_pro: {
    name: 'Gemini 3 Pro',
    fn: (img, mime, brief) => auditWithGemini(img, mime, brief, 'gemini-3-pro-preview'),
  },
  gpt: {
    name: 'GPT-4o',
    fn: (img, mime, brief) => auditWithGPT(img, mime, brief),
  },
};

// ── Multi-Audit ──────────────────────────────────────────────────────

async function multiAudit(imageBase64, mimeType, brief, auditorKeys) {
  const keys = auditorKeys || Object.keys(AUDITORS);
  const results = {};
  const errors = {};

  await Promise.all(keys.map(async (key) => {
    const auditor = AUDITORS[key];
    if (!auditor) { errors[key] = 'Unknown auditor'; return; }
    try {
      results[key] = await auditor.fn(imageBase64, mimeType, brief);
    } catch (err) {
      errors[key] = err.message;
    }
  }));

  // Consensus
  const scores = Object.values(results).map(r => r.overall_score);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const spread = scores.length > 1 ? Math.max(...scores) - Math.min(...scores) : 0;

  let agreement_level;
  if (spread <= 10) agreement_level = 'strong';
  else if (spread <= 20) agreement_level = 'moderate';
  else agreement_level = 'weak';

  const divergence_notes = [];
  if (spread > 15) {
    const highest = Object.entries(results).sort((a, b) => b[1].overall_score - a[1].overall_score);
    divergence_notes.push(`Highest: ${highest[0][0]} (${highest[0][1].overall_score}), Lowest: ${highest[highest.length - 1][0]} (${highest[highest.length - 1][1].overall_score})`);
  }

  // Dimension averages
  const dimKeys = ['composition', 'lighting', 'color', 'realism', 'mood', 'brief_adherence'];
  const dim_averages = {};
  for (const dk of dimKeys) {
    const vals = Object.values(results).map(r => r.dimensions?.[dk]).filter(v => v != null);
    dim_averages[dk] = vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
  }

  return {
    results,
    errors: Object.keys(errors).length ? errors : undefined,
    consensus: {
      avg_score: +avg.toFixed(1),
      agreement_level,
      spread,
      divergence_notes,
      dim_averages,
    },
  };
}

/**
 * Peer audit — runs ALL available auditors.
 */
async function peerAudit(imageBase64, mimeType, brief) {
  return multiAudit(imageBase64, mimeType, brief, Object.keys(AUDITORS));
}

export { multiAudit, peerAudit, AUDITORS };
