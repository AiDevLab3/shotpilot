import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGemini } from '../ai/shared.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_DIR = path.resolve(__dirname, '../../../../kb/condensed');

// Lazy-load QA knowledge
let _qaKB = null;
function getQAKnowledge() {
  if (!_qaKB) {
    _qaKB = {
      realismPrinciples: fs.readFileSync(path.join(KB_DIR, '01_Core_Realism_Principles.md'), 'utf-8'),
      qualityControlPack: fs.readFileSync(path.join(KB_DIR, '03_Pack_Quality_Control.md'), 'utf-8'),
      imageQCPack: fs.readFileSync(path.join(KB_DIR, '03_Pack_Image_Quality_Control.md'), 'utf-8'),
    };
  }
  return _qaKB;
}

function buildQASystemPrompt() {
  const { realismPrinciples, qualityControlPack, imageQCPack } = getQAKnowledge();
  return `You are the Quality Gate Agent for a cinematic production pipeline.

## Your Knowledge Base

### Realism Principles
${realismPrinciples}

### Quality Control Standards
${qualityControlPack}

### Image Quality Control
${imageQCPack}

## Your Task
Analyze the provided image against the shot intent and style profile.
Score each dimension 1-10 and provide actionable guidance.

## Output Format
Respond with ONLY valid JSON:
{
  "realism": { "score": 1-10, "notes": "..." },
  "style_match": { "score": 1-10, "notes": "..." },
  "ai_artifacts": { "score": 1-10, "notes": "... (10 = no artifacts)" },
  "video_readiness": { "score": 1-10, "notes": "..." },
  "reference_suitability": { "score": 1-10, "notes": "..." },
  "overall_score": 1-10,
  "recommendation": "approve | iterate | reject",
  "iteration_guidance": "Specific instructions for improvement if not approved"
}`;
}

/**
 * Audit a generated image against intent and style.
 */
async function auditImage(imageBase64, shotContext, styleProfile) {
  const parts = [];

  // Add image
  parts.push({
    inlineData: {
      mimeType: 'image/png',
      data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
    },
  });

  parts.push({
    text: `## Shot Context\n${typeof shotContext === 'string' ? shotContext : JSON.stringify(shotContext, null, 2)}\n\n## Style Profile\n${JSON.stringify(styleProfile, null, 2)}\n\nAnalyze this image against the shot intent and style profile.`,
  });

  const result = await callGemini({
    parts,
    systemInstruction: buildQASystemPrompt(),
    thinkingLevel: 'medium',
    responseMimeType: 'application/json',
    maxOutputTokens: 4096,
  });

  return JSON.parse(result);
}

/**
 * Pre-screen a reference image for pipeline suitability.
 */
async function screenReference(imageBase64) {
  const parts = [];

  parts.push({
    inlineData: {
      mimeType: 'image/png',
      data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
    },
  });

  parts.push({
    text: 'Evaluate this reference image for use in a cinematic production pipeline. Is it suitable as a style/character/environment reference?',
  });

  const { realismPrinciples } = getQAKnowledge();

  const screenPrompt = `You are the Quality Gate Agent for a cinematic production pipeline targeting PHOTOGRAPHIC REALISM (8.5+/10).

## Critical Context
This reference image will be fed INTO AI image/video generation models as a style, character, or object reference. If the reference itself looks CGI, synthetic, or has an "AI sheen," the downstream generations will INHERIT and AMPLIFY those flaws. No amount of prompting can fix a bad reference — the CGI look bakes into the DNA of every downstream image.

## Your Knowledge Base
${realismPrinciples}

## Scoring Criteria (BE HARSH — a bad ref poisons everything downstream)

### Photographic Realism (NOT artistic quality)
- Does this look like it was PHOTOGRAPHED with a real camera, or does it look GENERATED/RENDERED?
- Check: skin texture (pores, imperfections vs. smooth/waxy), fabric texture (real thread vs. painted-on), metal/material surfaces (real reflections vs. uniform shaders)
- Check: lighting (motivated and physically accurate vs. uniform ambient "studio glow")
- Check: depth of field (natural lens behavior vs. everything in focus)
- Check: color (natural color variance vs. oversaturated/uniform CGI palette)
- Check: entropy/imperfection (real objects have wear, dirt, asymmetry — CGI is too clean/perfect)

### AI Artifact Detection
- Anatomical errors (hands, fingers, joints, teeth)
- Text/logo garbling
- Impossible geometry or physics
- Repeating patterns or texture smearing
- "Plastic" skin, hair, or fabric
- Uniform lighting that doesn't match the scene

### Downstream Viability Score Guide
- 9-10: Looks photographed. Safe to use as primary reference. Downstream models will maintain realism.
- 7-8: Minor synthetic tells but usable. May need prompt compensation downstream.
- 5-6: Noticeable CGI/AI look. Will contaminate downstream realism. Use as concept/mood ref ONLY, not as image-to-image input.
- 3-4: Obvious AI generation. Will poison downstream pipeline. REJECT for any reference use.
- 1-2: Severe artifacts. Unusable.

## Output Format
Respond with ONLY valid JSON:
{
  "suitable": true/false,
  "quality_score": 1-10,
  "downstream_risk": "low | medium | high | critical",
  "best_use": "primary_ref | style_ref_only | concept_mood_only | unusable",
  "realism_breakdown": {
    "skin_texture": 1-10,
    "fabric_materials": 1-10,
    "lighting_physics": 1-10,
    "color_naturalism": 1-10,
    "entropy_imperfection": 1-10,
    "overall_photographic": 1-10
  },
  "ai_tells": ["specific artifacts found"],
  "warnings": ["pipeline contamination risks"],
  "recommendation": "What to do — regenerate, photobash, use as-is, or use only for mood/concept",
  "notes": "brief honest assessment"
}`;

  const result = await callGemini({
    parts,
    systemInstruction: screenPrompt,
    thinkingLevel: 'low',
    responseMimeType: 'application/json',
    maxOutputTokens: 2048,
  });

  return JSON.parse(result);
}

export { auditImage, screenReference };
