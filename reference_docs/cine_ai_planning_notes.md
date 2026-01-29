# Cine-AI Planning Notes

## Question 1: Pre-Production Depth

### Scripts
- **Answer:** Ask the user first if they want help writing dialogue/descriptions or just structure/format
- **Default:** Most users will want recommendations to enhance their ideas
- **Agent Behavior:** Always ask, then offer recommendations if requested

### Character Bibles
- **Answer:** Full depth required
- **Components:**
  - Visual consistency (what we've already built)
  - Personality traits
  - Backstory
  - Character arcs
- **Rationale:** Personality needed for image prompting; all components essential for video performance

### Storyboards
- **Answer:** Text descriptions for now
- **Future:** User may build visual app or organize in Figma manually
- **Agent Output:** Detailed text-based storyboard descriptions

### Shot Sheets
- **Answer:** Detailed technical breakdown
- **Components:**
  - Lens specifications
  - Camera movement
  - Duration
  - Audio cues
- **Rationale:** Ensures stills are consistent with video prompts from the start
- **Philosophy:** "Measure twice, cut once" - detailed planning eliminates rework later

---

## Question 2: Video Model Priority
*Awaiting user response*

## Question 3: Continuous Learning System
*Awaiting user response*

## Question 4: Interaction Style
*Awaiting user response*


## Question 2: Video Model Priority

### Research Approach
- **Answer:** Research all 5 models equally in-depth
- **Rationale:** 
  - Users have different access levels and preferences
  - Subscription costs vary—users make decisions based on budget
  - Agent must be an expert in ALL models to provide flexible recommendations

### Model Selection Strategy
- **Not a rigid decision tree**
- **Case-by-case basis** depending on:
  - Story complexity
  - Theme/aesthetic requirements
  - User access (which models they have subscriptions to)
  - User preference
- **Agent Behavior:** Ask user which models they have access to and their preference/priority order

---

## Question 3: Continuous Learning System

### User Question: "What do you suggest?"

**My Recommendation: Hybrid Approach**

**Option A: "Research Mode" (Active Learning)**
- When the agent encounters a question outside its knowledge base, it:
  1. Acknowledges: "I don't have expertise on [topic] yet. Let me research this for you."
  2. Searches official docs, Reddit, forums, and community resources
  3. Synthesizes findings and adds to the knowledge base
  4. Provides the answer with sources
- **Advantage:** Agent never guesses or hallucinates
- **Disadvantage:** Adds latency to responses

**Option B: "Version Awareness" (Passive Monitoring)**
- Knowledge base includes "Last Updated" timestamps for each model
- Agent proactively checks for new model versions when starting a session
- If a new version is detected, agent notifies user: "Veo 3.2 was released. Would you like me to research the new features?"
- **Advantage:** Keeps knowledge base current without user intervention
- **Disadvantage:** Requires automated version checking (may not catch all updates)

**Option C: "User-Triggered Updates" (Manual)**
- User manually tells agent: "Research the new Midjourney v7 features"
- Agent performs deep research and updates knowledge base
- **Advantage:** User controls when updates happen
- **Disadvantage:** User must stay informed about new releases

**My Recommendation: Hybrid System (A + B + Troubleshooting Escalation + User Control)**

**Primary: Research Mode (Option A)**
- Agent never guesses or hallucinates
- Acknowledges gaps and researches in real-time

**Secondary: Version Awareness (Option B)**
- Keeps agent proactively current with new model releases
- Notifies user of updates

**Tertiary: Troubleshooting Escalation (NEW)**
When multiple prompt attempts fail:
1. Agent acknowledges: *"We've tried 3 different approaches and haven't achieved the desired result."*
2. Agent offers options:
   - *"Would you like me to research this specific technique more deeply to find a solution?"*
   - *"Or should we try a different model that might handle this better?"*
3. If user chooses research, agent performs deep dive and updates knowledge base
4. If user chooses different model, agent recommends alternative with reasoning

**Fallback: User-Triggered (Always Available)**
User can always manually request:
- *"Research the new Midjourney v7 features"*
- *"Are you up to date on Veo 3.1?"*
- *"Research [specific technique or topic]"*

---

## Question 4: Interaction Style

### Answer: "Concise First, Detail on Demand"

**Default Response Format:**
1. **Quick Assessment:** "Image 3 is the closest match."
2. **Action:** "Use it as a reference and prompt: [full prompt here]."
3. **Invitation:** "Ask if you want to know why I chose Image 3."

**If User Asks "Why?" or "Explain in more detail":**
- Provide technical breakdown:
  - What Image 3 got right (lighting, composition, character consistency)
  - What Images 1, 2, 4 got wrong (specific technical issues)
  - Why the recommended prompt will fix the remaining issues

**Agent Behavior:**
- Always end with a question or suggested next step
- Never be long-winded unless explicitly asked
- Professional, encouraging, technically precise


---

## Additional Recommendations

### Shot List vs. Storyboard Distinction

**Answer:** Create both separately

**Shot List:**
- Technical specifications for each shot
- Format: "Scene 3, Shot 2: 85mm, dolly-in, 3 seconds"
- Purpose: Provides direction for prompting still shots
- Essential for technical consistency

**Storyboard:**
- Visual reference (text descriptions for now)
- Shows composition, framing, character positions
- Purpose: Visual planning and scene flow

**Rationale:** Both serve different purposes—technical specs guide prompting, storyboards guide visual composition

---

### Video Generation Control Features (Expanded)

**Answer:** Integrated into each model's prompting section

**Critical Features to Research & Document:**

1. **First Frame / Last Frame**
   - Critical for video accuracy
   - Different models handle differently
   - Very important for video prompt decisions

2. **Reference Images / Ingredients**
   - Veo calls them "Ingredients"
   - Other models call them "Reference Images"
   - Research how each model uses visual references to guide generation

3. **Extend / Continuation Features**
   - How each model handles video extension
   - Techniques for seamless continuation

4. **Generation Length Constraints (CRITICAL FOR SHOT SHEETS)**
   - **Veo 3.1:** 8 seconds maximum
   - **Kling 2.6:** 5s or 10s options
   - **Seedance 1.5:** 10 seconds (to be confirmed)
   - **Higgsfield Cinema Studio v1.5:** [to be researched]
   - **Runway Gen-3:** [to be researched]

**Impact on Shot Sheet Planning:**
- If two shots are 4s each (total 8s), can prompt together in Veo
- If shots are 4s + 7s (total 11s), requires two separate generations
- Agent must calculate total shot duration and recommend generation strategy
- Example: "This scene requires 3 shots (3s, 5s, 4s = 12s total). I recommend generating as two clips: Clip 1 (3s + 5s = 8s in Veo), Clip 2 (4s standalone). You'll cut them together in editing."

**Implementation:** Each video model guide will include:
- First/Last Frame techniques
- Reference image/ingredient usage
- Extend/continuation workflows
- Generation length limits and shot planning strategies

---

### The "Extra Stills" Philosophy

**Answer:** Yes, automatically suggest generating 2-3 variations of critical shots

**Agent Behavior:**
- For key moments (hero entrance, emotional beats, action sequences), suggest: "Generate 3 angles of the hero's entrance"
- Philosophy: "Better to have extras than not enough"
- Rationale: 
  - Easier to generate variations in real-time than recreate later
  - Model already has theme/style established
  - Matching style after-the-fact is difficult
  - Quick cuts may require multiple stills per scene

**Example:** "For this hero entrance, I recommend generating 3 stills: (1) Wide establishing shot, (2) Medium close-up, (3) Low-angle hero shot. We can decide which works best for the final edit."

---

## Summary: Complete System Design Confirmed

✅ **Pre-Production:** Scripts (ask user), Full Character Bibles, Text Storyboards, Detailed Shot Sheets
✅ **Video Models:** All 5 researched equally in-depth, case-by-case recommendations
✅ **Continuous Learning:** Hybrid (Research Mode + Version Awareness)
✅ **Interaction Style:** Concise first, detail on demand
✅ **Shot Planning:** Separate Shot List + Storyboard
✅ **First/Last Frame:** Integrated into each model guide
✅ **Extra Stills:** Automatically suggest 2-3 variations for critical shots


---

## CRITICAL RESEARCH PRIORITY: API vs. Direct Interface Prompting

### The Issue
User reports that an LLM stated: **"Prompt design varies depending on if you are using the model directly or through an API."**

### Why This Matters
If true, this means:
- The same model (e.g., Veo 3.1) could require **different prompt structures** depending on access method
- **Direct Interface:** Using Veo 3.1 in Google Flow
- **API Access:** Using Veo 3.1 through a third-party platform's API integration
- Users may get inconsistent results if they follow the wrong prompting guide for their access method

### Research Requirements

**For Each Model, Research:**

1. **Direct Interface Prompting**
   - Official platform (e.g., Google Flow for Veo, Higgsfield's native interface)
   - Prompt structure, parameters, syntax

2. **API Prompting**
   - Official API documentation (e.g., Google AI Studio API for Veo)
   - Third-party API integrations (if applicable)
   - Differences in prompt structure, parameter names, or syntax

3. **Document Distinctions**
   - If differences exist, create separate sections: "Using [Model] Directly" vs. "Using [Model] via API"
   - If no differences, explicitly state: "Prompting is identical for direct and API access"

### Agent Behavior

**When user starts a project, agent must ask:**
- "Are you using [Model] directly in [Platform], or through an API integration?"
- Based on answer, provide the correct prompting structure

**Example:**
- User: "I'm using Veo 3.1"
- Agent: "Are you using Veo directly in Google Flow, or through an API (e.g., via a third-party platform)?"
- User: "Through an API"
- Agent: [Provides API-specific prompting structure]

### Priority Level
**HIGH PRIORITY** - This could invalidate prompting advice if not researched properly.

---

## Summary: Complete System Design Confirmed (Final)

✅ **Pre-Production:** Scripts (ask user), Full Character Bibles, Text Storyboards, Detailed Shot Sheets
✅ **Video Models:** All 5 researched equally in-depth, case-by-case recommendations
✅ **Video Control Features:** First/Last Frame, Reference Images/Ingredients, Extend, Generation Length Limits
✅ **API vs. Direct Interface:** Research prompting differences for each access method (HIGH PRIORITY)
✅ **Continuous Learning:** Hybrid (Research Mode + Version Awareness + Troubleshooting Escalation + User Control)
✅ **Interaction Style:** Concise first, detail on demand
✅ **Shot Planning:** Separate Shot List + Storyboard, duration calculation for optimal generation strategy
✅ **Extra Stills:** Automatically suggest 2-3 variations for critical shots
