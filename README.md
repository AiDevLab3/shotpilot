# Cine-AI Knowledge Base & ShotPilot

**Professional AI Filmmaking Knowledge Base + Cinematography Prompt Generation Application**

Version: 9.0 (February 2026)  
KB Content: ~250,000 words (condensed to 18K tokens for AI consumption)  
Application: ShotPilot - Expert Cinematography Prompt Generator  
**Current Milestone:** 🚀 Phase 2C Complete - ShotPilot Beta Launch Preparation

---

## 🎯 What is This Repository?

This repository contains two interconnected projects:

### 1. **Cine-AI Knowledge Base** (250K+ Words)
A comprehensive collection of professional cinematography knowledge, model-specific prompting guides, and AI filmmaking best practices. The knowledge base serves as the foundation for AI-powered filmmaking tools.

**Content Includes:**
- 5 Core Cinematography Packs (Realism, Character Consistency, Quality Control, Motion, Spatial Composition)
- 22+ Model-Specific Prompting Guides (image + video generation)
- Professional cinematography principles and film references
- Quality diagnostic frameworks and troubleshooting guides

### 2. **ShotPilot Application** (Beta - Launch Ready)
An AI-powered cinematography prompt generation tool that transforms the 250K-word knowledge base into actionable, context-aware prompts for AI image/video generation.

**ShotPilot differentiates from generic "AI prompt optimizers" through:**
- 250K+ word cinematography knowledge base (condensed to 18K tokens)
- Complete project context persistence (Project → Scene → Shot → Character)
- Model-specific prompt optimization (6-21 models supported)
- Expert-level quality diagnostics with film references
- Professional cinematography language and equipment recommendations

---

## 🎬 ShotPilot: Expert Cinematography Prompt Generator

### **Product Versions**

**ShotPilot Lite** (Beta Launch Target)
- ✅ **ALL FEATURES** (AI collaboration, quality systems, script management, everything)
- ✅ **6 Curated AI Models** (Higgsfield, VEO 3.1, Midjourney, Kling 2.6, GPT Image, Nano Banana Pro)
- 🎯 Target: Serious AI filmmakers and content creators
- 💰 Pricing: To be determined based on beta feedback

