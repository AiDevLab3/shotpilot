import fs from 'fs';
import path from 'path';
import { buildContextBlock, callGemini } from './shared.js';

/**
 * Refine character or object suggestions through conversation.
 * Returns { response, contentUpdate, kbFilesUsed }.
 */
async function refineContent(context) {
    const { type, currentContent, message, history, project, kbContent } = context;
    const projectBlock = buildContextBlock('PROJECT', project);

    const systemInstruction = `You are refining a ${type} for an AI filmmaking project through conversation with the user. Listen carefully and update ONLY what they ask for. Keep everything else unchanged.`;

    const historyParts = (history || []).map(m =>
        `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.content}`
    ).join('\n');

    const userPrompt = `${kbContent ? `KNOWLEDGE BASE:\n${kbContent}\n\n` : ''}${projectBlock}

CURRENT ${type.toUpperCase()}:
${JSON.stringify(currentContent, null, 2)}

${historyParts ? `CONVERSATION SO FAR:\n${historyParts}\n` : ''}
USER REQUEST: ${message}

Respond conversationally (1-3 sentences acknowledging the change), then provide the COMPLETE updated ${type} as JSON.

OUTPUT VALID JSON ONLY:
{
  "response": "Your conversational reply about the changes made",
  "contentUpdate": { <the full updated ${type} object with all fields, reflecting the requested changes> }
}`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'medium',
            responseMimeType: 'application/json',
            maxOutputTokens: 2048,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                return { response: text, contentUpdate: null };
            }
        }
        return parsed;
    } catch (error) {
        console.error(`[gemini] ${type} refinement error:`, error);
        throw error;
    }
}

/**
 * Phase 3 Creative Director: conversational project development.
 * Returns { response, projectUpdates, scriptUpdates, kbFilesUsed }.
 */
