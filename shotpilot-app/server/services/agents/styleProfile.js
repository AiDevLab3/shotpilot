import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_DIR = path.join(__dirname, 'profiles');

const DEFAULT_PROFILE_ID = 'dark-knight-default';

/**
 * Load a project style profile by ID.
 * Falls back to the Dark Knight default if not found.
 */
function loadStyleProfile(projectId) {
  const profileId = projectId || DEFAULT_PROFILE_ID;
  const profilePath = path.join(PROFILES_DIR, `${profileId}.json`);

  if (fs.existsSync(profilePath)) {
    return JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
  }

  // Fallback to default
  const defaultPath = path.join(PROFILES_DIR, `${DEFAULT_PROFILE_ID}.json`);
  if (fs.existsSync(defaultPath)) {
    return JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
  }

  throw new Error(`Style profile not found: ${profileId}`);
}

/**
 * List all available style profiles.
 */
function listStyleProfiles() {
  if (!fs.existsSync(PROFILES_DIR)) return [];
  return fs.readdirSync(PROFILES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(PROFILES_DIR, f), 'utf-8'));
      return { id: data.id, name: data.name, description: data.description };
    });
}

export { loadStyleProfile, listStyleProfiles, DEFAULT_PROFILE_ID };
