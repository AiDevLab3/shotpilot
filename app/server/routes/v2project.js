/**
 * Project DNA Route — GET/PUT /api/v2/projects/:id/dna
 * Defines the visual identity that anchors all analysis and generation
 * ShotPilot v2
 */
import { Router } from 'express';
import { db } from '../database.js';

const router = Router();

/**
 * Project DNA — the creative foundation that feeds into:
 * 1. Image Analysis (style match scoring)
 * 2. Expert Prompt Generation (style directives)
 * 3. Model Recommendation (matching strengths to style needs)
 * 4. Character Consistency (maintaining identity across shots)
 */

// Get project DNA
router.get('/api/v2/projects/:id/dna', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Build DNA from project fields + any custom DNA data
    let customDna = {};
    try {
      if (project.style_dna) customDna = JSON.parse(project.style_dna);
    } catch {}

    const dna = {
      projectId: project.id,
      name: project.name,
      // Core DNA
      theme: customDna.theme || project.description || '',
      tone: customDna.tone || '',
      mood: customDna.mood || '',
      visualStyle: customDna.visualStyle || project.visual_style || '',
      colorPalette: customDna.colorPalette || '',
      lightingKey: customDna.lightingKey || '',
      // Technical
      lensPreference: customDna.lensPreference || '',
      filmStock: customDna.filmStock || '',
      aspectRatio: customDna.aspectRatio || '16:9',
      // References
      referenceFilms: customDna.referenceFilms || [],
      referencePhotographers: customDna.referencePhotographers || [],
      // Model preferences
      preferredImageModel: customDna.preferredImageModel || null,
      preferredVideoModel: customDna.preferredVideoModel || null,
      // Realism settings
      realismLevel: customDna.realismLevel || 'cinematic', // cinematic | stylized | hyperreal
      grainLevel: customDna.grainLevel || 'subtle', // none | subtle | heavy
      // Custom directives
      customDirectives: customDna.customDirectives || [],
      negativeDirectives: customDna.negativeDirectives || [],
    };

    res.json(dna);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project DNA
router.put('/api/v2/projects/:id/dna', (req, res) => {
  try {
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Add style_dna column if missing
    try {
      db.prepare('ALTER TABLE projects ADD COLUMN style_dna TEXT').run();
    } catch {} // Already exists

    const dna = req.body;
    db.prepare('UPDATE projects SET style_dna = ? WHERE id = ?').run(
      JSON.stringify(dna), req.params.id
    );

    // Also update the visual_style field for backward compat
    if (dna.visualStyle) {
      db.prepare('UPDATE projects SET visual_style = ? WHERE id = ?').run(
        dna.visualStyle, req.params.id
      );
    }

    res.json({ success: true, projectId: req.params.id, dna });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate DNA from description (AI-assisted)
router.post('/api/v2/projects/:id/dna/generate', async (req, res) => {
  try {
    const { description, referenceFilms, visualStyle } = req.body;
    const { callGemini } = await import('../services/ai/shared.js');

    const prompt = `You are a cinematography expert. Based on this project description, generate a complete visual style DNA profile.

PROJECT: ${description || 'A cinematic short film'}
${referenceFilms?.length ? `REFERENCE FILMS: ${referenceFilms.join(', ')}` : ''}
${visualStyle ? `VISUAL STYLE: ${visualStyle}` : ''}

Generate a JSON object with these fields:
- theme: What the story is about (1 sentence)
- tone: How it feels (dramatic, hopeful, melancholic, etc.)
- mood: Visual atmosphere (gritty, ethereal, claustrophobic, etc.)
- visualStyle: Primary visual approach (cinematic realism, noir, cyberpunk, etc.)
- colorPalette: Specific color direction (e.g., "desaturated teal and amber, cool shadows, warm practicals")
- lightingKey: Primary lighting approach (e.g., "low-key, practical sources only, motivated lighting")
- lensPreference: Default lens choices (e.g., "35mm f/2.8 for wides, 85mm f/1.4 for close-ups")
- filmStock: Film stock reference (e.g., "Kodak Vision3 500T push-processed")
- referenceFilms: Array of reference films
- customDirectives: Array of specific visual rules (e.g., "no unmotivated fill light")
- negativeDirectives: Array of things to avoid (e.g., "no HDR glow", "no sterile symmetry")
- realismLevel: "cinematic" | "stylized" | "hyperreal"
- grainLevel: "none" | "subtle" | "heavy"

Respond with ONLY the JSON object, no markdown fences.`;

    const result = await callGemini({
      parts: [{ text: prompt }],
      systemInstruction: 'You are a cinematography expert. Output only valid JSON.',
      responseMimeType: 'application/json',
      maxOutputTokens: 2048,
    });

    let dna;
    try {
      dna = JSON.parse(result);
    } catch {
      // Try to extract JSON from response
      const match = result.match(/\{[\s\S]*\}/);
      dna = match ? JSON.parse(match[0]) : { error: 'Could not parse DNA', raw: result };
    }

    // Save to project
    try {
      db.prepare('ALTER TABLE projects ADD COLUMN style_dna TEXT').run();
    } catch {}
    db.prepare('UPDATE projects SET style_dna = ? WHERE id = ?').run(
      JSON.stringify(dna), req.params.id
    );

    res.json({ success: true, projectId: req.params.id, dna });
  } catch (error) {
    console.error('[v2project] DNA generation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
