/**
 * RAG-Powered Prompt Compiler
 * 
 * Combines the standalone compiler's expert prompt translation with:
 * - RAG-powered contextual KB loading (not static files)
 * - ShotPilot's multimodal reference images (character/object photos)
 * - Full project/scene/shot/character/object context from the DB
 * - Style profiles from project settings
 * 
 * This replaces both:
 * - /compiler/src/compiler.js (standalone, static KB)
 * - /server/services/ai/promptGeneration.js (weaker prompts, but had multimodal)
 */
import { callGemini, buildImageParts } from './shared.js';
import { queryForModel, queryKB, queryForStyle } from '../../rag/query-simple.js';

// ============ RAG-POWERED KB LOADING ============

/**
 * Load contextually relevant KB for a specific model + shot.
 * Instead of static tier files, queries RAG for exactly what this shot needs.
 */
function loadKBViaRAG(modelId, shotContext = {}) {
    const sections = [];
    let totalTokens = 0;

    // 1. Model-specific syntax & tips (always needed)
    const syntaxChunks = queryForModel(modelId, ['syntax', 'tips'], 15);
    if (syntaxChunks.length > 0) {
        const syntaxText = syntaxChunks.map(c => c.text).join('\n\n');
        sections.push({ label: 'MODEL SYNTAX & TIPS', text: syntaxText });
        totalTokens += syntaxChunks.reduce((sum, c) => sum + (c.metadata?.tokens || 50), 0);
    }

    // 2. Model-specific failure modes (critical for avoiding known pitfalls)
    const failureChunks = queryForModel(modelId, ['failures'], 10);
    if (failureChunks.length > 0) {
        const failureText = failureChunks.map(c => c.text).join('\n\n');
        sections.push({ label: 'KNOWN FAILURE MODES', text: failureText });
        totalTokens += failureChunks.reduce((sum, c) => sum + (c.metadata?.tokens || 50), 0);
    }

    // 3. Core realism principles (always included)
    const coreChunks = queryKB('realism core principles anti-artifact', { category: 'principles' }, 8);
    if (coreChunks.length > 0) {
        const coreText = coreChunks.map(c => c.text).join('\n\n');
        sections.push({ label: 'CORE REALISM PRINCIPLES', text: coreText });
        totalTokens += coreChunks.reduce((sum, c) => sum + (c.metadata?.tokens || 50), 0);
    }

    // 4. Contextual pack loading based on what the shot actually needs
    const contextKeywords = buildContextKeywords(shotContext);
    if (contextKeywords.length > 0) {
        const packChunks = queryKB(contextKeywords.join(' '), { category: 'pack' }, 10);
        if (packChunks.length > 0) {
            const packText = packChunks.map(c => c.text).join('\n\n');
            sections.push({ label: 'TECHNIQUE PACKS', text: packText });
            totalTokens += packChunks.reduce((sum, c) => sum + (c.metadata?.tokens || 50), 0);
        }
    }

    // 5. Style-specific knowledge if project has a defined style
    if (shotContext.style) {
        const styleChunks = queryForStyle(shotContext.style, 5);
        if (styleChunks.length > 0) {
            const styleText = styleChunks.map(c => c.text).join('\n\n');
            sections.push({ label: 'STYLE KNOWLEDGE', text: styleText });
            totalTokens += styleChunks.reduce((sum, c) => sum + (c.metadata?.tokens || 50), 0);
        }
    }

    // 6. Translation matrix (how to convert generic concepts to this model's language)
    const translationChunks = queryForModel(modelId, ['translation'], 5);
    if (translationChunks.length === 0) {
        // Try general translation
        const generalTranslation = queryKB('translation matrix model syntax', { category: 'translation' }, 5);
        if (generalTranslation.length > 0) {
            sections.push({ label: 'TRANSLATION MATRIX', text: generalTranslation.map(c => c.text).join('\n\n') });
        }
    } else {
        sections.push({ label: 'TRANSLATION MATRIX', text: translationChunks.map(c => c.text).join('\n\n') });
    }

    console.log(`[ragCompiler] KB loaded for ${modelId}: ${sections.length} sections, ~${totalTokens} tokens`);

    return {
        content: sections.map(s => `=== ${s.label} ===\n${s.text}`).join('\n\n'),
        sections: sections.map(s => s.label),
        tokens: totalTokens,
    };
}

/**
 * Analyze shot context to determine which technique packs are relevant.
 */
