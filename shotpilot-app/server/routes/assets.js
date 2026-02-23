import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../database.js';
import { callGemini } from '../services/ai/shared.js';
import { generateImage, generateFlux2, generateGptImage, generateNanoBanana, editNanoBanana, upscaleTopaz, applyGenFocus, getRealismLockBlock } from '../services/generation.js';
import { getModelRegistryContext } from '../services/ragModelContext.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Film stock presets
const FILM_STOCK_PRESETS = [
  { 
    id: "kodak-vision3-500t", 
    name: "Kodak Vision3 500T", 
    inject: "shot on Kodak Vision3 500T tungsten film stock, warm amber highlights, fine grain structure, slightly desaturated shadows" 
  },
  { 
    id: "kodak-portra-400", 
    name: "Kodak Portra 400", 
    inject: "shot on Kodak Portra 400 film stock, warm skin tones, gentle contrast, creamy highlights, natural color rendition" 
  },
  { 
    id: "kodak-ektar-100", 
    name: "Kodak Ektar 100", 
    inject: "shot on Kodak Ektar 100 film stock, vivid saturated colors, ultra-fine grain, high contrast, punchy shadows" 
  },
  { 
    id: "fuji-pro-400h", 
    name: "Fuji Pro 400H", 
    inject: "shot on Fuji Pro 400H film stock, cool pastel tones, soft highlights, slightly green-shifted shadows, gentle grain" 
  },
  { 
    id: "ilford-hp5", 
    name: "Ilford HP5+ 400", 
    inject: "shot on Ilford HP5+ 400 black and white film stock, high contrast, rich grain, deep blacks, bright highlights" 
  },
  { 
    id: "kodak-5219-500t", 
    name: "Kodak 5219 Vision3 (Cinema)", 
    inject: "shot on Kodak 5219 500T motion picture film stock, cinematic color science, rich shadow detail, filmic highlight rolloff" 
  },
  { 
    id: "fuji-eterna-vivid-500", 
    name: "Fuji Eterna Vivid 500", 
    inject: "shot on Fuji Eterna Vivid 500 cinema film stock, vivid color reproduction, fine grain, clean shadows, slightly cool tone" 
  },
  { 
    id: "cinestill-800t", 
    name: "CineStill 800T", 
    inject: "shot on CineStill 800T tungsten film stock, halation around highlights, orange/teal color shift, visible grain, neon glow" 
  }
];

