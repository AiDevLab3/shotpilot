import { createSpecialist } from './_baseSpecialist.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts/grokImagine.md'), 'utf-8');

const generatePrompt = createSpecialist({
  modelName: 'Grok Imagine',
  ragModelId: 'grok_imagine',
  kbFile: '02_Model_Grok_Imagine.md',
  systemPromptOverride: systemPrompt
});

export { generatePrompt };