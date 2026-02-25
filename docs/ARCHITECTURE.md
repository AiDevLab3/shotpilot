# ShotPilot Technical Architecture

## System Overview

ShotPilot is a multi-layer architecture designed for professional filmmaking workflows with AI-augmented content creation. The system combines a React frontend, Express.js backend, SQLite data layer, RAG-powered knowledge base, and multi-agent orchestration system.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)                │
├─────────────────────────────────────────────────────────────────┤
│  Pages: Creative Director | Characters | Objects | Scenes |     │
│         Asset Manager | Agent Studio                            │
├─────────────────────────────────────────────────────────────────┤
│  Services: API Client | Auth | Project Context | Image Utils    │
├─────────────────────────────────────────────────────────────────┤
│  State: Zustand Stores (Projects, CD Messages, Workshop)        │
└─────────────────────────────────────────────────────────────────┘
                                   │
                               HTTP/REST API
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (Express.js + Node.js)                │
├─────────────────────────────────────────────────────────────────┤
│  Routes: /api/projects | /api/scenes | /api/agents |           │
│          /api/v2/rag | /api/generate | /api/analyze            │
├─────────────────────────────────────────────────────────────────┤
│  Services: Agent Orchestrator | RAG Compiler | Generation |    │
│            Quality Gate | Creative Director | Strategy Picker   │
├─────────────────────────────────────────────────────────────────┤
│  Middleware: Auth | Credit Tracking | Error Handling           │
└─────────────────────────────────────────────────────────────────┘
                                   │
                              SQLite + RAG
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│  SQLite: Projects, Scenes, Shots, Characters, Objects,         │
│          Images, Conversations, Users, Credits                  │
├─────────────────────────────────────────────────────────────────┤
│  RAG: FTS5 Index (1,229 chunks), Knowledge Base, Model Specs   │
└─────────────────────────────────────────────────────────────────┘
                                   │
                              External APIs
                                   │
┌─────────────────────────────────────────────────────────────────┐
│  AI Services: fal.ai (FLUX, Grok, Kling, etc.) | OpenAI |      │
│               Google Gemini | Anthropic Claude                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model

### Core Entities

