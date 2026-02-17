/**
 * geminiService.js — Barrel re-export file.
 *
 * All AI functions have been split into domain-specific modules under ./ai/:
 *   - ai/shared.js           — buildContextBlock, buildImageParts, callGemini
 *   - ai/readiness.js        — analyzeReadiness, generateRecommendations
 *   - ai/promptGeneration.js — generatePrompt, refinePromptFromAudit
 *   - ai/suggestions.js      — generateAestheticSuggestions, generateCharacterSuggestions, generateObjectSuggestions
 *   - ai/shotPlanning.js     — generateShotPlan, readinessDialogue
 *   - ai/scriptAnalysis.js   — analyzeScript
 *   - ai/creativeDirector.js — creativeDirectorCollaborate, summarizeConversation, refineContent
 *   - ai/imageAudit.js       — holisticImageAudit, analyzeEntityImage
 *
 * This file re-exports everything so existing imports continue to work unchanged.
 */

export { buildContextBlock } from './ai/shared.js';
export { analyzeReadiness, generateRecommendations } from './ai/readiness.js';
export { generatePrompt, refinePromptFromAudit } from './ai/promptGeneration.js';
export { generateAestheticSuggestions, generateCharacterSuggestions, generateObjectSuggestions, generateTurnaroundPrompt } from './ai/suggestions.js';
export { generateShotPlan, readinessDialogue } from './ai/shotPlanning.js';
export { analyzeScript } from './ai/scriptAnalysis.js';
export { refineContent, creativeDirectorCollaborate, summarizeConversation } from './ai/creativeDirector.js';
export { holisticImageAudit, analyzeEntityImage } from './ai/imageAudit.js';
