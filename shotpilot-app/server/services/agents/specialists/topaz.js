import { createSpecialist } from './_baseSpecialist.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts/topaz.md'), 'utf-8');

const generatePrompt = createSpecialist({
  modelName: 'Topaz AI (Gigapixel/Photo AI)',
  ragModelId: 'topaz',
  kbFile: '02_Model_Topaz.md',
  systemPromptOverride: systemPrompt
});

export { generatePrompt };