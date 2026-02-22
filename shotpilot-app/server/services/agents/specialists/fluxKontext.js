import { createSpecialist } from './_baseSpecialist.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts/fluxKontext.md'), 'utf-8');

const generatePrompt = createSpecialist({
  modelName: 'FLUX.1 Kontext',
  ragModelId: 'flux_kontext',
  kbFile: '02_Model_Flux_Kontext.md',
  systemPromptOverride: systemPrompt
});

export { generatePrompt };