export default function createAssetRoutes() {
  const router = express.Router();

  /**
   * GET /api/presets/film-stocks — get film stock presets
   */
  router.get('/api/presets/film-stocks', (req, res) => {
    res.json(FILM_STOCK_PRESETS);
  });

  /**
   * GET /api/projects/:id/assets — get all project images with asset metadata
   */
  router.get('/api/projects/:id/assets', (req, res) => {
    const images = db.prepare(`
      SELECT * FROM project_images WHERE project_id = ? ORDER BY id
    `).all(req.params.id);
    res.json(images);
  });

  /**
   * PATCH /api/assets/:id — update asset metadata (classification, scores, scene, status, etc.)
   */
  router.patch('/api/assets/:id', (req, res) => {
    const allowed = ['asset_type', 'subject_category', 'scene_id', 'style_score', 'realism_score',
                     'pipeline_score', 'status', 'analysis_json', 'refinement_notes', 'title', 'notes', 'tags',
                     'source_model', 'source_prompt', 'refinement_json', 'parent_asset_id', 'iteration'];
    const updates = [];
    const values = [];
    for (const [key, val] of Object.entries(req.body)) {
      if (allowed.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(val);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });
    values.push(req.params.id);
    db.prepare(`UPDATE project_images SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    const updated = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);

    // If scene_id was set, auto-create a shot + image_variant in that scene
    if (req.body.scene_id && updated) {
      const sceneId = parseInt(req.body.scene_id);
      const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(sceneId);
      if (scene) {
        // Check if this asset already has a shot in this scene (avoid duplicates)
        const existingVariant = db.prepare(`
          SELECT iv.id FROM image_variants iv 
          JOIN shots s ON iv.shot_id = s.id 
          WHERE s.scene_id = ? AND iv.image_url = ?
        `).get(sceneId, updated.image_url);

        if (!existingVariant) {
          // Get next shot order
          const maxOrder = db.prepare('SELECT MAX(order_index) as mx FROM shots WHERE scene_id = ?').get(sceneId);
          const nextOrder = (maxOrder?.mx || 0) + 1;
          const shotCount = db.prepare('SELECT COUNT(*) as cnt FROM shots WHERE scene_id = ?').get(sceneId);
          const shotNumber = String(shotCount.cnt + 1);

          // Create shot
          const shotResult = db.prepare(`
            INSERT INTO shots (scene_id, shot_number, shot_type, description, status, order_index, created_at)
            VALUES (?, ?, ?, ?, 'planning', ?, datetime('now'))
          `).run(
            sceneId,
            shotNumber,
            updated.subject_category === 'environment' ? 'Wide Shot' : 'Medium Shot',
            updated.title || updated.refinement_notes || `Asset #${updated.id}`,
            nextOrder
          );

          // Link image as variant
          db.prepare(`
            INSERT INTO image_variants (shot_id, image_url, model_used, prompt_used, status, created_at, iteration_number)
            VALUES (?, ?, ?, ?, 'imported', datetime('now'), 1)
          `).run(
            shotResult.lastInsertRowid,
            updated.image_url,
            updated.source_model || 'unknown',
            updated.source_prompt || ''
          );

          console.log(`[assets] Auto-created shot #${shotResult.lastInsertRowid} in scene ${sceneId} for asset #${updated.id}`);
        }
      }
    }

    // If scene_id was cleared, remove the auto-created shot (optional — keep for now)
    
    res.json(updated);
  });

  /**
   * DELETE /api/assets/:id — remove an asset and optionally its image file
   */
  router.delete('/api/assets/:id', (req, res) => {
    try {
      const asset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
      if (!asset) return res.status(404).json({ error: 'Asset not found' });

      // Delete iterations that reference this asset
      db.prepare('DELETE FROM project_images WHERE parent_asset_id = ?').run(req.params.id);
      // Delete the asset itself
      db.prepare('DELETE FROM project_images WHERE id = ?').run(req.params.id);

      // Optionally delete generated image files (not originals)
      if (asset.image_url && asset.image_url.startsWith('/uploads/images/gen_')) {
        const filePath = path.join(__dirname, '../../', asset.image_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[assets/delete] Removed file: ${filePath}`);
        }
      }

      console.log(`[assets/delete] Deleted asset #${req.params.id} (${asset.title || 'untitled'})`);
      res.json({ deleted: true, id: parseInt(req.params.id) });
    } catch (err) {
      console.error('[assets/delete] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/assets/:id/analyze — run AI analysis on a single image
   * Returns: classification, scores, technical breakdown, refinement advice
   */
  router.post('/api/assets/:id/analyze', async (req, res) => {
    try {
      const asset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
      if (!asset) return res.status(404).json({ error: 'Asset not found' });

      // Get RAG-powered model context
      const modelContext = await getModelRegistryContext();

      // Load the project for style context
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(asset.project_id);

      // Read the image file
      const imagePath = path.join(__dirname, '../../', asset.image_url);
      if (!fs.existsSync(imagePath)) return res.status(404).json({ error: 'Image file not found' });
      const imageBuffer = fs.readFileSync(imagePath);
      const base64 = imageBuffer.toString('base64');
      const mimeType = 'image/jpeg';

      const styleContext = project ? `
Project: ${project.title}
Style: ${project.style_aesthetic || 'Dark cinematic realism, Christopher Nolan-inspired'}
Mood: ${project.atmosphere_mood || 'Tense, dramatic, grounded'}
Lighting: ${project.lighting_directions || 'High contrast, practical lighting sources'}
References: ${project.cinematic_references || 'The Dark Knight, Sicario, Heat'}
      `.trim() : '';

      // Load actual project scenes so Gemini can suggest real scene IDs
      const projectScenes = asset.project_id 
        ? db.prepare('SELECT id, title, description, location FROM scenes WHERE project_id = ? ORDER BY order_index').all(asset.project_id)
        : [];
      const sceneContext = projectScenes.length > 0
        ? 'PROJECT SCENES:\n' + projectScenes.map(s => `- Scene ${s.id}: "${s.title}"${s.description ? ` — ${s.description}` : ''}${s.location ? ` (${s.location})` : ''}`).join('\n')
        : 'No scenes defined yet.';

      const prompt = `You are a cinematographer reviewing images for a professional film production. You're the expert on set — give your honest, practical assessment.

PROJECT STYLE:
${styleContext}

${sceneContext}

Look at this image and answer three questions. Return a JSON object (no markdown, just raw JSON):

{
  "asset_type": "real_ref" | "ai_generated" | "style_ref",
  "subject_category": "hero" | "property_manager" | "vehicle" | "environment" | "dome" | "equipment" | "character_other" | "scene_composite" | "other",
  
  "style_match": {
    "score": <1-10>,
    "verdict": "Does this image belong in this project? Does it match the established look — color palette, mood, film stock feel, production design? Be specific about what fits and what clashes."
  },
  
  "cinematic_realism": {
    "score": <1-10>,
    "verdict": "Does this look like a real frame pulled from a real film? Call out anything that breaks the illusion — AI artifacts, unnatural textures, impossible physics, CGI sheen. Also call out what sells it."
  },
  
  "improvement_plan": {
    "status": "approved" | "needs_work" | "rejected",
    "next_steps": "What specific changes would make this image better? Use these available models:\n${modelContext}\nRecommend the specific model by ID and explain why. If multiple steps needed (e.g., edit then upscale), list them in order."
  },
  
  "scene_suggestions": [${projectScenes.length > 0 ? '"ONLY use scene IDs from the PROJECT SCENES list above. Return matching scene IDs as strings."' : '"No scenes available"'}],
  "summary": "One sentence — what's the verdict on this image?"
}`;

      const result = await callGemini({
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: prompt },
        ],
        responseMimeType: 'application/json',
        thinkingLevel: 'medium',
        maxOutputTokens: 4096,
        meta: { action: 'analyze', projectId: asset.project_id, assetId: asset.id }
      });

      // Parse the result
      let analysis;
      try {
        const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysis = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('[assets/analyze] Failed to parse Gemini response:', result);
        return res.status(500).json({ error: 'Failed to parse analysis', raw: result });
      }

      // Save to DB — map new schema to existing columns
      db.prepare(`
        UPDATE project_images SET
          asset_type = ?,
          subject_category = ?,
          style_score = ?,
          realism_score = ?,
          pipeline_score = NULL,
          status = ?,
          analysis_json = ?,
          refinement_notes = ?
        WHERE id = ?
      `).run(
        analysis.asset_type,
        analysis.subject_category,
        analysis.style_match?.score,
        analysis.cinematic_realism?.score,
        analysis.improvement_plan?.status || 'unreviewed',
        JSON.stringify(analysis),
        analysis.improvement_plan?.next_steps || analysis.summary,
        req.params.id
      );

      const updated = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
      res.json({ analysis, asset: updated });
    } catch (err) {
      console.error('[assets/analyze] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/projects/:id/analyze-all — batch analyze all unreviewed assets
   */
  router.post('/api/projects/:id/analyze-all', async (req, res) => {
    const unreviewed = db.prepare(`
      SELECT id FROM project_images
      WHERE project_id = ? AND (status = 'unreviewed' OR status IS NULL)
    `).all(req.params.id);

    res.json({ queued: unreviewed.length, message: `Analyzing ${unreviewed.length} assets. Results will update in real-time.` });

    // Process in background (don't block response)
    // Client will poll for updates
    (async () => {
      for (const img of unreviewed) {
        try {
          // Reuse the analyze logic by making an internal call
          const asset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(img.id);
          const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
          const imagePath = path.join(__dirname, '../../', asset.image_url);
          if (!fs.existsSync(imagePath)) continue;
          const imageBuffer = fs.readFileSync(imagePath);
          const base64 = imageBuffer.toString('base64');

          const styleContext = project ? `
Project: ${project.title}
Style: ${project.style_aesthetic || 'Dark cinematic realism, Christopher Nolan-inspired'}
Mood: ${project.atmosphere_mood || 'Tense, dramatic, grounded'}
Lighting: ${project.lighting_directions || 'High contrast, practical lighting sources'}
References: ${project.cinematic_references || 'The Dark Knight, Sicario, Heat'}
          `.trim() : '';

          const prompt = `You are a cinematographer reviewing images for a professional film production. You're the expert on set — give your honest, practical assessment.

PROJECT STYLE:
${styleContext}

Look at this image and answer three questions. Return a JSON object (no markdown, just raw JSON):

{
  "asset_type": "real_ref" | "ai_generated" | "style_ref",
  "subject_category": "hero" | "property_manager" | "vehicle" | "environment" | "dome" | "equipment" | "character_other" | "scene_composite" | "other",
  
  "style_match": {
    "score": <1-10>,
    "verdict": "Does this image belong in this project? Does it match the established look — color palette, mood, film stock feel, production design? Be specific about what fits and what clashes."
  },
  
  "cinematic_realism": {
    "score": <1-10>,
    "verdict": "Does this look like a real frame pulled from a real film? Call out anything that breaks the illusion — AI artifacts, unnatural textures, impossible physics, CGI sheen. Also call out what sells it."
  },
  
  "improvement_plan": {
    "status": "approved" | "needs_work" | "rejected",
    "next_steps": "What specific changes would make this image better? Name the tool: which model to regenerate with, what edit to apply, whether to upscale, what prompt changes to make. If it's already good enough, say so. Write this for a filmmaker, not a programmer."
  },
  
  "scene_suggestions": ["scene IDs this could work for"],
  "summary": "One sentence — what's the verdict on this image?"
}`;

          const result = await callGemini({
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: base64 } },
              { text: prompt },
            ],
            responseMimeType: 'application/json',
            thinkingLevel: 'medium',
            maxOutputTokens: 4096,
            meta: { action: 'analyze', projectId: req.params.id, assetId: img.id }
          });

          let analysis;
          try {
            const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            analysis = JSON.parse(cleaned);
          } catch { continue; }

          db.prepare(`
            UPDATE project_images SET
              asset_type = ?, subject_category = ?, realism_score = ?, style_score = ?,
              pipeline_score = NULL, status = ?, analysis_json = ?, refinement_notes = ?
            WHERE id = ?
          `).run(
            analysis.asset_type, analysis.subject_category,
            analysis.cinematic_realism?.score, analysis.style_match?.score,
            analysis.improvement_plan?.status || 'unreviewed',
            JSON.stringify(analysis), analysis.improvement_plan?.next_steps || analysis.summary, img.id
          );
          console.log(`[assets/analyze-all] Analyzed #${img.id}: ${analysis.improvement_plan?.status} (realism:${analysis.cinematic_realism?.score}/style:${analysis.style_match?.score})`);
        } catch (err) {
          console.error(`[assets/analyze-all] Failed on #${img.id}:`, err.message);
        }
      }
      console.log('[assets/analyze-all] Batch analysis complete');
    })();
  });

  /**
   * POST /api/assets/:id/refinement-plan — generate a refinement plan for a needs_work asset
   * Body: { source_model?, source_prompt?, reference_images?: Array<{asset_id, role, image_url}> }
   * Returns: ref strategy decision, recommended model, tailored prompt, explanation
   */
  router.post('/api/assets/:id/refinement-plan', async (req, res) => {
    try {
      const asset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
      if (!asset) return res.status(404).json({ error: 'Asset not found' });

      // Get RAG-powered model context
      const modelContext = await getModelRegistryContext();

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(asset.project_id);
      const imagePath = path.join(__dirname, '../../', asset.image_url);
      if (!fs.existsSync(imagePath)) return res.status(404).json({ error: 'Image file not found' });
      const imageBuffer = fs.readFileSync(imagePath);
      const base64 = imageBuffer.toString('base64');

      // Get existing analysis if available
      const existingAnalysis = asset.analysis_json ? JSON.parse(asset.analysis_json) : null;

      const styleContext = project ? `
Project: ${project.title}
Style: ${project.style_aesthetic || 'Dark cinematic realism, Christopher Nolan-inspired'}
Mood: ${project.atmosphere_mood || 'Tense, dramatic, grounded'}
Lighting: ${project.lighting_directions || 'High contrast, practical lighting sources'}
References: ${project.cinematic_references || 'The Dark Knight, Sicario, Heat'}
      `.trim() : '';

      const body = req.body || {};
      const knownModel = asset.source_model || body.source_model || null;
      const knownPrompt = asset.source_prompt || body.source_prompt || null;
      const referenceImages = body.reference_images || [];

      // Prepare reference images context
      let referenceContext = '';
      let referenceParts = [];
      
      if (referenceImages.length > 0) {
        console.log(`[refs] Processing ${referenceImages.length} reference images`);
        referenceContext = '\nREFERENCE IMAGES PROVIDED:\n';
        
        for (let i = 0; i < referenceImages.length; i++) {
          const ref = referenceImages[i];
          const refImagePath = path.join(__dirname, '../../', ref.image_url);
          
          if (fs.existsSync(refImagePath)) {
            const refImageBuffer = fs.readFileSync(refImagePath);
            const refBase64 = refImageBuffer.toString('base64');
            referenceParts.push({ inlineData: { mimeType: 'image/jpeg', data: refBase64 } });
            
            referenceContext += `- Reference #${i + 1}: ${ref.role} reference (Asset ID: ${ref.asset_id})\n`;
            console.log(`[refs] Loaded reference #${i + 1}: ${ref.role} (${(refImageBuffer.length / 1024).toFixed(0)}KB)`);
          } else {
            console.warn(`[refs] Reference image not found: ${refImagePath}`);
            referenceContext += `- Reference #${i + 1}: ${ref.role} reference (MISSING FILE)\n`;
          }
        }
      }

      const prompt = `You are an expert AI image generation consultant working in a professional cinematic production pipeline. A creator has an image that needs improvement.

STYLE CONTEXT:
${styleContext}

EXISTING ANALYSIS:
${existingAnalysis ? JSON.stringify(existingAnalysis, null, 2) : 'None — analyze the image fresh.'}
${referenceContext}
KNOWN SOURCE INFO:
- Model used to generate: ${knownModel || 'UNKNOWN — you must estimate which model likely made this'}
- Original prompt: ${knownPrompt || 'UNKNOWN — you must reverse-engineer the likely prompt from the image'}

YOUR TASK: Create a refinement plan. This is the critical decision point.

You MUST decide the REFERENCE IMAGE STRATEGY. This is the most important decision:

REFERENCE STRATEGY RULES:
1. If the image has CGI/synthetic/waxy texture issues → DO NOT use as reference. The synthetic look will transfer to the new generation. Generate fresh with a better prompt.
2. If the image has the right overall look/composition but has minor fixable issues (wrong lighting angle, small hand problem, slight color shift) → USE as reference with targeted prompt adjustments.
3. If the image is close to photorealistic but needs subtle refinement → USE as reference, it will anchor the good parts.
4. If you don't know the original prompt and the image has major style issues → DO NOT use as reference. Reverse-engineer what the creator wanted, then generate fresh.
5. If the image was generated by one model but a different model would handle the subject better → recommend the better model, and decide ref strategy based on whether the current image's qualities would help or hurt.

Return a JSON object (no markdown, raw JSON):
{
  "reverse_engineered_prompt": "If original prompt was unknown, your best reconstruction of what prompt likely produced this image. Include style, subject, lighting, composition details. If prompt was provided, return it unchanged.",
  "estimated_source_model": "If model was unknown, your best guess (flux-2, midjourney, dall-e, stable-diffusion, gpt-image, etc). If known, return it unchanged.",
  "reference_strategy": {
    "use_as_reference": true/false,
    "reasoning": "2-3 sentence explanation of WHY you chose this strategy. Reference the specific issues. Explain in plain language a non-technical creator can understand.",
    "risk_if_used_as_ref": "What would go wrong if we DID use this as a reference image (even if you recommend not to)",
    "risk_if_not_used_as_ref": "What would we lose if we DON'T use this as a reference (even if you recommend using it)"
  },
  "recommended_model": "The best model for this specific refinement task. Use these available models:\n${modelContext}\nExplain your pick.",
  "model_reasoning": "Why this model for this specific image and these specific issues. Reference the model's documented strengths and known failure modes from the knowledge base.",
  "refined_prompt": "The actual prompt to use for generation. This should be model-syntax-aware for the recommended model. Include all necessary style, lighting, composition, and subject details. If using as reference, note what the reference provides vs what the prompt needs to override. ${referenceImages.length > 0 ? `If provided reference images are used, reference them by number and role in the prompt (e.g., 'Using Reference #1 as ${referenceImages[0]?.role} guide, Reference #2 for ${referenceImages[1]?.role}').` : ''} Be specific and complete — this prompt should be copy-paste ready.",
  "prompt_notes": "Brief notes for the creator explaining what changed in the prompt vs the original and why",
  "generation_settings": {
    "guidance_scale": <recommended value if applicable>,
    "steps": <recommended if applicable>,
    "aspect_ratio": "recommended aspect ratio",
    "other_settings": "any model-specific settings to mention"
  },
  "expected_improvement": "What should get better with this approach, and what might still need another iteration",
  "iteration_tips": "If the first try doesn't nail it, what to adjust next"
}`;

      const result = await callGemini({
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64 } },
          ...referenceParts,
          { text: prompt },
        ],
        responseMimeType: 'application/json',
        thinkingLevel: 'high',
        maxOutputTokens: 8192,
        meta: { action: 'refinement-plan', projectId: asset.project_id, assetId: asset.id }
      });

      let plan;
      try {
        const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        plan = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('[assets/refinement-plan] Failed to parse:', result);
        return res.status(500).json({ error: 'Failed to parse refinement plan', raw: result });
      }

      // Save the plan and source info to the asset
      db.prepare(`
        UPDATE project_images SET
          refinement_json = ?,
          source_model = COALESCE(source_model, ?),
          source_prompt = COALESCE(source_prompt, ?)
        WHERE id = ?
      `).run(
        JSON.stringify(plan),
        plan.estimated_source_model,
        plan.reverse_engineered_prompt,
        req.params.id
      );

      const updated = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
      res.json({ plan, asset: updated });
    } catch (err) {
      console.error('[assets/refinement-plan] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/assets/:id/source — manually set source model and prompt
   */
  router.post('/api/assets/:id/source', (req, res) => {
    const { source_model, source_prompt } = req.body;
    db.prepare(`
      UPDATE project_images SET source_model = ?, source_prompt = ? WHERE id = ?
    `).run(source_model || null, source_prompt || null, req.params.id);
    const updated = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
    res.json(updated);
  });

  /**
   * POST /api/assets/:id/iterate — upload a new version (iteration) of this asset
   * Links the new upload to the parent asset for tracking
   */
  router.post('/api/assets/:id/iterate', (req, res) => {
    try {
      const parent = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
      if (!parent) return res.status(404).json({ error: 'Parent asset not found' });

      const { image_url, title, source_model, source_prompt } = req.body;
      if (!image_url) return res.status(400).json({ error: 'image_url is required' });

      // Calculate iteration number
      const maxIter = db.prepare(`
        SELECT MAX(iteration) as max_iter FROM project_images
        WHERE parent_asset_id = ? OR id = ?
      `).get(req.params.id, req.params.id);
      const nextIter = (maxIter?.max_iter || parent.iteration || 1) + 1;

      const result = db.prepare(`
        INSERT INTO project_images (project_id, image_url, title, parent_asset_id, iteration,
          source_model, source_prompt, subject_category, scene_id, asset_type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ai_generated', 'unreviewed')
      `).run(
        parent.project_id, image_url,
        title || `${parent.title || 'Asset'} v${nextIter}`,
        parent.id, nextIter,
        source_model || parent.source_model,
        source_prompt || null,
        parent.subject_category, parent.scene_id
      );

      const newAsset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(result.lastInsertRowid);
      res.json(newAsset);
    } catch (err) {
      console.error('[assets/iterate] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/assets/:id/transform-prompt — transform prompt for different model
   * Body: { prompt, target_model, source_model?, reference_images? }
   */
  router.post('/api/assets/:id/transform-prompt', async (req, res) => {
    try {
      const asset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
      if (!asset) return res.status(404).json({ error: 'Asset not found' });

      const { prompt, target_model, source_model, reference_images = [] } = req.body;
      if (!prompt || !target_model) {
        return res.status(400).json({ error: 'prompt and target_model are required' });
      }

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(asset.project_id);

      // Load the target model's specialist
      try {
        const specialistPath = path.join(__dirname, '../services/agents/specialists/', `${target_model.replace(/-/g, '')}.js`);
        let specialistModule;
        
        // Map model names to specialist file names
        const modelMap = {
          'flux-2': 'flux2',
          'gpt-image': 'gptImage', 
          'midjourney': 'midjourney',
          'nano-banana-pro': 'nanoBananaPro',
          'higgsfield': 'higgsfieldGuide'
        };
        
        const specialistName = modelMap[target_model] || target_model;
        const fullSpecialistPath = path.join(__dirname, '../services/agents/specialists/', `${specialistName}.js`);
        
        if (fs.existsSync(fullSpecialistPath)) {
          specialistModule = await import(fullSpecialistPath);
        } else {
          return res.status(400).json({ error: `Specialist not found for model: ${target_model}` });
        }

        // Create a brief object from the prompt with reference context
        let description = prompt;
        if (reference_images.length > 0) {
          description += ` [${reference_images.length} reference images provided: ${reference_images.map((ref, i) => `#${i + 1} (${ref.role})`).join(', ')}]`;
        }
        
        const brief = {
          subject: 'prompt transformation',
          description,
          mood: 'maintain existing mood',
          lighting: 'maintain existing lighting',
          composition: 'maintain existing composition'
        };

        // Load the project's style profile
        let styleProfile = {};
        if (project) {
          styleProfile = {
            aesthetic: project.style_aesthetic || 'Dark cinematic realism',
            mood: project.atmosphere_mood || 'Tense, dramatic', 
            lighting: project.lighting_directions || 'High contrast, practical sources',
            references: project.cinematic_references || 'The Dark Knight, Sicario'
          };
        }

        // Load project context
        const projectContext = {
          project: { name: project?.title || 'Cinematic Project' },
          characters: project?.character_notes || 'N/A',
          vehicles: project?.vehicle_notes || 'N/A', 
          visualIdentity: styleProfile.aesthetic || 'N/A'
        };

        // Call the specialist's generatePrompt function
        const result = await specialistModule.generatePrompt(brief, styleProfile, projectContext);

        res.json({
          transformed_prompt: result.prompt,
          negative_prompt: result.negative_prompt,
          parameters: result.parameters,
          notes: result.notes || `Transformed from ${source_model || 'unknown'} to ${target_model}`
        });

      } catch (err) {
        console.error('[assets/transform-prompt] Specialist error:', err);
        res.status(500).json({ error: `Failed to load specialist for ${target_model}: ${err.message}` });
      }
    } catch (err) {
      console.error('[assets/transform-prompt] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/assets/:id/generate — generate refined version(s) using the refinement plan
   * Now supports multiple models, film stocks, realism lock, and reference images
   * Body: { model?, film_stock?, realism_lock?, num_images?, image_size?, num_steps?, guidance_scale?, prompt_override?, reference_images? }
   */
  router.post('/api/assets/:id/generate', async (req, res) => {
    try {
      const asset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
      if (!asset) return res.status(404).json({ error: 'Asset not found' });

      const {
        model = 'flux-2',
        film_stock,
        realism_lock = true,
        num_images = 4,
        image_size,
        num_steps,
        guidance_scale,
        prompt_override,
        reference_images = []
      } = req.body;

      const plan = asset.refinement_json ? JSON.parse(asset.refinement_json) : null;
      if (!plan && !prompt_override) {
        return res.status(400).json({ error: 'No refinement plan found. Generate a plan first, or provide prompt_override.' });
      }

      let prompt = prompt_override || plan?.refined_prompt || '';
      const useRef = plan ? plan.reference_strategy.use_as_reference : false;

      // Add reference images context to prompt if provided
      if (reference_images.length > 0) {
        let refContext = '';
        for (let i = 0; i < reference_images.length; i++) {
          const ref = reference_images[i];
          refContext += `Using @image${i + 1} as ${ref.role} reference, `;
        }
        prompt = `${refContext}${prompt}`;
        console.log(`[refs] Added ${reference_images.length} reference images to prompt`);
      }

      // Add film stock injection if specified
      if (film_stock) {
        const filmPreset = FILM_STOCK_PRESETS.find(f => f.id === film_stock);
        if (filmPreset) {
          prompt = `${filmPreset.inject}, ${prompt}`;
          console.log(`[assets/generate] Applied film stock: ${filmPreset.name}`);
        }
      }

      // Add realism lock block if enabled
      if (realism_lock) {
        const realismBlock = getRealismLockBlock();
        prompt = `${prompt}, ${realismBlock}`;
        console.log('[assets/generate] Applied realism lock');
      }

      // Map image_size from plan to fal.ai format
      let imageSize = image_size || 'landscape_16_9';
      if (plan?.generation_settings?.aspect_ratio) {
        const ar = plan.generation_settings.aspect_ratio.toLowerCase();
        if (ar.includes('16:9') || ar.includes('21:9')) imageSize = 'landscape_16_9';
        else if (ar.includes('9:16')) imageSize = 'portrait_16_9';
        else if (ar.includes('1:1') || ar.includes('square')) imageSize = 'square_hd';
        else if (ar.includes('4:3')) imageSize = 'landscape_4_3';
      }

      const result = await generateImage({
        model,
        prompt,
        useReference: useRef,
        referenceImagePath: useRef ? asset.image_url : undefined,
        referenceImages: reference_images,
        numImages: num_images,
        imageSize,
        numSteps: num_steps || plan?.generation_settings?.steps || 28,
        guidanceScale: guidance_scale || plan?.generation_settings?.guidance_scale || 3.5,
        meta: { action: 'generate', projectId: asset.project_id, assetId: asset.id }
      });

      // Handle non-API models
      if (result.apiAvailable === false) {
        return res.json({
          generated: [],
          apiAvailable: false,
          prompt: result.prompt,
          parameters: result.parameters,
          model,
          message: `${model} is not API-available. Use the prompt manually in the ${model} interface.`
        });
      }

      // Create new asset entries for each generated image, linked to parent
      const maxIter = db.prepare(`
        SELECT MAX(iteration) as max_iter FROM project_images
        WHERE parent_asset_id = ? OR id = ?
      `).get(req.params.id, req.params.id);
      const baseIter = (maxIter?.max_iter || asset.iteration || 1);

      const newAssets = [];
      for (let i = 0; i < result.images.length; i++) {
        const img = result.images[i];
        const nextIter = baseIter + i + 1;
        const insertResult = db.prepare(`
          INSERT INTO project_images (project_id, image_url, title, parent_asset_id, iteration,
            source_model, source_prompt, subject_category, scene_id, asset_type, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ai_generated', 'unreviewed')
        `).run(
          asset.project_id, img.url,
          `${asset.title || 'Asset'} v${nextIter}`,
          asset.parent_asset_id || asset.id, nextIter,
          model,
          prompt,
          asset.subject_category, asset.scene_id
        );
        const newAsset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(insertResult.lastInsertRowid);
        newAssets.push(newAsset);
      }

      console.log(`[assets/generate] Created ${newAssets.length} new iterations for asset #${asset.id} using ${model}`);

      res.json({
        generated: newAssets,
        requestId: result.requestId,
        useReference: useRef,
        prompt,
        model,
        apiAvailable: true
      });
    } catch (err) {
      console.error('[assets/generate] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/assets/:id/pipeline — run the 3-step realism pipeline
   * Body: { prompt, model?, use_reference?, num_images?, film_stock?, realism_lock?, refine_model?, refine_prompt?, upscale?, image_size?, reference_images? }
   */
  router.post('/api/assets/:id/pipeline', async (req, res) => {
    try {
      const asset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
      if (!asset) return res.status(404).json({ error: 'Asset not found' });

      const {
        prompt,
        model = 'flux-2',
        use_reference = false,
        num_images = 4,
        film_stock,
        realism_lock = true,
        refine_model = 'gpt-image-edit',
        refine_prompt,
        upscale = true,
        image_size = 'landscape_16_9',
        reference_images = []
      } = req.body;

      if (!prompt) return res.status(400).json({ error: 'prompt is required' });

      const results = {
        step1_generate: null,
        step2_refine: null, 
        step3_upscale: null,
        iterations: []
      };

      console.log(`[assets/pipeline] Starting 3-step pipeline for asset #${asset.id}`);

      // STEP 1: Generate
      try {
        console.log(`[assets/pipeline] Step 1: Generate with ${model}`);
        
        let finalPrompt = prompt;
        
        // Add reference images context to prompt if provided
        if (reference_images.length > 0) {
          let refContext = '';
          for (let i = 0; i < reference_images.length; i++) {
            const ref = reference_images[i];
            refContext += `Using @image${i + 1} as ${ref.role} reference, `;
          }
          finalPrompt = `${refContext}${finalPrompt}`;
          console.log(`[refs] Added ${reference_images.length} reference images to pipeline prompt`);
        }
        
        // Add film stock injection
        if (film_stock) {
          const filmPreset = FILM_STOCK_PRESETS.find(f => f.id === film_stock);
          if (filmPreset) {
            finalPrompt = `${filmPreset.inject}, ${finalPrompt}`;
          }
        }

        // Add realism lock
        if (realism_lock) {
          finalPrompt = `${finalPrompt}, ${getRealismLockBlock()}`;
        }

        const generateResult = await generateImage({
          model,
          prompt: finalPrompt,
          useReference: use_reference,
          referenceImagePath: use_reference ? asset.image_url : undefined,
          referenceImages: reference_images,
          numImages: 1, // Generate one for the pipeline
          imageSize: image_size,
          meta: { action: 'pipeline-generate', projectId: asset.project_id, assetId: asset.id }
        });

        if (generateResult.apiAvailable === false) {
          return res.json({
            ...results,
            step1_generate: { error: `${model} is not API-available`, prompt: generateResult.prompt, parameters: generateResult.parameters }
          });
        }

        // Save step 1 result
        const step1Image = generateResult.images[0];
        const step1Asset = db.prepare(`
          INSERT INTO project_images (project_id, image_url, title, parent_asset_id, iteration,
            source_model, source_prompt, subject_category, scene_id, asset_type, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ai_generated', 'unreviewed')
          RETURNING *
        `).get(
          asset.project_id, step1Image.url,
          `${asset.title || 'Asset'} Pipeline Step 1`,
          asset.id, (asset.iteration || 1) + 1,
          model, finalPrompt,
          asset.subject_category, asset.scene_id
        );

        results.step1_generate = step1Asset;
        results.iterations.push(step1Asset);

        // STEP 2: Refine
        if (refine_model && refine_model !== 'none') {
          console.log(`[assets/pipeline] Step 2: Refine with ${refine_model}`);
          
          let refinePromptText = refine_prompt || 'make skin texture realistic, add grain, enhance natural lighting';
          
          try {
            let refineResult;
            
            if (refine_model === 'gpt-image-edit') {
              refineResult = await generateGptImage({
                prompt: refinePromptText,
                useReference: true,
                referenceImagePath: step1Image.url,
                numImages: 1,
                editPrompt: refinePromptText,
                meta: { action: 'pipeline-refine', projectId: asset.project_id, assetId: asset.id }
              });
            } else if (refine_model === 'nano-banana-pro' || refine_model === 'nano-edit') {
              const { editNanoBanana } = await import('../services/generation.js');
              refineResult = await editNanoBanana({
                prompt: refinePromptText,
                imagePath: step1Image.url,
                numImages: 1,
                meta: { action: 'pipeline-refine', projectId: asset.project_id, assetId: asset.id }
              });
            } else if (refine_model === 'flux-2-klein') {
              refineResult = await generateFlux2({
                prompt: `${finalPrompt}, ${refinePromptText}`,
                useReference: true,
                referenceImagePath: step1Image.url,
                numImages: 1,
                imageSize: image_size,
                meta: { action: 'pipeline-refine', projectId: asset.project_id, assetId: asset.id }
              });
            } else {
              throw new Error(`Unsupported refine model: ${refine_model}`);
            }

            // Save step 2 result
            const step2Image = refineResult.images[0];
            const step2Asset = db.prepare(`
              INSERT INTO project_images (project_id, image_url, title, parent_asset_id, iteration,
                source_model, source_prompt, subject_category, scene_id, asset_type, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ai_generated', 'unreviewed')
              RETURNING *
            `).get(
              asset.project_id, step2Image.url,
              `${asset.title || 'Asset'} Pipeline Step 2`,
              asset.id, (asset.iteration || 1) + 2,
              refine_model, refinePromptText,
              asset.subject_category, asset.scene_id
            );

            results.step2_refine = step2Asset;
            results.iterations.push(step2Asset);

          } catch (refineError) {
            console.error(`[assets/pipeline] Step 2 failed:`, refineError);
            results.step2_refine = { error: refineError.message };
          }
        }

        // STEP 3: Upscale
        if (upscale) {
          console.log(`[assets/pipeline] Step 3: Upscale with Topaz`);
          
          const sourceImage = results.step2_refine && !results.step2_refine.error ? 
            results.step2_refine : results.step1_generate;
            
          try {
            const upscaleResult = await upscaleTopaz({
              imagePath: sourceImage.image_url,
              scale: 2,
              meta: { action: 'pipeline-upscale', projectId: asset.project_id, assetId: asset.id }
            });

            // Save step 3 result
            const step3Image = upscaleResult.images[0];
            const step3Asset = db.prepare(`
              INSERT INTO project_images (project_id, image_url, title, parent_asset_id, iteration,
                source_model, source_prompt, subject_category, scene_id, asset_type, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ai_generated', 'unreviewed')
              RETURNING *
            `).get(
              asset.project_id, step3Image.url,
              `${asset.title || 'Asset'} Pipeline Step 3`,
              asset.id, (asset.iteration || 1) + 3,
              'topaz-redefine', 'upscaled 2x',
              asset.subject_category, asset.scene_id
            );

            results.step3_upscale = step3Asset;
            results.iterations.push(step3Asset);

          } catch (upscaleError) {
            console.error(`[assets/pipeline] Step 3 failed:`, upscaleError);
            results.step3_upscale = { error: upscaleError.message };
          }
        }

        console.log(`[assets/pipeline] Completed pipeline for asset #${asset.id}, created ${results.iterations.length} iterations`);

        res.json({
          ...results,
          completed_steps: Object.values(results).filter(step => step && !step.error && step !== results.iterations).length,
          prompt: finalPrompt,
          model,
          pipeline_id: `pipeline_${Date.now()}`
        });

      } catch (err) {
        console.error(`[assets/pipeline] Step 1 failed:`, err);
        res.status(500).json({ 
          ...results,
          step1_generate: { error: err.message },
          error: 'Pipeline failed at generation step' 
        });
      }

    } catch (err) {
      console.error('[assets/pipeline] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/assets/:id/iterations — get all iterations of an asset (the refinement chain)
   */
  router.get('/api/assets/:id/iterations', (req, res) => {
    const asset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // Find the root asset
    const rootId = asset.parent_asset_id || asset.id;
    const iterations = db.prepare(`
      SELECT * FROM project_images
      WHERE id = ? OR parent_asset_id = ?
      ORDER BY iteration ASC
    `).all(rootId, rootId);
    res.json(iterations);
  });

  return router;
}