async function creativeDirectorCollaborate(context) {
    const { project, message, history, scriptContent, mode, kbContent, characters, objects, scenes, imageUrls, targetModel, modelKBContent } = context;
    const projectBlock = buildContextBlock('PROJECT', project);

    // Build context blocks for characters, objects, scenes
    let fullContext = projectBlock;
    if (characters && characters.length > 0) {
        fullContext += '\n\nCHARACTERS IN PROJECT:\n' + characters.map(c =>
            `- ${c.name}${c.description ? ': ' + c.description : ''}${c.personality ? ' | Personality: ' + c.personality : ''}`
        ).join('\n');
    }
    if (objects && objects.length > 0) {
        fullContext += '\n\nOBJECTS/PROPS IN PROJECT:\n' + objects.map(o =>
            `- ${o.name}${o.description ? ': ' + o.description : ''}`
        ).join('\n');
    }
    if (scenes && scenes.length > 0) {
        fullContext += '\n\nSCENES IN PROJECT:\n' + scenes.map(s =>
            `- ${s.name}${s.description ? ': ' + s.description : ''}${s.location_setting ? ' | Location: ' + s.location_setting : ''}`
        ).join('\n');
    }

    // Build model-specific instruction block
    const modelInstruction = targetModel
        ? `\nTARGET MODEL: ${targetModel}
You have the full ${targetModel} Prompting Mastery guide loaded below. When generating ANY prompts, image descriptions, or visual specifications:
- Use EXACT syntax, parameters, and formatting that ${targetModel} requires
- Follow the model's specific language profile from the Translation Matrix
- Include model-specific parameters (e.g. Midjourney uses --s, --ar, --oref; Nano Banana uses physics-based specs; Higgsfield uses camera rig language)
- NEVER generate generic prompts — every prompt MUST be optimized for ${targetModel}
- Reference the loaded KB guide for correct syntax and best practices`
        : `\nNO TARGET MODEL SELECTED. If no model is selected, proactively recommend one based on the project's needs:
- For artistic/stylized hero stills: Midjourney
- For precise camera rig control and cinematic realism: Higgsfield Cinema Studio
- For iterative edits, text rendering, and identity-preserving refinement: GPT Image 1.5
- For physics-based realism and character consistency: Nano Banana Pro
- For video generation with natural motion: VEO 3.1 or Kling 2.6/3.0
Mention this recommendation naturally in conversation when visual direction or shot planning comes up. Tell the user they can select a model using the dropdown in the chat header.`;

    const systemInstruction = `You are an expert AI Creative Director — a seasoned collaborator who helps filmmakers develop their projects from concept to camera-ready. You have deep knowledge of cinematography, visual storytelling, script analysis, production planning, AND model-specific prompt engineering.

YOUR ROLE:
You are the filmmaker's creative partner. You see the entire project — script, characters, objects, scenes, and all visual direction. Guide them through every creative decision with real expertise.
${modelInstruction}

INTERNAL WORKFLOW (follow these strictly but NEVER reference them to the user):
1. SCRIPT FIRST: The script must be locked before committing to visual direction or image generation. If the user tries to jump to shots/visuals before the script is complete and cohesive, gently steer them back to finishing the script first — unless they explicitly say they want to skip ahead.
2. PROGRESSIVE DEVELOPMENT: Script → Characters & Objects → Visual Direction → Scene Planning → Shot Design. Each phase should be completed before moving to the next.
3. When the user provides a script, analyze it thoroughly: extract characters and objects (via characterCreations/objectCreations), then STOP. Do NOT proceed to scene breakdowns or shot design in the same response. After extracting characters/objects, guide the user to review them on the Characters and Objects pages. Mention that each entity has an "Enhance with AI" button that will expand bare-bones descriptions into production-ready detail using the script context, plus tools to upload reference images and generate prompts. The user should confirm characters and objects are fleshed out before moving on.
4. CHARACTERS & OBJECTS GATE: Do NOT create scenes (sceneCreations) or suggest diving into shot design until the user has explicitly confirmed their characters and objects are ready. Look at the CHARACTERS IN PROJECT and OBJECTS/PROPS IN PROJECT context above — if these lists are empty or characters lack detailed descriptions (just names from script extraction), the user hasn't locked this phase yet. Guide them there first.
5. When generating prompts, ALWAYS use the target model's specific syntax from the loaded KB.

TONE & STYLE (CRITICAL):
- Talk like a creative collaborator, NOT a rule-enforcing system. Never say things like "Following our Script First rule..." or "As per our workflow...". Just naturally guide the conversation.
- Be concise. Keep responses to 2-3 focused paragraphs max.
- Mention technical details (camera, lens, lighting) sparingly — only when directly relevant to a creative decision. Do NOT repeat camera specs in every response. One well-placed technical mention shows expertise; repeating it in every response becomes noise.
- Focus on the STORY and VISION. What does this scene FEEL like? What's the emotional intent? Technical specs support the vision, they don't lead it.
- NEVER write out full model-specific prompts in conversation. Prompt generation happens separately through the shot system. Your job here is creative direction — vision, story, character, mood — not prompt engineering. If the user asks for a prompt, tell them to use the Generate Prompt button on their shots in Scene Manager.

EXPERTISE VOICE (CRITICAL):
- When you reference KB knowledge, present it as YOUR expertise — not as a system rule or citation.
- BAD: "The Realism Pack says to avoid HDR" or "According to the KB, lighting should be motivated"
- GOOD: "That lighting is going to read as synthetic — every light source needs a physical origin in the scene. A window, a practical lamp, an overhead fluorescent. Without motivation, viewers subconsciously register it as fake."
- GOOD: "For this noir feel, I'd push the contrast ratio to at least 8:1 with a single hard source from above. Midjourney responds well to 'chiaroscuro, single light source' with --style raw, but if you're using Higgsfield, spec it out as a Zeiss Ultra Prime with a single harsh spotlight."
- When recommending against something, explain the WHY from cinematography craft, not just the rule.
- When model-specific knowledge is relevant, share it as practical advice: "Kling 3.0 handles multi-character scenes better than 2.6 because of Elements 3.0 identity locking" — not "the KB recommends Kling 3.0 for this."

CHARACTER CREATION & UPDATES (CRITICAL):
- When NEW characters are discussed, described, or extracted from a script, include them in "characterCreations".
- Each character needs at minimum a name and description. Include personality if discussed.
- This happens silently in the background — don't tell the user "I'm creating a character entry" unless they ask.
- IMPORTANT: Extracting characters from a script is just step 1. After extraction, either guide the user to the Characters page OR collaborate with them right here to flesh out each character's details.
- When the user wants to flesh out or refine an EXISTING character (one already in CHARACTERS IN PROJECT above), use "characterUpdates" instead. Match by name and provide the updated description and/or personality.
- ENHANCEMENT QUALITY: When fleshing out a character — whether creating or updating — write production-ready descriptions optimized for AI image generation. Include specific physical details: face (eye color, nose shape, jawline, distinguishing marks), age & skin (specific age range, skin tone with undertones), hair (style, color, length, texture), build & posture (body type, posture habits), wardrobe (default clothing, accessories). Ground every detail in the script and story context. For personality, include 2-3 core traits with behavioral mannerisms that guide expression and body language.

OBJECT CREATION & UPDATES (CRITICAL):
- When NEW objects or props are discussed, described, or extracted from a script, include them in "objectCreations".
- Each object needs at minimum a name and description. Focus on material, color, texture, condition, scale, and distinctive features.
- This happens silently in the background — don't tell the user "I'm creating an object entry" unless they ask.
- Only create objects that are SPECIFIC PROPS relevant to the story (e.g. "The Specialist's tactical bag", "vintage rotary phone"). Do NOT create generic scene elements (e.g. "table", "chair", "wall") unless they are narratively significant.
- When the user wants to flesh out or refine an EXISTING object (one already in OBJECTS/PROPS IN PROJECT above), use "objectUpdates" instead. Match by name and provide the updated description.
- ENHANCEMENT QUALITY: When fleshing out an object — whether creating or updating — write production-ready descriptions. Include exact material, color, texture, condition (new/worn/damaged), dimensions/scale relative to human, distinctive features, and contextual placement. Ground details in the story — if the script says it's a battered leather journal, describe the specific wear patterns, stain marks, page yellowing.

SCENE CREATION (CRITICAL):
- ONLY create scenes when the user EXPLICITLY asks for a scene breakdown, shot list, or says something like "create the scenes", "break it down into scenes", "generate the scene list", or "I'm ready for scenes".
- Do NOT create scenes automatically during script discussion, character development, or visual direction conversations. Finalize the script and direction FIRST.
- PREREQUISITE CHECK: Before creating scenes, verify that CHARACTERS IN PROJECT above has entries with real descriptions (not just names). If the character list is empty or characters only have bare-minimum data from script extraction, do NOT create scenes. Instead, naturally guide the user: they can use "Enhance with AI" on each character/object to expand descriptions using script context, upload reference images, and generate prompts. Once entities are fleshed out, come back for the scene breakdown.
- When triggered AND prerequisites are met, create ALL scenes at once as a complete breakdown — not one at a time across multiple messages.
- Each scene needs: name, description, location_setting, time_of_day, mood_tone. Include suggestedShots if you have enough context.
- Each suggestedShot needs: shot_type (e.g. "Wide Shot", "Medium Shot", "Close-up"), camera_angle, description, and purpose.

PROJECT INFO UPDATES (CRITICAL — BE CONSERVATIVE):
- Fields you can update: title, frame_size, purpose, lighting_directions, style_aesthetic, storyline_narrative, cinematography, atmosphere_mood, cinematic_references
- ONLY update projectUpdates when the user is DIRECTLY discussing project-level visual direction, style, or narrative. Do NOT update project info when discussing individual characters, objects, or specific scene details.
- Project info should capture the MACRO look — the high-level aesthetic blueprint. Character-specific details (wardrobe, gear textures) belong in the character description, NOT in project info.
- If project info fields are already populated, do NOT overwrite them unless the user explicitly asks to change the project direction. Avoid appending character-specific details to existing style fields.
- When in doubt, set projectUpdates to null. It is always safer to NOT update than to overwrite established direction.

IMAGE ANALYSIS (CRITICAL):
- When the user shares an image, your default behavior is to AUDIT it against the project's EXISTING visual direction. Use the Quality Control Visual Audit criteria:
  - Does the style match what's established? (lighting, color, mood, composition)
  - Is character identity consistent? (face, hair, wardrobe, build)
  - Does the lighting match the project's lighting direction?
  - Does the color/tonality match the established aesthetic?
- Report what aligns and what diverges. Do NOT update projectUpdates based on the image unless the user explicitly says they want to use this image to SET or LOCK the project style (e.g. "use this as our look", "match this style", "lock this aesthetic").
- If the image is a character reference, note how it fits the character's established description. Update the character description if the user asks you to.

IMAGE-TO-ENTITY WORKFLOW (CRITICAL):
- When the user shares an image and says it's for a specific character or object (e.g. "here's the image I have for the vehicle", "this is what Marcus looks like"), you should:
  1. Create or update the entity with a detailed, production-ready description based on what you see in the image AND what the user tells you about it.
  2. Set "referenceImageUrl" to the EXACT URL of the image the user shared (it will be in the image context above). This attaches the image to the entity as its reference image.
  3. Ask the user if they have the prompt they used to generate the image — if they provide it, include it as "referenceImagePrompt". This helps with iteration and turnarounds later.
  4. In your response, naturally confirm what you've done: mention you've created/updated the entity with their image and details, and that they can audit the image quality on the entity's page for any recommended refinements.
- The image URLs you receive look like "/uploads/filename.ext" — use this exact URL in referenceImageUrl, do NOT modify it.
- This workflow lets the user stay in the conversation instead of having to navigate to the Characters/Objects page to upload images manually.`;

    // Format history — handle compacted summary messages specially
    const recentHistory = (history || []).slice(-14);
    const historyParts = recentHistory.map(m => {
        if (m.role === 'summary') return `[CONTEXT DIGEST — earlier conversation compacted]:\n${m.content}`;
        return `${m.role === 'user' ? 'USER' : 'DIRECTOR'}: ${m.content}`;
    }).join('\n');

    const userPrompt = `${modelKBContent ? `MODEL-SPECIFIC KNOWLEDGE BASE (${targetModel}):\n${modelKBContent}\n\n` : ''}${kbContent ? `CORE KNOWLEDGE BASE:\n${kbContent}\n\n` : ''}${fullContext}

${scriptContent ? `CURRENT SCRIPT${scriptContent.length > 15000 ? ` (TRUNCATED — showing first 15,000 of ${scriptContent.length} characters, later scenes may be cut off)` : ''}:\n${scriptContent.substring(0, 15000)}\n` : 'NO SCRIPT YET.\n'}
MODE: ${mode || 'initial'}

${historyParts ? `RECENT CONVERSATION:\n${historyParts}\n` : ''}
USER: ${message}

Respond as the Creative Director. End with a question or clear next step.${targetModel ? ` Any prompts MUST use ${targetModel}-specific syntax from the loaded KB.` : ''}

OUTPUT VALID JSON ONLY:
{
  "response": "Your creative director response (markdown supported)",
  "projectUpdates": null or { "field_name": "suggested value", ... },
  "scriptUpdates": null or "THE COMPLETE FULL SCRIPT with changes integrated — NEVER a partial fragment. If you modify one scene, you MUST return the entire script including ALL unchanged scenes. If the script is too long to return in full, set scriptUpdates to null and describe the changes in your response instead so the user can make the edit manually.",
  "characterCreations": null or [{ "name": "Character Name", "description": "Physical/visual description", "personality": "Personality traits", "referenceImageUrl": "URL of the user's uploaded image to attach as reference (from the images shared in this message), or null" }],
  "characterUpdates": null or [{ "name": "Existing Character Name (must match exactly)", "description": "Updated full description (replaces existing)", "personality": "Updated personality (replaces existing)", "referenceImageUrl": "URL of user's uploaded image to attach, or null" }],
  "objectCreations": null or [{ "name": "Object Name", "description": "Physical description: material, color, texture, condition, scale, distinctive features", "referenceImageUrl": "URL of user's uploaded image to attach as reference, or null", "referenceImagePrompt": "The prompt the user said they used to generate this image, or null" }],
  "objectUpdates": null or [{ "name": "Existing Object Name (must match exactly)", "description": "Updated full description (replaces existing)", "referenceImageUrl": "URL of user's uploaded image to attach, or null", "referenceImagePrompt": "The prompt the user said they used to generate this image, or null" }],
  "sceneCreations": null or [{ "name": "Scene name", "description": "Scene description", "location_setting": "Where", "time_of_day": "Day/Night/Dawn/Dusk", "mood_tone": "Emotional tone", "suggestedShots": [{ "shot_type": "Wide Shot", "camera_angle": "Eye Level", "description": "What this shot captures", "purpose": "Why needed" }] }]
}`;

    // Build parts array — include images if provided
    const parts = [];
    const resolvedImages = Array.isArray(imageUrls) ? imageUrls : [];
    let loadedImageCount = 0;

    for (const url of resolvedImages) {
        try {
            const imagePath = url.startsWith('/')
                ? path.join(process.cwd(), url)
                : url;

            if (fs.existsSync(imagePath)) {
                const imageData = fs.readFileSync(imagePath);
                let mimeType = 'image/jpeg';
                const ext = path.extname(imagePath).toLowerCase();
                if (ext) {
                    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
                    mimeType = mimeMap[ext] || 'image/jpeg';
                } else {
                    if (imageData[0] === 0x89 && imageData[1] === 0x50) mimeType = 'image/png';
                    else if (imageData[0] === 0x47 && imageData[1] === 0x49) mimeType = 'image/gif';
                    else if (imageData[0] === 0x52 && imageData[1] === 0x49) mimeType = 'image/webp';
                }
                parts.push({ inlineData: { mimeType, data: imageData.toString('base64') } });
                loadedImageCount++;
            } else {
                console.warn('[gemini] Creative director: image file not found:', imagePath);
            }
        } catch (err) {
            console.warn('[gemini] Creative director: could not load image:', err.message);
        }
    }

    if (loadedImageCount > 0) {
        const imageLabel = loadedImageCount === 1
            ? '↑ User shared this reference image.'
            : `↑ User shared ${loadedImageCount} reference images.`;
        const imageUrlList = resolvedImages.map((url, i) => `  Image ${i + 1} URL: ${url}`).join('\n');
        parts.push({ text: `${imageLabel}\nImage URLs (use these exact URLs in referenceImageUrl if attaching to an entity):\n${imageUrlList}\n\n${userPrompt}` });
    } else {
        parts.push({ text: userPrompt });
    }

    try {
        const text = await callGemini({
            parts,
            systemInstruction,
            thinkingLevel: 'high',
            responseMimeType: 'application/json',
            maxOutputTokens: 3072,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            // Fallback 1: Extract JSON object from surrounding text
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                } catch (e2) {
                    // Fallback 2: Try to sanitize common JSON issues (trailing commas, unescaped newlines in strings)
                    let sanitized = jsonMatch[0]
                        .replace(/,\s*([}\]])/g, '$1')           // trailing commas
                        .replace(/[\x00-\x1f]/g, (ch) =>         // control chars in strings
                            ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t' : ''
                        );
                    try {
                        parsed = JSON.parse(sanitized);
                    } catch (e3) {
                        // Fallback 3: Extract just the response text so user sees something useful
                        console.warn('[gemini] Could not parse Creative Director JSON, extracting response text');
                        const responseMatch = text.match(/"response"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                        const responseText = responseMatch
                            ? responseMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                            : text.substring(0, 500);
                        parsed = { response: responseText, projectUpdates: null, scriptUpdates: null, characterCreations: null, objectCreations: null, sceneCreations: null };
                    }
                }
            } else {
                parsed = { response: text, projectUpdates: null, scriptUpdates: null, characterCreations: null, objectCreations: null, sceneCreations: null };
            }
        }
        return parsed;
    } catch (error) {
        console.error('[gemini] Creative director error:', error);
        throw error;
    }
}

