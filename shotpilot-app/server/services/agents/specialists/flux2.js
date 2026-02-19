import { createSpecialist } from './_baseSpecialist.js';

const generatePrompt = createSpecialist({
  modelName: 'Flux 2',
  kbFile: '02_Model_Flux_2.md',
});

export { generatePrompt };
