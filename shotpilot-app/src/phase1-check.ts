import { useStore } from './store';
import { ProjectDNA, Scene, Shot, Frame } from './types/schema';
import { v4 as uuidv4 } from 'uuid';

export function runPhase1Check() {
    const store = useStore.getState();

    // 1. Create Project
    const project: ProjectDNA = {
        id: uuidv4(),
        name: "Test Project",
        version: "v1",
        createdAt: new Date(),
        updatedAt: new Date(),
        lookName: "Test Look",
        primaryReferences: [],
        colorPalette: { temperature: "neutral", saturation: "medium", shadowTint: "teal" },
        lightingPhilosophy: "natural",
        contrastStyle: "gentle",
        cameraLanguage: { movement: "locked", lensRange: "35-50mm", framingRules: [] },
        textureRules: { grainLevel: "subtle", softness: "natural", forbiddenTerms: [] },
        realismPackVersion: "v1",
        customRealismRules: [],
        forbiddenDrift: [],
        canonStyleFrameId: null,
        canonCharacterFrameId: null,
        canonLightingFrameId: null
    };
    store.addProject(project);

    // 2. Create Scene
    const scene: Scene = {
        id: uuidv4(),
        projectId: project.id,
        sceneNumber: 1,
        name: "Test Scene",
        description: "A test scene",
        createdAt: new Date(),
        updatedAt: new Date(),
        location: "Studio",
        timeOfDay: "Day",
        weather: "Clear",
        lightingLock: { source: "Sun", direction: "Left", quality: "Hard", contrastRatio: "High", fill: "None" },
        characterIds: [],
        entityIds: [],
        shots: []
    };
    store.addScene(scene);

    // 3. Create Shot
    const shot: Shot = {
        id: uuidv4(),
        sceneId: scene.id,
        shotNumber: "1A",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        shotType: "medium",
        cameraRig: { lens: "50mm", aperture: "f/2.8", focusBehavior: "clean", cameraHeight: "eye" },
        composition: { framing: "center", blocking: "standing", negativeSpace: "balanced" },
        cameraMovement: "static",
        characterIds: [],
        entityIds: [],
        frames: [],
        locks: { compositionLocked: false, characterLocked: false, entitiesLocked: false, lightingLocked: false, lensLocked: false, motionReadyLocked: false },
        iterationsCount: 0
    };
    store.addShot(shot);

    // 4. Create Frame with edit lineage
    const frame: Frame = {
        id: uuidv4(),
        shotId: shot.id,
        frameNumber: 1,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        model: "test_model",
        generationType: "image",
        generationAttemptNumber: 1,
        promptId: "p1",
        compiledPrompt: "test prompt",
        negativePrompt: "bad art",
        qualityScores: { aiSheenScore: 10, lightingContinuity: 90, characterIdentityLock: 80, cinematicHierarchy: 85, overallScore: 88 },
        status: "completed",
        modelParameters: {},
        generationTime: 5,
        asset: {
            url: "http://example.com/img.png",
            operationType: "generate",
            editSourceFrameId: null
        }
    };
    store.addFrame(frame);

    console.log("Phase 1 Check Complete: Entities created successfully.");
}