/**
 * Summarize/compact a Creative Director conversation into a concise context digest.
 * Preserves key creative decisions, character/scene notes, style direction, and script state.
 */
async function summarizeConversation({ messages, scriptContent, projectTitle }) {
    const systemInstruction = `You are an expert conversation summarizer for a cinematography AI tool called ShotPilot.
Your job is to distill a Creative Director conversation into a concise CONTEXT DIGEST that preserves every important creative decision while discarding conversational filler.

OUTPUT FORMAT — return valid JSON:
{
  "summary": "A concise paragraph (3-6 sentences) capturing the creative vision, decisions made, and current direction.",
  "keyDecisions": ["decision 1", "decision 2", ...],
  "characterNotes": "Any character details discussed (or null if none)",
  "sceneNotes": "Any scene/shot details discussed (or null if none)",
  "styleDirection": "Visual style, lighting, mood, cinematography notes (or null if none)",
  "openQuestions": "Anything left unresolved or still being explored (or null if none)"
}

RULES:
- Be concise but preserve EVERY creative decision and specific detail (names, styles, references, technical choices)
- Discard greetings, pleasantries, workflow explanations, error messages, and repeated content
- If the user gave a script or story outline, summarize the plot briefly — don't reproduce the full text
- Preserve any model-specific notes (e.g. "targeting Higgsfield", "anamorphic 2.39:1")`;

    const conversationText = messages.map(m =>
        `${m.role === 'user' ? 'USER' : 'DIRECTOR'}: ${m.content}`
    ).join('\n\n');

    const userPrompt = `PROJECT: ${projectTitle || 'Untitled'}
${scriptContent ? `SCRIPT STATUS: Script exists (${scriptContent.length} chars)` : 'NO SCRIPT YET'}

CONVERSATION TO SUMMARIZE:
${conversationText}

Summarize this conversation into a context digest.`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'low',
            responseMimeType: 'application/json',
            maxOutputTokens: 1024,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                return { summary: text, keyDecisions: [], characterNotes: null, sceneNotes: null, styleDirection: null, openQuestions: null };
            }
        }
        return parsed;
    } catch (error) {
        console.error('[gemini] Summarize conversation error:', error);
        throw error;
    }
}

export {
    refineContent,
    creativeDirectorCollaborate,
    summarizeConversation,
};
