/**
 * Parse @mentions from shot text fields and match against project characters/objects.
 *
 * Supports two formats:
 *   @CharacterName     — simple name match (case-insensitive)
 *   @"Character Name"  — quoted for names with spaces
 *
 * Returns the subset of characters/objects that are mentioned in the shot.
 * If no @mentions are found, returns all characters/objects (backward-compatible).
 */

/**
 * Extract raw @mention names from a text string.
 * Handles: @SingleWord, @"Multi Word Name", @Multi-Hyphenated-Name
 */
function extractMentionNames(text) {
    if (!text) return [];

    const mentions = [];
    // Match @"quoted name" or @word (letters, digits, hyphens, underscores, apostrophes)
    const regex = /@"([^"]+)"|@([\w'-]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const name = match[1] || match[2]; // quoted group or unquoted group
        if (name) mentions.push(name.trim());
    }
    return mentions;
}

/**
 * Parse @mentions from shot fields and filter characters/objects to only mentioned ones.
 *
 * @param {object} shot - The shot object with description, blocking, notes fields
 * @param {Array} allCharacters - All characters in the project
 * @param {Array} allObjects - All objects in the project
 * @returns {{ characters: Array, objects: Array, mentionedNames: string[] }}
 */
function filterByMentions(shot, allCharacters, allObjects) {
    // Gather text from all mention-capable fields
    const textFields = [
        shot?.description,
        shot?.blocking,
        shot?.notes,
    ].filter(Boolean);

    const allText = textFields.join(' ');
    const mentionedNames = extractMentionNames(allText);

    // No @mentions found → send everything (backward-compatible)
    if (mentionedNames.length === 0) {
        return {
            characters: allCharacters || [],
            objects: allObjects || [],
            mentionedNames: [],
        };
    }

    // Normalize for case-insensitive matching
    const normalizedMentions = mentionedNames.map(n => n.toLowerCase());

    const matchedCharacters = (allCharacters || []).filter(c =>
        normalizedMentions.includes(c.name.toLowerCase())
    );

    const matchedObjects = (allObjects || []).filter(o =>
        normalizedMentions.includes(o.name.toLowerCase())
    );

    // Log unmatched mentions for debugging
    const matchedNames = [
        ...matchedCharacters.map(c => c.name.toLowerCase()),
        ...matchedObjects.map(o => o.name.toLowerCase()),
    ];
    const unmatched = mentionedNames.filter(n => !matchedNames.includes(n.toLowerCase()));
    if (unmatched.length > 0) {
        console.warn(`[mentionParser] Unmatched @mentions: ${unmatched.join(', ')}`);
    }

    return {
        characters: matchedCharacters,
        objects: matchedObjects,
        mentionedNames,
    };
}

export { extractMentionNames, filterByMentions };
