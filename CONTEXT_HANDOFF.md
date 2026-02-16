# ShotPilot — Context Handoff Summary

**Date:** February 15, 2026
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
├── 01_Core_Realism_Principles.md    ← Loaded in ALL 11 AI endpoints (most critical file)
├── 02_Model_*.md (7 files)          ← Condensed model guides (~600 words each)
├── 03_Pack_*.md (4 files)           ← Specialized cinematography packs
├── 04_Translation_Matrix.md         ← Cross-model parameter mapping
├── models/                          ← Full research per model (loaded for deep queries)
│   ├── midjourney/Prompting_Mastery.md  ← Updated to V7 (--oref replaces --cref)
│   ├── gpt_image_1_5/
│   ├── nano_banana_pro/
│   └── ... (23+ model directories)
└── archive/                         ← Old versions, not active
```

**KB Loading Flow:** `kbLoader.js` → `readKBFile()` / `loadKBForModel()` → concatenated into Gemini system instruction context.

### Database Schema (SQLite, WAL mode)
- `users` — auth (MVP uses hardcoded test user)
- `projects` — title, frame_size, style_aesthetic, cinematography, mood, references, etc.
- `characters` — name, description, personality, reference_image_url
- `objects` — name, description, reference_image_url
- `scenes` — location, time_of_day, weather, mood, lighting, camera approach
- `shots` — shot_type, camera_angle, camera_movement, focal_length, lens, description, blocking
- `image_variants` — image_url, model_used, prompts (original/generated/edited), audit_score, audit_data
- `project_images` — **NEW** alt images library (image_url, title, notes, tags)

### AI Services (split into `server/services/ai/` modules, barrel-exported via `geminiService.js`)

| Module | Functions |
|--------|-----------|
| `ai/shared.js` | `buildContextBlock`, `buildImageParts`, `callGemini` (core Gemini API client) |
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
| `routes/images.js` | Upload, variants CRUD, holistic image audit |

50 total endpoints across 8 route modules. Each module exports a factory function receiving dependencies (db, services, middleware).

### Frontend Pages (5 active, routed in App.tsx)
- **Creative Director** (`/projects/:id`) — AI chat sidebar (persistent via zustand) + project info display + script upload/analysis. Absorbed the former standalone ScriptAnalyzerPage and ProjectInfoPage.
- **Characters** (`/projects/:id/characters`) — Bible page with AI assistant, reference image upload
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

### Session: Feb 14 (Current) — Architecture Refactoring

#### Monolith Split
- **`server/index.js`** (1,665 → 140 lines) — All routes extracted into 8 domain modules under `server/routes/`
- **`server/services/geminiService.js`** (1,611 → 24 lines) — All AI functions extracted into 7 domain modules under `server/services/ai/`
- `geminiService.js` is now a barrel re-export file — existing imports work unchanged
- Each route module exports a factory function that receives dependencies (db, services, middleware)
- Fixed backward-compat aliases (`check-quality`, `quality-dialogue`) that broke during refactor — now use 307 redirects

#### Route Test Suite
- Added `tests/route-test.js` — comprehensive test hitting all 50 endpoints
- 41/50 pass locally (9 AI endpoints need external Gemini API access)
- Tests cover full CRUD lifecycle: create → read → update → delete for all entities

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

### Backend Bugs (Priority — being fixed in Feb 15 session)
- **Duplicate KB loading in Creative Director** — When a model is selected, Core Principles, Character Consistency, and Quality Control packs are sent twice (once in `coreKBFiles` array, again inside `loadKBForModel()`). Wastes ~20-40K tokens per call.
- **Model key mismatch in qualityCheck.js** — Uses `'nano-banana'` but everywhere else uses `'nano-banana-pro'`. Also `midjourney` and `gpt-image` point to different files than kbLoader.js.
- **No retry/timeout on Gemini API calls** — `callGemini` in shared.js does a single fetch with no exponential backoff, no timeout, no 429/503 handling.
- **Script truncated at 5000 chars** — `creativeDirector.js` silently cuts scripts at 5000 chars with no user notification. Long scripts lose later scenes.
- **Dead code: `AVAILABLE_MODELS_CONSTRAINT`** — Defined and exported in shared.js but never imported or used anywhere.

### KB Content Gaps (Priority — being fixed in Feb 15 session)
- **Lost during condensation:** Global Style System (GSS) 2-layer architecture, Canon Master Look Template, and 4-Block Prompt Compiler format were cut from Core Realism Principles. These are critical for project-level visual consistency. Source: `kb/packs/Cine-AI_Cinematic_Realism_Pack_v1.md`.
- **Translation Matrix only covers 4 of 7 models** — VEO 3.1, Kling 2.6, Kling 3.0 get one paragraph instead of proper translation rows. No character consistency mechanism translations.
- **Character suggestions lack model-specific KB** — `generateCharacterSuggestions` generates generic reference prompts instead of model-optimized ones.

### Feature Gaps (Planned)
- **Characters/objects disconnected from shots** — No way to associate characters/objects with specific shots. Planned solution: @mention system (e.g., `@DetectiveMarlowe` in shot description auto-injects character details + reference image into prompt context).
- **Audit system is buried in UI** — 6-dimension audit exists but is hidden behind multiple clicks in variant cards. Needs: prominent status labels (Unaudited/Needs Refinement/Locked In), iteration tracking, 3-strike model pivot recommendation.
- **KB knowledge is invisible to users** — AI uses KB but users never see what expertise was applied. Need to surface technical insights naturally (not file names, but statements like "Midjourney V7 responds best to cinematographic language...").
- **No conversation persistence** — Chat history is browser-only (zustand). Page refresh or cache clear loses everything.
- **Character AI Assistant** does NOT have the model selector or turnaround prompts yet (only Object AI Assistant was updated).

### Deferred (Not Lite Version Scope)
- **In-app image generation** — Direct API integration planned for Full version. Lite proves the KB/AI expertise works first.
- **Video generation workflow** — Video models are in KB and registry but no UI exists. Deferred until image workflow is fully refined and locked in.
- **Multi-agent architecture** — Original vision was 5 specialized agents. Currently single Gemini with different system prompts. Deliberate MVP trade-off.

### Other Known Issues
- **Tests may be stale** — Test files from earlier phases may not cover recent changes.
- **Auth is placeholder** — MVP uses hardcoded `test@shotpilot.com` with auto-login.
- **Credits system is mostly cosmetic** — Credit tracking exists but is loosely enforced.
- **No image optimization** — Uploaded images aren't resized or compressed before storage.

### Resolved
- ~~`geminiService.js` is massive~~ — Split into 7 domain modules under `server/services/ai/`
- ~~`server/index.js` is massive~~ — Split into 8 route modules under `server/routes/`
- ~~Base64 images in SQLite~~ — Images are stored as files, only paths in DB
- ~~Orphaned pages (ScriptAnalyzerPage, ProjectInfoPage)~~ — **DELETED Feb 15**: Functionality absorbed into CreativeDirectorPage. Also deleted unused `AestheticSuggestionsPanel` component and `ShotBoardPage.tsx.bak`.

---

## 7. Key Files Quick Reference

| File | What It Does |
|------|-------------|
| `server/index.js` | Server setup, middleware, mounts route modules (~140 lines) |
| `server/routes/*.js` | 8 route modules (auth, ai, projects, characters, objects, scenes, shots, images) |
| `server/services/geminiService.js` | Barrel re-export of all AI functions from `services/ai/` |
| `server/services/ai/*.js` | 7 AI domain modules (shared, readiness, promptGeneration, suggestions, shotPlanning, scriptAnalysis, creativeDirector, imageAudit) |
| `server/services/kbLoader.js` | KB file loading, model registry, file concatenation |
| `server/services/creditService.js` | Credit deduction, usage logging, stats |
| `server/database.js` | SQLite schema + migrations |
| `server/middleware/auth.js` | Express-session auth + checkCredits middleware |
| `tests/route-test.js` | Comprehensive route test suite (50 endpoints) |
| `src/components/ChatSidebar.tsx` | Creative Director chat UI (persistent sidebar) |
| `src/components/ObjectAIAssistant.tsx` | Object prompt generation with model selector + turnaround |
| `src/components/CharacterAIAssistant.tsx` | Character prompt generation (no model selector yet) |
| `src/components/GeneratePromptModal.tsx` | Shot prompt generation modal |
| `src/components/ImageAuditReport.tsx` | 6-dimension audit display + realism diagnosis |
| `src/components/VariantList.tsx` | Image variant cards with audit/refine/upload |
| `src/pages/ShotBoardPage.tsx` | Scene manager with shot cards |
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

### Phase 1 — Foundation (In Progress, Feb 15)
1. ~~**Update CONTEXT_HANDOFF.md**~~ — Done. Added lite/full version clarity, cleaned stale refs.
2. **Fix backend bugs** — Duplicate KB loading, model key mismatch, Gemini retry/timeout, script truncation, dead code cleanup.
3. **Restore lost KB content** — GSS architecture, Master Look Template, 4-Block Prompt Compiler back into Core Realism Principles.
4. ~~**Delete orphaned pages**~~ — Done. Removed ScriptAnalyzerPage, ProjectInfoPage, AestheticSuggestionsPanel, ShotBoardPage.bak.

### Phase 2 — Core Features (Next)
5. **Complete Translation Matrix** — Add proper translation rows for all 7 lite models. Character consistency mechanism translations.
6. **@mention system** — `@CharacterName` / `@ObjectName` in shot fields auto-injects details + reference images into prompt context.
7. **Audit elevation** — Status labels (Unaudited/Needs Refinement/Locked In), iteration tracking, 3-strike model pivot, prominent UI placement.
8. **KB expertise surfacing** — AI responses explain reasoning with technical film expertise, not generic labels.

### Phase 3 — Polish
9. **Server-side conversation persistence** — Store chat history in DB, survive page refreshes.
10. **Character AI Assistant parity** — Model selector + turnaround prompts (mirror ObjectAIAssistant).

### Deferred
- In-app image generation (Full version)
- Video generation workflow (after image is locked in)
- Multi-agent orchestration (future architecture)