function buildContextKeywords(ctx) {
    const keywords = [];
    
    if (ctx.hasCharacters) keywords.push('character', 'face', 'identity', 'consistency');
    if (ctx.shotType) {
        const st = ctx.shotType.toLowerCase();
        if (st.includes('close')) keywords.push('close-up', 'detail', 'facial', 'texture');
        if (st.includes('wide') || st.includes('establishing')) keywords.push('spatial', 'composition', 'environment', 'depth');
        if (st.includes('tracking') || st.includes('dolly')) keywords.push('motion', 'movement', 'camera');
        if (st.includes('action')) keywords.push('motion', 'dynamic', 'movement');
    }
    if (ctx.mood) {
        const mood = ctx.mood.toLowerCase();
        if (mood.includes('noir') || mood.includes('dark')) keywords.push('noir', 'contrast', 'shadow');
        if (mood.includes('warm') || mood.includes('golden')) keywords.push('warm', 'golden', 'lighting');
    }
    if (ctx.lighting) keywords.push('lighting', ctx.lighting);
    if (ctx.cameraMovement && ctx.cameraMovement !== 'Static') keywords.push('motion', 'movement', ctx.cameraMovement);

    return keywords;
}

// ============ BRIEF BUILDER ============

/**
 * Build a comprehensive creative brief from ShotPilot's DB context.
 */
function buildBrief(project, scene, shot, characters, objects) {
    const lines = [];
    
    lines.push(`DESCRIPTION: ${shot.description || 'No description provided'}`);
    if (shot.shot_type) lines.push(`SHOT TYPE: ${shot.shot_type}`);
    if (shot.camera_angle) lines.push(`CAMERA ANGLE: ${shot.camera_angle}`);
    if (shot.camera_movement) lines.push(`CAMERA MOVEMENT: ${shot.camera_movement}`);
    if (shot.focal_length) lines.push(`FOCAL LENGTH: ${shot.focal_length}`);
    if (shot.camera_lens) lines.push(`CAMERA/LENS: ${shot.camera_lens}`);
    if (shot.blocking) lines.push(`BLOCKING: ${shot.blocking}`);
    if (shot.desired_duration) lines.push(`DURATION: ${shot.desired_duration}`);

    // Scene context
    if (scene) {
        if (scene.location) lines.push(`LOCATION: ${scene.location}`);
        if (scene.time_of_day) lines.push(`TIME OF DAY: ${scene.time_of_day}`);
        if (scene.mood_tone) lines.push(`MOOD: ${scene.mood_tone}`);
        if (scene.lighting_notes) lines.push(`LIGHTING: ${scene.lighting_notes}`);
    }

    // Characters
    if (characters?.length > 0) {
        lines.push('\nCHARACTERS:');
        characters.forEach(c => {
            let line = `  - ${c.name}`;
            if (c.description) line += `: ${c.description}`;
            if (c.personality) line += ` (${c.personality})`;
            if (c.wardrobe) line += ` [Wardrobe: ${c.wardrobe}]`;
            lines.push(line);
        });
    }

    // Objects
    if (objects?.length > 0) {
        lines.push('\nOBJECTS/PROPS:');
        objects.forEach(o => {
            let line = `  - ${o.name}`;
            if (o.description) line += `: ${o.description}`;
            lines.push(line);
        });
    }

    return lines.join('\n');
}

/**
 * Build style profile text from project settings.
 */
function buildStyleText(project) {
    const lines = [];
    if (project.style_aesthetic) lines.push(`Aesthetic: ${project.style_aesthetic}`);
    if (project.mood) lines.push(`Mood: ${project.mood}`);
    if (project.cinematography) lines.push(`Cinematography: ${project.cinematography}`);
    if (project.lighting) lines.push(`Lighting: ${project.lighting}`);
    if (project.frame_size) lines.push(`Frame: ${project.frame_size}`);
    if (project.references) lines.push(`References: ${project.references}`);
    if (project.color_palette) lines.push(`Color Palette: ${project.color_palette}`);
    if (project.avoid_list) lines.push(`AVOID: ${project.avoid_list}`);
    return lines.length > 0 ? 'STYLE PROFILE:\n  ' + lines.join('\n  ') : '';
}

// ============ MAIN COMPILER ============

/**
 * Compile a prompt using RAG-powered KB + full project context + multimodal references.
 * 
 * This is the main entry point — replaces both the old compiler and promptGeneration.js.
 */
