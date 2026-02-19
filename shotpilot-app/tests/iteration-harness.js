/**
 * ShotPilot Iteration Test Harness
 * 
 * Closes the full loop: KB prompt → image gen → audit → refine → repeat
 * Hard-capped budget with per-image cost tracking.
 * 
 * Run: node tests/iteration-harness.js
 */
import 'dotenv/config';
import Database from 'better-sqlite3';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { loadKBForModel } from '../server/services/kbLoader.js';
import { generatePrompt, refinePromptFromAudit } from '../server/services/ai/promptGeneration.js';
import { holisticImageAudit } from '../server/services/ai/imageAudit.js';
import { readKBFile } from '../server/services/kbLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// BUDGET CONTROLS — HARD LIMITS
// ============================================================
const BUDGET_MAX = 25.00;           // Absolute max spend in USD
const MAX_SHOTS = 8;                // Max shots to test
const MAX_ITERATIONS = 5;           // Max iterations per shot
const COST_PER_IMAGE_GEN = 0.04;   // Conservative estimate
const COST_PER_TEXT_CALL = 0.01;    // Conservative estimate (prompt gen, audit, refine)
const IMAGE_MODEL = 'nano-banana-pro-preview';
const KB_MODEL = 'nano-banana-pro';

let totalSpent = 0;
const costLog = [];

function trackCost(type, amount) {
  totalSpent += amount;
  costLog.push({ type, amount, running: totalSpent, time: new Date().toISOString() });
  if (totalSpent >= BUDGET_MAX) {
    console.error(`\n🛑 BUDGET CAP REACHED: $${totalSpent.toFixed(2)} / $${BUDGET_MAX}`);
    saveFinalReport();
    process.exit(0);
  }
}

function budgetRemaining() {
  return BUDGET_MAX - totalSpent;
}

function canAfford(type) {
  const cost = type === 'image' ? COST_PER_IMAGE_GEN : COST_PER_TEXT_CALL;
  return (totalSpent + cost) < BUDGET_MAX;
}

// ============================================================
// IMAGE GENERATION via Gemini API
// ============================================================
async function generateImage(prompt) {
  if (!canAfford('image')) throw new Error('Budget exceeded');
  
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${key}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
    })
  });
  
  const data = await res.json();
  if (data.error) throw new Error(`Image gen error: ${data.error.message}`);
  
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData);
  if (!imagePart) throw new Error('No image returned');
  
  trackCost('image_gen', COST_PER_IMAGE_GEN);
  
  return {
    buffer: Buffer.from(imagePart.inlineData.data, 'base64'),
    mimeType: imagePart.inlineData.mimeType || 'image/jpeg',
    textResponse: parts.find(p => p.text)?.text || null
  };
}

