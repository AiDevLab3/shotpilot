/**
 * Compiler Test Suite
 * 
 * Tests the core compilation pipeline with diverse briefs.
 * Validates: prompt quality, KB loading, model routing, and end-to-end generation.
 * 
 * Budget: $5 max (conservative estimates per call)
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { compile, compileMulti } from '../src/compiler.js';
import { auditImage } from '../src/audit.js';
import { generateImage } from '../src/gemini.js';
import { recommendModel } from '../src/model-router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../../test-results/compiler-tests');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Budget tracking
const BUDGET = 5.00;
let spent = 0;
function track(type) {
  const costs = { compile: 0.02, generate: 0.04, audit: 0.02 };
  spent += costs[type] || 0.01;
  if (spent >= BUDGET) { console.error('🛑 Budget cap reached'); process.exit(0); }
}

// TCPW Dark Knight style profile (reusable)
const TCPW_STYLE = {
  name: 'tcpw-dark-knight',
  aesthetic: 'Nolan-esque Neo-Noir, high-contrast, large-format IMAX realism',
  colorPalette: 'Industrial-chic: deep midnight blues, sharp whites, matte-black hardware, amber sodium vapor accents',
  lensProfile: 'IMAX 65mm, anamorphic characteristics, deep focus',
  filmReferences: 'The Dark Knight, Heat, Sicario, Prisoners',
  avoidList: 'CGI look, plastic skin, HDR glow, hyper-detailed, 8K clarity, waxy texture, sterile symmetry',
};

// Test briefs covering diverse shot types
const TEST_BRIEFS = [
  {
    name: 'Character Close-up',
    brief: {
      description: 'Detective Marlowe studying a crumpled business card under a single desk lamp. His weathered face tells the story of a thousand sleepless nights.',
      shotType: 'Close-up',
      mood: 'intimate, contemplative, noir',
      lighting: 'Single practical desk lamp, warm 2700K pool of light, deep shadows',
      location: 'Private detective office',
      timeOfDay: 'Late night',
      characters: [{ name: 'Detective Marlowe', description: 'Late 50s, weathered face, salt-and-pepper stubble, tired eyes, rumpled dress shirt with loosened tie', action: 'studying a business card' }],
      objects: [{ name: 'Business card', description: 'crumpled, water-stained, barely legible' }],
      styleProfile: TCPW_STYLE,
    },
  },
  {
    name: 'Extreme Wide Establishing',
    brief: {
      description: 'Houston skyline at dusk, the Astrodome silhouetted against an orange-purple sky. A fleet of matte-black TCPW trucks crosses the overpass in a convoy, headlights cutting through the haze.',
      shotType: 'Extreme Long Shot',
      mood: 'power, scale, anticipation',
      lighting: 'Golden hour transitioning to blue hour, sodium vapor street lights beginning to glow',
      location: 'Houston highway overpass with skyline backdrop',
      timeOfDay: 'Dusk',
      objects: [{ name: 'TCPW Fleet', description: 'matte-black tactical pressure washing trucks in convoy formation, amber warning lights' }],
      styleProfile: TCPW_STYLE,
    },
  },
  {
    name: 'Action Medium Shot',
    brief: {
      description: 'The Specialist mid-blast with a high-pressure industrial washer, water exploding off a graffiti-covered concrete wall. Droplets suspended in the air, backlit by industrial floods.',
      shotType: 'Medium Shot',
      mood: 'kinetic energy, precision, power',
      lighting: 'Backlit industrial floods with water mist creating volumetric light rays',
      location: 'Warehouse exterior, concrete wall',
      timeOfDay: 'Night',
      characters: [{ name: 'The Specialist', description: 'Early 30s athletic build, TCPW tactical utility vest, safety goggles pushed up on forehead, dark tech fabrics, focused expression', action: 'operating high-pressure washer at full blast' }],
      styleProfile: TCPW_STYLE,
    },
  },
  {
    name: 'Object Detail Shot',
    brief: {
      description: 'A close detail shot of the TCPW pressure washing rig nozzle assembly. Chrome and matte-black metal, precision-engineered, water beading on the surface. This is the weapon.',
      shotType: 'Insert / Detail Shot',
      mood: 'reverence, precision, craftsmanship',
      lighting: 'Macro ring light with subtle blue rim accent',
      objects: [{ name: 'TCPW Nozzle Assembly', description: 'chrome and matte-black precision-machined nozzle, water droplets on surface, industrial beauty' }],
      styleProfile: TCPW_STYLE,
    },
  },
  {
    name: 'Two-Character Dialogue',
    brief: {
      description: 'Detective Marlowe and The Specialist face each other across a steel table in a dimly lit interrogation room. Tension thick enough to cut.',
      shotType: 'Over-the-Shoulder',
      mood: 'tension, confrontation, power dynamics',
      lighting: 'Single overhead fluorescent with green tint, face-sculpting side light from one-way mirror',
      location: 'Police interrogation room',
      timeOfDay: 'Unknown (windowless room)',
      characters: [
        { name: 'Detective Marlowe', description: 'Late 50s, weathered, badge visible on belt, leaning forward aggressively' },
        { name: 'The Specialist', description: 'Early 30s, calm, arms crossed, slight smirk, still wearing tactical vest' },
      ],
      styleProfile: TCPW_STYLE,
    },
  },
];

async function runTests() {
  console.log('\n🎬 Cine-AI Compiler Test Suite');
  console.log(`📊 Budget: $${BUDGET} | Tests: ${TEST_BRIEFS.length}`);
  console.log('═'.repeat(70) + '\n');

  const results = [];

  for (let i = 0; i < TEST_BRIEFS.length; i++) {
    const test = TEST_BRIEFS[i];
    console.log(`\n━━━ Test ${i + 1}/${TEST_BRIEFS.length}: ${test.name} ━━━`);

    try {
      // Test 1: Model recommendation
      const rec = recommendModel(test.brief);
      console.log(`  🎯 Recommended model: ${rec.displayName} (score: ${rec.score})`);
      console.log(`     Reason: ${rec.reason}`);
      if (rec.alternatives.length) {
        console.log(`     Alternatives: ${rec.alternatives.map(a => a.displayName).join(', ')}`);
      }

      // Test 2: Compile prompt
      console.log(`  📝 Compiling for nano-banana-pro...`);
      const compiled = await compile(test.brief, 'nano-banana-pro');
      track('compile');
      console.log(`  ✅ Prompt: ${compiled.prompt.substring(0, 120)}...`);
      console.log(`  📚 KB: ${compiled.tokensUsed} tokens (${compiled.kbSections.join(', ')})`);

      // Test 3: Generate image
      console.log(`  🖼️  Generating image...`);
      const image = await generateImage(compiled.prompt);
      track('generate');
      
      const imgFile = `${test.name.replace(/\s+/g, '_').toLowerCase()}.jpg`;
      fs.writeFileSync(path.join(OUT_DIR, imgFile), image.buffer);
      console.log(`  💾 Saved: ${imgFile} (${Math.round(image.buffer.length / 1024)}KB)`);

      // Test 4: Audit
      console.log(`  🔍 Auditing...`);
      const audit = await auditImage(image.buffer, image.mimeType, test.brief, 'nano-banana-pro');
      track('audit');

      console.log(`  📊 Score: ${audit.overall_score}/100 → ${audit.recommendation}`);
      console.log(`  📐 Brief adherence: ${audit.dimensions?.brief_adherence?.score || '?'}/10`);
      console.log(`  🔀 Routing: ${audit.routing?.recommended_model || 'same'} — ${audit.routing?.reason || ''}`);
      console.log(`  💰 Spent: $${spent.toFixed(2)}`);

      results.push({
        test: test.name,
        shotType: test.brief.shotType,
        score: audit.overall_score,
        recommendation: audit.recommendation,
        briefAdherence: audit.dimensions?.brief_adherence?.score,
        routing: audit.routing,
        prompt: compiled.prompt,
        kbTokens: compiled.tokensUsed,
        kbSections: compiled.kbSections,
        assumptions: compiled.assumptions,
        issues: audit.issues,
        summary: audit.summary,
        image: imgFile,
      });

    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
      results.push({ test: test.name, error: err.message });
    }
  }

  // Summary
  const scored = results.filter(r => r.score !== undefined);
  const avgScore = scored.length ? Math.round(scored.reduce((s, r) => s + r.score, 0) / scored.length) : 0;
  const avgBrief = scored.filter(r => r.briefAdherence).length
    ? (scored.reduce((s, r) => s + (r.briefAdherence || 0), 0) / scored.filter(r => r.briefAdherence).length).toFixed(1)
    : '?';

  console.log('\n' + '═'.repeat(70));
  console.log('📊 RESULTS SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Tests run: ${results.length}`);
  console.log(`Avg overall score: ${avgScore}/100`);
  console.log(`Avg brief adherence: ${avgBrief}/10`);
  console.log(`Total spent: $${spent.toFixed(2)}`);
  console.log('\nPer test:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  ❌ ${r.test}: ${r.error}`);
    } else {
      console.log(`  ${r.recommendation === 'ACCEPT' ? '✅' : '⚠️'} ${r.test}: ${r.score}/100 (brief: ${r.briefAdherence || '?'}/10) → ${r.recommendation}`);
    }
  });

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    budget: { max: BUDGET, spent },
    style: TCPW_STYLE.name,
    results,
    summary: { avgScore, avgBriefAdherence: avgBrief, testsRun: results.length },
  };
  fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`\n💾 Report: test-results/compiler-tests/report.json`);
}

runTests().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
