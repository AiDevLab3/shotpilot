# ShotPilot

**AI Cinematography Copilot for Professional Filmmaking**

Transform your creative vision into cinematic imagery with 250,000+ words of film industry expertise, 10 AI model specialists, and professional quality analysis.

<!-- Screenshots coming soon -->

## What Makes ShotPilot Different

While other AI tools give you generic results, ShotPilot combines:
- **Cinematic realism expertise** — 250K+ words of anti-artifact research tackling the #1 problem in AI imagery: making it look real, not "AI-generated." Plastic skin, HDR glow, uncanny lighting — we've documented every failure mode and how to fix it.
- **Expert model specialists** — handcrafted prompts for 9 API-connected models (FLUX, GPT Image, Grok, Kling, Seedream, Reve, Kontext, Nano Banana, Topaz) + Midjourney prompt generation
- **6-dimension quality analysis** — Physics, Style, Lighting, Clarity, Objects, Character consistency
- **AI-collaborative workflow** — Create scripts, characters, objects, and shot plans through natural language conversation with AI experts, or upload your own
- **User-in-the-loop control** — AI recommends, you decide, transparent cost tracking

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Environment variables for AI services:
  - `GEMINI_API_KEY` (Google AI Studio)
  - `FALAI_API_KEY` (fal.ai for FLUX, Grok, etc.)
  - `OPENAI_API_KEY` (GPT Image 1.5)

### Installation

```bash
# Clone the repository
git clone https://github.com/AiDevLab3/shotpilot-v2.git
cd shotpilot-v2

# Install dependencies
cd shotpilot-app
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Initialize database and start server
npm run dev
```

### First Project Setup

1. **Open ShotPilot**: Navigate to `http://localhost:3000`
2. **Create Project**: Set your visual style, mood, and cinematography approach  
3. **Add Characters**: Upload reference photos and descriptions for consistent identity
4. **Script Import**: Paste your screenplay or treatment for context
5. **Scene Planning**: Break script into scenes with specific requirements
6. **Shot Design**: Use the Creative Director to plan individual shots
7. **Generate & Review**: Create images with AI, analyze quality, and iterate

## Core Features

### 🎬 Professional Workflow
- **Creative Director**: Collaborate with AI to develop scripts, define visual style, plan cinematography — or upload your own
- **Character Bible**: Create characters through conversation or upload reference photos, with consistent identity tracking
- **Object Library**: Build props, vehicles, locations through AI collaboration or import your own references
- **Scene Manager**: Drag-and-drop shot planning with AI-designed shots, coverage analysis, and cohesion checks
- **Asset Manager**: Complete image library with version control and iteration chains

### 🎥 Cinematic Realism Engine
The biggest problem in AI-generated imagery isn't creativity — it's realism. Every AI model produces telltale artifacts: plastic-looking skin, impossible lighting physics, HDR glow, uncanny symmetry, depth-of-field inconsistencies. ShotPilot's knowledge base contains extensive research on:
- **Anti-artifact techniques** — Identifying and eliminating the "AI look" at the prompt level
- **Lighting physics** — Motivated light sources, proper key-to-fill ratios, color temperature consistency
- **Material realism** — Skin subsurface scattering, fabric behavior, metal reflectivity
- **Camera simulation** — Lens characteristics, sensor noise, depth of field that matches real optics
- **Continuity preservation** — Maintaining realism across edits and iterations without introducing new artifacts

This isn't generic prompt enhancement. It's the difference between "a photo of a detective" and an image that could pass for a frame from a Fincher film.

### 🤖 AI Expert System
- **Creative Director Agent**: Interprets vision and selects optimal models
- **Quality Gate**: 6-dimension analysis with actionable feedback
- **Strategy Picker**: Intelligent improvement recommendations
- **Model Specialists**: Expert prompts for 10+ different AI models
- **RAG Compiler**: Contextual knowledge loading for each shot

### 📊 Quality Analysis

**Analyzed Dimensions:**
- **Physics**: Lighting consistency, shadow accuracy, depth of field realism
- **Style**: Aesthetic coherence with project visual identity  
- **Lighting**: Professional cinematography principles and motivated sources
- **Clarity**: Technical image quality and sharpness appropriateness
- **Objects**: Prop accuracy, environmental consistency, logical placement
- **Character**: Facial consistency, identity preservation, wardrobe continuity

### 🎯 Scene Workshop

**Key Features:**
- **Visual Storyboard**: Horizontal shot sequence with thumbnails and scores
- **Staging Area**: Unassigned images ready for placement
- **Gap Analysis**: "What's Missing?" identifies incomplete coverage  
- **Cohesion Check**: "Look Consistent?" verifies visual continuity
- **Contextual Chat**: Per-shot AI consultation for refinements

