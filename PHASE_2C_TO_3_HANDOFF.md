# Phase 2C → Phase 3 → Phase 4 Handoff Document

**Version:** 2.0
**Date:** February 11, 2026
**Status:** Phase 4 (Creative Director Collaboration) Complete
**Branch:** `claude/add-aesthetic-suggestions-FOYuK`

---

## 1. Executive Summary

This document serves as the comprehensive restore point covering Phase 2C (Optimization), Phase 3 (AI Collaboration Layer), and Phase 4 (Creative Director Workspace). All three phases are now complete.

**Critical Strategic Reminder:**
ShotPilot is NOT a generic prompt optimizer. It is a professional cinematography consulting tool powered by a 250K-word knowledge base. We prioritize filmic realism, expert-level diagnostics, and context persistence over "one-click magic."

---

## 2. Phase 2C Completion Summary (Optimization)

**Status: COMPLETE**
**Objective:** Optimize the 250K-word Knowledge Base for AI consumption.

**Key Achievements:**
1. Condensed KB: 13 files (~18K tokens total)
2. Spatial Composition Pack created
3. Quality Control Pack expanded (430 → 1,400 words with film references)
4. Focal length conflicts resolved (85mm vs 50mm portrait logic)
5. Translation Matrix updated for Midjourney v7 and Kling syntax
6. Validation Protocol: 5-test pass/fail criteria, 4/5 pass rate

---

## 3. Sprint 1 Completion Summary (Stabilization)

**Status: COMPLETE**
**Objective:** Stabilize core systems and prepare backend for video workflows.

### 5 Bug Fixes
1. Quality Score Inflation (empty shots: 65% → 30%)
2. Focal Length Conflicts resolved
3. React rendering issues in Shot Card
4. Shot numbering gaps fixed (1,3,4 → 1,2,3)
5. Generate Prompt modal stale data

### 2 Systems Implemented
1. **On-the-Fly Quality Score:** 80% Shot / 20% Context, <1ms calculation
2. **Model Selection UI:** Image vs Video separation, dropdown filters

### Kling 3.0 Integration
- Multi-shot intelligence, 15s duration, Elements 3.0
- Full 5-layer prompt structure added

---

## 4. Phase 3 Completion Summary (AI Collaboration Layer)

**Status: COMPLETE (All 7 sub-phases)**

### 3.1: Aesthetic Suggestions Panel
- `AestheticSuggestionsPanel.tsx` on ProjectInfoPage
- AI suggests style, mood, lighting, cinematography based on project context

### 3.2: Character AI Assistant
- `CharacterAIAssistant.tsx` in character modal
- AI generates character descriptions, personality, visual direction

### 3.3: Shot Planning Panel
- `ShotPlanningPanel.tsx` modal from scene header
- AI generates shot sequence for a scene with camera angles, movements, focal lengths

### 3.4: Quality Dialogue
- `QualityDialogue.tsx` chat modal from shot quality badge
- Conversational quality check using KB criteria

### 3.5: Script Analyzer
- `ScriptAnalyzer.tsx` / `ScriptAnalyzerPage.tsx`
- Analyzes uploaded scripts for scenes, characters, mood, visual direction

### 3.6: Object AI Assistant
- `ObjectAIAssistant.tsx` in object modal
- AI suggests object descriptions, visual attributes, material properties

### 3.7: Usage Tracking & KB Metadata
- `kbFilesUsed` metadata attached to all AI responses
- `logAIFeatureUsage()` tracks which AI features are used
- `getAIUsageStats()` endpoint for analytics

---

## 5. Phase 4 Completion Summary (Creative Director Workspace)

**Status: COMPLETE**
**Objective:** Build collaborative AI Creative Director for end-to-end project development.

### Creative Director Chat
- Full-featured AI chat powered by Gemini with model-specific KB
- Conversational project development (script, vision, characters, scenes)
- System prompt with INTERNAL WORKFLOW rules (never stated to user)
- Tone tuned: concise, story-focused, minimal camera verbosity

### Persistent Chat Sidebar (Architectural Refactor)
- **`ChatSidebar.tsx`**: Extracted chat component, 380px wide, collapsible to 44px
- **`ProjectLayout.tsx`**: Layout wrapper with React Context for shared project state
- **Nested routing**: All `/projects/:id/*` routes render inside ProjectLayout
- Chat stays visible across ALL tabs (Project Info, Characters, Objects, Scene Manager)
- `queueMessage()` in zustand store for cross-component "Send to Director"

### Auto-Create from Chat
- **Characters**: AI silently creates characters in DB when discussed (deduped by name)
- **Scenes & Shots**: Created when user explicitly requests scene breakdown
- Badges in chat show what was created

### Script Management
- Script upload (.txt, .fdx, .fountain, .md) with size limit (50K chars)
- Script editor with character count
- "Send to Director" queues message to sidebar
- **Script update protection**: AI must return FULL script (not fragments), frontend rejects updates shorter than 50% of existing script

