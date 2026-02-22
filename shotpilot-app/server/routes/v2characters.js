/**
 * Character Reference System — POST /api/v2/characters
 * Define characters once → maintain consistency across all generations
 * ShotPilot v2
 * 
 * This is the KEY differentiator per market research:
 * "Character consistency across shots is the #1 unsolved problem in AI filmmaking"
 */
import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REF_DIR = path.join(__dirname, '../../uploads/character-refs');

if (!fs.existsSync(REF_DIR)) fs.mkdirSync(REF_DIR, { recursive: true });

const upload = multer({
  dest: REF_DIR,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

/**
 * Get character consistency prompt block for a specific model
 * Based on Translation Matrix Section 5: Character/Identity Consistency Translation
 */
function getConsistencyBlock(modelId, characterName, refImageCount) {
  const blocks = {
    midjourney: `--oref [CHARACTER_REF_URL] --ow 100`,
    flux_kontext: `Using the provided reference images, maintain exact identity of ${characterName}. Preserve facial structure, skin tone, hair, and wardrobe.`,
    gpt_image_1_5: `Match the character's face, hair, build, and wardrobe exactly from the reference image of ${characterName}. Same skin tone, same facial features, same clothing.`,
    nano_banana_pro: `Match identity from reference images of ${characterName}. Preserve facial structure, skin tone, hair color and style. Same wardrobe and accessories. Use all ${refImageCount} reference images for identity lock.`,
    seedream_4_5: `Maintain exact visual identity of ${characterName} from the provided reference. Same face, same hair, same clothing, same build.`,
    ideogram: `Character consistency: ${characterName} must match the provided reference exactly. Lock facial features, hair, clothing, and body proportions.`,
    kling_3_0: `[CHARACTER] ${characterName} — identity locked from reference images. Maintain face, build, wardrobe across all frames.`,
    veo_3_1: `Using the provided images for ${characterName}, maintain their exact appearance throughout the shot.`,
    kling_image_v3: `Character: ${characterName}. Reference-locked identity. Preserve all facial features, hair, clothing from reference.`,
  };

  // Default block for models without specific syntax
  return blocks[modelId] || `Character: ${characterName}. Maintain exact visual identity from provided reference images. Preserve facial structure, skin tone, hair color/style, and wardrobe.`;
}

// Upload character reference images
router.post('/api/v2/characters/:characterId/refs', upload.array('refs', 14), async (req, res) => {
  try {
    const { characterId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No reference images provided (upload up to 14)' });
    }

    // Rename files to organized names
    const refs = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const ext = path.extname(file.originalname) || '.jpg';
      const newName = `char_${characterId}_ref_${i + 1}_${Date.now()}${ext}`;
      const newPath = path.join(REF_DIR, newName);
      fs.renameSync(file.path, newPath);
      refs.push({
        index: i + 1,
        filename: newName,
        url: `/uploads/character-refs/${newName}`,
        originalName: file.originalname,
        size: file.size,
      });
    }

    // Store refs in database (add column if needed)
    try {
      db.prepare(`ALTER TABLE characters ADD COLUMN ref_images TEXT`).run();
    } catch {} // Column might already exist

    const existingRefs = (() => {
      try {
        const row = db.prepare('SELECT ref_images FROM characters WHERE id = ?').get(characterId);
        return row?.ref_images ? JSON.parse(row.ref_images) : [];
      } catch { return []; }
    })();

    const allRefs = [...existingRefs, ...refs];
    db.prepare('UPDATE characters SET ref_images = ? WHERE id = ?').run(JSON.stringify(allRefs), characterId);

    res.json({
      success: true,
      characterId,
      totalRefs: allRefs.length,
      newRefs: refs,
      allRefs,
    });
  } catch (error) {
    console.error('[v2characters] Ref upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get character refs
router.get('/api/v2/characters/:characterId/refs', (req, res) => {
  try {
    const { characterId } = req.params;
    const row = db.prepare('SELECT ref_images, name FROM characters WHERE id = ?').get(characterId);
    if (!row) return res.status(404).json({ error: 'Character not found' });

    const refs = row.ref_images ? JSON.parse(row.ref_images) : [];
    res.json({
      characterId,
      name: row.name,
      refs,
      totalRefs: refs.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get consistency prompt block for a character + model
router.get('/api/v2/characters/:characterId/consistency/:modelId', (req, res) => {
  try {
    const { characterId, modelId } = req.params;
    const row = db.prepare('SELECT ref_images, name FROM characters WHERE id = ?').get(characterId);
    if (!row) return res.status(404).json({ error: 'Character not found' });

    const refs = row.ref_images ? JSON.parse(row.ref_images) : [];
    const block = getConsistencyBlock(modelId, row.name, refs.length);

    res.json({
      characterId,
      characterName: row.name,
      modelId,
      consistencyBlock: block,
      refCount: refs.length,
      refUrls: refs.map(r => r.url),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