```sql
-- Projects: Top-level creative containers
projects (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  style_aesthetic TEXT,      -- e.g., "Neo-noir", "Documentary realism"
  mood TEXT,                 -- e.g., "Dark and moody", "Bright and energetic" 
  cinematography TEXT,       -- e.g., "Handheld documentary", "Steadicam tracking"
  lighting TEXT,            -- e.g., "High contrast chiaroscuro", "Natural window light"
  frame_size TEXT,          -- e.g., "IMAX 65mm", "Anamorphic 2.39:1"
  references TEXT,          -- Reference films, photographers, visual inspiration
  color_palette TEXT,       -- e.g., "Amber/teal", "Desaturated earth tones"
  avoid_list TEXT,          -- Things to avoid in generation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenes: Story segments with specific requirements
scenes (
  id INTEGER PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,      -- Scene sequence order
  location TEXT,            -- e.g., "Wayne Manor rooftop", "Gotham Police Station"
  time_of_day TEXT,        -- e.g., "Night", "Golden hour", "Overcast afternoon"
  mood_tone TEXT,          -- Scene-specific mood override
  lighting_notes TEXT,     -- Scene-specific lighting requirements
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shots: Individual camera setups within scenes
shots (
  id INTEGER PRIMARY KEY,
  scene_id INTEGER REFERENCES scenes(id),
  shot_number TEXT,         -- e.g., "1A", "15", "Insert B"
  shot_type TEXT,          -- e.g., "Wide Shot", "Close-up", "Medium Shot"
  camera_angle TEXT,       -- e.g., "Low angle", "Dutch angle", "Eye level"
  camera_movement TEXT,    -- e.g., "Static", "Pan right", "Dolly push"
  focal_length TEXT,       -- e.g., "50mm", "24-70mm zoom", "85mm portrait"
  camera_lens TEXT,        -- e.g., "RED Komodo 6K", "Sony FX3"
  description TEXT,        -- Creative description of what happens
  blocking TEXT,           -- Actor/object positioning and movement
  desired_duration TEXT,   -- e.g., "3 seconds", "Hold for emphasis"
  order_index INTEGER,     -- Shot sequence within scene
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Characters: Consistent character definitions with visual references
characters (
  id INTEGER PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,        -- Physical description, personality
  age_range TEXT,         -- e.g., "30-35", "Elderly", "Young adult"
  personality TEXT,       -- Character traits affecting portrayal
  wardrobe TEXT,          -- Costume and styling notes
  reference_image_url TEXT, -- Primary character reference photo
  notes TEXT,             -- Additional character development notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Objects: Props, vehicles, locations with reference materials
objects (
  id INTEGER PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,        -- Physical description and context
  category TEXT,          -- e.g., "Vehicle", "Weapon", "Location", "Prop"
  reference_image_url TEXT, -- Primary object reference photo
  notes TEXT,             -- Usage notes, symbolic meaning, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Images: Single source of truth for all generated/imported images
project_images (
  id INTEGER PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  scene_id INTEGER REFERENCES scenes(id), -- NULL for unassigned staging images
  title TEXT,             -- User-defined title
  image_url TEXT NOT NULL, -- File path or URL to image
  prompt_used TEXT,       -- Generation prompt (if AI-generated)
  model_used TEXT,        -- AI model used (if applicable)
  analysis_json TEXT,     -- Holistic quality analysis results
  tags TEXT,              -- User-defined tags for organization
  parent_asset_id INTEGER, -- Links iterations: improved versions reference originals
  iteration_number INTEGER DEFAULT 1, -- 1 = original, 2+ = iterations
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Image Variants: Links shots to specific images with metadata
image_variants (
  id INTEGER PRIMARY KEY,
  shot_id INTEGER REFERENCES shots(id),
  asset_id INTEGER REFERENCES project_images(id), -- Links to master image record
  image_url TEXT,         -- Backward compatibility field
  prompt_used TEXT,       -- Backward compatibility field  
  audit_data TEXT,        -- Quality analysis specific to this shot assignment
  audit_score INTEGER,    -- 0-100 quality score
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Key Design Decisions

**1. Separation of Concerns**
- `project_images`: Master record for all images, handles iterations and metadata
- `image_variants`: Assignment of images to specific shots with shot-specific analysis
- This allows one image to be used in multiple shots while maintaining shot-specific context

**2. Flexible Style System**
- Project-level defaults (style_aesthetic, mood, cinematography)
- Scene-level overrides (mood_tone, lighting_notes)
- Shot-level specifics (shot_type, camera_angle, movement)
- Hierarchical inheritance with granular control

**3. Iteration Tracking**
- `parent_asset_id` creates chains: original → improved_v1 → improved_v2
- `iteration_number` provides sequential ordering
- Preserves full edit history while maintaining clear current versions

## Agent System Architecture

ShotPilot employs a multi-agent system where each agent has specialized knowledge and responsibilities:

### Agent Roles

**1. Creative Director (`creativeDirector.js`)**
- **Purpose**: Interprets user vision, selects optimal AI model, creates structured briefs
- **Knowledge**: Complete model registry with 10+ AI models and their capabilities
- **Key Functions**:
  - `directShot()`: Shot interpretation and model selection
  - `suggestPlacements()`: Scene workshop image-to-shot matching
  - `analyzeGaps()`: Coverage analysis and missing shot identification
  - `checkCohesion()`: Visual continuity across shot sequences

**2. Quality Gate (`qualityGate.js`)**
- **Purpose**: Holistic image analysis with 6-dimension scoring system
- **Dimensions**: Physics, Style, Lighting, Clarity, Objects, Character consistency
- **Key Functions**:
  - `auditImage()`: Complete quality analysis with actionable feedback
  - `screenReference()`: Reference image suitability verification
- **Output**: Numerical scores (1-10 scale) with detailed improvement recommendations

**3. Strategy Picker (`strategyPicker.js`)**
- **Purpose**: Analyzes quality gate results and recommends specific improvement approaches
- **Strategies**: Regenerate, edit, upscale, color-grade, or approve
- **Key Functions**:
  - `pickStrategy()`: Maps quality issues to specific fix approaches
  - Model-aware recommendations based on identified weaknesses

**4. Orchestrator (`orchestrator.js`)**
- **Purpose**: Coordinates multi-agent workflows and user-in-the-loop processes
- **Key Functions**:
  - `generateWithAudit()`: Single generation with quality analysis
  - `analyzeAndRecommend()`: User-in-loop step 1 (analyze without executing)
  - `executeImprovement()`: User-in-loop step 2 (execute chosen improvements)
  - `importImage()`: External image import with metadata tracking

**5. Continuity Tracker (`continuityTracker.js`)**
- **Purpose**: Character consistency verification across shots and scenes
- **Status**: Implemented but needs database persistence backend
- **Future**: Will track character appearance drift and suggest corrections

### Agent Interaction Flow

```
User Request
     │
     ▼
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│  Creative       │───▶│  Model Specialist │───▶│  Generation     │
│  Director       │    │  (FLUX/GPT/MJ)    │    │  Service        │
└─────────────────┘    └───────────────────┘    └─────────────────┘
     │                                                     │
     ▼                                                     ▼
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│  Quality Gate   │◀───│    Generated      │◀───│    Image        │
│  Analysis       │    │    Image          │    │    Result       │
└─────────────────┘    └───────────────────┘    └─────────────────┘
     │
     ▼