**ShotPilot Full** (Future Release)
- ✅ **ALL FEATURES** (identical to Lite)
- ✅ **21 AI Models** (Lite's 6 + 15 additional models)
- 🎯 Target: Professional studios and production teams
- 💰 Pricing: Premium tier with expanded model library

**CRITICAL:** The ONLY difference between Lite and Full is model count, not feature limitations. Lite is a complete, professional-grade product with curated models.

---

### **Why ShotPilot is Different**

**Every AI tool claims "AI-optimized prompts." Here's what makes ShotPilot actually different:**

#### **1. 250K-Word Knowledge Base**
- Not generic ChatGPT prompting - real cinematography expertise
- Condensed from full Cine-AI Knowledge Base
- References actual films (Nolan, IMAX, Panavision, Cooke lenses)
- Professional terminology (Chiaroscuro, motivated lighting, focal compression)
- Optimized to ~18K tokens (1.8% of Gemini context limit)

#### **2. Complete Context Persistence**
- Project aesthetic → Scene environment → Shot specifics → Character details
- Every prompt generation uses full project context
- Not isolated, one-off prompts - understands your entire production

#### **3. Model-Specific Optimization**
- Translation Matrix for cross-model prompt conversion
- Each model has dedicated guide (syntax, strengths, limitations)
- Prompts optimized for that model's specific capabilities
- Validates syntax before generation (no invalid parameters)

#### **4. Expert-Level Quality Diagnostics**
- Not just "missing fields" - explains WHY they matter
- Film references and cinematography principles
- Actionable recommendations with technical reasoning
- Example: "85mm for tight compression portraits (Nolan's Batman closeups), not 50mm"

#### **5. Professional Cinematography Language**
- Real equipment recommendations (Panavision System 65, Cooke S4, ARRI Alexa)
- Technical precision (focal length, aperture, lighting ratios, motivated sources)
- Industry-standard terminology throughout
- Avoids "AI sheen" and maintains filmic realism

**Bottom Line:** ShotPilot doesn't just optimize prompts - it provides professional cinematography consulting.

---

### **Current Status: Phase 2C Complete** ✅

**Completed (February 2026):**
- ✅ Knowledge Base optimization (17 items, ~18K tokens)
- ✅ Spatial Composition Pack added (12th KB file)
- ✅ Quality Control Pack expanded (430 → 1,400 words)
- ✅ Focal length conflicts resolved
- ✅ Translation Matrix updated (Midjourney v7 syntax)
- ✅ 5-test validation protocol (4/5 pass, 1 blocked by missing UI)
- ✅ Production-grade prompt quality confirmed

**Testing Results:**
- Spatial composition language validated ✅
- Character database integration working ✅
- Quality diagnostics at professional level ✅
- Focal length fixes confirmed ✅
- Generated prompts production-ready ✅

**Next Phase: Phase 3 Development** (10-12 weeks estimated)
- Fix critical bugs (5 identified)
- Add missing features (model selection UI, AI collaboration layer, script management)
- Polish UI/UX
- Prepare for beta launch

**Timeline:** No deadline - launch when fully complete and polished.

---

## 📚 Knowledge Base Structure

### **Current Organization (Phase 2C)**

The knowledge base exists in two forms:

#### **1. Full Knowledge Base** (`kb/` folder)
250,000+ words of cinematography expertise organized into:
- **5 Core Packs** (Universal constraints and best practices)
- **22+ Model Guides** (Model-specific syntax and capabilities)
- **Examples & Templates** (Copy-paste starting points)

**Location:** `kb/packs/`, `kb/models/`, `kb/examples/`

#### **2. Condensed Knowledge Base** (`shotpilot-app/kb/`)
Optimized for AI consumption - 12 files, ~18K tokens:

| File | Tokens | Purpose |
|------|--------|---------|
| 01_Core_Realism_Principles.md | ~1,600 | Foundation cinematography rules |
| 02_Model_[6 models].md | ~1,300-2,060 | Model-specific syntax guides |
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

### **Knowledge Base Access**

**For Filmmakers:**
1. Start with `kb/index/KB_MASTER_INDEX.md` for navigation
2. Read `kb/packs/Cine-AI_Cinematic_Realism_Pack_v1.md` for foundations
3. Choose your model and read its guide in `kb/models/[model_name]/Prompting_Mastery.md`
4. Use templates in `kb/examples/`

**For AI Agents:**
- Condensed KB in `shotpilot-app/kb/` (optimized for consumption)
- Load packs for universal principles
- Load model guides for syntax knowledge
- Apply quality diagnostics from Quality Control Pack

**For Developers:**
- Condensed KB designed for programmatic ingestion
- Consistent markdown format
- Clear file naming conventions
- See `shotpilot-app/kb/` for current schema

---

## 🏗️ Repository Structure
```
cine-ai-knowledge-base/
├── kb/                                   # FULL KNOWLEDGE BASE (250K+ words)
│   ├── packs/                           # 5 core cinematography packs
│   │   ├── Cine-AI_Cinematic_Realism_Pack_v1.md
│   │   ├── Cine-AI_Character_Consistency_Pack_v1.md
│   │   ├── Cine-AI_Quality_Control_Pack_v1.md
│   │   ├── Cine-AI_Motion_Readiness_Pack_v1.md
│   │   └── Cine-AI_Spatial_Composition_Anatomy_Pack_v1.md
│   ├── models/                          # 22+ model-specific guides
│   │   ├── higgsfield_cinema_studio_v1_5/
│   │   ├── gpt_image_1_5/
│   │   ├── nano_banana_pro/
│   │   ├── veo_3_1/
│   │   ├── kling_2_6/
│   │   └── [18+ more models...]
│   ├── index/
│   │   └── KB_MASTER_INDEX.md           # Navigation hub
│   └── examples/
│       └── Cinematic_Realism_Master_Prompt_Template.md
│
├── shotpilot-app/                       # SHOTPILOT APPLICATION
│   ├── kb/                              # CONDENSED KB (18K tokens, 12 files)
│   │   ├── 01_Core_Realism_Principles.md
│   │   ├── 02_Model_[6 models].md
│   │   ├── 03_Pack_[4 packs].md
│   │   └── 04_Translation_Matrix.md
│   ├── archive/                         # Full KB source + old files
│   ├── audit_reports/                   # Phase 2C documentation
│   ├── server/                          # Backend (Express + SQLite)
│   ├── src/                             # Frontend (React + TypeScript)
│   └── README.md                        # App-specific documentation
│
├── app_spec/                            # Application specifications
│   ├── SHOTBOARD_SCHEMA_v1.md
│   ├── ANTIGRAVITY_BUILD_NOTES.md
│   └── DECISIONS_LOG.md
│
├── AGENTS.md                            # Agentic Film Crew concept
├── PRODUCTION_WORKFLOW.md               # Production workflow overview
├── CONCEPT_PITCH.md                     # Project vision
├── PHASE_2C_TO_3_HANDOFF.md            # Latest comprehensive handoff
└── README.md                            # This file
```

---

## 🚀 Quick Start

### **For ShotPilot Users**

1. Navigate to `shotpilot-app/` directory
2. Follow installation instructions in `shotpilot-app/README.md`
3. Create your first project and explore AI collaboration features
4. Generate context-aware, professional cinematography prompts

### **For Knowledge Base Users**

1. Start with `kb/index/KB_MASTER_INDEX.md`
2. Read core packs in `kb/packs/`
3. Choose your model guide from `kb/models/`
4. Use templates from `kb/examples/`

### **For Developers**

1. Review `app_spec/SHOTBOARD_SCHEMA_v1.md` for data structures
2. Check `shotpilot-app/kb/` for condensed KB format
3. Read `PHASE_2C_TO_3_HANDOFF.md` for current project state
4. See `shotpilot-app/audit_reports/` for optimization history

---

## 🎯 Competitive Positioning

### **What Makes This Different from Other Tools?**

**Not "AI-Powered Storyboarding"** - We don't automate your vision into generic outputs.

**Not "Generic Prompt Optimizers"** - We provide professional cinematography consulting, not keyword stuffing.

**Not "Workflow Automation"** - We enhance your creative control with expert-level guidance.

### **What We Actually Provide:**

✅ **250K-Word Cinematography Brain** - Real expertise, not generic AI knowledge  
✅ **Complete Project Context** - Understands your entire production, not isolated prompts  
✅ **Model-Specific Optimization** - Each model's strengths leveraged correctly  
✅ **Expert-Level Diagnostics** - Film references, technical reasoning, actionable feedback  
✅ **Professional Equipment Knowledge** - Real cameras, lenses, lighting setups  
✅ **Filmic Realism Focus** - Eliminates AI sheen, maintains cinematic quality

---

## 📖 Additional Resources

### **Core Documentation**

- **[AGENTS.md](AGENTS.md)** - Agentic Film Crew concept (5-agent architecture)
- **[PRODUCTION_WORKFLOW.md](PRODUCTION_WORKFLOW.md)** - End-to-end production workflow
- **[CONCEPT_PITCH.md](CONCEPT_PITCH.md)** - Original project vision and concept
- **[PHASE_2C_TO_3_HANDOFF.md](PHASE_2C_TO_3_HANDOFF.md)** - Current project state and Phase 3 roadmap

### **Application Documentation**

- **[Shotboard Schema](app_spec/SHOTBOARD_SCHEMA_v1.md)** - Data structures and schemas
- **[Build Notes](app_spec/ANTIGRAVITY_BUILD_NOTES.md)** - Technical implementation notes
- **[Decisions Log](app_spec/DECISIONS_LOG.md)** - Architectural decisions and rationale

### **Phase 2C Reports**

- **[shotpilot-app/audit_reports/](shotpilot-app/audit_reports/)** - Complete optimization history
  - HANDOFF.md (summary)
  - phase5_retrieval_strategy.md
  - phase8_consolidation_plan.md
  - phase9_optimization_plan.md
  - phase10_implementation_roadmap.md

---

## 🔬 Technical Specifications

### **ShotPilot Tech Stack**

**Frontend:**
- React 18 + TypeScript
- Vite build system
- Tailwind CSS
- React Router

**Backend:**
- Node.js + Express
- SQLite database
- Google Gemini 3.0 Flash API
- Knowledge base loader service

**Knowledge Base:**
- 12 condensed markdown files (~18K tokens)
- Dynamic loading based on operation type
- Model-specific syntax validation
- Cross-model translation matrix

**AI Integration:**
- Gemini 3.0 Flash (primary)
- Thinking mode enabled for complex reasoning
- Context-aware prompt compilation
- Quality diagnostics and recommendations

---

## 📊 Version History

**v9.0 (February 2026)** - ShotPilot Phase 2C Complete
- Completed 17-item KB optimization
- Added Spatial Composition Pack (12th file)
- Expanded Quality Control Pack (430 → 1,400 words)
- Fixed focal length conflicts in Core Realism
- Updated Translation Matrix (Midjourney v7 syntax)
- Validated with 5-test protocol
- Production-ready prompt quality confirmed
- Preparing for Phase 3 development

**v8.0 (February 2026)** - Knowledge Base Reorganization
- Reorganized into kb/ structure (packs, models, index, examples)
- Created 5 canonical packs
- Organized 22+ model guides
- Added app_spec/ folder with schema and build notes
- Eliminated redundancy and established single source of truth

**v7.0 (February 2026)** - Initial ShotPilot Development
- Created ShotPilot application foundation
- Condensed KB for AI consumption
- Agentic Film Crew concept development
- 22 prompting mastery guides

---

## 🤝 Contributing

This knowledge base and application are actively maintained and evolving. For questions, suggestions, or contributions:

1. Open an issue for discussion
2. Submit pull requests for improvements
3. Share feedback on ShotPilot beta (coming soon)

---

## 📜 License

**Knowledge Base:** [To be determined]  
**ShotPilot Application:** [To be determined]

---

## 📞 Contact & Support

**ShotPilot Beta:** Launch preparation in progress  
**Knowledge Base Updates:** Ongoing  
**Last Updated:** February 9, 2026  
**Repository:** Cine-AI Knowledge Base & ShotPilot

---

**Maintained by:** Cine-AI Team  
**Current Focus:** ShotPilot Phase 3 Development (Beta Launch Preparation)
