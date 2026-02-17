# Visual Test Script — Feb 17, 2026 Changes

**Prerequisites:** Run `npm start` in `shotpilot-app/`. Open the app at `http://localhost:5173`. You should be auto-logged in as test@shotpilot.com. Have a test project with a script, some characters, and some objects already created (or create one fresh).

---

## Test 1: Prompt Survives Navigation

- [ ] Go to **Scene Manager** for a project that has scenes and shots
- [ ] Expand a scene, find a shot, click **Generate Prompt** — wait for it to finish
- [ ] Verify the generated prompt is visible in the shot's variant list
- [ ] Navigate to the **Objects** page (or any other page)
- [ ] Navigate back to **Scene Manager**
- [ ] **Expected:** All scenes are expanded, the generated prompt is still visible — not erased

---

## Test 2: Dual-Path Add Object — Upload First

- [ ] Go to the **Objects** page
- [ ] Click **Add Object** (or edit an existing one)
- [ ] Enter a name (e.g., "Vintage Pocket Watch")
- [ ] **Expected:** You see TWO options in the AI assistant panel:
  - A teal dashed "I have a reference image" upload button at the top
  - An "or" divider
  - A "Generate Prompt" button below
- [ ] Click **"I have a reference image"** and upload any image
- [ ] **Expected:** After upload, you see:
  - Image thumbnail with an X to remove
  - "Reference image uploaded" label
  - **Analyze Quality** button
  - A hint: "Add your prompt first for best results, or analyze without it"
  - **Add prompt used** button (amber/yellow)
  - An "optional" divider with **Generate AI Prompt & Turnaround** button below

---

## Test 3: Promptless Analysis

- [ ] Continuing from Test 2 — do NOT add a prompt
- [ ] Click **Analyze Quality** directly
- [ ] **Expected:** Analysis runs, shows a verdict (STRONG MATCH / NEEDS TWEAKS / SIGNIFICANT MISMATCH) with quality dimension scores
- [ ] Expand the analysis — check for a **Revised prompt** section at the bottom
- [ ] **Expected:** The AI reverse-engineered a prompt from the image (this IS the revised prompt)

---

## Test 4: Add Prompt Used

- [ ] Still on the same object, click **Add prompt used**
- [ ] **Expected:** A textarea appears with placeholder text
- [ ] Paste any prompt text and click **Save**
- [ ] **Expected:** Button changes to green "✓ Prompt stored"
- [ ] Click **Analyze Quality** again (Re-analyze)
- [ ] **Expected:** Analysis now evaluates how well the image matches the prompt you provided

---

## Test 5: New Object — Save First Warning

- [ ] Click **Add Object** to start a brand new object (don't save yet)
- [ ] **Expected:** Instead of the upload button, you see: "Save the object first to upload a reference image"
- [ ] The **Generate Prompt** button should still be available below

---

## Test 6: Enhance with AI — Story Context

- [ ] Open a project that has a script, characters, and scenes already set up
- [ ] Go to **Objects**, edit an object that's mentioned in the script
- [ ] Click **Enhance with AI**
- [ ] **Expected:** The enhanced description references story-specific details — not generic production-speak. It should reflect the object's role in the narrative (e.g., condition, who uses it, where it appears)
- [ ] Do the same test on the **Characters** page — edit a character, click **Enhance with AI**
- [ ] **Expected:** Description references the character's story role, relationships, and scenes they appear in

---

## Test 7: Creative Director — Workflow Gate

- [ ] Start a new project (or one with no characters/objects yet)
- [ ] Open the **Creative Director** chat
- [ ] Paste a short script and send it
- [ ] **Expected:** Director extracts characters and objects, then STOPS. It should NOT generate a scene breakdown in the same response
- [ ] **Expected:** Director mentions the Characters/Objects pages and the "Enhance with AI" button — guides you to flesh out details before moving to scenes
- [ ] Try asking "create the scenes" or "let's do the scene breakdown"
- [ ] **Expected:** Director checks whether characters have real descriptions. If they're still bare-bones from extraction, it should push back and guide you to flesh them out first

---

## Test 8: Creative Director — Flesh Out Entities In-Chat

- [ ] In the Director chat, say something like: "Let's flesh out [character name] — what should they look like?"
- [ ] **Expected:** Director writes a detailed, production-ready description (specific eye color, hair, build, wardrobe — not vague)
- [ ] **Expected:** A purple **"Characters enhanced: [name]"** badge appears below the Director's message
- [ ] Go to the **Characters** page and check that character's card
- [ ] **Expected:** The description has been updated with the detailed version from the chat
- [ ] Repeat for an object: "Let's detail out the [object name]"
- [ ] **Expected:** Same behavior — purple "Objects enhanced" badge, description updated on Objects page

---

## Test 9: Creative Director — Image to Entity Transfer

- [ ] In the Director chat, upload an image and say: "Here's the image I already have for [object name]" (use a new object name)
- [ ] **Expected:** Director:
  - Creates the object with a detailed description based on the image
  - Green "Objects added: [name]" badge appears
  - Response mentions the object is set up on the Objects page with the image
  - Asks if you have the prompt you used to generate the image
- [ ] Go to the **Objects** page
- [ ] **Expected:** The new object appears in the grid WITH the image as its thumbnail
- [ ] Click to edit it
- [ ] **Expected:** The AI assistant panel shows the reference image already uploaded with Analyze/Add Prompt tools
- [ ] Go back to the Director and provide the prompt: "The prompt I used was: [paste something]"
- [ ] **Expected:** Director stores the prompt (may confirm via objectUpdates)

---

## Test 10: Creative Director — Image to Existing Entity

- [ ] In the Director chat, upload an image and say: "This is what [existing character name] looks like"
- [ ] **Expected:** Director updates the character's description to match the image, attaches the image
- [ ] Purple "Characters enhanced" badge appears
- [ ] Go to **Characters** page — character should now have the image as its thumbnail
- [ ] Click to edit — reference image should be visible in the AI assistant with all tools

---

## Quick Smoke Tests

- [ ] Objects page grid loads without errors
- [ ] Characters page grid loads without errors
- [ ] Scene Manager loads with all scenes expanded
- [ ] Creative Director chat sends and receives messages without errors
- [ ] No console errors on any page (open browser DevTools → Console)
