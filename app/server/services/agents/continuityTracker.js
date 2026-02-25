import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from '../ai/shared.js';
import { db } from '../../database.js';
import { queryKB } from '../../rag/query-simple.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_DIR = path.resolve(__dirname, '../../../../kb/condensed');

// Ensure continuity tables exist
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_bibles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      character_name TEXT NOT NULL,
      bible_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, character_name)
    );
    
    CREATE TABLE IF NOT EXISTS continuity_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      shot_id INTEGER,
      scene_id INTEGER,
      result_json TEXT NOT NULL,
      recommendation TEXT,
      continuity_score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS approved_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      shot_id INTEGER,
      image_url TEXT NOT NULL,
      description TEXT,
      approved_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (err) {
  console.warn('[continuity] Table creation warning:', err.message);
}

// Persistence helpers
function saveCharacterBible(projectId, characterName, bible) {
  const stmt = db.prepare(`
    INSERT INTO character_bibles (project_id, character_name, bible_json, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(project_id, character_name) DO UPDATE SET
      bible_json = excluded.bible_json,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(projectId, characterName, JSON.stringify(bible));
}

function getCharacterBible(projectId, characterName) {
  const row = db.prepare('SELECT bible_json FROM character_bibles WHERE project_id = ? AND character_name = ?').get(projectId, characterName);
  return row ? JSON.parse(row.bible_json) : null;
}

function getAllCharacterBibles(projectId) {
  const rows = db.prepare('SELECT character_name, bible_json FROM character_bibles WHERE project_id = ?').all(projectId);
  return rows.map(r => ({ name: r.character_name, bible: JSON.parse(r.bible_json) }));
}

function saveContinuityCheck(projectId, shotId, sceneId, result) {
  db.prepare(`
    INSERT INTO continuity_checks (project_id, shot_id, scene_id, result_json, recommendation, continuity_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(projectId, shotId, sceneId, JSON.stringify(result), result.recommendation, result.continuity_score);
}

function getContinuityHistory(projectId, limit = 20) {
  return db.prepare(`
    SELECT * FROM continuity_checks WHERE project_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(projectId, limit).map(r => ({ ...r, result: JSON.parse(r.result_json) }));
}

function saveApprovedReference(projectId, shotId, imageUrl, description) {
  db.prepare(`
    INSERT INTO approved_references (project_id, shot_id, image_url, description)
    VALUES (?, ?, ?, ?)
  `).run(projectId, shotId, imageUrl, description);
}

function getApprovedReferences(projectId, limit = 10) {
  return db.prepare(`
    SELECT * FROM approved_references WHERE project_id = ? ORDER BY approved_at DESC LIMIT ?
  `).all(projectId, limit);
}

// KB knowledge — tries RAG first, falls back to hardcoded files
function getContinuityKnowledge() {
  try {
    const realismChunks = queryKB('realism principles photographic quality', { category: 'principles' }, 5);
    const consistencyChunks = queryKB('character consistency appearance tracking continuity', {}, 5);

    if (realismChunks.length > 0 || consistencyChunks.length > 0) {
      console.log(`[continuity] RAG loaded: ${realismChunks.length} realism, ${consistencyChunks.length} consistency chunks`);
      return {
        realismPrinciples: realismChunks.map(c => c.text).join('\n\n') || 'Standard photographic realism criteria.',
        characterConsistency: consistencyChunks.map(c => c.text).join('\n\n') || 'Standard character consistency tracking.',
      };
    }
  } catch (err) {
    console.warn('[continuity] RAG query failed, falling back:', err.message);
  }

  try {
    return {
      realismPrinciples: fs.readFileSync(path.join(KB_DIR, '01_Core_Realism_Principles.md'), 'utf-8'),
      characterConsistency: fs.readFileSync(path.join(KB_DIR, '03_Pack_Character_Consistency.md'), 'utf-8'),
    };
  } catch {
    return {
      realismPrinciples: 'Evaluate photographic realism across all continuity dimensions.',
      characterConsistency: 'Track face, body, costume, colors, and distinguishing features across shots.',
    };
  }
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

  const parsed = JSON.parse(result);
  
  // Persist the check result if we have context IDs
  if (shotContext?.projectId || shotContext?.project_id) {
    try {
      saveContinuityCheck(
        shotContext.projectId || shotContext.project_id,
        shotContext.shotId || shotContext.shot_id || null,
        shotContext.sceneId || shotContext.scene_id || null,
        parsed
      );
    } catch (err) {
      console.warn('[continuity] Failed to persist check:', err.message);
    }
  }

  return parsed;
}

/**
 * Build a character bible from multiple reference images.
 * @param {Array<string>} characterImages - Array of base64-encoded images
 * @param {string} characterName - Name of the character
 * @returns {object} Structured character profile
 */
async function buildCharacterBible(characterImages = [], characterName = 'Unknown', projectId = null) {
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

  const parsed = JSON.parse(result);
  
  // Persist the character bible
  if (projectId) {
    try {
      saveCharacterBible(projectId, characterName, parsed);
      console.log(`[continuity] Persisted character bible: ${characterName} for project ${projectId}`);
    } catch (err) {
      console.warn('[continuity] Failed to persist character bible:', err.message);
    }
  }

  return parsed;
}

export {
  checkContinuity,
  buildCharacterBible,
  // Persistence exports
  saveCharacterBible,
  getCharacterBible,
  getAllCharacterBibles,
  saveContinuityCheck,
  getContinuityHistory,
  saveApprovedReference,
  getApprovedReferences,
};
