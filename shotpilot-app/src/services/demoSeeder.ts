import { useStore } from '../store';
import type { ProjectDNA, Scene, Shot, Frame, SoulID } from '../types/schema';

export const seedDemoData = () => {
    const store = useStore.getState();

    // 1. Create Project
    const project: ProjectDNA = {
        id: 'proj_001',
        name: 'Neon Nights',
        version: 'v1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lookName: 'Noir Cyberpunk',
        primaryReferences: ['Blade Runner 2049', 'Drive'],
        colorPalette: {
            temperature: 'cool',
            saturation: 'high',
            shadowTint: 'teal'
        },
        lightingPhilosophy: 'Contrast heavy neon',
        contrastStyle: 'noir',
        cameraLanguage: {
            movement: 'dolly',
            lensRange: '35-85mm',
            framingRules: ['center framed']
        },
        textureRules: {
            grainLevel: 'medium',
            softness: 'sharp',
            forbiddenTerms: []
        },
        realismPackVersion: 'v1',
        customRealismRules: [],
        forbiddenDrift: [],
        canonStyleFrameId: null,
        canonCharacterFrameId: null,
        canonLightingFrameId: null
    };

    // 2. Create Soul (Character)
    const soul: SoulID = {
        id: 'soul_001',
        projectId: 'proj_001',
        name: 'Detective K',
        version: 'v1',
        createdAt: new Date(),
        updatedAt: new Date(),
        physicalAppearance: {
            facialStructure: { jawline: 'sharp', noseShape: 'straight', eyeSpacing: 'average', eyeColor: 'brown', distinguishingMarks: [] },
            age: '30s',
            skinTone: 'fair',
            hair: { style: 'short', color: 'dark', length: 'short', texture: 'messy' },
            bodyType: 'lean',
            posture: 'rigid'
        },
        signatureWardrobe: [],
        personality: { traits: [], vocalTone: '', speechQuirks: [], mannerisms: [] },
        masterReferenceImage: '',
        additionalReferences: [],
        modelSpecificIds: {}
    };

    // 3. Create Scene
    const scene: Scene = {
        id: 'scene_001',
        projectId: 'proj_001',
        sceneNumber: 1,
        name: 'The Alleyway',
        description: 'K walks down a rainy neon alley.',
        createdAt: new Date(),
        updatedAt: new Date(),
        location: 'Alley',
        timeOfDay: 'night',
        weather: 'rain',
        lightingLock: { source: 'neon signs', direction: 'backlight', quality: 'hard', contrastRatio: 'high', fill: 'negative' },
        characterIds: ['soul_001'],
        entityIds: [],
        shots: ['shot_001', 'shot_002', 'shot_003']
    };

    // 4. Create Shots
    const shot1: Shot = {
        id: 'shot_001',
        sceneId: 'scene_001',
        shotNumber: '1A',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        shotType: 'wide',
        cameraRig: { lens: '24mm', aperture: 'f/2.8', focusBehavior: 'deep', cameraHeight: 'high' },
        composition: { framing: 'wide', blocking: 'walking away', negativeSpace: 'centered' },
        cameraMovement: 'static',
        characterIds: ['soul_001'],
        entityIds: [],
        frames: ['frame_001'],
        heroFrameId: 'frame_001',
        locks: { compositionLocked: false, characterLocked: true, entitiesLocked: false, lightingLocked: true, lensLocked: false, motionReadyLocked: false },
        iterationsCount: 0
    };

    const shot2: Shot = {
        id: 'shot_002',
        sceneId: 'scene_001',
        shotNumber: '1B',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        shotType: 'medium',
        cameraRig: { lens: '50mm', aperture: 'f/1.8', focusBehavior: 'shallow', cameraHeight: 'eye' },
        composition: { framing: 'medium', blocking: 'turning head', negativeSpace: 'right' },
        cameraMovement: 'dolly_in',
        characterIds: ['soul_001'],
        entityIds: [],
        frames: ['frame_002'],
        heroFrameId: 'frame_002',
        locks: { compositionLocked: false, characterLocked: true, entitiesLocked: false, lightingLocked: true, lensLocked: false, motionReadyLocked: false },
        iterationsCount: 0
    };

    const shot3: Shot = {
        id: 'shot_003',
        sceneId: 'scene_001',
        shotNumber: '1C',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        shotType: 'closeup',
        cameraRig: { lens: '85mm', aperture: 'f/1.4', focusBehavior: 'shallow', cameraHeight: 'eye' },
        composition: { framing: 'close', blocking: 'staring', negativeSpace: 'center' },
        cameraMovement: 'static',
        characterIds: ['soul_001'],
        entityIds: [],
        frames: ['frame_003'],
        heroFrameId: 'frame_003',
        locks: { compositionLocked: false, characterLocked: true, entitiesLocked: false, lightingLocked: true, lensLocked: false, motionReadyLocked: false },
        iterationsCount: 0
    };

    // 5. Create Frames
    const frame1: Frame = {
        id: 'frame_001',
        shotId: 'shot_001',
        frameNumber: 1,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        model: 'flux_v1',
        generationType: 'image',
        generationAttemptNumber: 1,
        promptId: 'prompt_001',
        compiledPrompt: 'Wide shot of a detective walking in rain',
        negativePrompt: 'blur, low quality',
        asset: { url: 'https://placehold.co/600x400/1a1a1a/FFF?text=Wide+Shot', operationType: 'generate', editSourceFrameId: null },
        qualityScores: { aiSheenScore: 10, lightingContinuity: 90, characterIdentityLock: 80, cinematicHierarchy: 85, overallScore: 85 },
        status: 'completed',
        modelParameters: {},
        generationTime: 5
    };

    const frame2: Frame = {
        id: 'frame_002',
        shotId: 'shot_002',
        frameNumber: 1,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        model: 'flux_v1',
        generationType: 'image',
        generationAttemptNumber: 1,
        promptId: 'prompt_002',
        compiledPrompt: 'Medium shot of detective turning',
        negativePrompt: 'blur',
        asset: { url: 'https://placehold.co/600x400/2a2a2a/FFF?text=Medium+Shot', operationType: 'generate', editSourceFrameId: null },
        qualityScores: { aiSheenScore: 20, lightingContinuity: 85, characterIdentityLock: 85, cinematicHierarchy: 80, overallScore: 82 },
        status: 'completed',
        modelParameters: {},
        generationTime: 5
    };

    const frame3: Frame = {
        id: 'frame_003',
        shotId: 'shot_003',
        frameNumber: 1,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        model: 'flux_v1',
        generationType: 'image',
        generationAttemptNumber: 1,
        promptId: 'prompt_003',
        compiledPrompt: 'Closeup of detective eyes',
        negativePrompt: 'blur',
        asset: { url: 'https://placehold.co/600x400/3a3a3a/FFF?text=Closeup', operationType: 'generate', editSourceFrameId: null },
        qualityScores: { aiSheenScore: 15, lightingContinuity: 95, characterIdentityLock: 90, cinematicHierarchy: 90, overallScore: 88 },
        status: 'completed',
        modelParameters: {},
        generationTime: 5
    };

    console.log("Seeding data...");
    store.addProject(project);
    store.addSoulId(soul);
    store.addScene(scene);
    store.addShot(shot1);
    store.addShot(shot2);
    store.addShot(shot3);
    store.addFrame(frame1);
    store.addFrame(frame2);
    store.addFrame(frame3);

    // Auto-select first shot
    store.setUiSelection(shot1.id);
};
