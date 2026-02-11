# ShotPilot: Project Context & Vision

**Last Updated:** February 11, 2026
**Version:** Phase 4 Complete (Creative Director + Persistent Sidebar)
**Creator:** Caleb
**Repository:** cine-ai-knowledge-base
**Branch:** `claude/add-aesthetic-suggestions-FOYuK`
**Current AI Model:** Gemini 3 Flash Preview (configurable via GEMINI_MODEL env var)

---

## Table of Contents

1. [Project Vision](#project-vision)
2. [Competitive Advantages](#competitive-advantages)
3. [Repository Structure](#repository-structure)
4. [Knowledge Base](#knowledge-base)
5. [Selected Models](#selected-models)
6. [Technical Architecture](#technical-architecture)
7. [Current State](#current-state)
8. [Key Files Reference](#key-files-reference)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Strategic Decisions](#strategic-decisions)
11. [Restore Point Checklist](#restore-point-checklist)

---

## Critical Strategic Reminder

> ShotPilot is NOT a generic prompt optimizer. It is a professional cinematography consulting tool powered by a 250K-word knowledge base. We prioritize filmic realism, expert-level diagnostics, and context persistence over "one-click magic."

---

## Project Vision

### The Problem

AI filmmakers face a fragmented workflow with context loss at every step:

- **Context Loss:** Creative planning → storyboarding → image generation → iteration → video generation (context resets at each step)
- **Generic Prompts:** Different LLMs give generic prompts that aren't model-specific
- **No Persistence:** No context preservation across sessions
- **No Collaboration:** Other tools dump a storyboard and leave — no iterative AI partner
- **Surface Analysis:** Image quality analysis is surface-level, not expert-level

### The Solution: ShotPilot

A **persistent AI copilot for cinematic AI filmmaking** that:

- Maintains project context across entire creative workflow
- Provides expert-level, model-specific prompts using 250K-word knowledge base
- Collaborates conversationally through every stage (script → characters → scenes → shots)
- Analyzes images against professional cinematic realism standards
- Organizes projects, scenes, shots, and variants in unified dashboard

### Core Insight

> **"LTX Studio with a collaborative AI agent that optimizes end-to-end"**

The differentiator is **persistent AI collaboration** — the Creative Director sidebar stays with you across every tab, maintaining context and helping you develop your vision from concept to camera-ready.

---

## Competitive Advantages

### 1. Persistent AI Collaboration (The Key Differentiator)
- AI Creative Director sidebar visible across ALL tabs
- Conversational development from script to final shot
- Auto-creates characters, scenes, shots from natural conversation
- Summarizes/compacts long conversations to prevent context drift

### 2. Specialized Knowledge Base
- **Full Version:** 250,000+ words of expert AI filmmaking knowledge
- **Condensed Version:** 12 core files + 24 model-specific guides
- **Coverage:** Model-specific syntax, not generic "AI art" advice

### 3. Model-Specific Expertise (7 Models)
- **Higgsfield:** Dropdown UI + technical camera specs
- **Midjourney:** Parameter-based (--ar, --style, --cref, --sref)
- **Nano Banana:** Physics-based conversational editing
- **GPT Image:** Natural language descriptions
- **VEO 3.1:** 5-part cinematic formula + native audio
- **Kling 2.6:** Custom Face Models + Element Library
- **Kling 3.0:** Multi-shot intelligence, 15s duration

### 4. Context Persistence
- **Project DNA:** Maintained across all shots and conversations
- **Character Bibles:** Enforce visual consistency
- **Hierarchical Context:** Shot > Scene > Project (most specific wins)
- **Conversation Memory:** Compacted to preserve key decisions

### 5. Expert-Level Quality Analysis
- 6-Dimension Audit Framework (AI Sheen, Lighting, Character, Visual Hierarchy, Motion, Adherence)
- 3-Tier Recommendation System (LOCK IT IN / REFINE / REGENERATE)
- Conversational quality dialogue for iterative improvement

---

## Repository Structure

```
cine-ai-knowledge-base/
├── PROJECT_CONTEXT_SUMMARY.md         # This file — project restore point
├── PHASE_2C_TO_3_HANDOFF.md           # Phase handoff document
│
├── kb/                                # FULL KNOWLEDGE BASE (250K+ words)
│   ├── models/                        # 24 comprehensive model guides
│   ├── packs/                         # 5 specialized knowledge packs
│   ├── index/                         # KB navigation and master index
│   ├── examples/                      # Templates and workflows
│   └── archive/                       # Archived cross-model guides
│
└── shotpilot-app/                     # APPLICATION
    │
    ├── kb/                            # CONDENSED KNOWLEDGE BASE
    │   ├── 01_Core_Realism_Principles.md
    │   ├── 02_Model_*.md              # 6 model instruction files
    │   ├── 03_Pack_*.md               # 4 knowledge packs
    │   ├── 04_Translation_Matrix.md
    │   └── models/                    # 24 full model-specific guides
    │
    ├── src/                           # Frontend (React 19 + TypeScript)
    │   ├── App.tsx                    # Root: routing + auto-login
    │   ├── components/
    │   │   ├── ChatSidebar.tsx        # Persistent AI chat sidebar
    │   │   ├── ProjectLayout.tsx      # Layout wrapper + project context
    │   │   ├── layout/Header.tsx      # Navigation tabs
    │   │   ├── AestheticSuggestionsPanel.tsx  # Phase 3.1
    │   │   ├── CharacterAIAssistant.tsx       # Phase 3.2
    │   │   ├── ShotPlanningPanel.tsx           # Phase 3.3
    │   │   ├── QualityDialogue.tsx             # Phase 3.4
    │   │   ├── ScriptAnalyzer.tsx              # Phase 3.5
    │   │   ├── ObjectAIAssistant.tsx           # Phase 3.6
    │   │   ├── GeneratePromptModal.tsx
    │   │   ├── GeneratePromptButton.tsx
    │   │   ├── RecommendationsDialog.tsx
    │   │   ├── QualityBadge.tsx
    │   │   ├── CreditBadge.tsx
    │   │   ├── VariantList.tsx
    │   │   └── VariantCard.tsx
    │   ├── pages/
    │   │   ├── CreativeDirectorPage.tsx  # Project info + script (no chat)
    │   │   ├── CharacterBiblePage.tsx
    │   │   ├── ObjectBiblePage.tsx
    │   │   ├── ShotBoardPage.tsx         # ~1050 lines, scenes + shots
    │   │   ├── ProjectInfoPage.tsx
    │   │   └── ScriptAnalyzerPage.tsx
    │   ├── services/
    │   │   └── api.ts                 # 52 API functions + auto-login
    │   ├── stores/
    │   │   └── creativeDirectorStore.ts  # Zustand with persist
    │   └── types/
    │       └── schema.ts
    │
    ├── server/                        # Backend (Express 5 + SQLite)
    │   ├── index.js                   # Express server + all API routes
    │   ├── database.js                # SQLite schema (8 tables)
    │   ├── middleware/
    │   │   └── auth.js
    │   └── services/
    │       ├── geminiService.js       # 13 exported AI functions
    │       ├── kbLoader.js            # KB file loading + caching
    │       ├── creditService.js       # Credit management
    │       └── qualityCheck.js        # Completeness scoring
    │
    ├── tests/
    │   ├── phase2c-api.test.js        # 72 tests (Vitest)
    │   ├── phase3.test.js
    │   └── phase2c.spec.js            # Playwright (pre-existing failures)
    │
    ├── .env                           # GEMINI_API_KEY, SESSION_SECRET
    ├── package.json
    └── vite.config.ts
```

---

## Knowledge Base

### Condensed KB (In `shotpilot-app/kb/`)

| File | Purpose |
|------|---------|
| `01_Core_Realism_Principles.md` | Universal photography/cinematography rules |
| `02_Model_Higgsfield_Cinema_Studio.md` | Dropdown UI workflow, rig builds |
| `02_Model_Midjourney.md` | 8-component framework, parameter mastery |
| `02_Model_Nano_Banana_Pro.md` | 6-variable framework, physics-based syntax |
| `02_Model_GPT_Image.md` | Natural language, iterative editing |
| `02_Model_VEO_31.md` | 5-part formula, native audio |
| `02_Model_Kling_26.md` | Custom Face Models, Element Library |
| `03_Pack_Character_Consistency.md` | Character bible, cross-model consistency |
| `03_Pack_Quality_Control.md` | 6-dimension audit, 3-tier recommendations |
| `03_Pack_Motion_Readiness.md` | Animation prep, storyboard sequence |
| `03_Pack_Spatial_Composition.md` | Spatial/anatomy rules, blocking |
| `04_Translation_Matrix.md` | Cross-model syntax translation |

### Full KB (In `shotpilot-app/kb/models/`)
24 comprehensive model-specific Prompting Mastery guides covering all supported models.

---

## Selected Models

### Image (4)
1. **Higgsfield Cinema Studio V1.5** — Deterministic camera/lens control
2. **Midjourney** — Artistic stylization, look development
3. **Nano Banana Pro** — High-quality edits, 4K native, physics-based
4. **GPT Image 1.5** — Natural language, fast iteration

### Video (3)
5. **VEO 3.1** — Native audio generation, 5-part formula, 8s duration
6. **Kling 2.6** — Physics simulation, character consistency, 5-10s
7. **Kling 3.0** — Multi-shot intelligence, 15s duration (hidden in UI)

---

## Technical Architecture

### Stack
- **Frontend:** React 19.2 + TypeScript 5.9 + Vite 7.2 (SWC plugin)
- **Backend:** Node.js + Express 5 (ES Modules)
- **Database:** SQLite via better-sqlite3 (synchronous queries)
- **AI:** Gemini 3 Flash Preview (1M context, multimodal, thinking support)
- **State:** Zustand with persist middleware (localStorage)
- **Icons:** lucide-react
- **Styling:** Inline React.CSSProperties, dark theme (#18181b, #27272a, #3f3f46)
- **Auth:** Auto-login MVP pattern (test@shotpilot.com)

### Database Schema (8 Tables)
1. **users** — id, email, password_hash, credits, tier
2. **usage_log** — id, user_id, action, credits_used, model_name, shot_id
3. **projects** — id, user_id, title, frame_size, purpose, lighting_directions, style_aesthetic, storyline_narrative, cinematography, atmosphere_mood, cinematic_references
4. **characters** — id, project_id, name, description, personality, reference_image_url
5. **objects** — id, project_id, name, description, reference_image_url
6. **scenes** — id, project_id, name, description, order_index, location_setting, time_of_day, weather_atmosphere, mood_tone, lighting_notes, camera_approach, characters_present, status
7. **shots** — id, scene_id, shot_number, shot_type, camera_angle, camera_movement, desired_duration, focal_length, camera_lens, description, blocking, vfx_notes, sfx_notes, notes, status, order_index
8. **image_variants** — id, shot_id, image_url, model_used, prompt_used, generated_prompt, user_edited_prompt, quality_score, status, analysis_notes

### App Architecture
```
App (BrowserRouter + auto-login)
└── Header (NavLink tabs + project selector dropdown)
    └── ProjectLayout (React Context: project, setProject, refreshProject)
        ├── ChatSidebar (380px, collapsible to 44px)
        │   ├── Gemini-powered conversation
        │   ├── Model selector (7 models)
        │   ├── Image upload + preview
        │   ├── Quick start: Upload Script / Paste / Start from Idea
        │   ├── Auto-create characters, scenes, shots from chat
        │   ├── Conversation compaction (20 msg threshold)
        │   └── Project field updates from AI
        └── Outlet (content area, switches per route):
            ├── / → CreativeDirectorPage (project info + script editor)
            ├── /characters → CharacterBiblePage
            ├── /objects → ObjectBiblePage
            └── /scenes → ShotBoardPage
```

### Zustand Store (`creativeDirectorStore.ts`)
```typescript
SessionData: {
    messages: Message[];        // Chat history (user/assistant/summary)
    scriptContent: string;      // Script text
    mode: 'initial' | 'script-first' | 'idea-first' | 'refining';
    projectSnapshot: Project;   // Cached project data
    targetModel: string | null; // Selected model for prompt generation
}
// Plus: queueMessage/clearQueuedMessage for cross-component communication
```

### Gemini Service Functions (13 exported)
| Function | Purpose | Phase |
|----------|---------|-------|
| `generateRecommendations()` | Field suggestions for incomplete shots | 2B |
| `generatePrompt()` | Model-specific prompt generation | 2B |
| `analyzeQuality()` | KB-guided quality analysis | 2B |
| `generateAestheticSuggestions()` | Project aesthetic suggestions | 3.1 |
| `generateCharacterSuggestions()` | Character bible suggestions | 3.2 |
| `generateShotPlan()` | Shot sequence for a scene | 3.3 |
| `qualityDialogue()` | Conversational quality check | 3.4 |
| `analyzeScript()` | Script analysis | 3.5 |
| `generateObjectSuggestions()` | Object/prop suggestions | 3.6 |
| `buildContextBlock()` | Format DB objects as context strings | Helper |
| `refineContent()` | Conversational refinement | 3.2/3.6 |
| `creativeDirectorCollaborate()` | Creative Director chat | 4 |
| `summarizeConversation()` | Conversation compaction | 4 |

---

## Current State

### Completed Phases

#### Phase 0: Foundation
- Repository structure, full KB (250K words), condensed KB

#### Phase 1: Core UI & CRUD
- 8-table database schema
- Project Info, Characters, Objects, Scene Manager pages
- All CRUD operations, hierarchical data structure
- Reference image upload, status management

#### Phase 2A-B: Backend Services + Stabilization Sprint
- Authentication (session-based, auto-login MVP)
- Credit system with usage logging
- KB loader with model-specific file mapping
- Quality check (completeness scoring, on-the-fly <1ms, 80/20 weighting)
- Gemini integration (recommendations, prompt generation)
- Kling 3.0 integration (multi-shot intelligence, 15s, Elements 3.0)
- Bug fixes: quality score inflation, focal length conflicts, shot numbering gaps, modal stale data

#### Phase 2C: Frontend AI Integration
- Credit badge in header
- Generate Prompt button + modal with model selector
- Quality check workflow (70% threshold)
- Recommendations dialog (AI field suggestions)
- Variant display with quality badges
- Error handling and loading states

#### Phase 3: AI Collaboration Layer (All 7 Sub-phases)
- 3.1: Aesthetic Suggestions Panel
- 3.2: Character AI Assistant
- 3.3: Shot Planning Panel
- 3.4: Quality Dialogue (chat-based quality check)
- 3.5: Script Analyzer
- 3.6: Object AI Assistant
- 3.7: KB metadata + usage tracking

#### Phase 4: Creative Director Workspace
- AI Creative Director with conversational project development
- Persistent collapsible chat sidebar (across all tabs)
- Auto-create characters and scenes from conversation
- Script management (upload, edit, "Send to Director")
- Image upload and analysis pipeline (audit mode)
- Save reliability (debounce, auto-save, sendBeacon)
- Conversation compaction at 20 messages
- Script update protection (50% length guard)
- Project CRUD (create, rename, delete)
- Frame size dropdown with 7 presets

### Test Status
- **72 Vitest tests passing**
- 2 Playwright test files with pre-existing import failures
- TypeScript compilation clean
- Vite production build succeeds

---

## Key Files Reference

### Critical Files
| File | Purpose | Lines |
|------|---------|-------|
| `src/components/ChatSidebar.tsx` | Persistent AI chat sidebar | ~350 |
| `src/components/ProjectLayout.tsx` | Layout + project context provider | ~120 |
| `src/pages/CreativeDirectorPage.tsx` | Project info + script (no chat) | ~480 |
| `src/pages/ShotBoardPage.tsx` | Scene/shot management | ~1050 |
| `server/services/geminiService.js` | 13 AI functions | ~1200 |
| `server/index.js` | Express server + all routes | ~700 |
| `src/services/api.ts` | 52 frontend API functions | ~385 |
| `src/stores/creativeDirectorStore.ts` | Zustand state management | ~142 |

### Environment
```bash
GEMINI_API_KEY=your_key_here
SESSION_SECRET=your_secret_here
# Optional: GEMINI_MODEL=gemini-3-flash-preview (default)
```

### Commands
```bash
npm start          # Both backend + frontend (concurrently)
npm run server     # Backend only (port 3000)
npm run dev        # Frontend only (Vite, port 5174)
npx vitest run     # Run tests
npx tsc --noEmit   # Type check
```

---

## Implementation Roadmap

### Completed
- Phase 0: Foundation
- Phase 1: Core UI & CRUD
- Phase 2A-B: Backend Services
- Phase 2C: Frontend AI Integration
- Phase 3: AI Collaboration Layer (3.1-3.7)
- Phase 4: Creative Director Workspace

### Potential Next Phases

#### Phase 5: Video UI Integration
- Unlock VEO 3.1, Kling 2.6, Kling 3.0 in UI
- Video-specific settings (duration, FPS, camera move)
- Video prompt compilation using 5-layer structure

#### Phase 6: Shot Iteration & Polish
- Iterate on individual shots through AI conversation
- Storyboard export view
- Multi-model prompt generation
- Batch operations (generate all shots in a scene)

#### Phase 7: Launch Prep
- Payment integration (Stripe)
- User onboarding flow
- Responsive design
- Error tracking (Sentry)
- Deployment pipeline

---

## Strategic Decisions

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

---

## Critical Reminders

1. **Do Not "Simplify" the KB** — The complexity IS the product. Remove film references and it becomes ChatGPT.
2. **Maintain 80/20 Split** — Never let Context override user's Shot decisions.
3. **Video is Different** — 5-layer structure (Scene, Character, Action, Camera, Audio). Do not reuse Image logic blindly.
4. **Keep it Fast** — Quality checks <50ms (current <1ms).
5. **Script Protection** — Never let AI erase script content (50% length guard).
6. **AI Rules = Internal** — The AI should NEVER state its rules/workflow to the user.
7. **Chat is Persistent** — The sidebar must survive tab navigation.

---

## Restore Point Checklist

### If context is lost, you need:

1. **What ShotPilot Is:** Persistent AI copilot for cinematic AI filmmaking with model-specific expertise
2. **Key Differentiator:** Persistent chat sidebar that stays across all tabs — collaborative, not dump-and-run
3. **Stack:** React 19 + Vite 7 + Express 5 + SQLite + Gemini Flash (ES modules everywhere)
4. **Styling:** Inline CSSProperties, dark theme, lucide-react icons, zustand state
5. **Architecture:** ProjectLayout wraps all routes, provides project context; ChatSidebar is persistent left panel
6. **AI Service:** `geminiService.js` has 13 exported functions; `callGemini()` is the internal wrapper
7. **KB:** Condensed files in `shotpilot-app/kb/`, loaded by `kbLoader.js` with caching
8. **Store:** `creativeDirectorStore.ts` — per-project sessions with messages, script, mode, model
9. **Navigation:** Creative Director | Characters | Objects | Scene Manager (tabs in Header)
10. **Commands:** `npm start` for both servers, NOT `npm run dev` (that's frontend only)
11. **Branch:** `claude/add-aesthetic-suggestions-FOYuK`
12. **Tests:** 72 passing via `npx vitest run`

---

## Version History

| Date | Version | Milestone |
|------|---------|-----------|
| Feb 5, 2026 | 0.1 | Phase 2B Complete — Backend services + Gemini integrated |
| Feb 9, 2026 | 0.2 | Phase 2C + Phase 3 Complete — AI collaboration layer |
| Feb 11, 2026 | 0.3 | Phase 4 Complete — Creative Director + persistent sidebar |
| [Future] | 1.0 | Public Launch — ShotPilot Lite v1.0 live |

---

**This document serves as the complete project context restore point. If context is lost, this restores you to exactly where we are today: February 11, 2026.**
