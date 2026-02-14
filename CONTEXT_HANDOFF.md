# ShotPilot — Context Handoff Summary

**Date:** February 14, 2026
**Creator:** Caleb (self-described "visionary, not developer" — surface-level code understanding, defers technical decisions)
**Repository:** `cramsey28/cine-ai-knowledge-base`
**Active Branch:** `claude/add-aesthetic-suggestions-upSzS`
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

### Frontend Pages
- **Creative Director** — AI chat sidebar (persistent via zustand) + project info display
- **Characters** — Bible page with AI assistant, reference image upload
- **Objects** — Bible page with AI assistant (model selector, turnaround prompts)
- **Scene Manager** — Shot board with variant management, audit, prompt generation
- **Image Library** — **NEW** project-level image parking lot for alternates/references

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

### From Testing / User Notes
- **Character AI Assistant** does NOT have the model selector or turnaround prompts yet (only Object AI Assistant was updated). Should mirror the same pattern.
- **Repo organization** — Caleb explicitly deferred this: *"Repo org - lets tackle this later."* The root-level docs (AGENTS.md, CONCEPT_PITCH.md, PRODUCTION_WORKFLOW.md, MASTER_INDEX.md) may be stale. `PROJECT_CONTEXT_SUMMARY.md` was last updated Feb 12 and references the old branch.
- **Video QC vs Image QC** — QC pack was split into Image and Video files, but video quality analysis is not implemented yet. No video generation workflow exists in the app.
- **KB accuracy concerns** — Caleb flagged that Claude's "optimization" of research files lost critical information. The condensed `02_Model_*.md` files (~600 words each) may have inaccuracies. The full research in `kb/models/` is more reliable but only loaded for deep queries.
- **Multi-agent architecture** — Caleb's original vision was multi-agent specialists for different domains. Currently everything runs through a single Gemini agent with different system prompts. This was a deliberate MVP trade-off but may be revisited.
- **No video generation workflow** — Video models (VEO, Kling) are in the KB and model registry but there's no UI flow for video generation yet.
- **Tests may be stale** — Test files (`phase2c-api.test.js`, `phase3.test.js`) were written for earlier phases and may not cover recent changes.
- **Auth is placeholder** — MVP uses hardcoded `test@shotpilot.com` with auto-login. No real authentication.
- **Credits system is mostly cosmetic** — Credit tracking exists but is loosely enforced.
- **OneDrive/data loss risk** — User previously lost all data from OneDrive conflicts. Database is gitignored, so project data doesn't persist across clones.

### Architectural Concerns
- ~~`geminiService.js` is massive~~ — **RESOLVED**: Split into 7 domain modules under `server/services/ai/`
- ~~`server/index.js` is massive~~ — **RESOLVED**: Split into 8 route modules under `server/routes/`
- **No error boundaries around AI calls** — If Gemini returns malformed JSON, the parsing can fail silently or crash.
- ~~Base64 images in SQLite~~ — **NOT AN ISSUE**: Images are stored as files in `uploads/images/`, only file paths are in the DB. Base64 conversion only happens transiently when sending to Gemini API.
- **No image optimization** — Uploaded images aren't resized or compressed before storage.

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

## 8. Caleb's Design Principles (Inferred from Conversations)

1. **KB is the source of truth** — Gemini should consult KB first, only go outside KB if info is missing
2. **AI does the work, not the user** — Prompt refinement is automatic, not manual
3. **Realism is the hardest problem** — Special attention to diagnosing AI artifacts
4. **Project info is macro-level** — Should capture overall visual direction, not per-character details
5. **Conservative updates** — Don't overwrite existing project data unless explicitly discussing project-level changes
6. **Model-specific prompts** — Every prompt should be optimized for the specific target model's syntax and capabilities
7. **Professional cinematography language** — This is a filmmaking tool, not a generic image generator
8. **Don't over-trust AI** — Verify what Claude/AI produces against the original research

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

1. **Character AI Assistant parity** — Add model selector + turnaround prompts (mirror ObjectAIAssistant pattern)
2. **Testing pass** — Run the app end-to-end, verify all 8 fixes work in practice. Route test suite exists at `tests/route-test.js`
3. **KB accuracy audit** — Compare condensed `02_Model_*.md` files against full research in `models/` dirs
4. **Update PROJECT_CONTEXT_SUMMARY.md** — Currently references old branch and Phase 4 state
5. **Repo organization** — Caleb deferred this but root-level docs may need cleanup
6. **Image optimization** — Uploaded images aren't resized/compressed before storage or Gemini API submission
7. **Video generation workflow** — Models are in KB but no UI exists yet
