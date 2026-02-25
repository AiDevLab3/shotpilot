import { createSpecialist } from './_baseSpecialist.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts/seedream.md'), 'utf-8');

const generatePrompt = createSpecialist({
  modelName: 'Seedream 4.5',
  ragModelId: 'seedream_4_5',
  kbFile: '02_Model_Seedream_45.md',
  systemPromptOverride: systemPrompt
});

export { generatePrompt };