┌─────────────────┐    ┌───────────────────┐
│  Strategy       │───▶│  User Decision    │
│  Picker         │    │  (Approve/Edit)   │
└─────────────────┘    └───────────────────┘
     │                          │
     ▼                          ▼
┌─────────────────┐    ┌───────────────────┐
│  Orchestrator   │───▶│  Execute Next     │
│  Coordination   │    │  Action           │
└─────────────────┘    └───────────────────┘
```

## RAG Pipeline Architecture

### Knowledge Base Structure

The RAG system transforms 250,000+ words of cinematography expertise into contextually accessible knowledge:

```
Knowledge Base (kb/)
├── condensed/           # AI-optimized versions (18K tokens total)
│   ├── 01_Core_Principles.md        # Anti-artifact realism fundamentals
│   ├── 02_Model_FLUX2.md            # Model-specific syntax and tips
│   ├── 02_Model_GPT_Image.md        # Per-model optimization guides
│   ├── 03_Technique_Packs.md        # Contextual skill modules
│   └── 04_Translation_Matrix.md     # Cross-model parameter mapping
├── models/              # Full model documentation (25-65KB each)
│   ├── flux_2/
│   │   ├── Prompting_Mastery.md     # Complete model guide
│   │   ├── failure_modes.md         # Known issues and solutions
│   │   └── examples.md              # Proven prompt patterns
│   └── [8 more model directories]
├── core/               # Foundational principles
│   ├── realism_anti_artifact.md    # Core quality principles  
│   ├── cinematography_fundamentals.md
│   └── lighting_principles.md
├── packs/              # Contextual technique modules
│   ├── character_consistency.md    # Identity preservation across shots
│   ├── spatial_composition.md      # Wide shots and environments
│   ├── close_up_mastery.md        # Portrait and detail work
│   └── [12 more specialized packs]
└── translation/        # Cross-model compatibility
    └── parameter_mapping.md        # How concepts translate between models
```

### FTS5 Implementation

**Database Schema:**
```sql
-- Raw knowledge chunks with metadata
rag_chunks (
  id INTEGER PRIMARY KEY,
  file_path TEXT,          -- Source file for traceability
  chunk_text TEXT,         -- Raw content chunk
  category TEXT,           -- 'model', 'pack', 'core', 'translation'
  metadata_json TEXT       -- File metadata, chunk position, etc.
);

