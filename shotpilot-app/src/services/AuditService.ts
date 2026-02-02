import { Frame } from '../types/schema';

export interface AuditResult {
    tier: "LOCK IT IN" | "REFINE" | "REGENERATE";
    findings: string[];
    fixDelta: {
        add: string[];
        remove: string[];
        lock: string[];
    };
    scores: Frame['qualityScores'];
}

export class AuditService {
    static async runAudit(frame: Frame): Promise<AuditResult> {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock logic based on "Cine-AI Quality Control Pack"
        const isGood = Math.random() > 0.5;

        if (isGood) {
            return {
                tier: "LOCK IT IN",
                findings: ["Excellent realism", "Lighting is consistent", "Character matches reference"],
                fixDelta: { add: [], remove: [], lock: ["lighting", "lens"] },
                scores: {
                    aiSheenScore: 10,
                    lightingContinuity: 95,
                    characterIdentityLock: 98,
                    cinematicHierarchy: 90,
                    overallScore: 96
                }
            };
        } else {
            return {
                tier: "REFINE",
                findings: ["Slight AI sheen detected on textures", "Lighting direction drifts from scene canon", "Skin looks slightly plastic"],
                fixDelta: {
                    add: ["filmic grain", "imperfection"],
                    remove: ["smooth skin", "HDR"],
                    lock: ["lighting_source"]
                },
                scores: {
                    aiSheenScore: 45,
                    lightingContinuity: 70,
                    characterIdentityLock: 85,
                    cinematicHierarchy: 80,
                    overallScore: 78
                }
            };
        }
    }
}
