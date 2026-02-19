import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from '../ai/shared.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_DIR = path.resolve(__dirname, '../../../../kb/condensed');

// Lazy-load KB knowledge
let _continuityKB = null;
function getContinuityKnowledge() {
  if (!_continuityKB) {
    _continuityKB = {
      realismPrinciples: fs.readFileSync(path.join(KB_DIR, '01_Core_Realism_Principles.md'), 'utf-8'),
      characterConsistency: fs.readFileSync(path.join(KB_DIR, '03_Pack_Character_Consistency.md'), 'utf-8'),
    };
  }
  return _continuityKB;
}

function buildContinuitySystemPrompt(styleProfile) {
  const { realismPrinciples, characterConsistency } = getContinuityKnowledge();
  return `You are the Continuity Tracker Agent for a cinematic production pipeline.

## Your Role
Track and enforce visual consistency across all shots in a project. Compare new images against previously approved shots to catch drift in character appearance, color grade, environment details, lighting, and object consistency.

## Knowledge Base

### Realism Principles
${realismPrinciples}

### Character Consistency Techniques
${characterConsistency}

${styleProfile ? `### Project Style Profile\n${JSON.stringify(styleProfile, null, 2)}` : ''}

## Evaluation Criteria
1. **Character Consistency** — Face, body type, costume, gear, hair, distinguishing features must match across shots
2. **Color Grade Consistency** — The established palette (e.g. teal-amber) must be maintained; detect warmth/coolness drift
3. **Environment Consistency** — Architectural details, vehicle appearance, props must remain stable
4. **Object Consistency** — Key objects (vehicles, tools, equipment) must look the same across shots
5. **Lighting Style Consistency** — Motivated practicals, shadow depth, crushed blacks, highlight behavior

## Output
Always respond with ONLY valid JSON matching the requested schema.`;
}

/**
 * Check continuity of a new image against previously approved shots.
 * @param {string} newImageBase64 - Base64-encoded new image
 * @param {string} shotContext - Description of what this shot should depict
 * @param {Array<{shotId: string, imageBase64: string, description: string}>} approvedShots
 * @param {object} [styleProfile] - Optional project style profile
 * @returns {object} Continuity report
 */
async function checkContinuity(newImageBase64, shotContext, approvedShots = [], styleProfile = null) {
  const parts = [];
  let imageNum = 1;

  // Add up to 4 most recent approved shots as reference
  const referenceShotsList = approvedShots.slice(-4);

  for (const shot of referenceShotsList) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: shot.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
    parts.push({
      text: `↑ Image ${imageNum} — Approved shot "${shot.shotId}": ${shot.description || 'No description'}`,
    });
    imageNum++;
  }

  // Add the new image to evaluate
  parts.push({
    inlineData: {
      mimeType: 'image/jpeg',
      data: newImageBase64.replace(/^data:image\/\w+;base64,/, ''),
    },
  });
  parts.push({
    text: `↑ Image ${imageNum} — NEW image to evaluate for continuity`,
  });

  // Build the analysis prompt
  const approvedList = referenceShotsList.length > 0
    ? referenceShotsList.map((s, i) => `  - Image ${i + 1}: "${s.shotId}" — ${s.description || 'N/A'}`).join('\n')
    : '  (No approved shots provided — evaluate standalone quality)';

  parts.push({
    text: `## Continuity Check Request

**New shot context:** ${shotContext}

**Approved reference shots:**
${approvedList}

Compare the NEW image (Image ${imageNum}) against the approved reference shots. Evaluate consistency across all dimensions.

${referenceShotsList.length === 0 ? 'Since no approved shots are provided, evaluate the image for internal consistency and style adherence only. Score generously for consistency dimensions.' : ''}

Respond with ONLY valid JSON:
{
  "continuity_score": <1-10 overall>,
  "character_consistency": { "score": <1-10>, "issues": [] },
  "color_grade_consistency": { "score": <1-10>, "drift_direction": "warmer|cooler|none", "issues": [] },
  "environment_consistency": { "score": <1-10>, "issues": [] },
  "object_consistency": { "score": <1-10>, "issues": [] },
  "recommendation": "approve|flag|reject",
  "flags": ["specific continuity breaks if any"],
  "notes": "overall assessment"
}

Recommendation thresholds:
- approve: continuity_score >= 7, no critical flags
- flag: continuity_score 4-6, or minor issues that could be acceptable
- reject: continuity_score < 4, or critical continuity breaks`,
  });

  const result = await callGemini({
    parts,
    systemInstruction: buildContinuitySystemPrompt(styleProfile),
    thinkingLevel: 'medium',
    responseMimeType: 'application/json',
    maxOutputTokens: 4096,
  });

  return JSON.parse(result);
}

/**
 * Build a character bible from multiple reference images.
 * @param {Array<string>} characterImages - Array of base64-encoded images
 * @param {string} characterName - Name of the character
 * @returns {object} Structured character profile
 */
async function buildCharacterBible(characterImages = [], characterName = 'Unknown') {
  const parts = [];

  for (let i = 0; i < characterImages.length; i++) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: characterImages[i].replace(/^data:image\/\w+;base64,/, ''),
      },
    });
    parts.push({
      text: `↑ Image ${i + 1} — Reference image of "${characterName}"`,
    });
  }

  parts.push({
    text: `## Character Bible Request

Analyze all provided images of "${characterName}" and build a comprehensive character profile for continuity tracking.

Respond with ONLY valid JSON:
{
  "character_name": "${characterName}",
  "facial_features": {
    "face_shape": "",
    "skin_tone": "",
    "eye_details": "",
    "hair": "",
    "facial_hair": "",
    "distinguishing_marks": [],
    "estimated_age_range": ""
  },
  "body_type": {
    "build": "",
    "height_impression": "",
    "posture": ""
  },
  "costume": {
    "primary_outfit": "",
    "colors": [],
    "materials": [],
    "accessories": [],
    "footwear": ""
  },
  "color_palette": {
    "dominant_colors": [],
    "accent_colors": [],
    "overall_tone": ""
  },
  "distinguishing_features": ["unique identifiers that must be consistent"],
  "continuity_notes": "key things to watch for when checking this character across shots"
}`,
  });

  const result = await callGemini({
    parts,
    systemInstruction: buildContinuitySystemPrompt(null),
    thinkingLevel: 'medium',
    responseMimeType: 'application/json',
    maxOutputTokens: 4096,
  });

  return JSON.parse(result);
}

export { checkContinuity, buildCharacterBible };
