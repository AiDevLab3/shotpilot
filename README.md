# Cine-AI Knowledge Base & ShotPilot

**Professional AI Filmmaking Knowledge Base + Cinematography Prompt Generation Application**

Version: 9.0 (February 2026)  
KB Content: ~250,000 words (condensed to ~18K tokens for AI consumption)  
Application: ShotPilot - Expert Cinematography Prompt Generator  
**Current Milestone:** 🚀 Sprint 1 Complete - Production-Ready Core Features

---

## 🎯 What is This Repository?

This repository contains two interconnected projects:

### 1. **Cine-AI Knowledge Base** (250K+ Words)
A comprehensive collection of professional cinematography knowledge, model-specific prompting guides, and AI filmmaking best practices. The knowledge base serves as the foundation for AI-powered filmmaking tools.

**Content Includes:**
- 5 Core Cinematography Packs (Realism, Character Consistency, Quality Control, Motion, Spatial Composition)
- 23+ Model-Specific Prompting Guides (image + video generation)
- Professional cinematography principles and film references
- Quality diagnostic frameworks and troubleshooting guides

### 2. **ShotPilot Application** (Beta - Launch Ready)
An AI-powered cinematography prompt generation tool that transforms the 250K-word knowledge base into actionable, context-aware prompts for AI image/video generation.

**ShotPilot differentiates from generic "AI prompt optimizers" through:**
- 250K+ word cinematography knowledge base (condensed to 18K tokens)
- Complete project context persistence (Project → Scene → Shot → Character)
- Model-specific prompt optimization (7 supported models)
- Expert-level quality diagnostics with film references
- Professional cinematography language and equipment recommendations

---

## 🎬 ShotPilot: Expert Cinematography Prompt Generator

### **Product Versions**

**ShotPilot Lite** (Beta Launch Target)
- ✅ **ALL FEATURES** (AI collaboration, quality systems, script management, everything)
- ✅ **7 Curated AI Models** (Higgsfield, VEO 3.1, Midjourney, Kling 2.6, Kling 3.0, GPT Image, Nano Banana Pro)
- 🎯 Target: Serious AI filmmakers and content creators
- 💰 Pricing: To be determined based on beta feedback

