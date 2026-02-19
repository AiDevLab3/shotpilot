/**
 * Brief Analyzer — parses a creative brief (text string or object) and extracts
 * structured metadata for intelligent model routing.
 */

// ── Keyword dictionaries ─────────────────────────────────────────────

const VIDEO_KEYWORDS = [
  'video', 'animation', 'motion', 'moving', 'cinematic shot',
  'establishing shot', 'tracking shot', 'pan', 'dolly', 'slow-motion',
  'slow motion', 'timelapse', 'time-lapse', 'sequence', 'clip',
  '-second ', 'seconds', 'duration', 'fps', 'frame rate',
  'camera movement', 'zoom', 'orbit', 'flyover', 'fly-through',
];

const EDIT_KEYWORDS = [
  'edit', 'modify', 'change the', 'replace the', 'remove the', 'add to',
  'swap', 'transform', 'adjust', 'retouch', 'fix', 'alter',
  'reference photo', 'reference image', 'this photo', 'this image',
  'input image', 'source image', 'original image', 'uploaded',
];

const STYLE_SIGNALS = {
  photorealistic: [
    'photorealistic', 'photo-realistic', 'realistic', 'photograph',
    'photo', 'DSLR', 'film still', 'documentary', 'natural',
    'lifelike', 'true-to-life', 'hyperreal',
  ],
  cinematic: [
    'cinematic', 'film noir', 'movie', 'film', 'anamorphic',
    'widescreen', 'letterbox', 'blockbuster', 'hollywood',
    'director', 'cinematographer', 'feature film',
    'establishing shot', 'close-up', 'tracking shot', 'dolly',
  ],
  stylized: [
    'stylized', 'artistic', 'concept art', 'illustration',
    'painterly', 'watercolor', 'oil painting', 'anime', 'manga',
    'cartoon', 'sketch', 'drawing', 'hand-drawn', 'cel-shaded',
  ],
  design: [
    'logo', 'brand', 'branding', 'poster', 'flyer', 'banner',
    'ui', 'interface', 'icon', 'badge', 'emblem', 'label',
    'packaging', 'mockup', 'layout', 'infographic', 'vector',
  ],
  abstract: [
    'abstract', 'surreal', 'dreamlike', 'psychedelic', 'fractal',
    'geometric', 'minimalist', 'experimental', 'avant-garde',
  ],
};

const TEXT_RENDERING_KEYWORDS = [
  'text', 'typography', 'lettering', 'font', 'typeface',
  'the word', 'the words', 'the text', 'that says', 'that reads',
  'with the name', 'title', 'headline', 'caption', 'subtitle',
  'logo with', 'sign that', 'neon sign', 'billboard', 'label',
  "saying '", 'saying "', "reads '", 'reads "',
];

const CHARACTER_CONSISTENCY_KEYWORDS = [
  'same character', 'consistent character', 'character across',
  'multi-shot', 'multiple shots', 'throughout', 'recurring',
  'series of', 'sequence of', 'storyboard',
];

const REFERENCE_IMAGE_KEYWORDS = [
  'reference photo', 'reference image', 'this photo', 'this image',
  'based on this', 'like this', 'input image', 'source image',
  'uploaded image', 'attached image', 'original photo',
];

const AUDIO_KEYWORDS = ['audio', 'sound', 'music', 'dialogue', 'voice', 'narration', 'sfx', 'sound effect'];

const BUDGET_ECONOMY_KEYWORDS = [
  'budget', 'cheap', 'economy', 'affordable', 'budget-friendly',
  'cost-effective', 'quick', 'fast', 'rapid', 'draft', 'rough',
  'concept', 'sketch', 'low-cost', 'inexpensive',
];

const BUDGET_QUALITY_KEYWORDS = [
  'premium', 'highest quality', 'best quality', 'production-ready',
  'final output', 'hero shot', 'hero image', 'showcase', 'portfolio',
  'print-ready', 'publication', 'gallery',
];

// ── Analyzer ─────────────────────────────────────────────────────────

/**
 * Analyze a creative brief and extract structured metadata.
 *
 * @param {string|object} brief - Text string or brief object with .description
 * @returns {object} Analyzed brief metadata
 */