-- Full-text search index
rag_chunks_fts (
  chunk_text TEXT,         -- Searchable content
  category TEXT,           -- Filterable category
  content="rag_chunks"     -- Links to main table
);
```

**Current Stats:**
- **1,229 chunks** indexed from 83KB of markdown files
- **Category breakdown**: 45% model-specific, 30% technique packs, 25% core principles
- **Query performance**: <50ms for contextual searches with filtering

### RAG Query Functions

**1. `queryKB(text, filters, limit)`**
- General knowledge base search with category filtering
- Used for contextual technique loading based on shot requirements

**2. `queryForModel(modelId, categories, limit)`**
- Model-specific knowledge retrieval
- Categories: 'syntax', 'tips', 'failures', 'translation'
- Ensures model-appropriate prompting techniques

**3. `queryForStyle(projectStyle, limit)`**
- Style-specific knowledge loading  
- Matches project aesthetics to relevant cinematography techniques

### RAG Compiler Integration

The RAG Compiler (`ragCompiler.js`) combines RAG queries with project context:

```javascript
// Contextual KB loading based on actual shot needs
function loadKBViaRAG(modelId, shotContext) {
    const sections = [];
    
    // 1. Model syntax (always needed)
    const syntaxChunks = queryForModel(modelId, ['syntax', 'tips'], 15);
    
    // 2. Failure modes (critical for avoiding known pitfalls)  
    const failureChunks = queryForModel(modelId, ['failures'], 10);
    
    // 3. Core realism principles (always included)
    const coreChunks = queryKB('realism anti-artifact', {category: 'principles'}, 8);
    
    // 4. Contextual packs (based on shot requirements)
    const keywords = buildContextKeywords(shotContext);
    const packChunks = queryKB(keywords.join(' '), {category: 'pack'}, 10);
    
    // 5. Style-specific knowledge
    if (shotContext.style) {
        const styleChunks = queryForStyle(shotContext.style, 5);
    }
    
    return combineIntoPrompt(sections);
}
```

### Upgrade Path

**Current System**: FTS5 keyword-based search
- **Pros**: Fast, reliable, works well with consistent terminology
- **Cons**: No semantic understanding, struggles with conceptual queries

**Planned Upgrade**: OpenAI embeddings + vector search
- **When**: If FTS5 returns irrelevant results or KB grows beyond ~500 files
- **Implementation**: Documented in `server/rag/UPGRADE-PATH.md`
- **Migration**: Preserve FTS5 as fallback, add embedding pipeline

## Generation Pipeline

### Model Integration Architecture

ShotPilot integrates 10 specialized AI models through a unified interface:

```javascript
// Model Registry with capabilities and API status
const MODEL_REGISTRY = {
  'flux-2': {
    name: 'FLUX.2',
    specialistModule: 'flux2',
    strengths: ['photorealism', 'physics-based lighting', 'hex colors'],
    hasAPI: true,
    description: 'Physics-based photorealism with JSON structured prompts'
  },
  'midjourney': {
    name: 'Midjourney V7', 
    specialistModule: 'midjourney',
    strengths: ['aesthetic excellence', 'photographer approach'],
    hasAPI: false,  // Prompt-only, Discord/web interface
    description: 'Aesthetic mastery with photographer\'s eye'
  }
  // ... 8 more models
};
```

### Specialist System

Each model has a dedicated specialist module that understands its optimal prompting approach:

**FLUX 2 Specialist** (`specialists/flux2.js`):
```javascript
// Generates JSON-structured prompts with hex colors
{
  "subject": "Detective in rain-soaked alley",
  "lighting": "#FFA500 sodium vapor, #4A90E2 LED accent", 
  "camera": "50mm f/2.8, shallow DOF",
  "mood": "noir_atmospheric"
}
```

**Midjourney Specialist** (`specialists/midjourney.js`):
```javascript
// Natural language with V7 parameters
"Wide shot of rain-soaked Neo-Tokyo street, anamorphic lens flare, 
cyberpunk aesthetic --ar 21:9 --style raw --v 7 --oref [character_ref.jpg]"
```

**GPT Image Specialist** (`specialists/gptImage.js`):
```javascript
// Conversational style with world knowledge integration
"Create a cinematic wide shot showing our detective character from Scene 3
walking through a rain-soaked street in Neo-Tokyo. The scene should feel
like Blade Runner 2049 meets Ghost in the Shell..."
```

### Generation Workflow

**1. User Request Processing**
```
Shot Description → Creative Director → Model Selection → Brief Creation
```

**2. Specialist Prompt Generation**
```
Creative Brief → Model Specialist → RAG KB Loading → Expert Prompt
```

**3. Image Generation**
```
Expert Prompt → API Call → Image Result → Quality Analysis → Recommendation
```

**4. User-in-the-Loop Decision**
```
Analysis Results → User Choice → Execute Improvement → Iterate or Approve
```

### API Integration Status

**Working APIs (7 models)**:
- fal.ai: FLUX 2, Grok Imagine, Kling Image V3, Seedream 4.5, FLUX Kontext, Reve
- OpenAI: GPT Image 1.5
- fal.ai utility: Topaz upscaling, GenFocus DOF

**Prompt-Only (3 models)**:
- Midjourney V7 (Discord/web interface)
- Claude Artifacts (web interface)
- Nano Banana Pro (specialized wrapper needed)

## Key Design Decisions and Rationale

### 1. SQLite Over PostgreSQL
**Decision**: Use SQLite for primary database
**Rationale**: 
- Simpler deployment (single file database)
- Sufficient performance for single-tenant usage
- Better-sqlite3 provides synchronous API reducing complexity
- Easy backup and migration (copy single file)

### 2. FTS5 Over Vector Search
**Decision**: Use SQLite FTS5 for RAG implementation
**Rationale**:
- Knowledge base has consistent terminology (cinematography domain)
- Keyword-based search works well with technical documentation
- Much faster than embedding APIs for retrieval
- Upgrade path documented when semantic search needed

### 3. Multi-Agent Architecture
**Decision**: Specialized agents vs single monolithic AI
**Rationale**:
- Domain expertise: Each agent optimized for specific tasks
- Modularity: Can upgrade individual agents without system redesign  
- Transparency: Clear separation of concerns for debugging
- User control: Distinct decision points in the workflow

### 4. User-in-the-Loop Design
**Decision**: No automated improvement loops
**Rationale**:
- Cost control: User approves every generation ($0.02-$0.80 per image)
- Creative control: User makes final aesthetic decisions
- Transparency: Clear understanding of what AI is doing and why
- Professional workflow: Matches real creative director review processes

### 5. Hierarchical Style System
**Decision**: Project → Scene → Shot style inheritance
**Rationale**:
- Flexibility: Can maintain consistency while allowing scene-specific variation
- Realism: Matches how real film productions handle visual continuity
- Scalability: Easy to manage complex projects with many scenes
- Backward compatibility: Simpler projects work with project-level defaults

### 6. Immutable Image History
**Decision**: Parent/child relationships for image iterations
**Rationale**:
- Version control: Never lose original images during improvement cycles
- Analytics: Can track what improvements actually work
- Rollback capability: Can return to previous versions if iteration fails
- Cost tracking: Clear understanding of generation vs improvement costs

## Data Flow Diagrams

### Scene Workshop Data Flow
```
User Drops Image → DnD Handler → Update Assignment API →
Database Update → Re-fetch Shot Images → UI Update
     │
     ▼
