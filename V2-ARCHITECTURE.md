# ShotPilot V2 — Clean Architecture Plan

## What This Is
A clean rebuild of ShotPilot from the existing codebase, keeping everything that works,
deleting everything that doesn't, restructuring for clarity, and filling critical gaps.

## Repo Structure
```
shotpilot-v2/
├── README.md                    # Product overview, setup, usage
├── kb/                          # Single source of truth for knowledge base
│   ├── condensed/               # AI-consumption versions (from shotpilot-app/kb/)
│   ├── models/                  # Full model guides (from root kb/models/)
│   ├── core/                    # Core principles (from root kb/core/)
│   ├── packs/                   # Technique packs (from root kb/packs/)
│   └── translation/             # Translation matrix
├── app/                         # The product (renamed from shotpilot-app)
│   ├── src/                     # React frontend
│   │   ├── components/          # Only active components (no v2/, no dead code)
│   │   ├── pages/               # Only active pages
│   │   ├── services/            # Only active API clients
│   │   ├── stores/              # Only active stores
│   │   └── types/               # Clean types
│   ├── server/                  # Express backend
│   │   ├── services/            
│   │   │   ├── agents/          # Agent system (CD, QG, Strategy, Continuity, Orchestrator)
│   │   │   ├── ai/              # AI services (ragCompiler, shared, shotPlanning, etc.)
│   │   │   └── *.js             # Core services (generation, cost, credit, etc.)
│   │   ├── routes/              # Only active routes
│   │   ├── rag/                 # RAG system
│   │   └── middleware/          # Auth etc.
│   ├── tests/                   # All tests in one place
│   ├── data/                    # SQLite DB
│   ├── uploads/                 # User assets
│   └── public/                  # Static assets
└── docs/                        # All documentation
    ├── architecture.md          # How the system works
    ├── vision.md                # Product vision and roadmap
    └── archive/                 # Historical docs (CONCEPT_PITCH, etc.)
```

## What Gets Deleted
- All root-level loose files (CLAUDE.md, AGENTS.md, MORNING_NOTES.md, etc.)
- /compiler/ directory (functionality absorbed into ragCompiler.js)
- /shotpilot-app/src/components/v2/ (Workbench detour)
- /shotpilot-app/src/AppV2.tsx, stores/workbenchStore.ts, services/v2Api.ts, types/v2.ts
- All .backup files, cookies.txt, loose test scripts, loose image files
- Duplicate kb/archive/ (keep only in docs/archive/)
- Old test files (phase2c, phase3, route-test, etc.)
- CLAUDE_CODE_BRIEF.md, PHASE_3_TEST_REPORT.md, USER-IN-LOOP-REFACTOR-COMPLETE.md

## What Gets Fixed
1. tsconfig strict mode re-enabled (fix all unused vars properly)
2. Dead code removed from ShotBoardPage.tsx (accumulated cruft)
3. Old StoryboardPanel.tsx and StagingArea.tsx removed (replaced by DndSceneWorkshop)
4. Unused route files removed or consolidated
5. Clean imports throughout

## What Gets Integrated
1. ragCompiler already integrated (done tonight)
2. Generate Image button in modal (done tonight)
3. Continuity tracker persistence (wire to existing SQLite tables)
4. Auto-fill readiness gaps from project/scene data (not manual typing)
5. Default model from Creative Director selection

## Key Decisions
- Single kb/ folder at root, not duplicated
- No v2/workbench code — one clear interface
- Tests consolidated in app/tests/
- Docs separated from code
- Server serves built frontend (production-like)