// ============================================================
// MAIN TEST HARNESS
// ============================================================
async function runHarness() {
  const db = new Database(path.join(__dirname, '../data/shotpilot.db'));
  db.pragma('journal_mode = WAL');
  
  // Output directory
  const outDir = path.join(__dirname, '../test-results/iteration-harness');
  fs.mkdirSync(outDir, { recursive: true });
  
  // Get project 2 (TCPW Dark Knight)
  const project = db.prepare('SELECT * FROM projects WHERE id = 2').get();
  if (!project) { console.error('Project 2 not found'); return; }
  
  const characters = db.prepare('SELECT * FROM characters WHERE project_id = 2').all();
  const objects = db.prepare('SELECT * FROM objects WHERE project_id = 2').all();
  
  // Get diverse shots (mix of shot types)
  const shots = db.prepare(`
    SELECT s.*, sc.id as scene_id_real, sc.name as scene_name, sc.location_setting, 
           sc.time_of_day, sc.weather_atmosphere, sc.mood_tone, sc.lighting_notes, sc.camera_approach
    FROM shots s 
    JOIN scenes sc ON s.scene_id = sc.id 
    WHERE sc.project_id = 2 AND s.description IS NOT NULL AND length(s.description) > 50
    ORDER BY RANDOM()
    LIMIT ?
  `).all(MAX_SHOTS);
  
  console.log(`\n🎬 ShotPilot Iteration Test Harness`);
  console.log(`📊 Budget: $${BUDGET_MAX} | Shots: ${shots.length} | Max iterations: ${MAX_ITERATIONS}`);
  console.log(`🎯 Model: ${KB_MODEL} (KB) → ${IMAGE_MODEL} (image gen)`);
  console.log(`${'='.repeat(70)}\n`);
  
  const kbContent = loadKBForModel(KB_MODEL);
  const coreKB = readKBFile('01_Core_Realism_Principles.md') || '';
  console.log(`📚 KB loaded: ${Math.round(kbContent.length / 4)} tokens\n`);
  
  const allResults = [];
  
  for (let si = 0; si < shots.length; si++) {
    const shot = shots[si];
    const scene = {
      id: shot.scene_id_real,
      name: shot.scene_name,
      location_setting: shot.location_setting,
      time_of_day: shot.time_of_day,
      weather_atmosphere: shot.weather_atmosphere,
      mood_tone: shot.mood_tone,
      lighting_notes: shot.lighting_notes,
      camera_approach: shot.camera_approach,
    };
    
    console.log(`\n${'━'.repeat(70)}`);
    console.log(`📷 Shot ${si + 1}/${shots.length}: [${shot.shot_type}] ${shot.description.substring(0, 80)}...`);
    console.log(`   Scene: ${scene.name}`);
    console.log(`${'━'.repeat(70)}`);
    
    const shotResults = {
      shot_id: shot.id,
      shot_type: shot.shot_type,
      scene: scene.name,
      description: shot.description,
      iterations: []
    };
    
    let currentPrompt = null;
    let lastAuditResult = null;
    
    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      if (!canAfford('image')) {
        console.log(`   ⚠️ Budget too low for more iterations ($${totalSpent.toFixed(2)} spent)`);
        break;
      }
      
      console.log(`\n   --- Iteration ${iter + 1} ---`);
      
      try {
        // Step 1: Generate or refine prompt
        if (iter === 0) {
          console.log(`   📝 Generating initial prompt...`);
          if (!canAfford('text')) break;
          const result = await generatePrompt({
            project, scene, shot, characters, objects,
            modelName: KB_MODEL,
            kbContent,
            qualityTier: 'production'
          });
          trackCost('prompt_gen', COST_PER_TEXT_CALL);
          currentPrompt = result.prompt;
          console.log(`   ✅ Prompt: ${currentPrompt.substring(0, 100)}...`);
        } else {
          console.log(`   🔄 Refining prompt based on audit...`);
          if (!canAfford('text')) break;
          const modelKB = loadKBForModel(KB_MODEL);
          const refineResult = await refinePromptFromAudit({
            originalPrompt: currentPrompt,
            auditResult: lastAuditResult,
            modelName: KB_MODEL,
            modelKBContent: modelKB,
            project, scene, shot, characters, objects
          });
          trackCost('prompt_refine', COST_PER_TEXT_CALL);
          currentPrompt = refineResult.refined_prompt;
          console.log(`   ✅ Refined: ${currentPrompt.substring(0, 100)}...`);
          if (refineResult.reference_strategy) {
            console.log(`   📌 Ref strategy: ${refineResult.reference_strategy.action} — ${refineResult.reference_strategy.title || ''}`);
          }
        }
        
        // Step 2: Generate image
        console.log(`   🖼️  Generating image...`);
        const { buffer, mimeType } = await generateImage(currentPrompt);
        
        // Save image
        const ext = mimeType.includes('png') ? 'png' : 'jpg';
        const imgFilename = `shot${shot.id}_iter${iter + 1}.${ext}`;
        const imgPath = path.join(outDir, imgFilename);
        fs.writeFileSync(imgPath, buffer);
        console.log(`   💾 Saved: ${imgFilename} (${Math.round(buffer.length / 1024)}KB)`);
        
        // Step 3: Audit the image
        console.log(`   🔍 Auditing image...`);
        if (!canAfford('text')) break;
        const auditResult = await holisticImageAudit({
          imageBuffer: buffer,
          mimeType,
          project, scene, shot, characters, objects,
          kbContent: coreKB
        });
        trackCost('audit', COST_PER_TEXT_CALL);
        lastAuditResult = auditResult;
        
        const dimScores = Object.entries(auditResult.dimensions)
          .map(([k, v]) => `${k.replace(/_/g, ' ')}:${v.score}`)
          .join(', ');
        
        console.log(`   📊 Score: ${auditResult.overall_score}/100 → ${auditResult.recommendation}`);
        console.log(`   📐 ${dimScores}`);
        if (auditResult.realism_diagnosis?.length) {
          console.log(`   ⚠️  Realism: ${auditResult.realism_diagnosis.map(d => d.pattern + '(' + d.severity + ')').join(', ')}`);
        }
        console.log(`   💰 Running cost: $${totalSpent.toFixed(2)}`);
        
        shotResults.iterations.push({
          iteration: iter + 1,
          prompt: currentPrompt,
          image: imgFilename,
          score: auditResult.overall_score,
          recommendation: auditResult.recommendation,
          dimensions: auditResult.dimensions,
          realism_diagnosis: auditResult.realism_diagnosis,
          issues: auditResult.issues,
          summary: auditResult.summary,
          cost_so_far: totalSpent
        });
        
        // Stop early if locked in
        if (auditResult.recommendation === 'LOCK IT IN') {
          console.log(`   🎉 LOCKED IN at iteration ${iter + 1}!`);
          break;
        }
        
        // Stop if score regressed significantly
        if (iter > 0) {
          const prevScore = shotResults.iterations[iter - 1]?.score || 0;
          if (auditResult.overall_score < prevScore - 10) {
            console.log(`   📉 Score regressed significantly (${prevScore} → ${auditResult.overall_score}), stopping.`);
            break;
          }
        }
        
      } catch (err) {
        console.error(`   ❌ Error: ${err.message}`);
        shotResults.iterations.push({
          iteration: iter + 1,
          error: err.message,
          cost_so_far: totalSpent
        });
        break;
      }
    }
    
    allResults.push(shotResults);
  }
  
  // Save final report
  saveFinalReport(allResults);
}

