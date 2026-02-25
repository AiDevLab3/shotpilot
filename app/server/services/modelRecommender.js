/**
 * Model Recommender v2 — Smart routing with rich model profiles
 * Uses strengths, weaknesses, bestFor, worstFor + issue pattern matching
 * ShotPilot v2
 */
import { getActiveModels, getModelById, getActiveImageModels, getActiveVideoModels } from './modelRegistry.js';

// ═══════════════════════════════════════════════════════════════════
// ISSUE → MODEL ROUTING RULES
// Ordered by severity. Each rule maps detected issues to best models.
// ═══════════════════════════════════════════════════════════════════

const ISSUE_RULES = [
  // Realism failures
  {
    patterns: ['waxy', 'plastic', 'ai plastic', 'sheen', 'hdr glow', 'over-processed', 'airbrushed', 'synthetic skin'],
    models: ['seedream_4_5', 'gpt_image_1_5', 'nano_banana_pro', 'kling_o1_image'],
    strategy: 'regenerate',
    reasoning: 'Waxy/plastic skin and AI sheen are baked into the generation — editing rarely fixes these. Regenerate with a model that handles natural skin texture and filmic grain.',
    severity: 'high',
  },
  {
    patterns: ['cgi', 'game engine', 'render', 'unreal engine', 'glossy', 'too clean', 'too perfect'],
    models: ['seedream_4_5', 'gpt_image_1_5', 'flux_2', 'nano_banana_pro'],
    strategy: 'regenerate',
    reasoning: 'CGI/render look needs a model with strong photorealistic defaults. Add film grain, natural entropy, and motivated lighting to the prompt.',
    severity: 'high',
  },
  // Style issues
  {
    patterns: ['style mismatch', 'style inconsisten', 'wrong aesthetic', "doesn't match", 'different look'],
    models: ['flux_kontext', 'grok_imagine', 'flux_2'],
    strategy: 'edit',
    reasoning: 'Style transfer works well here — Flux Kontext excels at applying a target style to existing content without regenerating from scratch.',
    severity: 'medium',
  },
  // Lighting issues
  {
    patterns: ['flat', 'lifeless', 'no depth', 'two-dimensional', 'unengaging', 'boring composition'],
    models: ['flux_2', 'seedream_4_5', 'kling_o1_image'],
    strategy: 'regenerate',
    reasoning: 'Flat/lifeless images need fundamental lighting and depth changes that editing can\'t fix. Regenerate with stronger lighting direction and atmosphere.',
    severity: 'high',
  },
  {
    patterns: ['lighting drift', 'shadow direction', 'inconsistent light', 'unmotivated', 'no light source'],
    models: ['seedream_4_5', 'flux_2', 'gpt_image_1_5'],
    strategy: 'regenerate',
    reasoning: 'Lighting issues are structural — regenerate with explicit light source direction, color temperature, and motivated ratios in the prompt.',
    severity: 'medium',
  },
  // Character/identity issues
  {
    patterns: ['character consisten', 'identity', 'face', 'facial', 'doesn\'t look like', 'wrong person'],
    models: ['ideogram', 'flux_kontext', 'gpt_image_1_5', 'nano_banana_pro'],
    strategy: 'edit',
    reasoning: 'Character consistency is best handled by models with reference/consistency features. Edit with the original as reference to preserve identity.',
    severity: 'high',
  },
  // Typography
  {
    patterns: ['typography', 'text render', 'lettering', 'signage', 'text in image', 'garbled text'],
    models: ['ideogram', 'recraft_v4', 'gpt_image_1_5', 'qwen_image_max'],
    strategy: 'regenerate',
    reasoning: 'Text rendering is a generation-time capability — these models handle it natively with high accuracy.',
    severity: 'medium',
  },
  // Anatomy/physics
  {
    patterns: ['hand', 'finger', 'anatomy', 'body proportion', 'limb', 'extra finger', 'deformed'],
    models: ['gpt_image_1_5', 'seedream_4_5', 'nano_banana_pro', 'kling_image_v3'],
    strategy: 'regenerate',
    reasoning: 'Anatomy errors are baked into the generation. GPT Image 1.5 and Seedream have the strongest anatomical understanding.',
    severity: 'high',
  },
  // Composition
  {
    patterns: ['composition', 'framing', 'centered', 'symmetr', 'leading line', 'rule of third'],
    models: ['flux_2', 'gpt_image_1_5', 'seedream_4_5'],
    strategy: 'regenerate',
    reasoning: 'Composition is set at generation time. Specify exact framing, camera angle, and composition rules in the regeneration prompt.',
    severity: 'medium',
  },
  // Environments
  {
    patterns: ['environment', 'background', 'setting', 'landscape', 'architecture', 'interior'],
    models: ['flux_2', 'seedream_4_5', 'recraft_v4', 'kling_o1_image'],
    strategy: 'regenerate',
    reasoning: 'Flux 2 excels at environments with realistic depth, atmosphere, and architectural accuracy.',
    severity: 'low',
  },
  // Resolution/clarity
  {
    patterns: ['blurry', 'low resolution', 'soft', 'pixelated', 'noisy', 'artifacts'],
    models: ['topaz'],
    strategy: 'upscale',
    reasoning: 'Resolution and clarity issues are best fixed with upscaling rather than regeneration. Topaz preserves detail while increasing resolution.',
    severity: 'low',
  },
];

/**
 * Main recommendation engine
 * @param {Object} auditResult - From imageAudit (issues[], realism_diagnosis[], overall_score, dimensions)
 * @param {Object} [projectStyle] - Optional project style context
 * @param {Object} [brief] - Optional shot brief for adherence checking
 * @returns {{ topRecommendation, alternatives, strategy, reasoning, allScores }}
 */
