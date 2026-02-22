/**
 * Model Recommender — Takes audit results and returns ranked model recommendations
 * ShotPilot v2
 */
import { getActiveModels, getModelById } from './modelRegistry.js';

const ISSUE_MODEL_MAP = [
  {
    patterns: ['waxy', 'plastic', 'ai plastic', 'sheen', 'hdr glow', 'over-processed'],
    models: ['seedream_4_5', 'gpt_image_1_5', 'ideogram'],
    strategy: 'regenerate',
    reasoning: 'Waxy/plastic skin and AI sheen are baked into the original — editing rarely fixes these. Regenerate with a model that handles natural skin texture.',
  },
  {
    patterns: ['style mismatch', 'style inconsisten', 'wrong aesthetic', 'doesn\'t match'],
    models: ['flux_kontext', 'flux_2', 'grok_imagine'],
    strategy: 'edit',
    reasoning: 'Style transfer works well here — Flux Kontext excels at applying a target style to existing content without regenerating from scratch.',
  },
  {
    patterns: ['flat', 'lifeless', 'no depth', 'two-dimensional', 'unengaging'],
    models: ['flux_2', 'seedream_4_5', 'kling_o1_image'],
    strategy: 'regenerate',
    reasoning: 'Flat/lifeless images need fundamental lighting and depth changes that editing can\'t fix. Regenerate with stronger lighting direction.',
  },
  {
    patterns: ['environment', 'background', 'setting', 'landscape'],
    models: ['flux_2', 'seedream_4_5', 'recraft_v4'],
    strategy: 'regenerate',
    reasoning: 'Flux 2 excels at environments with realistic depth and atmosphere.',
  },
  {
    patterns: ['character consisten', 'identity', 'face', 'facial'],
    models: ['ideogram', 'flux_kontext', 'gpt_image_1_5'],
    strategy: 'edit',
    reasoning: 'Character consistency is best handled by models with reference/consistency features. Edit with the original as reference.',
  },
  {
    patterns: ['typography', 'text render', 'lettering', 'signage'],
    models: ['ideogram', 'recraft_v4', 'gpt_image_1_5'],
    strategy: 'regenerate',
    reasoning: 'Text rendering is a generation-time capability — these models handle it natively.',
  },
  {
    patterns: ['lighting drift', 'shadow direction', 'inconsistent light', 'unmotivated'],
    models: ['seedream_4_5', 'flux_2', 'gpt_image_1_5'],
    strategy: 'regenerate',
    reasoning: 'Lighting issues are structural — regenerate with explicit lighting direction in prompt.',
  },
  {
    patterns: ['cgi', 'game engine', 'render', 'glossy'],
    models: ['seedream_4_5', 'gpt_image_1_5', 'flux_2'],
    strategy: 'regenerate',
    reasoning: 'CGI/render look needs a model with strong photorealistic defaults. Add film grain and lens imperfection language.',
  },
];

/**
 * recommendFix — Main recommendation engine
 * @param {Object} auditResult - Output from imageAudit (must have issues[], realism_diagnosis[], overall_score)
 * @param {Object} [projectStyle] - Optional project style context
 * @returns {{ topRecommendation, alternatives, strategy, reasoning }}
 */
export function recommendFix(auditResult, projectStyle) {
  const issues = auditResult?.issues || [];
  const diagnosis = auditResult?.realism_diagnosis || [];
  const score = auditResult?.overall_score ?? 50;

  // Combine all issue text for matching
  const issueText = [
    ...issues,
    ...diagnosis.map(d => `${d.pattern} ${d.details || ''}`),
  ].join(' ').toLowerCase();

  // Score each active image model
  const candidates = getActiveModels()
    .filter(m => m.type === 'image')
    .map(model => {
      let matchScore = 0;
      let bestStrategy = score >= 70 ? 'edit' : 'regenerate';
      let bestReasoning = '';

      for (const rule of ISSUE_MODEL_MAP) {
        const matched = rule.patterns.some(p => issueText.includes(p));
        if (matched) {
          const idx = rule.models.indexOf(model.id);
          if (idx !== -1) {
            matchScore += (rule.models.length - idx) * 3; // Higher rank = higher score
            if (!bestReasoning) {
              bestStrategy = rule.strategy;
              bestReasoning = rule.reasoning;
            }
          }
        }
      }

      // Bonus for models with edit capability when strategy is edit
      if (bestStrategy === 'edit' && (model.editEndpoint || model.capabilities.includes('edit'))) {
        matchScore += 2;
      }

      return { model, matchScore, strategy: bestStrategy, reasoning: bestReasoning };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  // If nothing matched, default to Flux 2 for regenerate or edit
  if (candidates[0]?.matchScore === 0) {
    const flux2 = getModelById('flux_2');
    return {
      topRecommendation: {
        model: flux2.id,
        modelName: flux2.name,
        strategy: score >= 70 ? 'edit' : 'regenerate',
        reasoning: 'No specific issues matched — Flux 2 is a strong general-purpose default.',
      },
      alternatives: candidates.slice(1, 4).map(c => ({
        model: c.model.id,
        modelName: c.model.name,
        strategy: c.strategy,
      })),
      strategy: score >= 70 ? 'edit' : 'regenerate',
      reasoning: 'No specific issues matched — Flux 2 is a strong general-purpose default.',
    };
  }

  const top = candidates[0];
  return {
    topRecommendation: {
      model: top.model.id,
      modelName: top.model.name,
      strategy: top.strategy,
      reasoning: top.reasoning,
    },
    alternatives: candidates.slice(1, 4).map(c => ({
      model: c.model.id,
      modelName: c.model.name,
      strategy: c.strategy,
    })),
    strategy: top.strategy,
    reasoning: top.reasoning,
  };
}
