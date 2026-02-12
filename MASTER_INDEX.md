# Cine-AI Knowledge Base Master Index

**Comprehensive Navigation Guide for All Content**

**Version:** 4.0  
**Last Updated:** February 2, 2026  
**Status:** Reorganized into kb/ structure

---

## 🚨 Important: Knowledge Base Has Been Reorganized

The Cine-AI Knowledge Base has been reorganized into a clean, scalable structure. **Please use the new KB Master Index for navigation:**

### **→ [New KB Master Index](kb/index/KB_MASTER_INDEX.md) ←**

---

## What Changed in v4.0

The knowledge base is now organized into three main categories:

### 1. **Packs** (Universal Constraints)
Located in `kb/packs/` - Model-agnostic guides that define rules and best practices.

- Cinematic Realism Pack v1
- Character Consistency Pack v1
- Quality Control Pack v1
- Motion Readiness Pack v1
- Spatial Composition & Anatomy Pack v1

### 2. **Models** (Syntax Wrappers)
Located in `kb/models/` - Model-specific guides organized by model name.

- 22+ model guides (image + video)
- Each in its own folder with standardized `Prompting_Mastery.md` file
- Examples: `higgsfield_cinema_studio_v1_5/`, `veo_3_1/`, `kling_2_6/`, etc.

### 3. **Examples** (Templates)
Located in `kb/examples/` - Ready-to-use templates and prompts.

- Cinematic Realism Master Prompt Template
- More templates coming soon

---

## Quick Navigation (New Structure)

| Category | Location | Description |
|----------|----------|-------------|
| **KB Master Index** | `kb/index/KB_MASTER_INDEX.md` | Start here for complete navigation |
| **Packs** | `kb/packs/` | Universal constraints (5 packs) |
| **Models** | `kb/models/` | Model-specific guides (22+ models) |
| **Examples** | `kb/examples/` | Templates and workflows |
| **App Specs** | `app_spec/` | Schema, build notes, decisions log |

---

## Legacy Structure (Deprecated)

The following folders are being phased out:

- `prompting_guides/` - Content moved to `kb/models/`
- `guides/` - Content moved to `kb/packs/` or archived

**Do not rely on these folders for canonical content.** Use the new `kb/` structure instead.

---

## For AI Agents

**To ingest the knowledge base:**

1. Start with `kb/index/KB_MASTER_INDEX.md` for structure overview
2. Load all packs from `kb/packs/` for universal principles
3. Load relevant model guides from `kb/models/` for syntax
4. Reference examples from `kb/examples/` for templates

**Key files for agents:**
- `kb/packs/Cine-AI_Cinematic_Realism_Pack_v1.md` - Core realism system
- `kb/packs/Cine-AI_Character_Consistency_Pack_v1.md` - Character workflows
- `kb/packs/Cine-AI_Quality_Control_Pack_v1.md` - QC framework
- `kb/examples/Cinematic_Realism_Master_Prompt_Template.md` - Prompt template
- `app_spec/SHOTBOARD_SCHEMA_v1.md` - Data structures

---

## For Developers

**To build applications on this knowledge base:**

1. Review `app_spec/SHOTBOARD_SCHEMA_v1.md` for data structures
2. Check `app_spec/DECISIONS_LOG.md` for architectural context
3. Ingest KB programmatically from `kb/` folder structure

---

## Migration Notes

**What was consolidated:**
- Multiple cinematic realism guides → Single Cinematic Realism Pack
- Multiple character consistency guides → Single Character Consistency Pack
- Scattered model guides → Organized `kb/models/` structure

**What was preserved:**
- All model-specific content (moved to `kb/models/`)
- All universal principles (consolidated into `kb/packs/`)
- All examples and templates (moved to `kb/examples/`)

**What was deleted:**
- Redundant stub files
- Duplicate content
- Conflicting sources of truth

---

## Version History

**v4.0 (February 2, 2026)** - Knowledge Base Reorganization
- Reorganized into kb/ structure (packs, models, index, examples)
- Created 5 canonical packs
- Organized 22+ model guides
- Added app_spec/ folder
- Eliminated redundancy

**v3.0 (February 1, 2026)** - 22 Prompting Guides
- 11 image models + 11 video models
- Comprehensive production guides

**v2.0 and earlier** - Initial development

---

## Need Help?

- **For navigation:** See [KB Master Index](kb/index/KB_MASTER_INDEX.md)
- **For getting started:** See [README.md](README.md)
- **For agents:** See [AGENTS.md](AGENTS.md)
- **For production workflow:** See [PRODUCTION_WORKFLOW.md](PRODUCTION_WORKFLOW.md)

---

**Maintained by:** Cine-AI Knowledge Base Team  
**Last Updated:** February 2, 2026