export function recommendFix(auditResult, projectStyle, brief) {
  const issues = auditResult?.issues || [];
  const diagnosis = auditResult?.realism_diagnosis || [];
  const score = auditResult?.overall_score ?? 50;
  const dims = auditResult?.dimensions || {};

  // Combine all issue text for pattern matching
  const issueText = [
    ...issues,
    ...diagnosis.map(d => `${d.pattern} ${d.details || ''}`),
    auditResult?.summary || '',
    // Include dimension notes for deeper matching
    ...Object.values(dims).map(d => d?.notes || ''),
  ].join(' ').toLowerCase();

  // Score each active image model
  const candidates = getActiveImageModels().map(model => {
    let matchScore = 0;
    let bestStrategy = score >= 70 ? 'edit' : 'regenerate';
    let bestReasoning = '';
    let matchedRules = [];

    for (const rule of ISSUE_RULES) {
      const matched = rule.patterns.some(p => issueText.includes(p));
      if (matched) {
        const idx = rule.models.indexOf(model.id);
        if (idx !== -1) {
          // Higher rank = higher score, weighted by severity
          const severityWeight = rule.severity === 'high' ? 3 : rule.severity === 'medium' ? 2 : 1;
          matchScore += (rule.models.length - idx) * severityWeight;
          matchedRules.push(rule);
          if (!bestReasoning) {
            bestStrategy = rule.strategy === 'upscale' ? 'regenerate' : rule.strategy;
            bestReasoning = rule.reasoning;
          }
        }
      }
    }

    // Bonus: model has edit capability when strategy is edit
    if (bestStrategy === 'edit') {
      if (model.editEndpoint || model.img2imgEndpoint || model.capabilities?.includes('edit')) {
        matchScore += 3;
      } else {
        // Can't edit with this model — switch to regenerate
        bestStrategy = 'regenerate';
      }
    }

    // Bonus: model's bestFor matches project needs
    if (projectStyle) {
      const styleText = JSON.stringify(projectStyle).toLowerCase();
      const bestForMatches = (model.bestFor || []).filter(b => styleText.includes(b.toLowerCase().split(' ')[0]));
      matchScore += bestForMatches.length;
    }

    // Penalty: model's worstFor matches what we need
    const worstForHits = (model.worstFor || []).filter(w => issueText.includes(w.toLowerCase().split(' ')[0]));
    matchScore -= worstForHits.length * 2;

    return {
      model,
      matchScore,
      strategy: bestStrategy,
      reasoning: bestReasoning || `${model.name} is strong for ${(model.bestFor || model.strengths || []).slice(0, 2).join(' and ')}.`,
      matchedRules,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // Default to Flux 2 if nothing matched
  if (candidates.length === 0 || candidates[0].matchScore <= 0) {
    const flux2 = getModelById('flux_2');
    return {
      topRecommendation: {
        modelId: flux2.id,
        modelName: flux2.name,
        strategy: score >= 70 ? 'edit' : 'regenerate',
        reasoning: 'No specific issues matched — Flux 2 Flex is a strong general-purpose default for photorealistic content.',
      },
      alternatives: candidates.slice(1, 4).map(c => ({
        modelId: c.model.id,
        modelName: c.model.name,
        strategy: c.strategy,
        reasoning: c.reasoning,
      })),
      strategy: score >= 70 ? 'edit' : 'regenerate',
      reasoning: 'No specific issues matched — Flux 2 Flex is a strong general-purpose default.',
    };
  }

  const top = candidates[0];
  return {
    topRecommendation: {
      modelId: top.model.id,
      modelName: top.model.name,
      strategy: top.strategy,
      reasoning: top.reasoning,
    },
    alternatives: candidates.slice(1, 5).map(c => ({
      modelId: c.model.id,
      modelName: c.model.name,
      strategy: c.strategy,
      reasoning: c.reasoning,
    })),
    strategy: top.strategy,
    reasoning: top.reasoning,
    // Debug info
    allScores: candidates.slice(0, 8).map(c => ({
      model: c.model.id,
      score: c.matchScore,
      strategy: c.strategy,
    })),
  };
}

/**
 * Recommend a video model for animating a hero frame
 * @param {Object} heroFrameAnalysis - Analysis of the hero frame
 * @param {Object} motionSpec - Desired camera movement, duration, etc.
 * @returns {{ topRecommendation, alternatives }}
 */
export function recommendVideoModel(heroFrameAnalysis, motionSpec = {}) {
  const videoModels = getActiveVideoModels();
  const { cameraMove, duration, hasCharacters, hasDialogue, needsAudio } = motionSpec;

  const scored = videoModels.map(model => {
    let score = 0;
    const strengths = (model.strengths || []).join(' ').toLowerCase();

    // Duration matching
    if (duration && duration >= 10 && strengths.includes('long-form')) score += 3;
    
    // Camera movement
    if (cameraMove && strengths.includes('camera movement')) score += 3;
    
    // Character animation
    if (hasCharacters && strengths.includes('character')) score += 2;
    
    // Dialogue/lip-sync
    if (hasDialogue && strengths.includes('lip-sync')) score += 4;
    
    // Audio generation
    if (needsAudio && strengths.includes('audio')) score += 3;
    
    // Cinematic quality bonus
    if (strengths.includes('cinematic')) score += 1;

    return { model, score };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  return {
    topRecommendation: {
      modelId: top.model.id,
      modelName: top.model.name,
      reasoning: `${top.model.name} scores highest for your motion requirements.`,
    },
    alternatives: scored.slice(1, 4).map(s => ({
      modelId: s.model.id,
      modelName: s.model.name,
      reasoning: `Alternative: ${(s.model.strengths || []).slice(0, 2).join(', ')}`,
    })),
  };
}
