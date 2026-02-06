# ShotPilot: Project Context & Vision

**Last Updated:** February 5, 2026  
**Version:** Lite v1.0 (Phase 2B Complete - Backend Done)  
**Creator:** Caleb  
**Repository:** cine-ai-knowledge-base  
**Current Model:** Gemini 3.0 Flash

---

## Table of Contents

1. [Project Vision](#project-vision)
2. [Competitive Advantages](#competitive-advantages)
3. [Repository Structure](#repository-structure)
4. [Knowledge Base Optimization](#knowledge-base-optimization)
5. [Selected Models](#selected-models)
6. [Lite vs Full Version](#lite-vs-full-version)
7. [Technical Architecture](#technical-architecture)
8. [Agentic Implementation Plan](#agentic-implementation-plan)
9. [Current State](#current-state)
10. [Implementation Roadmap](#implementation-roadmap)
11. [Success Metrics](#success-metrics)
12. [Restore Point Checklist](#restore-point-checklist)

---

## Project Vision

### The Problem

AI filmmakers face a fragmented workflow with context loss at every step:

- **Context Loss:** Creative planning → storyboarding → image generation → analysis → iteration → video generation (context resets at each step)
- **Generic Prompts:** Different LLMs give generic prompts that aren't model-specific
- **No Persistence:** No context preservation across sessions
- **Disorganized:** No central hub for projects, characters, shots, images
- **Surface Analysis:** Image quality analysis is surface-level, not expert-level
- **Iteration Waste:** Users waste time iterating on mediocre prompts 4-5 times per generation

### The Solution: ShotPilot

A **persistent AI copilot for cinematic AI filmmaking** that:

- ✅ Maintains project context across entire creative workflow
- ✅ Provides expert-level, model-specific prompts using specialized knowledge
- ✅ Analyzes images against professional cinematic realism standards
- ✅ Organizes projects, scenes, shots, and variants in unified dashboard
- ✅ Eliminates prompt guesswork with production-ready guidance

### Core Insight

> **"LTX Studio with a collaborative AI agent that optimizes end-to-end"**

The differentiator isn't comprehensive documentation—it's **context persistence + model-specific expertise + multimodal analysis** in one unified workflow.

---

## Competitive Advantages

### 1. Specialized Knowledge Base

- **Full Version:** 250,000+ words of expert AI filmmaking knowledge
- **Condensed Version:** 82KB of production-ready guidance (11 files)
- **Coverage:** Model-specific syntax, not generic "AI art" advice
- **Currency:** Updated with latest model features and techniques

### 2. Model-Specific Expertise

Each model has unique prompting syntax and capabilities:

- **Higgsfield:** Dropdown UI + technical camera specs
- **Midjourney:** Parameter-based (--ar, --style, --cref, --sref)
- **Nano Banana:** Physics-based conversational editing
- **GPT Image:** Natural language descriptions
- **VEO 3.1:** 5-part cinematic formula + native audio
- **Kling 2.6:** Custom Face Models + Element Library

ShotPilot knows the **exact syntax** for each model, preventing "one size fits all" generic prompts that waste generations.

### 3. Context Persistence

- **Project DNA:** Maintained across all shots
- **Character Bibles:** Enforce visual consistency
- **Hierarchical Context:** Shot > Scene > Project (most specific wins)
- **Scene Flow:** Context flows naturally to shots
- **No Re-explaining:** System remembers your vision

### 4. Expert-Level Quality Analysis

**6-Dimension Audit Framework:**
1. AI Sheen Detection
2. Lighting Motivation
3. Character Identity Consistency
4. Visual Hierarchy
5. Motion Artifact Detection
6. Prompt Adherence

**3-Tier Recommendation System:**
- **LOCK IT IN** (90-100%) - Production ready
- **REFINE** (70-89%) - Minor improvements needed
- **REGENERATE** (<70%) - Fundamental issues

**Prompt Delta Format:**
- ADD: Missing elements
- REMOVE: Problematic elements
- LOCK: Preserve good elements
- ADJUST: Modify existing elements

### 5. Professional Workflow Integration

- **Image-First Methodology:** Generate hero frames before animation
- **Cross-Model Translation:** Maintain consistency across tools
- **Quality Gates:** Prevent bad outputs early in pipeline
- **Integrated Variant Management:** Track all iterations with metadata

---

## Repository Structure
```
cine-ai-knowledge-base/
├── .agent/                          # Antigravity agent configuration
├── app_spec/                        # Original MVP specifications
│
├── kb/                              # FULL KNOWLEDGE BASE (250K+ words)
│   ├── models/                      # 21 comprehensive model guides
│   │   ├── higgsfield_cinema_studio_v1_5/
│   │   │   └── Prompting_Mastery.md
│   │   ├── midjourney/
│   │   │   └── Prompting_Mastery.md
│   │   ├── nano_banana_pro/
│   │   │   └── Prompting_Mastery.md
│   │   ├── gpt_image_1_5/
│   │   │   └── Prompting_Mastery.md
│   │   ├── veo_3_1/
│   │   │   └── Prompting_Mastery.md
│   │   ├── kling_2_6/
│   │   │   └── Prompting_Mastery.md
│   │   └── ... (15 additional models)
│   │
│   ├── packs/                       # 5 specialized knowledge packs
│   │   ├── Cine-AI_Cinematic_Realism_Pack_v1.md
│   │   ├── Cine-AI_Character_Consistency_Pack_v1.md
│   │   ├── Cine-AI_Quality_Control_Pack_v1.md
│   │   ├── Cine-AI_Motion_Readiness_Pack_v1.md
│   │   └── Cine-AI_Spatial_Composition_Pack_v1.md
│   │
│   ├── index/                       # KB navigation and master index
│   ├── examples/                    # Templates and workflows
│   └── archive/                     # Cross-model translation guides
│
└── shotpilot-app/                   # ANTIGRAVITY APPLICATION
    │
    ├── kb/                          # CONDENSED KNOWLEDGE BASE (82KB)
    │   ├── 01_Core_Realism_Principles.md
    │   ├── 02_Model_Higgsfield_Cinema_Studio.md
    │   ├── 02_Model_Midjourney.md
    │   ├── 02_Model_Nano_Banana_Pro.md
    │   ├── 02_Model_GPT_Image.md
    │   ├── 02_Model_VEO_31.md
    │   ├── 02_Model_Kling_26.md
    │   ├── 03_Pack_Character_Consistency.md
    │   ├── 03_Pack_Quality_Control.md
    │   ├── 03_Pack_Motion_Readiness.md
    │   └── 04_Translation_Matrix.md
    │
    ├── src/                         # Frontend (React + TypeScript)
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── types/
    │
    ├── server/                      # Backend (Node.js + Express)
    │   ├── middleware/
    │   │   └── auth.js
    │   ├── services/
    │   │   ├── creditService.js
    │   │   ├── geminiService.js     # Gemini 3.0 Flash integration
    │   │   ├── kbLoader.js
    │   │   └── qualityCheck.js
    │   ├── database.js
    │   └── index.js
    │
    ├── public/
    ├── .env                         # GEMINI_API_KEY, SESSION_SECRET
    ├── package.json
    └── vite.config.ts
```

---

## Knowledge Base Optimization

### From Full to Condensed

#### Original Knowledge Base
- **Size:** 250,000+ words across 44 guides
- **Coverage:** 21 models (10 image + 11 video)
- **Audience:** Human filmmakers learning AI tools
- **Style:** Comprehensive tutorials with examples, theory, background

#### The Problem
- ❌ Too large for AI agent context windows
- ❌ Verbose with redundant photography theory
- ❌ Human-friendly explanations slow AI processing
- ❌ Generic LLMs don't need 200 pages to generate good prompts

#### The Solution: Condensed KB
- **Size:** 11 files, 82KB total (~15 pages of instructions)
- **Format:** AI-agent instruction format (not human docs)
- **Content:** Operational rules only (no theory)
- **Structure:** Decision frameworks + prompt templates

### Optimization Methodology

#### What Was Removed (80% reduction)
- Redundant photography theory (consolidated to core principles)
- Human-friendly explanations and examples
- Historical context and background information
- Verbose documentation style
- Duplicate information across files

#### What Was Added (New Structure)
- AI-agent instruction format
- Operational rules and checklists
- Prompt output templates
- Decision frameworks (when to use which model)
- Cross-model syntax translation tables
- Quality scoring algorithms
- Troubleshooting workflows

#### What Was Preserved (Critical Knowledge)
- Model-specific syntax (the core differentiator)
- Technical specifications (camera, lens, lighting)
- Professional cinematography terminology
- Quality standards and audit criteria
- Character consistency techniques
- Motion-readiness rules

### Condensed KB Structure

#### Core Principles (1 file, 7.8KB)
**01_Core_Realism_Principles.md**
- Universal photography/cinematography rules
- Photographic anchor (eliminate AI sheen)
- Optics enforcement (real-world behavior)
- Lighting motivation (no fake glow)
- Filmic tonality, entropy, composition
- Motion-readiness basics
- Quality audit dimensions
- Negative prompting rules

#### Model Instructions (6 files, 42KB total)

**Image Models (4 files):**

1. **02_Model_Higgsfield_Cinema_Studio.md** (4.2KB)
   - Dropdown UI workflow (camera/lens/aperture selections)
   - Text prompt structure (environment, lighting only)
   - Recommended rig builds
   - Integrated upscaling workflows

2. **02_Model_Midjourney.md** (5.8KB)
   - 8-component photography framework
   - Parameter mastery (--ar, --style raw, --s, --cref, --sref)
   - Cinematic prompting structure
   - Professional cinematography terms

3. **02_Model_Nano_Banana_Pro.md** (6.7KB)
   - 6-variable framework
   - Physics-based syntax (angles, color temp, ratios)
   - Conversational editing workflow
   - Best-in-class text rendering
   - 4K native resolution

4. **02_Model_GPT_Image.md** (8.4KB)
   - Natural language prompting
   - Iterative editing patterns
   - Reference image strategies
   - Photographer-style descriptions
   - Quality settings (low/high)

**Video Models (2 files):**

5. **02_Model_VEO_31.md** (8.9KB)
   - 5-part prompt formula
   - Cinematography-first structure
   - Native audio generation (SFX, dialogue, ambient)
   - Ingredients to Video system
   - Timestamp prompting

6. **02_Model_Kling_26.md** (8.5KB)
   - T2V, I2V, Custom Face Models, Element Library
   - Best-in-class physics/motion simulation
   - Multi-angle character understanding
   - Camera movement control
   - Cost optimization strategies

#### Pack Summaries (3 files, 23KB total)

7. **03_Pack_Character_Consistency.md** (6.4KB)
   - Character Bible structure
   - Universal techniques (reference images, frame chaining)
   - Model-specific workflows (Veo Ingredients, Runway References, Kling Custom Face, Element Library)
   - Cross-model strategies
   - Troubleshooting guides

8. **03_Pack_Quality_Control.md** (8.3KB)
   - 6-dimension audit framework
   - 3-tier recommendation system
   - Prompt delta format (ADD/REMOVE/LOCK/ADJUST)
   - Agent workflow and decision trees

9. **03_Pack_Motion_Readiness.md** (8.3KB)
   - Motion-ready composition rules
   - Common failure points (hands, overlapping limbs, micro-patterns)
   - Lighting/depth requirements
   - Pre-animation checklist
   - Video generation strategy

#### Translation Matrix (1 file, 9.9KB)

10. **04_Translation_Matrix.md** (9.9KB)
    - Side-by-side syntax for same concepts across all 6 models
    - Examples: Golden hour, chiaroscuro, teal/orange grading, portrait setups, film noir, camera movements
    - Quick reference table of key differences
    - Usage guidelines for agents

---

## Selected Models

### Selection Criteria

**Why These 6?**
- ✅ Professional quality output
- ✅ Complementary strengths (no overlap)
- ✅ Active development and support
- ✅ Accessible APIs/platforms
- ✅ "Best of breed" in their category

### Image Models (4)

#### 1. Higgsfield Cinema Studio V1.5
- **Strength:** Deterministic camera/lens control with real optical physics
- **Use Case:** Hero frames requiring exact technical specifications
- **Interface:** Dropdown UI (camera/lens/aperture) + text prompt
- **Unique Feature:** Simulates professional cinema cameras and legendary lenses
- **Best For:** Precision control, professional cinematography
- **KB File:** 02_Model_Higgsfield_Cinema_Studio.md (4.2KB)

#### 2. Midjourney
- **Strength:** Artistic stylization, look development
- **Use Case:** Concept art, moodboards, visual exploration
- **Interface:** Parameter-based (--ar, --style, --cref, --sref, --s)
- **Unique Feature:** Character Reference (--cref) for consistency
- **Best For:** Creative exploration, style development
- **KB File:** 02_Model_Midjourney.md (5.8KB)

#### 3. Nano Banana Pro
- **Strength:** High-quality edits, 4K native, physics-based control
- **Use Case:** Iterative refinement, professional finishing
- **Interface:** Conversational editing with technical precision
- **Unique Feature:** Best-in-class text rendering and hex color control
- **Best For:** Professional polish, detailed editing
- **KB File:** 02_Model_Nano_Banana_Pro.md (6.7KB)

#### 4. GPT Image 1.5
- **Strength:** Natural language, fast iteration, reference images
- **Use Case:** Quick variations, accessibility for non-technical users
- **Interface:** Natural language descriptions
- **Unique Feature:** Iterative editing with preservation
- **Best For:** Speed, ease of use, rapid prototyping
- **KB File:** 02_Model_GPT_Image.md (8.4KB)

### Video Models (2)

#### 5. VEO 3.1
- **Strength:** Native audio generation, cinematic understanding
- **Use Case:** Complete audiovisual scenes, dialogue
- **Interface:** 5-part prompt formula (shot/subject/action/setting/style)
- **Unique Feature:** Native synchronized audio (SFX, dialogue, ambient)
- **Best For:** Narrative scenes with audio, complete productions
- **Duration:** Up to 8 seconds
- **KB File:** 02_Model_VEO_31.md (8.9KB)

#### 6. Kling 2.6
- **Strength:** Physics simulation, character consistency, motion control
- **Use Case:** Complex motion, character-focused animation
- **Interface:** Custom Face Models, Element Library
- **Unique Feature:** Unparalleled face consistency across shots
- **Best For:** Character-driven content, complex physics
- **Duration:** 5-10 seconds
- **KB File:** 02_Model_Kling_26.md (8.5KB)

---

## Lite vs Full Version

### Lite Version (Current Build)

**Purpose:** Professional-grade MVP for serious AI filmmakers

**Core Features:**
- ✅ 6 curated models (4 image + 2 video)
- ✅ Core workflow: Project → Scene → Shot → Variants
- ✅ AI prompt generation with 82KB condensed KB
- ✅ Quality checking and recommendations
- ✅ Credit-based monetization system
- ✅ Character/Object Bibles
- ✅ Hierarchical context system (Shot > Scene > Project)

**Target User:** Filmmakers actively using AI tools, seeking expert guidance

**Timeline:** 2-3 weeks to launch (currently Phase 2B complete)

**Monetization Tiers:**
- **Free:** 10 prompts/month
- **Pro:** $15/month (100 prompts)
- **Studio:** $50/month (500 prompts)
- **Pay-as-you-go:** $0.50/prompt

### Full Version (Future Expansion)

**Purpose:** Comprehensive platform for all AI filmmaking needs

**Additional Features:**
- All 21 models (10 image + 11 video)
- Advanced workflows (multi-agent crew, batch generation)
- Video clip management and editing
- Collaboration features (team projects)
- API access for developers
- Custom model training integration
- Export to professional tools (Adobe, DaVinci)
- Template marketplace (community-contributed)
- Analytics and usage insights

**Target User:** Production studios, content agencies, professional creators

**Timeline:** 6-12 months post-launch (iterative expansion)

---

## Technical Architecture

### Technology Stack

**Frontend:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast development, optimized production builds)
- **Styling:** CSS Modules + Modern CSS
- **State Management:** React hooks (useState, useEffect, useContext)

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Module System:** ES Modules (import/export)
- **Authentication:** express-session + bcrypt
- **Environment:** dotenv for configuration

**Database:**
- **Engine:** SQLite (file-based, zero infrastructure)
- **ORM:** None (raw SQL for simplicity and performance)
- **Location:** `shotpilot.db` (file in project root)

**AI Integration:**
- **Model:** Gemini 3.0 Flash
- **Context Window:** 1M tokens
- **Capabilities:** Native multimodal (text + images)
- **Free Tier:** 1500 requests/day
- **Inference Speed:** Fast (optimized for production)
- **API Endpoint:** `gemini-3.0-flash:generateContent`

**Hosting (Planned):**
- **Frontend:** Vercel or Netlify
- **Backend:** Railway, Render, or Fly.io
- **Database:** SQLite file deployed with backend

### Database Schema
```sql
-- Core project structure
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    style_aesthetic TEXT,
    atmosphere_mood TEXT,
    color_palette TEXT,
    cinematography_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    location_setting TEXT,
    time_of_day TEXT,
    mood_tone TEXT,
    lighting_notes TEXT,
    scene_order INTEGER,
    status TEXT DEFAULT 'planning',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE shots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scene_id INTEGER NOT NULL,
    shot_number INTEGER NOT NULL,
    shot_type TEXT,
    camera_angle TEXT,
    camera_movement TEXT,
    description TEXT,
    subject TEXT,
    action TEXT,
    desired_duration INTEGER,
    focal_length INTEGER,
    aperture TEXT,
    lighting_setup TEXT,
    color_grading TEXT,
    special_notes TEXT,
    status TEXT DEFAULT 'planning',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);

-- Character and object bibles
CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    reference_images TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    reference_images TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Generated variants
CREATE TABLE image_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shot_id INTEGER NOT NULL,
    model_name TEXT NOT NULL,
    prompt_used TEXT NOT NULL,
    image_path TEXT,
    quality_tier TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shot_id) REFERENCES shots(id) ON DELETE CASCADE
);

-- User management
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    credits INTEGER DEFAULT 10,
    tier TEXT DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking
CREATE TABLE usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    credits_used INTEGER DEFAULT 0,
    model_name TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Key Architectural Decisions

#### 1. Platform-Owned API Keys (Not User-Provided)
**Reasoning:**
- ✅ Professional UX (no technical setup required)
- ✅ Monetization via credits (predictable revenue)
- ✅ Rate limiting and optimization control
- ✅ Security (users don't expose personal API keys)
- ✅ Centralized cost management

#### 2. Credit System (Not Direct API Billing)
**Reasoning:**
- ✅ Predictable pricing for users
- ✅ Upfront revenue for business
- ✅ Prevents abuse through rate limiting
- ✅ Enables tiered pricing and upgrades
- ✅ Simple accounting and analytics

#### 3. Quality Gating (Not Open Generation)
**Reasoning:**
- Incomplete shots trigger AI recommendations dialog
- 70% completeness threshold = Production tier
- <70% completeness = Draft tier
- Protects brand (prevents low-quality outputs)
- Encourages quality inputs from users
- Educational (teaches best practices)

#### 4. Hierarchical Context (Shot > Scene > Project)
**Reasoning:**
- Shot-specific details override scene defaults
- Scene context overrides project defaults
- Most specific value wins (predictable behavior)
- Intuitive mental model for users
- Flexible (can be sparse or detailed)

#### 5. SQLite (Not Cloud Database)
**Reasoning:**
- ✅ Zero infrastructure (no database server needed)
- ✅ File-based backup (simple .db file)
- ✅ Fast local queries (no network latency)
- ✅ Easy deployment (database travels with app)
- ✅ Sufficient for thousands of users
- ✅ Can migrate to PostgreSQL later if needed

#### 6. Gemini 3.0 Flash (Not Other AI Models)
**Reasoning:**
- ✅ 1M token context window (can load entire KB + project data)
- ✅ Native multimodal (can analyze images + text simultaneously)
- ✅ Free tier: 1500 requests/day (sufficient for beta testing)
- ✅ Fast inference (good UX, low latency)
- ✅ Function calling support (structured outputs)
- ✅ Latest improvements over 2.0 (better reasoning, accuracy)
- ✅ Cost-effective for MVP (free during development)

---

## Agentic Implementation Plan

### Overview

ShotPilot uses **Gemini 3.0 Flash** as the core AI agent that ingests specialized knowledge and generates expert-level prompts. The system is designed as a **knowledge-augmented agent** rather than a general-purpose chatbot.

### Agent Architecture
```
User Request
    ↓
Frontend UI
    ↓
Backend API
    ↓
Context Builder ──→ Loads KB files (model-specific)
    ↓              Loads project/scene/shot data
    ↓              Calculates hierarchical priority
    ↓
Gemini 3.0 Flash Agent
    ↓              System Instructions (rules + constraints)
    ↓              User Prompt (context + task)
    ↓              KB Content (model syntax + best practices)
    ↓
Generated Output
    ↓
Response Parser ──→ Extract prompt
    ↓              Extract assumptions
    ↓              Format for frontend
    ↓
Frontend Display
```

### Two Core Agent Functions

#### Function 1: generateRecommendations() - Free AI Suggestions

**Purpose:** Help users fill missing fields when shot completeness < 70%

**Inputs:**
```javascript
{
  project: { title, style, mood, ... },
  scene: { name, location, time_of_day, mood, ... },
  shot: { shot_type, description, ... },
  missingFields: [
    { field: 'camera_angle', label: 'Camera Angle' },
    { field: 'lighting_setup', label: 'Lighting Setup' }
  ]
}
```

**System Instructions:**
```
You are an expert cinematographer and director. 
Recommend appropriate values for missing fields based on context.

For each field provide:
1. Specific recommendation
2. Clear reasoning (reference their specific context)
3. 2-3 alternatives

Be educational but concise.
```

**Output Format:**
```json
[
  {
    "field": "camera_angle",
    "recommendation": "Low angle (camera below subject)",
    "reasoning": "Your shot description mentions a 'powerful detective' - low angles psychologically elevate characters, making them appear dominant and authoritative. This aligns with your noir aesthetic.",
    "alternatives": [
      "Eye level (neutral, conversational)",
      "Dutch angle (psychological unease)",
      "High angle (vulnerable, overwhelmed)"
    ]
  }
]
```

**API Configuration:**
- Temperature: 0.8 (creative suggestions)
- Max Tokens: 2048
- Response Type: JSON (structured output)
- Cost: Free (does not deduct credits)

#### Function 2: generatePrompt() - Credit-Based Prompt Generation

**Purpose:** Generate model-specific optimized prompts using KB knowledge

**Inputs:**
```javascript
{
  project: { /* all project fields */ },
  scene: { /* all scene fields */ },
  shot: { /* all shot fields */ },
  modelName: 'midjourney', // or higgsfield, nano-banana, etc.
  kbContent: '/* loaded from 02_Model_Midjourney.md */',
  qualityTier: 'production' // or 'draft'
}
```

**System Instructions:**
```
You are an expert AI filmmaker specializing in ${modelName}.
Generate precise prompts using the model-specific KB provided.
Follow EXACT syntax from KB.
Shot details override scene/project (hierarchical priority).
```

**User Prompt Structure:**
```
Generate ${modelName} prompt.

QUALITY: ${qualityTier.toUpperCase()}
${qualityTier === 'draft' ? '⚠️ Some context missing - make inferences' : '✅ Full context'}

PRIORITY: Shot > Scene > Project

PROJECT:
- Title: ${project.title}
- Style: ${project.style_aesthetic}
- Mood: ${project.atmosphere_mood}
[... more fields ...]

SCENE:
- Name: ${scene.name}
- Location: ${scene.location_setting}
- Time: ${scene.time_of_day}
[... more fields ...]

SHOT #${shot.shot_number}:
- Type: ${shot.shot_type}
- Angle: ${shot.camera_angle}
- Movement: ${shot.camera_movement}
- Description: ${shot.description}
[... more fields ...]

KB - ${modelName.toUpperCase()}:
${kbContent}

OUTPUT FORMAT:
[CLEAN PROMPT - NO PREAMBLE]

// AI Assumptions:
// - [list inferences made]
```

**Output Format:**
```javascript
{
  prompt: "Medium shot of a world-weary detective in trench coat...",
  assumptions: "- Inferred film noir aesthetic from project mood\n- Assumed 50mm lens..."
}
```

**API Configuration:**
- Temperature: 0.7 (balanced creativity + consistency)
- Max Tokens: 2048
- Cost: 1 credit per generation

### Knowledge Base Integration

#### KB Loading Strategy

**kbLoader.js** maps models to their required KB files:
```javascript
const MODEL_KB_MAP = {
  'higgsfield': [
    'kb/01_Core_Realism_Principles.md',
    'kb/02_Model_Higgsfield_Cinema_Studio.md'
  ],
  'midjourney': [
    'kb/01_Core_Realism_Principles.md',
    'kb/02_Model_Midjourney.md'
  ],
  'nano-banana': [
    'kb/01_Core_Realism_Principles.md',
    'kb/02_Model_Nano_Banana_Pro.md'
  ],
  'gpt-image': [
    'kb/01_Core_Realism_Principles.md',
    'kb/02_Model_GPT_Image.md'
  ],
  'veo-3.1': [
    'kb/01_Core_Realism_Principles.md',
    'kb/02_Model_VEO_31.md'
  ],
  'kling-2.6': [
    'kb/01_Core_Realism_Principles.md',
    'kb/02_Model_Kling_26.md'
  ]
};

// Conditionally load packs based on shot characteristics
function getKBContent(modelName, shotContext) {
  let files = [...MODEL_KB_MAP[modelName]];
  
  // Add Character Consistency if characters present
  if (shotContext.hasCharacters) {
    files.push('kb/03_Pack_Character_Consistency.md');
  }
  
  // Add Motion Readiness if generating hero frame for video
  if (shotContext.isVideoHeroFrame) {
    files.push('kb/03_Pack_Motion_Readiness.md');
  }
  
  // Always include Quality Control for scoring criteria
  files.push('kb/03_Pack_Quality_Control.md');
  
  return files.map(loadFile).join('\n\n');
}
```

### Quality Checking System

#### qualityCheck.js - Completeness Scoring

**Algorithm:**
```javascript
function calculateCompleteness(shot) {
  const requiredFields = [
    'shot_type',      // CRITICAL
    'description',    // CRITICAL
    'camera_angle',
    'camera_movement',
    'subject',
    'action',
    'lighting_setup'
  ];
  
  let totalWeight = 0;
  let earnedWeight = 0;
  
  requiredFields.forEach(field => {
    const weight = field === 'shot_type' || field === 'description' ? 3 : 1;
    totalWeight += weight;
    
    if (shot[field] && shot[field].trim() !== '') {
      earnedWeight += weight;
    }
  });
  
  const percentage = (earnedWeight / totalWeight) * 100;
  const tier = percentage >= 70 ? 'production' : 'draft';
  
  return { percentage, tier, missingFields };
}
```

**Quality Tiers:**
- **Production (≥70%):** Complete enough for professional results
- **Draft (<70%):** Missing context, AI will make assumptions

### Hierarchical Context Priority

**Priority System:**
```javascript
function resolveValue(field, shot, scene, project) {
  // 1. Check shot-specific value (highest priority)
  if (shot[field] && shot[field].trim() !== '') {
    return shot[field];
  }
  
  // 2. Check scene-level value (medium priority)
  const sceneField = mapToSceneField(field);
  if (scene[sceneField] && scene[sceneField].trim() !== '') {
    return scene[sceneField];
  }
  
  // 3. Check project-level value (lowest priority)
  const projectField = mapToProjectField(field);
  if (project[projectField] && project[projectField].trim() !== '') {
    return project[projectField];
  }
  
  // 4. Return null if no value found at any level
  return null;
}
```

**Example:**
```javascript
// User creates:
Project: { style_aesthetic: "Film noir, high contrast" }
Scene: { mood_tone: "Tense, claustrophobic" }
Shot: { 
  description: "Detective examines evidence",
  lighting_setup: "Single desk lamp, harsh shadows"
}

// Agent receives:
{
  style: "Film noir, high contrast",      // from Project
  mood: "Tense, claustrophobic",          // from Scene
  description: "Detective examines...",   // from Shot
  lighting: "Single desk lamp..."         // from Shot (OVERRIDES scene/project)
}
```

### Agent Workflow (Step-by-Step)

#### User Clicks "Generate Prompt"

**Step 1: Quality Check**
```javascript
POST /api/shots/:shotId/check-quality

Backend:
1. Load shot from database
2. Calculate completeness (0-100%)
3. Identify missing fields
4. Return { percentage, tier, missingFields }

Frontend:
- If tier === 'production' → Open Generate Prompt modal
- If tier === 'draft' → Open Recommendations dialog first
```

**Step 2A: Recommendations (if needed)**
```javascript
POST /api/shots/:shotId/get-recommendations

Backend:
1. Load project, scene, shot
2. Call generateRecommendations(context)
3. Gemini returns AI suggestions
4. Return recommendations to frontend

Frontend:
- Display missing fields with recommendations
- User selects or customizes values
- Auto-populate shot form
- User can skip and proceed anyway
```

**Step 2B: Generate Prompt**
```javascript
POST /api/shots/:shotId/generate-prompt
Body: { modelName: 'midjourney' }

Backend:
1. Check user credits (>=1?)
2. Load project, scene, shot
3. Load KB files for selected model
4. Calculate hierarchical context
5. Call generatePrompt(context)
6. Gemini returns { prompt, assumptions }
7. Deduct 1 credit
8. Save variant to database
9. Return variant to frontend

Frontend:
- Display generated prompt
- Show quality tier badge
- Update credit balance
- Add variant to list
```

### Error Handling & Edge Cases

#### Insufficient Credits
```javascript
if (user.credits < 1) {
  return res.status(403).json({
    error: 'Insufficient credits',
    credits_remaining: user.credits,
    upgrade_url: '/pricing'
  });
}
```

#### API Failures
```javascript
try {
  const response = await gemini.generate(...);
} catch (error) {
  console.error('Gemini API error:', error);
  // Return credits to user
  await creditService.refund(userId, 1);
  return res.status(500).json({
    error: 'AI generation failed',
    message: 'Your credit has been refunded'
  });
}
```

#### Invalid JSON from AI
```javascript
try {
  const recommendations = JSON.parse(text);
} catch (e) {
  // Fallback regex extraction
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Could not parse AI response');
}
```

### Performance Optimization

#### KB File Caching
```javascript
const kbCache = new Map();

function loadKBFile(path) {
  if (kbCache.has(path)) {
    return kbCache.get(path);
  }
  
  const content = fs.readFileSync(path, 'utf-8');
  kbCache.set(path, content);
  return content;
}
```

#### Request Batching
```javascript
// Future: Batch multiple shots
POST /api/shots/batch-generate
Body: {
  shotIds: [1, 2, 3],
  modelName: 'midjourney'
}

// Generate 3 prompts in sequence
// Deduct 3 credits
// Return array of variants
```

---

## Current State

### ✅ Phase 0: Foundation (COMPLETE)

**Repository Structure:**
- ✅ GitHub repository created and organized
- ✅ Full knowledge base (250K words, 44 guides)
- ✅ Condensed KB (82KB, 11 files for 6 models)
- ✅ Project documentation and specifications

### ✅ Phase 1: Core UI & CRUD (COMPLETE)

**Database:**
```sql
✅ projects table
✅ scenes table
✅ shots table (30+ fields)
✅ characters table
✅ objects table
✅ image_variants table
✅ users table
✅ usage_log table
```

**UI Components:**
- ✅ Project Info page (editable fields)
- ✅ Characters page (CRUD for character bibles)
- ✅ Objects page (CRUD for object bibles)
- ✅ Scene Manager page (unified accordion interface)
  - ✅ Scene cards with collapsible shot lists
  - ✅ Shot detail panels with all fields
  - ✅ 3-status system (Planning / In Progress / Complete)
  - ✅ Status dropdowns with hover effects
  - ✅ Nested accordion navigation
  - ✅ Add Scene / Add Shot buttons

**Features:**
- ✅ Create/Read/Update/Delete for all entities
- ✅ Hierarchical data structure (Project → Scene → Shot)
- ✅ Reference image upload (characters, objects)
- ✅ Comprehensive shot fields (30+ attributes)
- ✅ Status management for scenes and shots
- ✅ Navigation: Project Info | Characters | Objects | Scene Manager

### ✅ Phase 2A-B: Backend Services (COMPLETE)

**Authentication System:**
- ✅ `server/middleware/auth.js` - Session management
- ✅ Login/logout endpoints
- ✅ Password hashing (bcrypt)
- ✅ Session-based auth (express-session)

**Credit System:**
- ✅ `server/services/creditService.js`
- ✅ Credit deduction with usage logging
- ✅ Balance checking
- ✅ Usage analytics (last 30 days)

**Knowledge Base Integration:**
- ✅ `server/services/kbLoader.js`
- ✅ Loads model-specific KB files from `/kb` directory
- ✅ Maps models to required KB files
- ✅ Returns 6 available models
- ✅ Conditional pack loading (character consistency, motion readiness)

**Quality Checking:**
- ✅ `server/services/qualityCheck.js`
- ✅ Calculates completeness score (0-100%)
- ✅ Returns tier (production ≥70% / draft <70%)
- ✅ Identifies missing fields with labels

**Gemini AI Integration:**
- ✅ `server/services/geminiService.js`
- ✅ **Model:** Gemini 3.0 Flash (updated from 2.0)
- ✅ `generateRecommendations()` - AI suggests values for missing fields
- ✅ `generatePrompt()` - Main prompt generation using KB + context
- ✅ Hierarchical priority: Shot > Scene > Project

**API Endpoints:**
```javascript
// Auth
✅ POST /api/auth/login
✅ GET /api/auth/me
✅ POST /api/auth/logout

// Credits
✅ GET /api/user/credits
✅ GET /api/user/usage

// AI Generation
✅ GET /api/models (returns 6 models)
✅ POST /api/shots/:shotId/check-quality
✅ POST /api/shots/:shotId/get-recommendations (free)
✅ POST /api/shots/:shotId/generate-prompt (costs 1 credit)

// Variants
✅ GET /api/shots/:shotId/variants
✅ PUT /api/variants/:id
✅ DELETE /api/variants/:id
```

**Environment Configuration:**
- ✅ `.env` file with GEMINI_API_KEY and SESSION_SECRET
- ✅ Platform-owned API key (never exposed to frontend)
- ✅ ES module syntax (import/export)
- ✅ Server runs on port 3000, frontend on 5174

---

## What's Left to Complete Lite v1.0

### ❌ Phase 2C: Frontend Integration (IN PROGRESS)

This is the **critical missing piece** to complete the Lite version.

#### 1. Credit Display (Not Started)
**Component:** Header component  
**Features:**
- Badge showing remaining credits (e.g., "85 Credits")
- Updates after each generation
- Visual indicator (color changes when low: green → yellow → red)
- Click to view usage history

#### 2. Generate Prompt Button (Not Started)
**Location:** Shot detail panel  
**Features:**
- "Generate Prompt" button below shot fields
- Disabled if shot is incomplete (<70%)
- Opens modal on click
- Shows loading state during API calls

#### 3. Generate Prompt Modal (Not Started)
**Components:**
- Modal overlay with shot context preview
- Model selection dropdown (populated from `/api/models`)
- Credit cost display ("Generate (1 Credit)")
- Cancel / Generate buttons
- Loading spinner during generation
- Success state with prompt display

#### 4. Quality Check Integration (Not Started)
**Workflow:**
- User clicks "Generate Prompt"
- Frontend calls `/api/shots/:shotId/check-quality`
- If completeness ≥70% → Open Generate Prompt modal directly
- If completeness <70% → Open Recommendations dialog first

#### 5. Recommendations Dialog (Not Started)
**Components:**
- "Missing Context Detected" warning header
- Shows AI-powered suggestions for each missing field
- For each field:
  - AI recommendation with reasoning
  - 2-3 alternative suggestions
  - Option to accept, choose alternative, or write custom
- Auto-populates shot form as user answers
- "Skip and Generate Anyway" option (creates draft-tier prompt)
- "Save and Continue" button

#### 6. Insufficient Credits Handling (Not Started)
**Features:**
- Check credits before opening modal
- If credits = 0:
  - Modal shows "Insufficient Credits" message
  - Disable generate button
  - "Get More Credits" link/button to pricing page
  - Friendly messaging (not error-like)

#### 7. Variant Display (Not Started)
**Components:**
- List of generated variants below shot details
- Each variant card shows:
  - Model used (with icon/badge)
  - Quality tier badge (Production/Draft with color coding)
  - Generated prompt (expandable/collapsible)
  - Timestamp ("2 hours ago")
  - Edit/Delete buttons
- Latest variant highlighted or sorted to top
- Empty state if no variants yet

#### 8. Quality Tier Badges (Not Started)
**Design:**
- **Production:** Green badge with checkmark icon
- **Draft:** Yellow/orange badge with warning icon
- Tooltip on hover explaining tier
- Display on variant cards and in generation modal

#### 9. Error Handling (Not Started)
**Coverage:**
- API errors (network failures, 500 errors)
- Session timeout (redirect to login)
- Invalid input warnings (client-side validation)
- Rate limiting messages
- Graceful degradation (fallback UI states)

#### 10. Loading States (Not Started)
**Components:**
- Spinner during quality check
- Skeleton UI while loading recommendations
- Progress indicator during prompt generation
- Disabled buttons during API calls
- Optimistic UI updates where appropriate

---

## Implementation Roadmap

### ✅ Phase 0: Foundation (COMPLETE)
**Timeline:** Completed  
**Status:** ✅ Done

- Repository structure
- Full knowledge base (250K words)
- Condensed knowledge base (82KB, 11 files)
- Project specifications

---

### ✅ Phase 1: Core UI & CRUD (COMPLETE)
**Timeline:** Completed  
**Status:** ✅ Done

**Deliverables:**
- Database schema (8 tables)
- Project Info page
- Characters page
- Objects page
- Scene Manager page (accordion navigation)
- All CRUD operations functional

---

### ✅ Phase 2A-B: Backend Services (COMPLETE)
**Timeline:** Completed  
**Status:** ✅ Done

**Deliverables:**
- Authentication system
- Credit management
- Knowledge base loader
- Quality checking
- Gemini 3.0 Flash integration
- All API endpoints functional

---

### 🔄 Phase 2C: Frontend AI Integration (IN PROGRESS)
**Timeline:** 3-5 days  
**Status:** 🔄 Current Focus  
**Goal:** Complete Lite v1.0 with functional AI prompt generation

**Tasks:**
1. ❌ Add credit balance display to header
2. ❌ Create Generate Prompt button on shot panel
3. ❌ Build Generate Prompt modal
4. ❌ Integrate quality check workflow
5. ❌ Build recommendations dialog
6. ❌ Implement variant display with quality badges
7. ❌ Add insufficient credits handling
8. ❌ Implement error handling and loading states
9. ❌ Test complete end-to-end user flow
10. ❌ Bug fixes and polish

**Success Criteria:**
- ✅ User can login and see credit balance
- ✅ User creates project → scene → shot
- ✅ User clicks "Generate Prompt"
- ✅ Quality check runs automatically
- ✅ If incomplete → recommendations dialog appears
- ✅ User fills missing fields or skips
- ✅ User selects model from dropdown
- ✅ Prompt generates successfully (costs 1 credit)
- ✅ Variant appears with quality tier badge
- ✅ Credit balance updates in header
- ✅ Error handling works for all edge cases

---

### Phase 3: Polish & Launch Prep
**Timeline:** 1-2 weeks  
**Status:** ⏳ Not Started  
**Dependencies:** Phase 2C complete

**User Experience:**
1. User onboarding flow (welcome wizard)
2. Empty state designs (no projects, no shots)
3. Help tooltips and inline guidance
4. Keyboard shortcuts (power users)
5. Responsive design (mobile-friendly)

**Business:**
6. Pricing page (tier comparison)
7. Payment integration (Stripe)
8. Email verification system
9. Password reset flow
10. Account settings page

**Legal & Marketing:**
11. Terms of service
12. Privacy policy
13. Landing page (marketing site)
14. Documentation / Help center
15. Beta user testing program

**Technical:**
16. Performance optimization
17. Error tracking (Sentry or similar)
18. Analytics (Posthog or similar)
19. SEO optimization
20. Deployment pipeline

---

### Phase 4: Beta Launch
**Timeline:** 2-3 weeks  
**Status:** ⏳ Not Started  
**Dependencies:** Phase 3 complete

**Activities:**
1. Soft launch to 10-20 beta users
2. Collect feedback and bug reports
3. Daily monitoring and fixes
4. Iterate based on user behavior
5. Prepare for public launch

**Metrics to Track:**
- User retention (day 1, day 7, day 30)
- Prompts generated per user
- Credit purchase rate
- Feature usage analytics
- Customer satisfaction (NPS)

---

### Phase 5: Expansion (Post-Launch)

#### Short Term (1-3 months)
**Focus:** Improve core offering

1. Add 3-5 more popular models
2. Batch generation (multiple shots at once)
3. Export features (copy prompts, download metadata)
4. User feedback integration
5. Performance optimization
6. Template library (pre-built shot sequences)
7. Improved quality scoring (6-dimension audit)
8. Variant comparison (side-by-side)

#### Medium Term (3-6 months)
**Focus:** Add advanced features

1. Image upload and analysis
2. Quality scoring for uploaded images
3. Video clip management
4. Storyboarding tools
5. Collaboration features (share projects)
6. API access for developers
7. Webhook integrations
8. Custom branding (white label)

#### Long Term (6-12 months)
**Focus:** Build full platform

1. All 21 models from full knowledge base
2. Multi-agent crew system
3. Advanced workflows (animatics, previz)
4. Custom model training integration
5. Export to professional tools (Adobe, DaVinci)
6. Template marketplace (community-contributed)
7. Team accounts and permissions
8. Enterprise features (SSO, audit logs)

---

## Success Metrics

### Lite v1.0 Launch Targets

**User Acquisition:**
- 50 beta users in first month
- 10% month-over-month growth
- 30% of users invited by referrals

**User Retention:**
- 80% retention (week 2)
- 60% retention (month 1)
- 40% retention (month 3)

**Product Usage:**
- Average 15 prompts generated per active user
- 70%+ shots complete before generation
- Average quality score of 85% (production tier)

**Quality & Performance:**
- 90% positive feedback on prompt quality
- Prompts score 8/10+ in blind tests vs generic LLM prompts
- 80%+ of generated images require ≤2 iterations
- <2% API error rate
- <3 second response time (p95)

**Monetization:**
- 70%+ users upgrade from free tier
- $15 average revenue per paying user (ARPU)
- 5% conversion from free to paid within 30 days
- $1,000 MRR by month 3

**User Satisfaction:**
- Users report 50%+ time savings vs manual prompting
- Net Promoter Score (NPS) ≥40
- <5% churn rate monthly
- Average session length ≥15 minutes

---

## Restore Point Checklist

### Critical Information for Context Restoration

If context is lost, you need to know:

#### ✅ What ShotPilot Is
Persistent AI copilot for cinematic AI filmmaking with model-specific expertise using specialized knowledge base

#### ✅ Why It Matters
Solves context loss + generic prompts + fragmented workflow that plagues AI filmmakers

#### ✅ What's Been Built
- **Full KB:** 250K words, 44 guides, 21 models
- **Condensed KB:** 82KB, 11 files, 6 selected models
- **Phase 1:** Complete CRUD UI with accordion navigation
- **Phase 2A-B:** Complete backend (auth, credits, Gemini 3.0 Flash, AI services)

#### ✅ What's Left for Lite v1.0
- **Phase 2C:** Frontend AI integration (modal, recommendations, variants)
- Estimated 3-5 days of focused development

#### ✅ What Happens After Lite
1. Polish & launch prep (1-2 weeks)
2. Beta testing (2-3 weeks)
3. Public launch
4. Iterative expansion (add models, features)
5. Full version (6-12 months)

#### ✅ Critical Technical Decisions
- **Platform owns API keys** (not user-provided)
- **Credit system** (not direct billing)
- **Quality gating** (70% completeness threshold)
- **Hierarchical context** (Shot > Scene > Project)
- **6 models only** (not all 21)
- **SQLite database** (not cloud database)
- **Gemini 3.0 Flash** (1M context, multimodal, free tier)

#### ✅ Current Navigation
**Single Path:** Project Info | Characters | Objects | Scene Manager

**Scene Manager = Accordion:**
- Scenes with collapsible shot lists
- Shot detail panels with all 30+ fields
- 3-status system (Planning / In Progress / Complete)

#### ✅ Selected Models (6 Total)

**Image (4):**
1. Higgsfield Cinema Studio V1.5 - Deterministic camera control
2. Midjourney - Artistic stylization
3. Nano Banana Pro - High-quality edits, 4K
4. GPT Image 1.5 - Natural language, fast iteration

**Video (2):**
1. VEO 3.1 - Native audio, cinematic
2. Kling 2.6 - Physics, character consistency

#### ✅ Gemini 3.0 Flash Implementation
- **File:** `server/services/geminiService.js`
- **API URL:** `gemini-3.0-flash:generateContent`
- **Context Window:** 1M tokens
- **Functions:**
  - `generateRecommendations()` - Free AI suggestions
  - `generatePrompt()` - Credit-based prompt generation (1 credit)

#### ✅ Knowledge Base Structure
```
shotpilot-app/kb/
├── 01_Core_Realism_Principles.md (7.8KB)
├── 02_Model_Higgsfield_Cinema_Studio.md (4.2KB)
├── 02_Model_Midjourney.md (5.8KB)
├── 02_Model_Nano_Banana_Pro.md (6.7KB)
├── 02_Model_GPT_Image.md (8.4KB)
├── 02_Model_VEO_31.md (8.9KB)
├── 02_Model_Kling_26.md (8.5KB)
├── 03_Pack_Character_Consistency.md (6.4KB)
├── 03_Pack_Quality_Control.md (8.3KB)
├── 03_Pack_Motion_Readiness.md (8.3KB)
└── 04_Translation_Matrix.md (9.9KB)
```

#### ✅ Phase 2C Requirements (Frontend)
1. Credit balance in header
2. Generate Prompt button
3. Generate Prompt modal with model selector
4. Quality check integration (70% threshold)
5. Recommendations dialog (AI suggestions)
6. Variant display with quality badges
7. Insufficient credits handling
8. Error states and loading indicators

---

## Version History

| Date | Version | Milestone | Notes |
|------|---------|-----------|-------|
| Feb 5, 2026 | 0.1 | Phase 2B Complete | Backend services complete, Gemini 3.0 Flash integrated |
| [Future] | 0.2 | Phase 2C Complete | Frontend AI integration complete |
| [Future] | 1.0 | Public Launch | ShotPilot Lite v1.0 live |

---

## Quick Reference

### Repository
- **GitHub:** `cine-ai-knowledge-base`
- **App Directory:** `shotpilot-app/`
- **Knowledge Base:** `shotpilot-app/kb/` (11 files, 82KB)

### Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express (ES Modules)
- **Database:** SQLite (file-based)
- **AI:** Gemini 3.0 Flash (1M context)

### Key Files
- `server/services/geminiService.js` - Gemini 3.0 Flash integration
- `server/services/kbLoader.js` - Knowledge base loader
- `server/services/qualityCheck.js` - Completeness scoring
- `server/services/creditService.js` - Credit management
- `server/middleware/auth.js` - Authentication

### Environment Variables
```bash
GEMINI_API_KEY=your_key_here
SESSION_SECRET=your_secret_here
```

### Commands
```bash
# Start development server (both backend + frontend)
npm run start

# Backend only
npm run server

# Frontend only
npm run dev
```

---

**This document serves as the complete project context. Save it, and if context is lost, this restores you to exactly where we are today.**