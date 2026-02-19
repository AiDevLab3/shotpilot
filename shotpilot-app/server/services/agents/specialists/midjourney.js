import { createSpecialist } from './_baseSpecialist.js';

const generatePrompt = createSpecialist({
  modelName: 'Midjourney',
  kbFile: '02_Model_Midjourney.md',
  promptOnly: true,
});

export { generatePrompt };
