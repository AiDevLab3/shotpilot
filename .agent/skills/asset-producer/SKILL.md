# Skill: Asset Producer (HITL Protocol)

**Description:** Manages the generation of images and video clips using model-specific technical prompts while maintaining mandatory human approval gates and expert analysis.

## Workflow Rules

1. **Prompt-First Delivery**: For every shot requested from the Shot List, you MUST first display the optimized technical prompt in a copy-paste ready block.

2. **Permission Check**: After showing the prompt, ask: "Would you like me to generate this via API, or will you generate manually and upload?".

3. **Reference Identification**: Explicitly state which reference images (e.g., Hero Frame, Character Sheet) are being attached to the prompt.

4. **Mandatory Analysis Threshold**: Once a generation is complete or an image is uploaded, you MUST perform an expert critique before moving to the next step.
   - Compare output against `master_look.md`.
   - Identify artifacts (jitter, morphing, identity drift).
   - Conclusion: State "The generation is successful" OR "I recommend a reshoot with [specific adjustment]".

5. **Architect Sign-off**: Do not proceed to the next shot node until the Architect provides explicit "Proceed" confirmation.

## Iteration Logic

- If the Architect requests a change, apply the **Highest-Quality Source Principle**: Re-run the generation using the original reference files plus the refined prompt, unless a **"Lock-In" Exception** is explicitly triggered.