async function compile({ project, scene, shot, characters, objects, targetModel, qualityTier = 'production' }) {
    const hasChars = characters && characters.length > 0;

    // 1. Load contextually relevant KB via RAG
    const kb = loadKBViaRAG(targetModel, {
        shotType: shot.shot_type,
        mood: scene?.mood_tone || project?.mood,
        lighting: scene?.lighting_notes || project?.lighting,
        style: project?.style_aesthetic,
        cameraMovement: shot.camera_movement,
        hasCharacters: hasChars,
    });

    // 2. Build the creative brief from all available context
    const briefText = buildBrief(project, scene, shot, characters, objects);
    const styleText = buildStyleText(project);

    // 3. Build multimodal reference image parts
    const { parts: imageParts, imageMap } = buildImageParts(characters, objects);

    // Image reference instructions for the prompt
    let imageRefInstructions = '';
    if (imageMap.length > 0) {
        imageRefInstructions = '\nREFERENCE IMAGES PROVIDED:\n' +
            imageMap.map(m => `  Image ${m.imageNum}: ${m.name} (${m.type})`).join('\n') +
            '\n\nCRITICAL: Reference these images by number in the generated prompt. ' +
            'Follow the KB\'s documented syntax for reference image inputs. ' +
            'Include identity-locking instructions for each character with a reference image.';
    }

    // 4. Build the system instruction (from the compiler, battle-tested)
    const systemInstruction = `You are the Cine-AI Prompt Compiler — an expert system that translates creative briefs into model-specific prompts. You have deep knowledge of how ${targetModel} interprets prompt language — its exact syntax, parameters, strengths, and failure modes.

You are working within ShotPilot, a professional filmmaking studio. The user has provided full project context including style profiles, scene details, shot specifications, and character/object references. Your job is to compile all of this into the perfect prompt for ${targetModel}.

CRITICAL RULES:
1. Output ONLY the ready-to-use prompt. No preamble, no explanation, no markdown.
2. Follow the ${targetModel} KB syntax EXACTLY — parameters, structure, word order.
3. Include safety framing: "Cinematic film still" or "A scene from a feature film" to pass content filters. Do NOT describe crew, cameras, or behind-the-scenes elements — the frame should look like a final film frame, not a BTS photo.
4. Include anti-AI-artifact language: avoid CGI, plastic skin, HDR glow, hyper-detailed, 8K clarity, waxy texture.
5. Include filmic entropy: natural grain, motivated lighting with physical sources, micro-imperfections.
6. Reference characters by EXACT NAME from the brief.
7. Every technical choice (lens, f-stop, lighting) must be specifically motivated by the shot's intent.
8. The brief description is THE NON-NEGOTIABLE INTENT. Do not trade brief adherence for technical polish.
${imageRefInstructions ? '\n9. When reference images are provided, include explicit image references following the model KB syntax.' : ''}

SAFETY-AWARE FRAMING (CRITICAL):
AI image models have content safety filters. Frame the prompt as a FILM PRODUCTION:
- Use "Film still from a movie production" framing
- Weapons as PROPS: "prop revolver", "rubber stunt knife"
- Violence as choreography: "choreographed stunt", "dramatic scene"
- This preserves cinematic look while passing safety filters. Apply silently.

ASSUMPTIONS STYLE:
When listing assumptions, explain choices with specific technical reasoning.
BAD: "Applied Realism Pack" or "Used standard lighting"
GOOD: "Chose 50mm at f/4 for natural facial proportions — avoids the wide-angle distortion that ${targetModel} tends to exaggerate"
Reference model-specific behaviors and KB principles when relevant.`;

    // 5. Build the user prompt
    const userPrompt = `${kb.content}

${styleText}

CREATIVE BRIEF:
${briefText}
${imageRefInstructions}

QUALITY TIER: ${qualityTier.toUpperCase()}
${qualityTier === 'draft' ? '⚠️ Some context missing — make reasonable inferences based on the style profile and scene.' : '✅ Full context available — use everything.'}

TARGET MODEL: ${targetModel}

Generate the ${targetModel}-optimized prompt now. Output the prompt first, then on a new line starting with "// Assumptions:" list your technical choices and why.`;

    // 6. Call Gemini with multimodal parts (reference images + text)
    const allParts = [...imageParts, { text: userPrompt }];

    const result = await callGemini({
        parts: allParts,
        systemInstruction,
        thinkingLevel: 'high',
        responseType: 'text',
    });

    // 7. Parse prompt and assumptions
    const splitIdx = result.indexOf('// Assumptions:');
    const compiledPrompt = splitIdx > -1 ? result.substring(0, splitIdx).trim() : result.trim();
    const assumptions = splitIdx > -1
        ? result.substring(splitIdx).split('\n')
            .filter(l => l.trim().startsWith('//') || l.trim().startsWith('-'))
            .map(l => l.replace(/^\/\/\s*-?\s*/, '').replace(/^-\s*/, '').trim())
            .filter(Boolean)
        : [];

    console.log(`[ragCompiler] Compiled for ${targetModel}: ${compiledPrompt.length} chars, ${assumptions.length} assumptions, KB: ${kb.sections.join(', ')}`);

    return {
        prompt: compiledPrompt,
        assumptions: assumptions.join('\n'),
        tokensUsed: kb.tokens,
        model: targetModel,
        kbSections: kb.sections,
    };
}

