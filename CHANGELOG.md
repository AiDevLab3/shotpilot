# CHANGELOG

## 2026-02-18 — Repository Restructure v2.0

### What Changed

**New `kb/core/` directory** — Universal, model-agnostic principles:
- `realism-principles.md` ← from `shotpilot-app/kb/01_Core_Realism_Principles.md`
- `spatial-composition.md` ← from `kb/packs/Cine-AI_Spatial_Composition_Anatomy_Pack_v1.md`
- `character-consistency.md` ← from `kb/packs/Cine-AI_Character_Consistency_Pack_v1.md`
- `quality-control.md` ← from `kb/packs/Cine-AI_Quality_Control_Pack_v1.md`

**New `kb/translation/` directory:**
- `translation-matrix.md` ← from `shotpilot-app/kb/04_Translation_Matrix.md`

**Clean-named packs in `kb/packs/`:**
- `motion-readiness.md` ← renamed copy of `Cine-AI_Motion_Readiness_Pack_v1.md`
- `cinematic-realism.md` ← renamed copy of `Cine-AI_Cinematic_Realism_Pack_v1.md`

**Updated `kb/models/midjourney/`:**
- Replaced with `shotpilot-app` version (278 lines vs 214 — more complete)

**New `kb/models/kling_3_0/`:**
- `Prompting_Mastery.md` ← from `shotpilot-app/kb/models/kling-3.0.md` (was only in shotpilot)

**New `kb/condensed/` directory:**
- Copied all `01_Core_*.md`, `02_Model_*.md`, `03_Pack_*.md`, `04_Translation_*.md` flat files from `shotpilot-app/kb/`
- These are compiler-optimized condensed versions with unique content (shorter, structured for fast loading)

**New `compiler/` directory (skeleton):**
- Express API scaffold for the Prompt Compiler
- `src/index.js`, `compiler.js`, `kb-loader.js`, `model-router.js`, `audit.js`
- Ready for implementation

### What Was NOT Changed
- `shotpilot-app/` — fully preserved as historical restore point, nothing deleted
- `kb/archive/` — unchanged
- `kb/models/` — all existing models unchanged (only midjourney updated, kling_3_0 added)
- Original pack filenames kept alongside clean-named copies