function saveFinalReport(allResults) {
  const outDir = path.join(__dirname, '../test-results/iteration-harness');
  fs.mkdirSync(outDir, { recursive: true });
  
  const report = {
    timestamp: new Date().toISOString(),
    budget: { max: BUDGET_MAX, spent: totalSpent, remaining: BUDGET_MAX - totalSpent },
    config: { max_shots: MAX_SHOTS, max_iterations: MAX_ITERATIONS, image_model: IMAGE_MODEL, kb_model: KB_MODEL },
    costLog,
    results: allResults || [],
    summary: {}
  };
  
  if (allResults?.length) {
    // Compute summary stats
    const allScores = allResults.flatMap(r => r.iterations.filter(i => i.score !== undefined).map(i => i.score));
    const firstScores = allResults.map(r => r.iterations[0]?.score).filter(Boolean);
    const lastScores = allResults.map(r => r.iterations[r.iterations.length - 1]?.score).filter(Boolean);
    const improvements = allResults.map(r => {
      const scores = r.iterations.filter(i => i.score !== undefined).map(i => i.score);
      return scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;
    });
    
    report.summary = {
      shots_tested: allResults.length,
      total_iterations: allResults.reduce((sum, r) => sum + r.iterations.length, 0),
      avg_first_score: firstScores.length ? Math.round(firstScores.reduce((a, b) => a + b, 0) / firstScores.length) : 0,
      avg_last_score: lastScores.length ? Math.round(lastScores.reduce((a, b) => a + b, 0) / lastScores.length) : 0,
      avg_improvement: improvements.length ? Math.round(improvements.reduce((a, b) => a + b, 0) / improvements.length) : 0,
      locked_in: allResults.filter(r => r.iterations.some(i => i.recommendation === 'LOCK IT IN')).length,
      all_scores: allScores,
      per_shot: allResults.map(r => ({
        shot: r.description?.substring(0, 60),
        scene: r.scene,
        scores: r.iterations.filter(i => i.score !== undefined).map(i => i.score),
        improvement: (() => {
          const s = r.iterations.filter(i => i.score !== undefined).map(i => i.score);
          return s.length >= 2 ? s[s.length - 1] - s[0] : 0;
        })()
      }))
    };
    
    // Print summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 FINAL REPORT`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Shots tested: ${report.summary.shots_tested}`);
    console.log(`Total iterations: ${report.summary.total_iterations}`);
    console.log(`Avg first score: ${report.summary.avg_first_score}`);
    console.log(`Avg last score: ${report.summary.avg_last_score}`);
    console.log(`Avg improvement: ${report.summary.avg_improvement > 0 ? '+' : ''}${report.summary.avg_improvement}`);
    console.log(`Locked in: ${report.summary.locked_in}/${report.summary.shots_tested}`);
    console.log(`Total cost: $${totalSpent.toFixed(2)}`);
    console.log(`\nPer shot:`);
    report.summary.per_shot.forEach(s => {
      console.log(`  ${s.scene.substring(0, 30).padEnd(30)} | ${s.scores.join(' → ').padEnd(25)} | ${s.improvement > 0 ? '+' : ''}${s.improvement}`);
    });
  }
  
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`\n💾 Full report saved to test-results/iteration-harness/report.json`);
  console.log(`💰 Total spent: $${totalSpent.toFixed(2)} / $${BUDGET_MAX}`);
}

// Run it
runHarness().catch(err => {
  console.error('Fatal error:', err);
  saveFinalReport();
  process.exit(1);
});