function analyzeBrief(brief) {
  const text = typeof brief === 'string' ? brief : (brief.description || '');
  const lower = text.toLowerCase();

  // 1. Media type
  const mediaType = detectMediaType(lower, brief);

  // 2. Style
  const style = detectStyle(lower);

  // 3. Booleans
  const hasTextRendering = TEXT_RENDERING_KEYWORDS.some(k => lower.includes(k));
  const hasCharacterConsistency = CHARACTER_CONSISTENCY_KEYWORDS.some(k => lower.includes(k));
  const hasReferenceImages = REFERENCE_IMAGE_KEYWORDS.some(k => lower.includes(k))
    || (typeof brief === 'object' && brief.referenceImages?.length > 0);
  const hasAudio = AUDIO_KEYWORDS.some(k => lower.includes(k));

  // 4. Complexity
  const complexity = assessComplexity(lower, brief);

  // 5. Budget priority
  const budgetPriority = detectBudget(lower);

  // 6. Required features
  const requiredFeatures = detectFeatures(lower, { hasAudio, mediaType });

  return {
    mediaType,
    style,
    hasTextRendering,
    hasCharacterConsistency,
    hasReferenceImages,
    hasAudio,
    complexity,
    budgetPriority,
    requiredFeatures,
    // Pass through original text for scoring
    originalText: text,
  };
}

function detectMediaType(lower, brief) {
  // Edit detection first (most specific)
  if (EDIT_KEYWORDS.some(k => lower.includes(k))) return 'edit';

  // Video detection — but check for false positives
  const videoHits = VIDEO_KEYWORDS.filter(k => lower.includes(k));
  const designHits = STYLE_SIGNALS.design.filter(k => lower.includes(k));

  // If design keywords dominate, it's likely an image (e.g. "animated logo")
  if (videoHits.length > 0 && designHits.length === 0) return 'video';
  // Strong video signals override design context
  if (videoHits.length >= 2) return 'video';
  // Duration mentions are strong video signals
  if (lower.match(/\d+[\s-]?second/)) return 'video';

  // Default to image
  return 'image';
}

function detectStyle(lower) {
  let bestStyle = 'photorealistic';
  let bestCount = 0;

  for (const [style, keywords] of Object.entries(STYLE_SIGNALS)) {
    const count = keywords.filter(k => lower.includes(k)).length;
    if (count > bestCount) {
      bestCount = count;
      bestStyle = style;
    }
  }

  return bestStyle;
}

function assessComplexity(lower, brief) {
  let score = 0;

  // Multiple characters
  if (typeof brief === 'object' && brief.characters?.length > 1) score += 2;
  // Long description
  if (lower.length > 300) score += 1;
  // Multiple scene elements
  const complexWords = ['and', 'with', 'while', 'background', 'foreground', 'multiple', 'several'];
  score += complexWords.filter(w => lower.includes(w)).length * 0.5;
  // Technical requirements
  if (lower.includes('slow-motion') || lower.includes('slow motion')) score += 1;
  if (lower.includes('multi-shot') || lower.includes('multiple shots')) score += 2;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function detectBudget(lower) {
  if (BUDGET_ECONOMY_KEYWORDS.some(k => lower.includes(k))) return 'economy';
  if (BUDGET_QUALITY_KEYWORDS.some(k => lower.includes(k))) return 'quality';
  return 'balanced';
}

function detectFeatures(lower, { hasAudio, mediaType }) {
  const features = [];
  if (hasAudio) features.push('audio');
  if (lower.includes('multi-shot') || lower.includes('multiple shots')) features.push('multi-shot');
  if (lower.includes('slow-motion') || lower.includes('slow motion')) features.push('slow-motion');
  if (lower.includes('camera movement') || lower.includes('tracking') || lower.includes('dolly')) features.push('camera-movement');
  if (lower.includes('upscale') || lower.includes('enhance resolution')) features.push('upscale');
  if (lower.includes('background remov')) features.push('background-removal');
  if (lower.includes('loop') || lower.includes('looping')) features.push('looping');
  return features;
}

export { analyzeBrief };
