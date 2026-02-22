import { createSpecialist } from './_baseSpecialist.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts/klingImageV3.md'), 'utf-8');

const generatePrompt = createSpecialist({
  modelName: 'Kling Image V3/O3',
  ragModelId: 'kling_image_v3',
  kbFile: '02_Model_Kling_Image_V3.md',
  systemPromptOverride: systemPrompt
});

export { generatePrompt };