/**
 * Refine a prompt based on audit feedback while staying anchored to the original brief.
 * Uses RAG to load model-specific refinement knowledge.
 */
async function refine({ currentPrompt, auditResult, brief, project, scene, shot, characters, objects, targetModel }) {
    const kb = loadKBViaRAG(targetModel, {
        shotType: shot?.shot_type,
        hasCharacters: characters?.length > 0,
    });

    // Build multimodal parts for reference images
    const { parts: imageParts, imageMap } = buildImageParts(characters || [], objects || []);

    const briefText = buildBrief(project, scene, shot, characters, objects);

    // Identify weak vs strong dimensions
    const dims = auditResult.dimensions || {};
    const weak = [];
    const strong = [];
    for (const [key, val] of Object.entries(dims)) {
        const score = typeof val === 'object' ? val.score : val;
        const notes = typeof val === 'object' ? val.notes : '';
        if (score <= 6) weak.push({ dimension: key, score, notes });
        else strong.push({ dimension: key, score });
    }

    const systemInstruction = `You are the Cine-AI Prompt Refiner. You receive a prompt that was used to generate an image, along with an audit of that image and the ORIGINAL creative brief.

Your job: surgically fix the prompt to address the weak dimensions while PRESERVING everything that scored well.

CRITICAL RULES:
1. The ORIGINAL BRIEF is your north star. Every change must serve the brief's intent.
2. Do NOT rewrite the whole prompt. Make targeted, minimal changes.
3. Preserve high-scoring aspects — if lighting scored 9/10, don't touch lighting language.
4. Output ONLY the refined prompt. No preamble, no explanation.
5. After the prompt, on a new line starting with "// Changes:", list what you changed and why.`;

    const userPrompt = `${kb.content}

ORIGINAL CREATIVE BRIEF:
${briefText}

CURRENT PROMPT:
${currentPrompt}

AUDIT RESULTS:
Overall Score: ${auditResult.overall_score}/100
Recommendation: ${auditResult.recommendation}
Summary: ${auditResult.summary}

WEAK DIMENSIONS (fix these):
${weak.map(w => `- ${w.dimension}: ${w.score}/10 — ${w.notes}`).join('\n') || 'None'}

STRONG DIMENSIONS (preserve these):
${strong.map(s => `- ${s.dimension}: ${s.score}/10`).join('\n') || 'None'}

SPECIFIC FIXES SUGGESTED:
${(auditResult.prompt_fixes || []).map(f => `- ${f}`).join('\n') || 'None'}

Refine the prompt now. Targeted fixes only. Stay anchored to the original brief.`;

    const allParts = [...imageParts, { text: userPrompt }];

    const result = await callGemini({
        parts: allParts,
        systemInstruction,
        thinkingLevel: 'high',
        responseType: 'text',
    });

    const splitIdx = result.indexOf('// Changes:');
    const refinedPrompt = splitIdx > -1 ? result.substring(0, splitIdx).trim() : result.trim();
    const changes = splitIdx > -1
        ? result.substring(splitIdx).split('\n')
            .filter(l => l.trim().startsWith('//') || l.trim().startsWith('-'))
            .map(l => l.replace(/^\/\/\s*-?\s*/, '').replace(/^-\s*/, '').trim())
            .filter(Boolean)
        : [];

    return { prompt: refinedPrompt, changes };
}

export { compile, refine, loadKBViaRAG };
