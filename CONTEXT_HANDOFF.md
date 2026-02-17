# ShotPilot — Context Handoff Summary

**Date:** February 17, 2026
**Creator:** Caleb (self-described "visionary, not developer" — surface-level code understanding, defers technical decisions)
**Repository:** `cramsey28/cine-ai-knowledge-base`
**Active Branch:** `main`
**Stack:** React 19 + TypeScript + Vite | Express 5 + SQLite (better-sqlite3) | Gemini 3 Flash Preview
**Styling:** All inline `React.CSSProperties`, dark theme, `lucide-react` icons, `zustand` state

---

## 1. What Is ShotPilot?

An AI cinematography copilot — not a generic prompt optimizer. It's a professional filmmaking tool powered by a **250K-word knowledge base** covering models, techniques, realism principles, and consistency methods. The core workflow:

1. **Plan** — Creative Director chat (AI co-pilot) to define project vision, characters, objects, scenes
2. **Build** — Shot cards with camera specs, descriptions, blocking
3. **Generate** — AI creates model-specific prompts using KB expertise
4. **Audit** — Upload generated images → 6-dimension holistic audit with realism diagnosis
5. **Iterate** — AI auto-refines prompts based on audit findings (NOT user-driven refinement)

**Critical design philosophy:** The AI generates refined prompts automatically based on KB knowledge and image analysis. The user does NOT manually refine prompts — that's the whole point of the tool.

### Lite vs Full Version Strategy

**ShotPilot Lite** (current build) is a proof-of-concept that validates the most crucial functions: can the AI effectively leverage the 250K-word knowledge base to generate model-specific prompts, audit images against professional cinematography standards, and auto-refine? Lite uses a curated set of 7 models and **does not include in-app image generation** — users generate images externally and upload them for audit/refinement.

**ShotPilot Full** (future) will add direct image generation via API integration (Nano Banana Pro / Gemini image gen is the obvious first candidate since the API key is already in use), additional models (22+ from the full KB), and the complete audit-generate-refine loop without leaving the app.

**The distinction matters:** Lite is about proving the KB expertise works. Full is about closing the workflow loop. Do not build in-app generation features until Lite's core functions are validated and locked in. Video generation is similarly deferred — image workflow must be fully refined first.

---

## 2. How the Repo Got Messy (Timeline)

1. **Started as a knowledge base** — Caleb deep-researched every model and cinematography concept. 250K+ words of research files organized by topic.

2. **Claude "optimized" the KB** — Caleb asked Claude to condense research into AI-consumable format. **Critical information was lost.** Example: Nano Banana Pro was incorrectly labeled "no reference support" when it's actually best-in-class for natural language image editing. The QC pack was made for video when the app only does images currently.

3. **Split to ShotPilot lite version** — Claude advised starting with a few models and one agent instead of multi-agent specialists. KB was duplicated/condensed into `shotpilot-app/kb/` (~18K tokens). Full research stays in root `kb/`.

4. **Multiple "cleanup" sessions** — Several Claude sessions attempted repo reorganization, each making things worse: *"Throughout the 'optimize for ai' and several repo 'cleanups' we got the mess we have now."*

