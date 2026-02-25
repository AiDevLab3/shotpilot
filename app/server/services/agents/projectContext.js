import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadStyleProfile } from './styleProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_DIR = path.join(__dirname, 'profiles');

/**
 * Registry of available projects and their file mappings.
 */
const PROJECT_REGISTRY = {
  'tcpw-dark-knight': {
    name: 'TCPW Dark Knight',
    description: 'Pressure washing company reimagined through The Dark Knight aesthetic',
    scriptFile: 'tcpw-dark-knight-script.md',
    styleProfileId: 'tcpw-dark-knight',
  },
};

/**
 * Parse the TCPW script markdown into structured scene data.
 */
function parseScript(markdown) {
  const scenes = [];
  const lines = markdown.split('\n');

  // Extract top-level sections for project context
  const sections = {};
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      if (currentSection) sections[currentSection] = currentContent.join('\n').trim();
      currentSection = line.replace('## ', '').trim();
      currentContent = [];
    } else if (currentSection && !line.startsWith('### Scene')) {
      currentContent.push(line);
    }
  }
  if (currentSection) sections[currentSection] = currentContent.join('\n').trim();

  // Extract scene breakdown
  const sceneRegex = /### Scene (\d+): (.+)\n([\s\S]*?)(?=### Scene \d|## Technical Standards|$)/g;
  let match;
  while ((match = sceneRegex.exec(markdown)) !== null) {
    const num = parseInt(match[1]);
    const name = match[2].trim();
    const body = match[3].trim();

    const scene = {
      id: `scene-${num}`,
      number: num,
      name,
      description: '',
      lens: [],
      lighting: '',
      composition: '',
      mood: '',
      characters: [],
      technical_notes: [],
    };

    // Parse bullet points
    const bulletLines = body.split('\n').map(l => l.trim()).filter(l => l.startsWith('- '));
    const descLines = [];

    for (const bl of bulletLines) {
      const text = bl.replace(/^- /, '');
      const lower = text.toLowerCase();

      if (lower.startsWith('**lens')) {
        scene.lens.push(text.replace(/\*\*/g, '').replace(/^lens:\s*/i, '').trim());
      } else if (lower.startsWith('**lighting')) {
        scene.lighting = text.replace(/\*\*/g, '').replace(/^lighting:\s*/i, '').trim();
      } else if (lower.startsWith('**shutter')) {
        scene.technical_notes.push(text.replace(/\*\*/g, '').trim());
      } else if (lower.startsWith('**inserts')) {
        scene.technical_notes.push(text.replace(/\*\*/g, '').trim());
      } else {
        descLines.push(text);
      }
    }

    scene.description = descLines.join('\n');
    scenes.push(scene);
  }

  // Extract characters and vehicles from top-level sections
  const characters = sections['Characters'] || '';
  const vehicles = sections['Vehicles'] || '';
  const visualIdentity = sections['Visual Identity'] || '';
  const technicalStandards = sections['Technical Standards'] || '';

  return { scenes, characters, vehicles, visualIdentity, technicalStandards };
}

/**
 * Load a full project context by ID.
 * Returns { project, styleProfile, script (raw), scenes[], characters, vehicles, visualIdentity, technicalStandards }
 */
function loadProject(projectId = 'tcpw-dark-knight') {
  const project = PROJECT_REGISTRY[projectId];
  if (!project) {
    throw new Error(`Unknown project: ${projectId}. Available: ${Object.keys(PROJECT_REGISTRY).join(', ')}`);
  }

  const scriptPath = path.join(PROFILES_DIR, project.scriptFile);
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script file not found: ${scriptPath}`);
  }

  const script = fs.readFileSync(scriptPath, 'utf-8');
  const styleProfile = loadStyleProfile(project.styleProfileId);
  const parsed = parseScript(script);

  return {
    project: { id: projectId, ...project },
    styleProfile,
    script,
    scenes: parsed.scenes,
    characters: parsed.characters,
    vehicles: parsed.vehicles,
    visualIdentity: parsed.visualIdentity,
    technicalStandards: parsed.technicalStandards,
  };
}

/**
 * Get a specific scene from a project.
 */
function getScene(projectId, sceneId) {
  const ctx = loadProject(projectId);
  // Accept "scene-3", "3", or 3
  const num = typeof sceneId === 'string'
    ? parseInt(sceneId.replace('scene-', ''))
    : sceneId;
  const scene = ctx.scenes.find(s => s.number === num);
  if (!scene) {
    throw new Error(`Scene ${sceneId} not found in project ${projectId}. Available: ${ctx.scenes.map(s => s.id).join(', ')}`);
  }
  return { scene, context: ctx };
}

/**
 * List available projects.
 */
function listProjects() {
  return Object.entries(PROJECT_REGISTRY).map(([id, p]) => ({
    id,
    name: p.name,
    description: p.description,
  }));
}

export { loadProject, getScene, listProjects, PROJECT_REGISTRY };
