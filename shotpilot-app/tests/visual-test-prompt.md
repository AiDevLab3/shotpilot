# ShotPilot Visual Test Script

You are testing a web app running at http://localhost:5173. The backend runs on http://localhost:3000. Auth is automatic (no login needed).

Work through each section in order. For each checkbox item, report PASS or FAIL with a screenshot or description of what you saw. If something is broken, describe exactly what's wrong.

## Setup: Create Test Data

1. Navigate to http://localhost:5173
2. Create a new project called "Visual Test Project" with frame size "16:9 Widescreen"
3. Go to the **Characters** tab and create two characters:
   - Name: "Detective Marlowe", Description: "Tall man in a trench coat", Personality: "Cynical but determined"
   - Name: "Sarah Chen", Description: "Young woman with short black hair", Personality: "Brilliant and impatient"
4. Go to the **Objects** tab and create one object:
   - Name: "Revolver", Description: "Worn .38 special"
5. Go to the **Scene Manager** tab and create a scene:
   - Name: "Alley Confrontation", Location: "Dark alley", Time of Day: "Night", Mood: "Tense"
6. Create a shot in that scene:
   - Shot Number: "1", Shot Type: "Medium Shot", Camera Angle: "Eye Level", Description: "Establishing the alley"

---

## Test 1: Character AI Assistant (Characters Page)

Go to the **Characters** tab. Click on "Detective Marlowe" to edit.

- [ ] **1.1** A model selector dropdown exists labeled "Target Model" with options like "Midjourney", "Higgsfield Cinema Studio", etc. plus an "Auto (let AI decide)" default
- [ ] **1.2** The generate button says "Generate Prompt" (NOT "Generate with AI")
- [ ] **1.3** Select "Midjourney" from the model dropdown, then click "Generate Prompt". Wait for results.
- [ ] **1.4** Results show: Description section, Personality section, Reference Image Prompt section, and a "Turnaround Shots" section with a rotating arrow icon
- [ ] **1.5** Turnaround Shots section has exactly 3 prompts labeled "Front Portrait", "3/4 Profile", and "Full Body"
- [ ] **1.6** Each turnaround prompt has its own "Copy" button. Click one — it should briefly show "Copied" with a green checkmark
- [ ] **1.7** The reference prompt and turnaround prompts contain Midjourney-specific syntax (like `--ar`, `--v 7`, `--oref`, or `--stylize`)
- [ ] **1.8** Now click "Regenerate", but first change the model dropdown to "Auto (let AI decide)". After results load, check for a "Recommended model" banner at the bottom with a cyan/teal "Select" button

---

## Test 2: @Mention System (Shot Board)

Go to the **Scene Manager** tab. Click on the shot you created to edit it.

- [ ] **2.1** Click into the Description textarea and type `@`. An autocomplete dropdown should appear
- [ ] **2.2** The dropdown shows "Detective Marlowe" and "Sarah Chen" with blue "CHAR" badges, and "Revolver" with a yellow "OBJ" badge
- [ ] **2.3** Type `@Det` — the dropdown should filter to show only "Detective Marlowe"
- [ ] **2.4** Use arrow keys to highlight "Detective Marlowe", then press Enter or Tab to select. The text should insert as `@"Detective Marlowe"` (with quotes since it's multi-word)
- [ ] **2.5** Now type ` and @Rev` — the dropdown should show "Revolver". Select it. It should insert as `@Revolver` (no quotes, single word)
- [ ] **2.6** Press Escape while the dropdown is open — it should close without inserting anything
- [ ] **2.7** The dropdown appears ABOVE the textarea, not below it
- [ ] **2.8** Save the shot. On the shot card in the list, the @mentions should appear as highlighted/styled text (purple or different color from normal text), not plain text
- [ ] **2.9** Test the same @mention behavior in the "Blocking" and "Notes" fields — dropdown should work there too

---

## Test 3: Audit System Lifecycle (Variant Cards)

Stay on Scene Manager. You need an image variant to test this.

1. Click "Generate Prompt" on the shot (this calls the AI — it may take a few seconds)
2. After the prompt is generated, you'll need to upload a test image. If there's an upload button on the variant card, upload any image file.

- [ ] **3.1** After creating a variant (via prompt generation), the variant card shows a status badge. It should say "Unaudited" in gray
- [ ] **3.2** If you can trigger an audit (look for an "Audit" or "Analyze" button on the variant card), run it. After the audit completes, the badge should change to either "Needs Refinement" (yellow) or "Locked In" (green)
- [ ] **3.3** If the audit result is not "Locked In", look for a "Lock In" button. Click it — the badge should change to green "Locked In"
- [ ] **3.4** After locking, the button should change to "Unlock". Click "Unlock" — badge returns to its previous state
- [ ] **3.5** Upload a NEW image to the same variant. The badge should reset to "Unaudited" and any previous audit data should be cleared

---

## Test 4: Chat Persistence

Go to the **Creative Director** tab (first tab / main project page).

- [ ] **4.1** The chat sidebar should show a welcome message from the AI Director
- [ ] **4.2** Type "I want to create a neo-noir detective film" and send. Wait for the AI response.
- [ ] **4.3** Send one more message: "The main character is a cynical private detective in 1940s Los Angeles"
- [ ] **4.4** Now hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R). After reload, the chat should still show ALL previous messages (welcome + your 2 messages + AI responses)
- [ ] **4.5** The chat mode should have switched from "initial" — verify the quick-start buttons (Upload Script, Paste Script, Start from Idea) are no longer showing
- [ ] **4.6** Open browser DevTools → Application → Local Storage. Clear all localStorage for this site. Refresh the page. Chat messages should STILL be there (loaded from server, not localStorage)

---

## Test 5: AI Response Quality

Read the actual text of AI responses generated during the tests above.

- [ ] **5.1** The character reference prompts (Test 1) should sound like they come from a cinematography expert — mentioning specific lighting techniques, lens choices, or film references — not generic AI image prompt language
- [ ] **5.2** If you ran an image audit (Test 3), the audit feedback should sound like a Director of Photography giving on-set notes (e.g., "the key is too flat", "consider motivated practicals") rather than generic quality scores
- [ ] **5.3** The Creative Director chat responses (Test 4) should reference specific filmmaking techniques, visual styles, or cinematic references — not vague advice like "consider the mood"

---

## Cleanup

Delete the "Visual Test Project" when done to keep the database clean.

---

## Report Format

After completing all tests, provide a summary:

```
SECTION 1 (Character AI): X/8 passed
SECTION 2 (@Mentions): X/9 passed
SECTION 3 (Audit Lifecycle): X/5 passed
SECTION 4 (Chat Persistence): X/6 passed
SECTION 5 (AI Quality): X/3 passed

TOTAL: X/31 passed

FAILURES:
- 2.4: [description of what went wrong]
- ...
```