5. **Lost project data** — OneDrive + git conflicts destroyed project data. Repo moved to `C:\Projects\` to avoid OneDrive. Database is gitignored, so every fresh clone starts empty.

6. **Quality system drifted** — Originally intended for **image quality analysis** (upload image → AI scores realism + consistency). Somehow became **prompt field completeness scoring** (checking if shot card fields are filled in). This was discovered and fixed in the Feb 13 sessions.

**Caleb's words:** *"I made a big mistake not analyzing these better and trusting claude."*

---

## 3. Current Architecture

### Knowledge Base Hierarchy
```
shotpilot-app/kb/
├── 01_Core_Realism_Principles.md    ← Loaded in all AI endpoints (most critical file)
├── 02_Model_*.md (6 files)          ← Condensed model guides (Higgsfield, MJ, GPT Image, Nano Banana, Kling 2.6, VEO 3.1)
├── 03_Pack_*.md (6 files)           ← Specialized packs (Character Consistency, Image QC, Video QC, Motion, Spatial, QC)
├── 04_Translation_Matrix.md         ← Cross-model parameter mapping
├── models/                          ← Full research per model (always loaded for prompt generation since Feb 16)
│   ├── midjourney/Prompting_Mastery.md  ← Updated to V7 (--oref replaces --cref)
│   ├── gpt_image_1_5/
│   ├── nano_banana_pro/
│   └── ... (23+ model directories)
└── archive/                         ← Old versions, not active
```

**KB Loading Flow:** `kbLoader.js` → `readKBFile()` / `loadKBForModel()` → concatenated into Gemini system instruction context. In Auto mode, a quick Gemini call picks the best model first, then full model KB is loaded (never generates prompts without model-specific knowledge).

### Database Schema (SQLite, WAL mode)
- `users` — auth (MVP uses hardcoded test user)
- `projects` — title, frame_size, style_aesthetic, cinematography, mood, references, etc.
- `characters` — name, description, personality, reference_image_url
- `objects` — name, description, reference_image_url
- `scenes` — location, time_of_day, weather, mood, lighting, camera approach
- `shots` — shot_type, camera_angle, camera_movement, focal_length, lens, description, blocking
- `image_variants` — image_url, model_used, prompts (original/generated/edited), audit_score, audit_data, status (unaudited/needs-refinement/locked-in), iteration_number, parent_variant_id
- `conversations` — project_id (UNIQUE), mode, script_content, target_model
- `conversation_messages` — conversation_id, role, content, metadata (JSON)
- `project_images` — alt images library (image_url, title, notes, tags)

### AI Services (split into `server/services/ai/` modules, barrel-exported via `geminiService.js`)

| Module | Functions |
|--------|-----------|
| `ai/shared.js` | `buildContextBlock`, `buildImageParts` (returns `{ parts, imageMap }` with numbered refs), `callGemini` (core Gemini API client) |
| `ai/readiness.js` | `analyzeReadiness`, `generateRecommendations` |
| `ai/promptGeneration.js` | `generatePrompt`, `refinePromptFromAudit` |
| `ai/suggestions.js` | `generateAestheticSuggestions`, `generateCharacterSuggestions`, `generateObjectSuggestions` |
| `ai/shotPlanning.js` | `generateShotPlan`, `readinessDialogue` |
| `ai/scriptAnalysis.js` | `analyzeScript` |
| `ai/creativeDirector.js` | `creativeDirectorCollaborate`, `summarizeConversation`, `refineContent` |
| `ai/imageAudit.js` | `holisticImageAudit` |

All 15 functions are re-exported from `geminiService.js` so existing imports work unchanged.

### API Routes (split into `server/routes/` modules, mounted in `index.js`)

| Module | Endpoints |
|--------|-----------|
| `routes/auth.js` | Login, logout, session, credits, usage |
| `routes/ai.js` | All AI endpoints (readiness, suggestions, creative director, prompt gen/refine, script analysis, etc.) |
| `routes/projects.js` | Project CRUD + project images (alt library) |
| `routes/characters.js` | Character CRUD |
| `routes/objects.js` | Object CRUD |
| `routes/scenes.js` | Scene CRUD |
| `routes/shots.js` | Shot CRUD with insert-after ordering |
| `routes/images.js` | Upload, variants CRUD, holistic image audit, lock/unlock |
| `routes/conversations.js` | Conversation persistence CRUD (load, save, replace, clear) |

63 total endpoints across 9 route modules. Each module exports a factory function receiving dependencies (db, services, middleware).

### Frontend Pages (5 active, routed in App.tsx)
- **Creative Director** (`/projects/:id`) — AI chat sidebar (persistent via zustand) + project info display + script upload/analysis
- **Characters** (`/projects/:id/characters`) — Bible page with AI assistant (model selector, turnaround prompts), reference image upload
- **Objects** (`/projects/:id/objects`) — Bible page with AI assistant (model selector, turnaround prompts)
- **Scene Manager** (`/projects/:id/scenes`) — Shot board with variant management, audit, prompt generation
- **Image Library** (`/projects/:id/images`) — Project-level image parking lot for alternates/references

### Navigation: Header tabs → `Creative Director | Characters | Objects | Scene Manager | Image Library`

---

## 4. Selected Models (Curated for MVP)

**Image Generation:**
| Model | Strengths |
|-------|-----------|
| Higgsfield Cinema Studio v1.5 | Precise camera rig control, cinematic realism |
| Midjourney (V7) | Artistic/stylized hero stills, --oref for consistency |
| GPT Image 1.5 | Strong prompt adherence, text rendering |
| Nano Banana Pro | Best-in-class natural language editing + iteration |

**Video Generation:**
| Model | Strengths |
|-------|-----------|
| VEO 3.1 | Google's flagship video gen |
| Kling 2.6 / 3.0 | Motion control, avatar support |

---

## 5. What Was Done in Recent Sessions

### Session: Feb 16-17 — Prompt UX, Image References, Safety Framing

#### Inline Field Editing in Generate Prompt Modal
1. **Fill-the-gaps UX** — Readiness score showed what's missing (83% DRAFT) but gave no way to improve from the modal. Added inline editing: progress bar, collapsible "Fill gaps" section with missing fields, FieldEditor component (dropdowns for shot_type/camera_angle/camera_movement, text inputs for others), fields grouped by Shot vs Scene/Project with point values, save updates backend and refreshes score
2. **Fixed inline save** — Three issues fixed: (a) Source detection relied on missing backend data → added client-side `getFieldSource()`, (b) Readiness refresh triggered slow Gemini call → added `useKB: false` param for fast basic-only check, (c) No visual feedback → added "Saved!" green checkmark confirmation state
3. **Key mappings** — qualityCheck field names differ from DB columns (e.g. `shot_description` → `description`, `scene_lighting_notes` → `lighting_notes`). `FIELD_TO_API` map in GeneratePromptModal handles translation. `getFieldSource()` determines save target (shot/scene/project) from field name prefix

#### Prompt Generation Improvements
4. **Numbered image references** — `buildImageParts()` in shared.js now returns `{ parts, imageMap }` where imageMap tracks `[{ imageNum, type, name, description }]`. Generated prompts include "Image 1", "Image 2" syntax with identity-locking instructions (e.g. "Use Image 1 for Detective Marlowe's facial features — keep identity exact"). Reference Image Map appended to output
5. **Safety-aware framing** — Added SAFETY-AWARE FRAMING section to system instruction. Everything framed as film production to avoid AI model content safety filters: weapons = "prop revolver" / "rubber stunt knife", characters = "actor holding a prop [weapon]", scenes = "on the film set" / "practical set lighting". Strategy is invisible to user — applied silently, never mentioned in assumptions
6. **Fixed prompt appearing erased after navigation** — Navigating to Objects page and back made prompts look gone. Root cause: scenes collapsed to only-first-expanded, VariantList started collapsed. Fix: all scenes expand by default on load, VariantList defaults to expanded when it has variants

### Session: Feb 16 — Character AI Parity, Bug Fixes & Prompt Quality

#### Character AI Assistant Parity
1. **Model selector + turnaround prompts added** — CharacterAIAssistant now mirrors ObjectAIAssistant: model dropdown (image models only), targetModel passed through full stack, model-specific KB loaded, turnaround prompts (front portrait, 3/4 profile, full body), recommended model display in Auto mode

#### Prompt Quality Improvements
2. **Full model KB always loaded** — In Auto mode, backend now makes a quick Gemini call to pick the best model first, then loads that model's full KB before generating prompts. No more "lesser" prompts without the full model guide. Falls back to Midjourney if auto-pick fails
3. **Description enhancement gate** — When users click Generate Prompt with thin descriptions (<100 chars description, <50 chars personality), they get prompted to enhance first via AI. "Enhance First" auto-applies improved text to the form, "Skip, Use As-Is" proceeds with original. Regenerate always bypasses the gate
4. **Fixed Gemini using deprecated --v 6.1** — In Auto mode without model KB, Gemini fell back to training data. Added explicit constraints: ALWAYS --v 7 / --oref, NEVER --v 6 / --cref

#### UX Improvements
5. **AI assistant UX clarity** — Recommendation banner moved to top, structured display (model name + plain-English reason), collapsible "How to use these results" 5-step workflow guide, Step 1/Step 2 labels on Reference/Turnaround sections. Applied to both Character and Object assistants
6. **Fixed confusing recommendation banner** — "Best model for this character" → "Prompts formatted for" (prompts already use the selected model). "Select & Regenerate" → "Lock this model" (no misleading re-generation)

#### Bug Fixes
7. **Gemini array-wrapping bug** — Gemini sometimes wraps JSON responses in `[{...}]` instead of `{...}`, causing turnaroundPrompts/recommendedModel to go missing. Both parsers now unwrap arrays
8. **Generate Prompt button fix** — `onClick={loadSuggestions}` was passing the MouseEvent as modelOverride. Wrapped in arrow function
9. **Test suite updated** — Added cookie jar for session persistence, conversation CRUD tests, variant lock/unlock tests, updated variant status to match new lifecycle. All 19 focused tests pass

### Session: Feb 15 — 9-Task Improvement Sprint (ALL COMPLETED)

#### Phase 1 — Foundation
1. **CONTEXT_HANDOFF.md updated** — Added lite/full version clarity, cleaned stale refs
2. **Backend bugs fixed** — Duplicate KB loading eliminated (saves ~20-40K tokens/call), model key mismatch in qualityCheck.js fixed, Gemini retry/timeout added (3 retries with exponential backoff + 60s timeout), script truncation raised from 5K→50K chars with user notification, dead code `AVAILABLE_MODELS_CONSTRAINT` removed
3. **Lost KB content restored** — GSS 2-layer architecture, Canon Master Look Template, and 4-Block Prompt Compiler format restored to `01_Core_Realism_Principles.md` from full research source
4. **Orphaned pages deleted** — ScriptAnalyzerPage.tsx, ProjectInfoPage.tsx, AestheticSuggestionsPanel.tsx, ShotBoardPage.tsx.bak

#### Phase 2 — Core Features
5. **Translation Matrix completed** — All 7 models across all concept domains. Added video model rows for Atmospheric Effects, new Section 5 (Character/Identity Consistency Translation with per-model mechanisms: --oref, Elements 3.0, Ingredients to Video), Video Motion Translation section, expanded Key Translation Patterns table from 4→7 columns
6. **@mention system built** — `@Name` and `@"Multi Word Name"` syntax in shot descriptions/blocking/notes. `server/utils/mentionParser.js` extracts mentions and filters characters/objects sent to Gemini. `MentionTextarea.tsx` provides autocomplete dropdown with CHAR/OBJ badges, keyboard nav. Backward-compatible: no @mentions = all entities sent (legacy behavior)
7. **Audit system elevated** — Status lifecycle: `unaudited → needs-refinement → locked-in`. Audit maps recommendation to status automatically. Iteration tracking (`iteration_number`, `parent_variant_id`). 3-strike model pivot: after 3 variants score <70 on same model/shot, suggests switching models. Lock/unlock endpoints + UI buttons. Status badges on variant cards (color-coded). Upload clears stale audit data in DB
8. **KB expertise surfaced** — All AI services now present knowledge as personal cinematographic expertise instead of generic advice. Added BAD/GOOD example patterns to system prompts for: prompt generation (ASSUMPTIONS STYLE), image audit (DP on-set feedback), creative director (EXPERTISE VOICE), readiness analysis (cinematography-grounded reasoning), shot planning (model-aware technical suggestions)

#### Phase 3 — Polish
9. **Server-side conversation persistence** — Conversations + messages stored in SQLite (`conversations` + `conversation_messages` tables). Full CRUD routes at `/api/projects/:id/conversation`. ChatSidebar loads from server on mount (source of truth), falls back to local state. Fire-and-forget saves after each message exchange. Compaction syncs via PUT. ON DELETE CASCADE handles cleanup when projects deleted

### Session: Feb 14 — Architecture Refactoring

#### Monolith Split
- **`server/index.js`** (1,665 → 140 lines) — All routes extracted into 8 domain modules under `server/routes/`
- **`server/services/geminiService.js`** (1,611 → 24 lines) — All AI functions extracted into 7 domain modules under `server/services/ai/`
- `geminiService.js` is now a barrel re-export file — existing imports work unchanged
- Each route module exports a factory function that receives dependencies (db, services, middleware)
- Fixed backward-compat aliases (`check-quality`, `quality-dialogue`) that broke during refactor — now use 307 redirects

#### Route Test Suite
- `tests/route-test.js` — comprehensive test covering CRUD lifecycle, conversation persistence, variant lock/unlock, session cookies
- AI endpoints require external Gemini API access and are tested separately via `tests/visual-test-prompt.md`

### Session: Feb 13-14 — Features & Fixes

#### Midjourney V7 KB Update
- Full rewrite of `Prompting_Mastery.md` to v2.0
- `--oref` replaces `--cref` across all KB files (6 files updated)
- Added `--sref`/`--sw` (Style Reference) to Translation Matrix
- Updated kbLoader capabilities string

#### Realism Diagnosis in Audit
- Added explicit 4-pattern realism troubleshooting to holistic image audit:
  - AI Plastic Look, Flat/Lifeless, CGI/Game Engine Look, Lighting Drift
- New `realism_diagnosis` field in audit JSON output with severity classification
- New UI section in `ImageAuditReport.tsx` with color-coded severity badges

#### Multi-Image Upload in Chat
- `ChatSidebar.tsx` supports up to 10 images per message
- Grid display for multi-image messages
- Full pipeline: store → API → server → Gemini multi-part

#### 8 Testing Issues Fixed
1. **CD proactive model recommendation** — When no target model selected, AI now recommends one
2. **Conservative project updates** — Project info no longer overwritten on every AI response
3. **Object auto-creation from chat** — Objects discussed in CD chat are auto-created (like characters/scenes already were)
4. **Button label fix** — "Generate with AI" → "Generate Prompt"
5. **Model-aware object prompts** — Model selector dropdown, passes targetModel to API, loads model-specific KB
6. **Turnaround shot prompts** — Front/side/back view prompts for objects with per-prompt copy buttons
7. **Frame-size-aware containers** — Image containers in Character, Object, and Shot pages now parse project `frame_size` (e.g. "16:9 Widescreen" → CSS `16/9`) instead of hardcoded 16/9
8. **Image Library** — New page, DB table, CRUD API, full UI with upload, tags, filtering, lightbox, edit modal

---

## 6. Known Issues NOT Yet Addressed

### Deferred (Not Lite Version Scope)
- **In-app image generation** — Direct API integration planned for Full version. Lite proves the KB/AI expertise works first.
- **Video generation workflow** — Video models are in KB and registry but no UI exists. Deferred until image workflow is fully refined and locked in.
- **Multi-agent architecture** — Original vision was 5 specialized agents. Currently single Gemini with different system prompts. Deliberate MVP trade-off.

### Other Known Issues
- **Auth is placeholder** — MVP uses hardcoded `test@shotpilot.com` with auto-login.
- **Credits system is mostly cosmetic** — Credit tracking exists but is loosely enforced.
- **No image optimization** — Uploaded images aren't resized or compressed before storage.

### Resolved
- ~~`geminiService.js` is massive~~ — Split into 7 domain modules under `server/services/ai/`
- ~~`server/index.js` is massive~~ — Split into 8 route modules under `server/routes/`
- ~~Base64 images in SQLite~~ — Images are stored as files, only paths in DB
- ~~Orphaned pages (ScriptAnalyzerPage, ProjectInfoPage)~~ — **DELETED Feb 15**: Functionality absorbed into CreativeDirectorPage. Also deleted unused `AestheticSuggestionsPanel` component and `ShotBoardPage.tsx.bak`.
- ~~Duplicate KB loading~~ — **FIXED Feb 15**: Eliminated double-loading of Core Principles, Character Consistency, and QC packs
- ~~Model key mismatch~~ — **FIXED Feb 15**: qualityCheck.js now uses correct model keys
- ~~No retry/timeout on Gemini~~ — **FIXED Feb 15**: 3 retries with exponential backoff + 60s timeout
- ~~Script truncated at 5K chars~~ — **FIXED Feb 15**: Raised to 50K with user notification
- ~~Lost KB content (GSS, Master Look, Prompt Compiler)~~ — **RESTORED Feb 15**: Back in Core Realism Principles
- ~~Translation Matrix incomplete~~ — **COMPLETED Feb 15**: All 7 models across all concept domains + character consistency + video motion
- ~~Characters/objects disconnected from shots~~ — **FIXED Feb 15**: @mention system with autocomplete
- ~~Audit system buried in UI~~ — **FIXED Feb 15**: Status lifecycle, iteration tracking, 3-strike pivot, lock/unlock
- ~~KB knowledge invisible to users~~ — **FIXED Feb 15**: AI presents expertise naturally in all responses
- ~~No conversation persistence~~ — **FIXED Feb 15**: Server-side SQLite storage, survives page refresh
- ~~Character AI Assistant lacks model selector/turnarounds~~ — **FIXED Feb 16**: Full parity with ObjectAIAssistant
- ~~Character suggestions lack model-specific KB~~ — **FIXED Feb 16**: Auto mode picks best model, loads full KB, falls back to Midjourney
- ~~Tests stale after Feb 15 changes~~ — **FIXED Feb 16**: Updated with conversation CRUD, variant lock/unlock, session cookies
- ~~Gemini using deprecated --v 6.1~~ — **FIXED Feb 16**: Explicit V7/--oref constraints in system prompts
- ~~Readiness score with no way to improve~~ — **FIXED Feb 17**: Inline field editing in Generate Prompt modal with progress bar, dropdowns, and live score refresh
- ~~Generated prompts missing image references~~ — **FIXED Feb 17**: Numbered imageMap system, "Image 1" / "Image 2" syntax with identity-locking instructions
- ~~Safety filter violations on realistic weapon prompts~~ — **FIXED Feb 17**: Film production framing (prop weapons, actors, film sets)
- ~~Prompts appear erased after navigation~~ — **FIXED Feb 17**: All scenes expand by default, VariantList starts expanded

---

## 7. Key Files Quick Reference

| File | What It Does |
|------|-------------|
| `server/index.js` | Server setup, middleware, mounts route modules (~140 lines) |
| `server/routes/*.js` | 9 route modules (auth, ai, projects, characters, objects, scenes, shots, images, conversations) |
| `server/services/geminiService.js` | Barrel re-export of all AI functions from `services/ai/` |
| `server/services/ai/*.js` | 7 AI domain modules (shared, readiness, promptGeneration, suggestions, shotPlanning, scriptAnalysis, creativeDirector, imageAudit) |
| `server/services/kbLoader.js` | KB file loading, model registry, file concatenation |
| `server/services/creditService.js` | Credit deduction, usage logging, stats |
| `server/database.js` | SQLite schema + migrations |
| `server/middleware/auth.js` | Express-session auth + checkCredits middleware |
| `tests/route-test.js` | Route test suite (CRUD, conversations, variant lifecycle, sessions) |
| `src/components/ChatSidebar.tsx` | Creative Director chat UI (persistent sidebar) |
| `src/components/ObjectAIAssistant.tsx` | Object prompt generation with model selector + turnaround |
| `src/components/CharacterAIAssistant.tsx` | Character prompt generation with model selector + turnaround |
| `src/components/GeneratePromptModal.tsx` | Shot prompt generation modal with inline field editing + readiness progress bar |
| `src/components/ImageAuditReport.tsx` | 6-dimension audit display + realism diagnosis |
| `src/components/VariantList.tsx` | Generated prompt list per shot (starts expanded, sorted by model type + date) |
| `src/components/VariantCard.tsx` | Individual variant display with audit/refine/lock/copy actions |
| `src/components/MentionTextarea.tsx` | @mention autocomplete textarea for shot fields |
| `server/utils/mentionParser.js` | @mention parsing + entity filtering for AI context |
| `server/routes/conversations.js` | Conversation persistence CRUD routes |
| `src/pages/ShotBoardPage.tsx` | Scene manager with shot cards + @mention support |
| `src/pages/ImageLibraryPage.tsx` | Alt images library |
| `src/stores/creativeDirectorStore.ts` | Zustand store for chat persistence |
| `src/types/schema.ts` | All TypeScript interfaces |
| `src/services/api.ts` | All API client functions |
| `kb/01_Core_Realism_Principles.md` | Most critical KB file — loaded everywhere |
| `kb/04_Translation_Matrix.md` | Cross-model parameter mapping |

---

## 8. Design Principles & Strategic Decisions

### Caleb's Design Principles (Inferred from Conversations)

1. **KB is the source of truth** — Gemini should consult KB first, only go outside KB if info is missing
2. **AI does the work, not the user** — Prompt refinement is automatic, not manual
3. **Realism is the hardest problem** — Special attention to diagnosing AI artifacts
4. **Project info is macro-level** — Should capture overall visual direction, not per-character details
5. **Conservative updates** — Don't overwrite existing project data unless explicitly discussing project-level changes
6. **Model-specific prompts** — Every prompt should be optimized for the specific target model's syntax and capabilities
7. **Professional cinematography language** — This is a filmmaking tool, not a generic image generator
8. **Don't over-trust AI** — Verify what Claude/AI produces against the original research

### Strategic Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Persistent Chat Sidebar | AI collaboration across all tabs differentiates from dump-and-run tools | Architectural |
| Script-First Workflow | Script is the narrative blueprint; everything flows from it | Workflow |
| Image = Audit, Not Overwrite | Reference images should compare against direction, not replace it | Behavioral |
| Full Script Updates Only | AI returns complete script with edits, never fragments (50% guard) | Safety |
| Conversation Compaction | Prevents drift, reduces costs, improves latency | Optimization |
| Platform Owns API Keys | Professional UX, credit monetization, security | Permanent |
| Credit System | Predictable pricing, upfront revenue, abuse prevention | Permanent |
| 80/20 Quality Weighting | Shot data (80%) + Context (20%): users control their shots | Algorithm |
| On-the-Fly Scoring | Live <1ms calc vs stored scores that go stale | Architectural |
| SQLite | Zero infrastructure, file-based, sufficient for thousands of users | MVP |
| Gemini Flash | 1M context, multimodal, free tier, fast inference | MVP |
| KB Condensation | 250K words → ~18K tokens fits context window | Permanent |

### Critical Reminders

1. **Do Not "Simplify" the KB** — The complexity IS the product. Remove film references and it becomes ChatGPT.
2. **Maintain 80/20 Split** — Never let Context override user's Shot decisions.
3. **Video is Different** — 5-layer structure (Scene, Character, Action, Camera, Audio). Do not reuse Image logic blindly.
4. **Keep it Fast** — Quality checks <50ms (current <1ms).
5. **Script Protection** — Never let AI erase script content (50% length guard).
6. **AI Rules = Internal** — The AI should NEVER state its rules/workflow to the user.
7. **Chat is Persistent** — The sidebar must survive tab navigation.

---

## 9. Git Commit History (Reverse Chronological)

```
c9b05de Fix prompt appearing erased after navigation
3d23540 Add safety-aware framing to prompt generation
4da2f6b Add numbered image references to generated prompts
277e104 Fix inline field save: client-side source detection, fast refresh, visual feedback
67ca46b Add inline field editing to Generate Prompt modal
abb0999 Fix Gemini JSON parsing and server error handling
906b9a0 Add CLAUDE.md project operating instructions
54eb938 Add description enhancement gate before prompt generation
25af3b3 Always load full model KB — auto-pick model in Auto mode
26ececa Fix confusing recommendation banner: prompts already use the model
f4c6c37 Fix Generate Prompt button passing MouseEvent as model override
42a07ad Fix Gemini using deprecated --v 6.1 instead of V7 from KB
55108b3 Improve Character/Object AI assistant UX clarity
bf43fb0 Add visual test prompt for browser-controlled QA testing
bd80b34 Fix Gemini array-wrapping bug in character/object suggestions
a97acc9 Update test suite: conversation CRUD, variant lock/unlock, session cookies
b626053 Add model selector + turnaround prompts to Character AI Assistant
5919cda Add server-side conversation persistence
901054e Surface KB knowledge as expert cinematography advice in all AI responses
f27f47a Elevate audit system: status lifecycle, iteration tracking, 3-strike pivot
d6aface Add @mention system for characters/objects in shot descriptions
fe367dc Complete Translation Matrix: all 7 models across all concept domains
(+ Phase 1 commits: backend bug fixes, KB restoration, orphaned page deletion)
a497e90 Fix backward-compat route aliases and add route test suite
3656c6a Refactor: split monolithic server into route and AI service modules
81e880a Add context handoff summary for session continuity
9280375 Fix 8 testing issues: CD improvements, object AI, frame size, image library
47679ce Support multiple image uploads in Creative Director chat
1ee57e6 Add realism diagnosis to image audit and --sref/--sw to Translation Matrix
6824781 Update Midjourney KB to V7: --oref replaces --cref, new parameters
66fe54a Split QC pack into Image and Video files
2f74830 Include model-specific KB in image audit for model-aware feedback
8947d17 Replace hardcoded reference strategy with KB-driven Gemini reasoning
5c8cf4f Fix kbLoader to use full Prompting Mastery files
505e842 Add reference strategy guidance to prompt refinement
16e4baf Replace manual prompt edit with AI-driven prompt refinement
0116cd2 Add inline prompt refine/edit to VariantCard
a7487c4 Fix audit score bars still overflowing
9194490 Fix audit score bars overflowing card + add original/revised prompt label
fb29688 Fix audit 500 error - remove JSON mode incompatible with image+thinking
dd7b6d8 Fix audit endpoint hanging - checkCredits factory called without db param
c3a372a Fix prompt generation not showing in VariantList and upload auth retry
e7760a3 Add holistic image audit system + rename quality to prompt readiness
d0cc29c Phase 4 polish: welcome screen, UX cleanup, repo cleanup, bug fixes
```

---

## 10. What to Work on Next (Suggested Priority)

### All Planned Lite Feature Gaps — COMPLETED (Feb 16)
Character AI parity, model-specific KB loading, and test suite all done. See Sessions in Section 5.

### Remaining Work
1. **End-to-end workflow testing** — Full flow: create project → chat → build shots → @mention → generate prompt → upload image → audit → refine → lock in. Visual test prompt exists at `tests/visual-test-prompt.md`
2. **KB accuracy audit** — Compare condensed `02_Model_*.md` files against full research in `kb/models/` dirs. Previous "optimization" lost critical info
3. **Repo organization** — Root-level docs (AGENTS.md, CONCEPT_PITCH.md, PRODUCTION_WORKFLOW.md, MASTER_INDEX.md) may be stale

### Deferred (Not Lite Version Scope)
- In-app image generation (Full version)
- Video generation workflow (after image is locked in)
- Multi-agent orchestration (future architecture)