## Supported AI Models

| Model | Type | API | Strengths |
|-------|------|-----|-----------|
| **FLUX.2** | Generator | ✅ fal.ai | Physics-based realism, JSON prompts, hex colors |
| **Midjourney V7** | Generator | 🔄 Prompt-only | Aesthetic excellence, photographer approach |  
| **GPT Image 1.5** | Editor/Generator | ✅ OpenAI | World knowledge, text rendering, identity preservation |
| **Grok Imagine** | Generator | ✅ fal.ai | Dramatic aesthetics, film stock emulation |
| **Kling Image V3** | Generator | ✅ fal.ai | Elements face control, series generation |
| **Nano Banana Pro** | Editor | ✅ fal.ai | Thinking model, 14 references, conversational |
| **Reve** | Editor | ✅ fal.ai | Surgical edits, 4 variants, no masking |
| **Seedream 4.5** | Generator | ✅ fal.ai | SOTA typography, multi-image consistency |
| **FLUX Kontext** | Editor | ✅ fal.ai | Instruction-based editing, guidance control |
| **Topaz AI** | Utility | ✅ fal.ai | Post-processing, upscaling up to 6x |

## Tech Stack

### Backend
- **Runtime**: Node.js 18+ with ES modules
- **Framework**: Express.js with TypeScript support
- **Database**: SQLite with better-sqlite3 (WAL mode)
- **Knowledge Base**: FTS5 full-text search with 1,229 indexed chunks
- **AI Integration**: Google Gemini (analysis), fal.ai (generation), OpenAI (GPT Image)

### Frontend  
- **Framework**: React 18 with TypeScript
- **Routing**: React Router with nested layouts
- **State Management**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS with custom components
- **Drag & Drop**: @dnd-kit for Scene Workshop interactions
- **Image Handling**: Lazy loading with intersection observers

### Data Architecture
- **RAG System**: 250K+ words indexed via SQLite FTS5
- **Project Context**: Hierarchical style inheritance (Project → Scene → Shot)
- **Image Versioning**: Parent/child relationships for iteration tracking
- **Quality Tracking**: 6-dimension scoring with improvement recommendations

## Development

### Project Structure
```
shotpilot-v2/
├── shotpilot-app/              # Main application
│   ├── src/                    # React frontend
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level components  
│   │   ├── services/           # API clients and utilities
│   │   └── types/              # TypeScript definitions
│   ├── server/                 # Express backend
│   │   ├── services/           # Business logic
│   │   │   ├── agents/         # AI agent system
│   │   │   └── ai/             # RAG compiler and shared AI utilities
│   │   ├── routes/             # API endpoints
│   │   └── middleware/         # Auth, credits, error handling
│   ├── tests/                  # Test suites
│   └── data/                   # SQLite database
├── kb/                         # Knowledge base (condensed for AI)
├── docs/                       # Documentation
│   ├── VISION.md               # Product vision and roadmap  
│   └── ARCHITECTURE.md         # Technical architecture
└── README.md                   # This file
```

### Available Scripts

```bash
# Development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Database operations
npm run db:reset          # Reset to clean state
npm run db:migrate        # Run schema updates  
npm run rag:reindex       # Rebuild knowledge base index

# Code quality
npm run lint              # ESLint + TypeScript checks
npm run type-check        # TypeScript validation only
npm run format            # Prettier code formatting
```

### Environment Configuration

Create `.env` in the `shotpilot-app/` directory:

```bash
# Required: Google Gemini for analysis and orchestration
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-3-flash-preview

# Required: fal.ai for most image generation models  
FALAI_API_KEY=your_falai_key_here

# Optional: OpenAI for GPT Image 1.5
OPENAI_API_KEY=your_openai_key_here

# Optional: Server configuration
PORT=3000
BIND_HOST=0.0.0.0
NODE_ENV=development
```

### Testing

ShotPilot includes comprehensive test coverage:

**Automated Tests:**
```bash
# Full test suite (18 tests, ~25 seconds)
npm run test

# Specific test categories
npm run test:smoke        # API endpoints and core functionality
npm run test:ui           # React component testing  
npm run test:agents       # AI agent system validation
```

**Visual Testing:**
```bash
# Playwright browser automation
npx playwright install   # First-time setup
npm run test:visual       # Screenshot-based UI testing
```

**Manual Testing Checklist:**
- [ ] Project creation and style profile setup
- [ ] Character upload and reference image handling  
- [ ] Scene planning with Creative Director integration
- [ ] Drag-and-drop shot assignment in Scene Workshop
- [ ] Quality Gate analysis with 6-dimension scoring
- [ ] Image generation with multiple models
- [ ] User-in-the-loop improvement workflow

