import { PromptCompiler } from './services/PromptCompiler';
import { useStore } from './store';
import { Frame } from './types/schema';
import { v4 as uuidv4 } from 'uuid';

export function runPhase3Check() {
    console.log("Running Phase 3 Check...");
    const store = useStore.getState();
    const project = Object.values(store.projects)[0];
    const scene = Object.values(store.scenes)[0];
    const shot = Object.values(store.shots)[0];

    if (!project || !scene || !shot) {
        console.error("Phase 1 data missing!");
        return;
    }

    // Test 1: Standard Generation
    const frame: Frame = {
        id: uuidv4(),
        shotId: shot.id,
        frameNumber: 2,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "nano_banana_pro",
        generationType: "image",
        generationAttemptNumber: 1,
        promptId: "p2",
        compiledPrompt: "",
        negativePrompt: "",
        qualityScores: { aiSheenScore: 0, lightingContinuity: 0, characterIdentityLock: 0, cinematicHierarchy: 0, overallScore: 0 },
        status: "generating",
        modelParameters: {},
        generationTime: 0,
        asset: { url: "", operationType: "generate", editSourceFrameId: null }
    };

    const bundle = PromptCompiler.compile(frame, shot, scene, project, store.soulIds, store.entityIds);
    console.log("--- Standard Compile ---");
    console.log("Full Prompt:", bundle.fullPrompt);
    console.log("Realism Present:", bundle.fullPrompt.includes("REALISM_CONSTRAINTS"));

    // Test 2: Edit Mode
    const editFrame: Frame = {
        ...frame,
        asset: { url: "", operationType: "edit", editSourceFrameId: "some-id" },
        promptBundle: {
            ...bundle,
            editGoal: "style_adjust",
            editInstructions: "Make it more noir",
            fullPrompt: "", negativePrompt: "", params: {}, intentBlock: "", projectLookBlock: "", realismPackBlock: "", modelWrapperBlock: ""
        }
    };

    const editBundle = PromptCompiler.compile(editFrame, shot, scene, project, store.soulIds, store.entityIds);
    console.log("--- Edit Compile ---");
    console.log("Full Prompt:", editBundle.fullPrompt);
    console.log("Instruction Present:", editBundle.fullPrompt.includes("Make it more noir"));
}
