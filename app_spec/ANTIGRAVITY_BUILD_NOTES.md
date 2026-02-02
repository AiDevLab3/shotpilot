# Antigravity Build Notes (MVP)

This document defines the required structure and rules for building the Cine-AI Shotboard MVP in Antigravity.

---

## 1) Ingestion Rules (Knowledge Base)

Only ingest the following folders:

- `kb/packs/`
- `kb/models/`
- `kb/examples/`

Do NOT ingest:

- `kb/archive/`

Reason: archive content may contain duplicates or deprecated guidance that will cause prompt drift.

---

## 2) Required Views (MVP UI)

### A) Shotboard Grid View (Primary)
- Rows = Shots (ordered by `shotNumber`)
- Each row shows:
  - shotNumber
  - shotIntent summary
  - selectedFrame thumbnail (if selected)
  - status
  - lock indicators

### B) Shot Inspector Panel (Right Side)
Shows:
- shot intent
- composition plan
- camera plan
- lighting plan
- continuity locks
- linked SoulIDs and EntityIDs
- selectedFrameId
- iterationsCount

### C) Frame Variant Panel
For each Shot:
- list all Frames (variants)
- select one as "Selected Frame"
- show audit tier (LOCK IT IN / REFINE / REGENERATE)
- show quick notes and prompt bundle

### D) Scene Canvas View (Secondary)
Scene-level visual organization.
- nodes reference existing Frames or Notes
- flexible layout (not locked to a template)
- supports scenes with 3 frames or 10+ frames

### E) Project DNA Panel
Project-level controls:
- Project Look (global style)
- Realism Mode toggle
- Canon Frame Anchors:
  - canonStyleFrameId
  - canonCharacterFrameId
  - canonLightingFrameId

---

## 3) Non-Negotiable Workflow Rules

- **Frame is the atomic unit** (an image variant)
- A **Shot can have multiple Frames**
- A Shot has exactly one `selectedFrameId` (optional until selected)
- A selected frame can be locked and treated as canon for that shot
- Project-level canon frames can be referenced to enforce global continuity
- No "unattached images":
  - every image must belong to a Shot as a Frame

---

## 4) Prompt Compiler Output Format (4-Block)

Every compiled prompt must output 4 blocks:

### Block 1 — Scene Intent
Human-readable description of what is happening.

### Block 2 — Project Look Injection
Global style and cinematic intent from ProjectDNA.

### Block 3 — Realism Pack Injection
Insert `REALISM_LOCK_BLOCK` + required lens/lighting macros when realism mode is enabled.

### Block 4 — Model Wrapper
Model-specific syntax and parameter formatting.

Final output must include:
- `fullPrompt`
- `negativePrompt` (if supported)
- `params` (seed/stylize/aspect/etc. when relevant)

---

## 5) Prompt Compilation Rule

- Packs = global constraints
- Models = wrappers for syntax
- The compiler must never "average" prompts across models.
  - It must translate intent into each model's best practice syntax.