**ShotPilot Full** (Future Release)
- ✅ **ALL FEATURES** (identical to Lite)
- ✅ **22+ AI Models** (Lite's 7 + 15 additional models)
- 🎯 Target: Professional studios and production teams
- 💰 Pricing: Premium tier with expanded model library

**CRITICAL:** The ONLY difference between Lite and Full is model count, not feature limitations. Lite is a complete, professional-grade product with curated models.

---

## 🚀 Sprint 1 Achievements (February 2026)

Sprint 1 focused on stabilizing the core platform and preparing the backend for video generation capabilities.

### **Key Deliverables**
- ✅ **5 Critical Bugs Fixed:** Resolved quality score inflation, focal length conflicts, and UI rendering issues.
- ✅ **Quality Score System:** Implemented on-the-fly weighted calculation (80/20 algorithm) with <1ms latency.
- ✅ **Model Selection UI:** New dropdown in prompt generation modal separating Image vs. Video workflows.
- ✅ **Kling 3.0 Integration:** Added full multi-shot knowledge base for the latest video model.
- ✅ **Production Stability:** All features merged to `main` and verified.

### **Current Model Lineup (7 Models)**

**Image Generation (Available Now):**
1. **Higgsfield Cinema Studio** - Photorealistic humans & natural lighting
2. **Midjourney** - Artistic & stylized imagery
3. **GPT Image (DALL-E 3)** - Text interpretation & creative concepts
4. **Nano Banana Pro** - Natural language image editing & generation

**Video Generation (Backend Ready - UI Coming Phase 2):**
1. **VEO 3.1** - Advanced cinematography & camera movement
2. **Kling 2.6** - Fast iteration & consistency
3. **Kling 3.0** - Multi-shot intelligence & 15s duration (NEW)

---

## 📚 Knowledge Base Structure

### **Current Organization (Sprint 1)**

The knowledge base exists in two forms:

#### **1. Full Knowledge Base** (`kb/` folder)
250,000+ words of cinematography expertise organized into:
- **5 Core Packs** (Universal constraints and best practices)
- **23+ Model Guides** (Model-specific syntax and capabilities)
- **Examples & Templates** (Copy-paste starting points)

**Location:** `kb/packs/`, `kb/models/`, `kb/examples/`

#### **2. Condensed Knowledge Base** (`shotpilot-app/kb/`)
Optimized for AI consumption - 13 files, ~18K tokens:

| File | Tokens | Purpose |
|------|--------|---------|
| 01_Core_Realism_Principles.md | ~1,600 | Foundation cinematography rules |
| 02_Model_[7 models].md | ~1,300-2,900 | Model-specific syntax guides (inc. Kling 3.0) |
| 03_Pack_[4 packs].md | ~820-2,430 | Specialized guidance (character, motion, quality, spatial) |
| 04_Translation_Matrix.md | ~1,750 | Cross-model conversion |

**Total:** ~18,092 tokens (1.8% of Gemini 1M context limit)  
**Headroom:** 98.2% available for expansion

**Loading Patterns:**
- Quality check: ~5-6K tokens (Core + Quality + Character + Spatial)
- Prompt generation: ~8-12K tokens (Core + Model + Quality + Character + Motion + Spatial + Translation)

**Cost Per Operation (Gemini 3.0 Flash):**
- Quality check: ~$0.0005
- Prompt generation: ~$0.001
- 1,000 prompts: ~$1.00

---

## 🏗️ Repository Structure
```
cine-ai-knowledge-base/
├── kb/                                   # FULL KNOWLEDGE BASE (250K+ words)
│   ├── packs/                           # 5 core cinematography packs
│   ├── models/                          # 23+ model-specific guides
│   │   ├── kling_3_0/                   # NEW
│   │   ├── ...
│   ├── index/
│   └── examples/
│
├── shotpilot-app/                       # SHOTPILOT APPLICATION
│   ├── kb/                              # CONDENSED KB (18K tokens)
│   │   ├── models/                      # Model stubs
│   │   │   └── kling-3.0.md             # NEW
│   │   ├── ...
│   ├── server/                          # Backend (Express + SQLite)
│   │   └── services/kbLoader.js         # Model registry
│   ├── src/                             # Frontend (React + TypeScript)
│   │   └── components/                  # UI Components (GeneratePromptModal)
│   └── README.md                        # App-specific documentation
│
├── app_spec/                            # Application specifications
├── AGENTS.md                            # Agentic Film Crew concept
├── PRODUCTION_WORKFLOW.md               # Production workflow overview
├── CONCEPT_PITCH.md                     # Project vision
├── PHASE_2C_TO_3_HANDOFF.md            # Historic handoff doc
└── README.md                            # This file
```

---

## � Technical Specifications

### **ShotPilot Tech Stack**
**Frontend:** React 18, TypeScript, Vite, Tailwind CSS  
**Backend:** Node.js, Express, SQLite, Gemini 3.0 Flash  
**AI Logic:** On-the-fly quality weighting (80/20 split), Dynamic KB loading

### **Sprint 1 Improvements**
- **Quality Score:** Recalculated live on backend request (<1ms) to prevent UI staleness.
- **Model Filtering:** UI now intelligently separates Image models from Video models based on `type` field.
- **Data Integrity:** Fixed gaps in shot numbering and focal length definitions.

---

## � Quick Start

### **For ShotPilot Users**
1. Navigate to `shotpilot-app/` directory
2. Follow installation instructions in `shotpilot-app/README.md`
3. Run `npm run dev` to start the application
4. Use "Generate Prompt" to see the new Model Selection UI

### **For Developers**
1. Review `app_spec/SHOTBOARD_SCHEMA_v1.md` for data structures
2. Check `shotpilot-app/kb/` for condensed KB format
3. See `shotpilot-app/audit_reports/` for optimization history

---

## � Version History

**v9.0 (February 2026)** - Sprint 1 Complete
- **New Feature:** Model Selection UI with Image/Video filtering.
- **New Content:** Kling 3.0 Knowledge Base (Multi-Shot Intelligence).
- **Fix:** Quality Score system fully operational/stabilized.
- **Core:** 5 critical bugs resolved and merged to main.

**v8.0 (February 2026)** - Phase 2C Complete / KB Reorg
- Reorganized into kb/ structure.
- Validated with 5-test protocol.

**v7.0 (February 2026)** - Initial ShotPilot Development
- Created ShotPilot application foundation.
- Condensed KB for AI consumption.

---

## 📞 Contact & Support
**ShotPilot Beta:** Launch preparation in progress  
**Current Phase:** Sprint 2 (Video Generation UI)  
**Last Updated:** February 2026  
**Repository:** Cine-AI Knowledge Base & ShotPilot
