/**
 * Test the Smart Model Router with 5 diverse briefs.
 * Run: node tests/test-smart-router.js
 */
import { smartRecommend } from '../src/model-router.js';

const briefs = [
  {
    name: 'Film Noir Portrait',
    brief: 'Photorealistic close-up portrait of a detective in film noir lighting',
    expect: { mediaType: 'image', style: 'photorealistic' },
  },
  {
    name: 'Animated Logo with Typography',
    brief: "Animated logo with the text 'CINE-AI' in metallic chrome",
    expect: { mediaType: 'image', hasTextRendering: true, style: 'design' },
  },
  {
    name: 'Cyberpunk City Video',
    brief: '30-second establishing shot of a cyberpunk city at night with rain',
    expect: { mediaType: 'video', style: 'cinematic' },
  },
  {
    name: 'Photo Background Edit',
    brief: 'Edit this reference photo to change the background to a sunset beach',
    expect: { mediaType: 'edit', hasReferenceImages: true },
  },
  {
    name: 'Budget Concept Art',
    brief: 'Quick concept art sketch of a spaceship, budget-friendly',
    expect: { mediaType: 'image', style: 'stylized', budgetPriority: 'economy' },
  },
];

console.log('🎬 Cine-AI Smart Model Router — Test Results\n');
console.log('='.repeat(70));

for (const { name, brief, expect } of briefs) {
  const { analysis, recommendations } = smartRecommend(brief);
  const top3 = recommendations.slice(0, 3);

  console.log(`\n📋 ${name}`);
  console.log(`   Brief: "${brief}"`);
  console.log(`\n   Analysis:`);
  console.log(`     mediaType: ${analysis.mediaType} ${analysis.mediaType === expect.mediaType ? '✅' : '❌ expected ' + expect.mediaType}`);
  console.log(`     style: ${analysis.style}${expect.style ? (analysis.style === expect.style ? ' ✅' : ' ❌ expected ' + expect.style) : ''}`);
  console.log(`     hasTextRendering: ${analysis.hasTextRendering}${expect.hasTextRendering !== undefined ? (analysis.hasTextRendering === expect.hasTextRendering ? ' ✅' : ' ❌') : ''}`);
  console.log(`     hasReferenceImages: ${analysis.hasReferenceImages}${expect.hasReferenceImages !== undefined ? (analysis.hasReferenceImages === expect.hasReferenceImages ? ' ✅' : ' ❌') : ''}`);
  console.log(`     complexity: ${analysis.complexity}`);
  console.log(`     budgetPriority: ${analysis.budgetPriority}${expect.budgetPriority ? (analysis.budgetPriority === expect.budgetPriority ? ' ✅' : ' ❌ expected ' + expect.budgetPriority) : ''}`);
  if (analysis.requiredFeatures.length) console.log(`     requiredFeatures: ${analysis.requiredFeatures.join(', ')}`);

  console.log(`\n   Top 3 Recommendations:`);
  for (let i = 0; i < top3.length; i++) {
    const r = top3[i];
    console.log(`     ${i + 1}. ${r.displayName} (score: ${r.score}, api: ${r.apiAvailable ? 'yes' : 'no'})`);
    console.log(`        Reasons: ${r.reasons.join(', ')}`);
  }
  console.log('-'.repeat(70));
}

console.log('\n✅ Smart Router test complete.\n');