### Image Analysis Pipeline
- Image upload via multer with absolute path resolution
- Magic-byte MIME detection for extensionless files (PNG, GIF, WebP, JPEG)
- Default behavior: AUDIT against existing project direction (not overwrite)
- Only updates fields if user explicitly says "lock this style"

### Save Reliability
- Debounced field saves (800ms)
- 30s periodic auto-save interval
- `sendBeacon` on `beforeunload` for crash protection
- Zustand persist middleware for conversation state in localStorage

### Conversation Compaction
- Triggers at 20 messages, keeps recent 6 intact
- Older messages summarized by Gemini (low thinking, 1024 max tokens)
- Structured digest: summary, key decisions, character/scene notes, style direction
- Replaces old messages with single "Context Digest" message
- Reduces API token costs on every subsequent call

### Project CRUD
- Editable title (click to rename)
- Create new project (+ button)
- Delete project with confirmation dialog
- Frame size dropdown with 7 presets (including anamorphic/cinemascope)

---

## 6. Current Codebase State

**Branch:** `claude/add-aesthetic-suggestions-FOYuK`

**Model Lineup (7 Models):**
- **Image (4):** Higgsfield Cinema Studio, Midjourney, GPT Image, Nano Banana Pro
- **Video (3):** VEO 3.1, Kling 2.6, Kling 3.0

**Gemini Model:** `gemini-3-flash-preview` (with thinking support, 1M context)

**Systems Status:**
- **Frontend:** React 19 + TypeScript + Vite 7 — Stable
- **Backend:** Express 5 + better-sqlite3 — Stable
- **KB:** 12 core files + 24 model-specific guides + packs + translation matrix
- **Tests:** 72 unit tests passing (Vitest)
- **State:** Zustand with persist middleware (localStorage)

### Architecture
```
App (auto-login)
└── Header (tabs: Creative Director | Characters | Objects | Scene Manager)
    └── ProjectLayout (shared project context via React Context)
        ├── ChatSidebar (persistent, collapsible, left side)
        │   ├── AI conversation with Gemini
        │   ├── Model selector dropdown
        │   ├── Image upload + preview
        │   ├── Quick start buttons
        │   └── Conversation compaction
        └── Content Area (switches with tabs):
            ├── CreativeDirectorPage (project info + script)
            ├── CharacterBiblePage
            ├── ObjectBiblePage
            └── ShotBoardPage (scenes + shots)
```

---

## 7. Strategic Decisions Log

| Decision | Rationale | Status |
| :--- | :--- | :--- |
| **Persistent Chat Sidebar** | AI collaboration across all tabs is the key differentiator vs dump-and-run storyboard tools | **Architectural** |
| **Script-First Workflow** | Script is the narrative blueprint; all other creative decisions flow from it | **Workflow** |
| **Image = Audit, Not Overwrite** | Reference images should be compared against existing direction, not replace it | **Behavioral** |
| **Full Script Updates Only** | AI must return complete script with edits integrated, never fragments | **Safety** |
| **Conversation Compaction** | Prevents context drift, reduces costs, improves latency on long conversations | **Optimization** |
| **Lite vs Full = Model Count** | Features identical; only library size varies | **Permanent** |
| **Image/Video Separation** | Users think differently directing stills vs motion | **Architectural** |
| **On-the-Fly Scoring** | Live calc (<1ms) vs stored scores that go stale | **Architectural** |
| **80/20 Weighting** | Shot (80%) + Context (20%): users control their shots | **Algorithm** |
| **KB Condensation** | 250K words → 18K tokens fits context window while retaining expertise | **Permanent** |

---

## 8. What's Next

### Potential Phase 5 Features
1. **Video UI** — Unlock VEO 3.1, Kling 2.6, Kling 3.0 with video-specific settings (duration, FPS, camera move)
2. **Shot iteration from sidebar** — Refine individual shots through AI conversation
3. **Storyboard export** — Visual storyboard layout for scenes
4. **Multi-model prompt generation** — Generate same shot across multiple models
5. **Batch operations** — Generate all shots in a scene at once
6. **Collaboration** — Multi-user projects
7. **Payment integration** — Stripe for credit purchases

---

## 9. Critical Reminders

1. **Do Not "Simplify" the KB** — The complexity IS the product
2. **Maintain 80/20 Split** — Never let Context override user's Shot decisions
3. **Video is Different** — 5-layer structure (Scene, Character, Action, Camera, Audio)
4. **Keep it Fast** — Quality checks <50ms (current <1ms)
5. **Script Protection** — Never let AI erase script content (50% length guard)
6. **AI Rules = Internal** — The AI should NEVER state its rules/workflow to the user
7. **Chat is Persistent** — The sidebar must survive tab navigation

---

**End of Handoff Document**
