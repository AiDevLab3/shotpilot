import type { Frame, Shot, Scene, ProjectDNA, SoulID, EntityID } from '../types/schema';
import { REALISM_PACK } from '../constants/realismPack';

export interface PromptBundle {
    intentBlock: string;
    projectLookBlock: string;
    realismPackBlock: string;
    modelWrapperBlock: string;
    fullPrompt: string; // The final string to send to the API
    negativePrompt: string;
    params: Record<string, any>;

    // Nano Banana Pro Fields
    editGoal?: string | null; // cleanup | style_adjust | object_change | inpaint | outpaint | null
    editInstructions?: string | null;
    editMaskNotes?: string | null;
}

export class PromptCompiler {
    static compile(
        frame: Frame,
        shot: Shot,
        scene: Scene,
        project: ProjectDNA,
        soulIds: Record<string, SoulID>,
        _entityIds: Record<string, EntityID>,
        userIntent?: string
    ): PromptBundle {

        // 1. Scene Intent Block
        const intentBlock = buildIntentBlock(shot, scene, soulIds, userIntent);

        // 2. Project Look Block
        const projectLookBlock = buildProjectLookBlock(project);

        // 3. Realism Pack Block
        const realismPackBlock = buildRealismPackBlock(shot, scene, project);

        // 4. Model Wrapper Block (and final assembly)
        let modelWrapperBlock = "";
        let fullPrompt = "";
        let negativePrompt = REALISM_PACK.UNIVERSAL_NEGATIVES;
        let params: Record<string, any> = {};

        // Nano Banana Pro Editing Logic
        if (frame.model === "nano_banana_pro" && frame.asset?.operationType === "edit") {
            // Conversational Edit
            // Default editGoal must be "cleanup"
            const allowedGoals = ["cleanup", "style_adjust", "object_change", "inpaint", "outpaint"];
            let editGoal = frame.promptBundle?.editGoal as string;
            if (!editGoal || !allowedGoals.includes(editGoal)) {
                editGoal = "cleanup";
            }

            const editInstr = frame.promptBundle?.editInstructions || userIntent || "Cleanup AI artifacts, reduce AI sheen, and match cinematic realism while preserving identity.";
            const editMaskNotes = frame.promptBundle?.editMaskNotes || null;

            // Construct conversational prompt
            modelWrapperBlock = `[EDIT_MODE: ${editGoal}] ${editInstr}`;

            // Logic: "Subject: [Intent]. Look: [ProjectLook]. Edit: [Instruction]. Mask: [Notes]"
            // Must include projectLookBlock for consistency

            fullPrompt = `[CONTEXT]: ${intentBlock}\n[STYLE]: ${projectLookBlock}\n[EDIT_INSTRUCTION]: ${editInstr}\n[MASK_NOTES]: ${editMaskNotes || "None"}\n[CONSTRAINTS]: ${realismPackBlock}`;

            return {
                intentBlock,
                projectLookBlock,
                realismPackBlock,
                modelWrapperBlock,
                fullPrompt, // In a real API, this might be split. For MVP, we store the logical prompt.
                negativePrompt,
                params,
                editGoal,
                editInstructions: editInstr,
                editMaskNotes
            };
        }

        // Standard Generation Logic
        switch (frame.model) {
            case "nano_banana_pro":
                // Nano Banana Skeleton: Subject, Composition, Action, Location, Style, Camera, Lighting, Negatives
                modelWrapperBlock = formatNanoBanana(intentBlock, projectLookBlock, realismPackBlock, shot);
                fullPrompt = modelWrapperBlock;
                break;

            case "higgsfield_cinema_studio_v1_5":
            default:
                // Default fallback
                modelWrapperBlock = `${intentBlock}\n\n${projectLookBlock}\n\n${realismPackBlock}`;
                fullPrompt = modelWrapperBlock;
                break;
        }

        return {
            intentBlock,
            projectLookBlock,
            realismPackBlock,
            modelWrapperBlock,
            fullPrompt,
            negativePrompt,
            params
        };
    }
}

function buildIntentBlock(shot: Shot, scene: Scene, soulIds: Record<string, SoulID>, userIntent?: string): string {
    if (userIntent) return userIntent;

    // Auto-construct
    const characterNames = shot.characterIds.map((id: string) => soulIds[id]?.name).join(", ") || "No characters";
    return `Scene: ${scene.name}. Action: ${scene.description}. Shot: ${shot.shotType}. Subject: ${characterNames}. Blocking: ${shot.composition.blocking}.`;
}

function buildProjectLookBlock(project: ProjectDNA): string {
    return `Look: ${project.lookName}. Lighting Phil: ${project.lightingPhilosophy}. Palette: ${project.colorPalette.temperature}, ${project.colorPalette.saturation}.`;
}

function buildRealismPackBlock(shot: Shot, scene: Scene, project: ProjectDNA): string {
    const lens = shot.cameraRig.lens || REALISM_PACK.LENS_DEFAULTS.environment;
    const aperture = shot.cameraRig.aperture || "f/8";
    const lighting = shot.locks.lightingLocked ? "Shot Locked Lighting" : (scene.lightingLock ? `Scene Light: ${scene.lightingLock.source}, ${scene.lightingLock.direction}` : "Natural lighting");

    return `
${REALISM_PACK.LOCK_BLOCK}

OPTICS: ${lens}, ${aperture}.
LIGHTING: ${lighting}.
REALISM_MODE: ${project.realismPackVersion}.
    `.trim();
}

function formatNanoBanana(intent: string, look: string, realism: string, shot: Shot): string {
    // Nano Banana Pro "Golden Rules" formatting
    return `
SUBJECT: ${intent}
STYLE: ${look}
REALISM_CONSTRAINTS: ${realism}
CAMERA: ${shot.cameraRig.lens}, ${shot.cameraRig.aperture}
COMPOSITION: ${shot.composition.framing}
    `.trim();
}
