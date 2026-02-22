import { createSpecialist } from './_baseSpecialist.js';

const generatePrompt = createSpecialist({
  modelName: 'Higgsfield Cinema Studio',
  kbFile: '02_Model_Higgsfield_Cinema_Studio.md',
  ragModelId: 'higgsfield_cinema_studio_v1_5',
  extraContext: `## Special Note
You are a CAMERA CONTROL specialist, not an image generator.
Your output should be camera motion guidance — dolly, pan, tilt, crane moves, etc.
Focus on how to translate the shot intent into Higgsfield camera control parameters.`,
  promptOnly: true,
});

export { generatePrompt };