Image Variant Created → Audit Data Transfer → Score Badge Update
```

### Generation Pipeline Data Flow  
```
User Request → Creative Director → Model Selection →
Specialist Prompt → RAG Context Loading → Final Prompt →
API Generation → Quality Analysis → Strategy Recommendation →
User Decision → Execute/Approve → Database Storage
```

### RAG Query Flow
```
Shot Context → Keyword Extraction → FTS5 Query →
Category Filtering → Relevance Scoring → Context Assembly →
Prompt Integration → Model-Specific Formatting
```

## Performance Considerations

### Database Optimization
- **Indexes**: All foreign keys indexed, shot queries optimized for scene_id
- **Connection pooling**: better-sqlite3 WAL mode for concurrent reads
- **Query optimization**: Prepared statements for repeated operations

### Knowledge Base Performance
- **FTS5 indexes**: <50ms query times for most contextual searches
- **Token limits**: ~18K tokens total in condensed KB prevents context overflow
- **Caching**: Model-specific KB sections cached in memory during active use

### API Rate Limiting
- **fal.ai**: 10 concurrent requests, 3-minute timeout per generation
- **OpenAI**: Standard rate limits, retry logic with exponential backoff
- **Cost tracking**: All API calls logged with usage statistics

### Frontend Optimization
- **Image loading**: Lazy loading with intersection observers
- **State management**: Zustand with localStorage persistence
- **Route-based splitting**: Each page loads only necessary components

## Security and Deployment

### Authentication
- **Current**: MVP auto-authentication for single user
- **Production**: Session-based auth with user management system
- **API security**: Session validation middleware on all protected routes

### Data Protection
- **Local storage**: All data stored locally (no cloud dependencies)
- **File uploads**: Validated file types, size limits, secure path handling
- **API keys**: Environment variables only, never in client code

### Deployment Architecture
```
Internet → Tailscale VPN → Host Machine (macOS) → 
Docker Container OR Local Process → SQLite + File System
```

**Current Setup**:
- **Development**: Local Node.js process on macOS
- **Access**: Tailscale serve for remote access
- **Database**: SQLite file in project directory
- **Images**: Local filesystem with HTTP serving

**Production Options**:
- **VPS deployment**: Docker container with persistent volumes
- **Cloud deployment**: Minimal infrastructure (single instance + storage)
- **Self-hosted**: Same architecture, different hosting environment

This architecture provides a solid foundation for professional filmmaking workflows while maintaining flexibility for future enhancements and scalability requirements.