## API Documentation

### Core Endpoints

**Project Management:**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project settings
- `DELETE /api/projects/:id` - Delete project and all assets

**Scene & Shot Management:**
- `GET /api/scenes/:projectId` - Get scenes for project
- `POST /api/shots` - Create shot in scene  
- `PUT /api/shots/:id` - Update shot details
- `DELETE /api/shots/:id` - Remove shot (preserves images)

**AI Agent System:**
- `POST /api/agents/analyze` - Quality Gate analysis of uploaded image
- `POST /api/agents/generate-prompt` - Creative Director prompt generation  
- `POST /api/agents/generate-with-audit` - Single generation + quality analysis
- `POST /api/agents/execute-improvement` - User-chosen improvement execution

**RAG Knowledge Base:**
- `GET /api/v2/rag/status` - Knowledge base statistics
- `POST /api/v2/rag/query` - General knowledge queries
- `POST /api/v2/rag/query/model` - Model-specific knowledge retrieval

## Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `cd shotpilot-app && npm install`
4. Set up environment variables (see above)
5. Start development server: `npm run dev`

### Code Standards
- **TypeScript**: Strict mode enabled, all new code must be typed
- **React**: Functional components with hooks, avoid class components
- **Styling**: Tailwind CSS classes, custom CSS only when necessary
- **API**: RESTful endpoints with consistent error handling
- **Database**: Prepared statements only, no string concatenation
- **AI Services**: All API calls must include cost tracking and error handling

### Commit Guidelines
- **Format**: `type(scope): description`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Scope**: `agents`, `ui`, `api`, `rag`, `db`
- **Examples**:
  - `feat(agents): add character consistency tracking`
  - `fix(ui): resolve scene workshop drag-and-drop issues`
  - `docs(readme): update API endpoint documentation`

### Pull Request Process
1. Update documentation for any API changes
2. Add tests for new features  
3. Run full test suite: `npm test`
4. Update CHANGELOG.md with notable changes
5. Request review from maintainers

## Architecture Deep Dive

For technical implementation details, see:
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Complete system architecture
- **[VISION.md](docs/VISION.md)** - Product vision and business model
- **API Reference** - Interactive API docs at `/api/docs` (when running)

### Key Architectural Decisions

**Multi-Agent Design**: Specialized AI agents (Creative Director, Quality Gate, Strategy Picker) rather than monolithic AI for better domain expertise and modularity.

**RAG-Powered Knowledge**: 250K+ words of cinematography expertise accessible via contextual queries instead of static prompt templates.

**User-in-the-Loop**: No automated improvement loops - user controls every generation decision for cost transparency and creative control.

**Hierarchical Styling**: Project → Scene → Shot style inheritance allows consistency with scene-specific variation.

**Immutable Image History**: Parent/child relationships preserve full edit history while tracking costs and improvements.

## Roadmap

### Current Version (v1.0)
✅ Complete agent system with RAG integration  
✅ Professional Scene Workshop with drag-and-drop  
✅ 6-dimension quality analysis  
✅ 9 working model APIs + Midjourney prompt generation  
✅ Character and object reference system

### Next Release (v1.1) - Q2 2024
🔄 Complete API integration for all 10 models  
🔄 Character consistency tracking with database persistence  
🔄 Demo mode with pre-loaded showcase projects  
🔄 Team collaboration features and approval workflows

### Future Releases (v2.0+)
📋 Video generation workflow with motion analysis  
📋 Custom model fine-tuning integration  
📋 Mobile companion app for on-set reference  
📋 Educational platform integration for film schools

## Support

### Documentation
- **Getting Started**: See Quick Start section above
- **API Reference**: Available at `/api/docs` when running locally  
- **Architecture Guide**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Product Vision**: [docs/VISION.md](docs/VISION.md)

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Architecture questions and use case sharing
- **Discord**: Real-time community support (coming soon)

### Professional Support  
For production deployments, custom integrations, or training:
- **Email**: support@shotpilot.ai
- **Consulting**: Custom knowledge bases and workflow optimization
- **Training**: Team workshops on cinematography AI workflows

## License

**Development License**: This version is for development and evaluation purposes.

**Commercial Licensing**: Contact licensing@shotpilot.ai for production use licensing.

The knowledge base content represents significant research into AI model optimization and cinematography principles. Commercial use requires appropriate licensing agreements.

---

**Built with ❤️ for filmmakers who want to maintain creative control while leveraging AI expertise.**

*ShotPilot transforms your creative vision into professional imagery through deep cinematography knowledge, not generic AI prompting.*