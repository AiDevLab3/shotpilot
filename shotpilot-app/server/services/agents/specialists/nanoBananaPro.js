import { createSpecialist } from './_baseSpecialist.js';

const generatePrompt = createSpecialist({
  modelName: 'Nano Banana Pro',
  kbFile: '02_Model_Nano_Banana_Pro.md',
});

export { generatePrompt };
