import { createSpecialist } from './_baseSpecialist.js';

const generatePrompt = createSpecialist({
  modelName: 'GPT Image (DALL-E)',
  kbFile: '02_Model_GPT_Image.md',
});

export { generatePrompt };
