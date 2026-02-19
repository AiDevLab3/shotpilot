/**
 * Style Profile Manager — CRUD for reusable visual style profiles.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STYLES_DIR = path.join(__dirname, '../styles');

// Ensure styles dir exists
if (!fs.existsSync(STYLES_DIR)) fs.mkdirSync(STYLES_DIR, { recursive: true });

function stylePath(id) { return path.join(STYLES_DIR, `${id}.json`); }

function listStyles() {
  return fs.readdirSync(STYLES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(STYLES_DIR, f), 'utf-8')); }
      catch { return null; }
    })
    .filter(Boolean)
    .map(({ id, name, description, created, updated }) => ({ id, name, description, created, updated }));
}

function getStyle(id) {
  const fp = stylePath(id);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

function createStyle(data) {
  const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
  const now = new Date().toISOString();
  const style = {
    id,
    name: data.name,
    description: data.description || '',
    created: now,
    updated: now,
    settings: {
      colorPalette: data.settings?.colorPalette || '',
      lighting: data.settings?.lighting || '',
      lensPreferences: data.settings?.lensPreferences || '',
      mood: data.settings?.mood || '',
      referenceFilms: data.settings?.referenceFilms || [],
      customDirectives: data.settings?.customDirectives || [],
    },
  };
  fs.writeFileSync(stylePath(id), JSON.stringify(style, null, 2));
  return style;
}

function updateStyle(id, data) {
  const existing = getStyle(id);
  if (!existing) return null;
  const updated = {
    ...existing,
    name: data.name || existing.name,
    description: data.description !== undefined ? data.description : existing.description,
    updated: new Date().toISOString(),
    settings: { ...existing.settings, ...data.settings },
  };
  fs.writeFileSync(stylePath(id), JSON.stringify(updated, null, 2));
  return updated;
}

function deleteStyle(id) {
  const fp = stylePath(id);
  if (!fs.existsSync(fp)) return false;
  fs.unlinkSync(fp);
  return true;
}

/**
 * Convert a style profile into text directives for prompt injection.
 */
function styleToDirectives(style) {
  const s = style.settings;
  const lines = [`STYLE PROFILE: "${style.name}"`];
  if (s.colorPalette) lines.push(`  Color Palette: ${s.colorPalette}`);
  if (s.lighting) lines.push(`  Lighting: ${s.lighting}`);
  if (s.lensPreferences) lines.push(`  Lens/Camera: ${s.lensPreferences}`);
  if (s.mood) lines.push(`  Mood: ${s.mood}`);
  if (s.referenceFilms?.length) lines.push(`  Film References: ${s.referenceFilms.join(', ')}`);
  if (s.customDirectives?.length) {
    lines.push(`  Custom Directives:`);
    s.customDirectives.forEach(d => lines.push(`    - ${d}`));
  }
  return lines.join('\n');
}

export { listStyles, getStyle, createStyle, updateStyle, deleteStyle, styleToDirectives };
