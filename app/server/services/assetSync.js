import { db } from '../database.js';

/**
 * Create a new asset iteration and link it to a shot variant
 * @param {number} parentAssetId - Original asset ID
 * @param {string} newImageUrl - URL/path of the new image
 * @param {object} metadata - { model_used, prompt_used, title_suffix }
 * @param {number} shotId - Shot to link the new variant to
 * @returns {object} { asset, variant }
 */
export function createIteration(parentAssetId, newImageUrl, metadata = {}, shotId = null) {
  const parent = db.prepare('SELECT * FROM project_images WHERE id = ?').get(parentAssetId);
  if (!parent) throw new Error(`Parent asset ${parentAssetId} not found`);
  
  // Find next iteration number
  const maxIter = db.prepare('SELECT MAX(iteration) as mx FROM project_images WHERE parent_asset_id = ?').get(parentAssetId);
  const nextIter = (maxIter?.mx || 0) + 1;
  
  // Create new asset
  const result = db.prepare(`
    INSERT INTO project_images (
      project_id, image_url, title, scene_id, asset_type, subject_category,
      source_model, source_prompt, parent_asset_id, iteration, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'needs_review', datetime('now'))
  `).run(
    parent.project_id,
    newImageUrl,
    `${parent.title || 'Asset'} — v${nextIter}${metadata.title_suffix ? ' (' + metadata.title_suffix + ')' : ''}`,
    parent.scene_id,
    parent.asset_type || 'ai_generated',
    parent.subject_category,
    metadata.model_used || null,
    metadata.prompt_used || null,
    parentAssetId,
    nextIter
  );
  
  const newAsset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(result.lastInsertRowid);
  
  // If shot specified, create/update variant
  let variant = null;
  if (shotId) {
    const varResult = db.prepare(`
      INSERT INTO image_variants (shot_id, image_url, model_used, prompt_used, status, created_at, iteration_number, asset_id)
      VALUES (?, ?, ?, ?, 'generated', datetime('now'), ?, ?)
    `).run(
      shotId,
      newImageUrl,
      metadata.model_used || null,
      metadata.prompt_used || null,
      nextIter,
      newAsset.id
    );
    variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(varResult.lastInsertRowid);
  }
  
  return { asset: newAsset, variant };
}

/**
 * Get all iterations of an asset (including the original)
 */
export function getAssetIterations(assetId) {
  const asset = db.prepare('SELECT * FROM project_images WHERE id = ?').get(assetId);
  if (!asset) return [];
  
  // Find the root asset
  const rootId = asset.parent_asset_id || asset.id;
  
  // Get all in the chain
  const all = db.prepare(`
    SELECT * FROM project_images 
    WHERE id = ? OR parent_asset_id = ?
    ORDER BY iteration ASC
  `).all(rootId, rootId);
  
  return all;
}