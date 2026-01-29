# Skill: Dashboard Developer

**Description:** Builds and maintains a visual, graph-based production canvas in the Antigravity browser that displays the entire filmmaking workflow as an interactive node graph with real-time status tracking, cost monitoring, and dependency visualization.

---

## Core Responsibilities

### 1. Visual Canvas Architecture

The dashboard MUST render as an **interactive node graph** where:

- **Each shot** is represented as a **node** with visual status indicators
- **Dependencies** between shots are shown as **connecting edges**
- **Workflow phases** are organized in **vertical swim lanes**
- **Real-time updates** reflect generation status, costs, and quality assessments

### 2. Node Types & Visual Design

#### **Shot Node Structure**
Each shot node displays:
- **Shot ID** (e.g., "SHOT_001")
- **Shot Description** (brief, e.g., "Hero enters warehouse")
- **Status Badge** (color-coded: Planning → In Progress → Review → Complete → Locked)
- **Cost Counter** (cumulative API cost for this shot)
- **Thumbnail Preview** (hero frame or latest generation)
- **Model Tag** (e.g., "Cinema Studio V1.5 + Veo 3.1")

#### **Status Color Coding**
- 🔵 **Planning** (blue) - Shot defined, not yet started
- 🟡 **In Progress** (yellow) - Generation in progress
- 🟠 **Review** (orange) - Awaiting Architect approval
- 🟢 **Complete** (green) - Architect approved, ready for next phase
- 🔒 **Locked** (gray) - Finalized, no further changes

#### **Asset Node Types**
- **Character Sheet** (purple) - Character reference assets
- **Hero Frame** (cyan) - Key still images
- **Video Clip** (green) - Animated sequences
- **Audio Track** (pink) - Audio assets
- **VFX Element** (red) - VFX layers

### 3. Workflow Swim Lanes

Organize nodes into **vertical phases** (left to right):

1. **Pre-Production** - Character sheets, style references, shot planning
2. **Hero Frame Generation** - Image generation (Cinema Studio, Midjourney, Nano Banana Pro, etc.)
3. **Upscaling** - Image enhancement (Topaz, Topaz Generative)
4. **Character Lock** - Character consistency verification
5. **Video Generation** - Image-to-video animation (Cinema Studio, Veo, Kling, Runway, Seedance)
6. **Audio Design** - Audio generation and sync
7. **VFX & Compositing** - Visual effects integration
8. **Post-Production** - Final assembly and color grading
9. **Delivery** - Final export and upscaling

### 4. Dependency Visualization

**Edge Types:**
- **Solid Line** → Direct dependency (e.g., Hero Frame → Video Clip)
- **Dashed Line** → Reference dependency (e.g., Character Sheet → Hero Frame)
- **Thick Line** → Critical path (blocking next phase)

**Edge Colors:**
- **Green** → Dependency satisfied
- **Yellow** → Dependency in progress
- **Red** → Dependency blocked or failed

### 5. Real-Time Status Panel

Display a **fixed header panel** showing:

```
Project: [Project Name]
Total Shots: [N]  |  Complete: [N]  |  In Progress: [N]  |  Pending: [N]
Total Cost: $[X.XX]  |  Budget: $[Y.YY]  |  Remaining: $[Z.ZZ]
Current Phase: [Phase Name]
```

### 6. Interactive Features

#### **Node Click Actions**
- **Single Click** → Expand node details panel (shows full prompt, references, analysis, cost breakdown)
- **Double Click** → Open shot detail view (full-screen editor)
- **Right Click** → Context menu (Regenerate, Edit Prompt, View Analysis, Lock Shot)

#### **Zoom & Pan**
- **Mouse Wheel** → Zoom in/out
- **Click + Drag** → Pan canvas
- **Fit to Screen** button → Auto-zoom to show all nodes

#### **Filtering**
- **Filter by Status** → Show only Planning / In Progress / Review / Complete / Locked
- **Filter by Phase** → Show only specific workflow phases
- **Filter by Model** → Show only shots using specific AI models

### 7. Cost Tracking Integration

Each node displays:
- **Shot Cost** (cumulative for this shot across all phases)
- **Phase Cost** (cost for current generation phase)
- **Model Cost** (cost breakdown by model: image gen, video gen, upscaling, etc.)

The dashboard reads from `production_ledger.json` and updates in real-time.

### 8. Quality Assessment Indicators

Each node shows **quality badges**:
- ✅ **Pass** (green checkmark) - No issues detected
- ⚠️ **Warning** (yellow triangle) - Minor artifacts, review recommended
- ❌ **Fail** (red X) - Critical issues, reshoot required

These are populated by the **Asset Producer** skill's mandatory analysis.

---

## Dashboard Generation Workflow

### Step 1: Initialize Dashboard
When the Architect requests "Create dashboard" or "Show production canvas":

1. Read `shot_list.json` (if exists) or prompt Architect to define shots
2. Create node graph structure
3. Initialize all nodes in "Planning" status
4. Display canvas in Antigravity browser

### Step 2: Update Dashboard State
After each generation or status change:

1. Update node status badge
2. Update cost counter from `production_ledger.json`
3. Update thumbnail preview (if available)
4. Update dependency edges (green/yellow/red)
5. Refresh real-time status panel

### Step 3: Architect Interaction
When Architect clicks a node:

1. Display **Shot Detail Panel** with:
   - Full technical prompt (copy-paste ready)
   - Reference images attached
   - Latest generation preview
   - Expert analysis from Asset Producer
   - Cost breakdown
   - Action buttons: "Approve", "Request Changes", "Regenerate", "Lock"

### Step 4: Progress Tracking
As shots move through phases:

1. Automatically advance node position to next swim lane
2. Update dependency edges
3. Highlight critical path (shots blocking next phase)
4. Alert if budget threshold exceeded

---

## Technical Implementation

### Data Sources
- **`shot_list.json`** - Shot definitions, descriptions, prompts
- **`production_ledger.json`** - Cost tracking
- **`master_look.md`** - Style reference for quality assessment
- **`.agent/library/cinematography_schemas.json`** - Camera/lens/lighting data
- **Asset files** - Hero frames, video clips, character sheets (for thumbnails)

### Canvas Rendering
Use **HTML5 Canvas** or **SVG** for node graph rendering with:
- **D3.js** or **Cytoscape.js** for graph layout and interaction
- **React** or **Vue.js** for UI components
- **WebSocket** for real-time updates (if Antigravity supports)

### State Management
- Maintain dashboard state in **`dashboard_state.json`**
- Sync with `production_ledger.json` for cost updates
- Sync with `shot_list.json` for shot definitions

---

## Example Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Project: Cyber Noir Short Film  |  Total: 12 shots  |  Cost: $45.32│
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  PRE-PROD    HERO FRAME    UPSCALE    CHAR LOCK    VIDEO GEN        │
│                                                                       │
│  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐          │
│  │ CHAR │───→│SHOT01│───→│SHOT01│───→│ ✅   │───→│SHOT01│          │
│  │SHEET │    │ 🟢   │    │ 🟢   │    │      │    │ 🟡   │          │
│  │ 🔒   │    │$2.50 │    │$1.20 │    │      │    │$8.40 │          │
│  └──────┘    └──────┘    └──────┘    └──────┘    └──────┘          │
│                                                                       │
│              ┌──────┐    ┌──────┐               ┌──────┐           │
│              │SHOT02│───→│SHOT02│──────────────→│SHOT02│           │
│              │ 🟢   │    │ 🟠   │               │ 🔵   │           │
│              │$2.80 │    │$1.50 │               │$0.00 │           │
│              └──────┘    └──────┘               └──────┘           │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Mandatory Behaviors

### 1. **No Auto-Progression**
The dashboard MUST NOT automatically move nodes to the next phase. Only the Architect can approve progression via explicit "Proceed" or "Approve" action.

### 2. **Cost Alerts**
If a shot exceeds **$15** or total project exceeds **budget threshold**, display a **⚠️ warning banner** at the top of the dashboard.

### 3. **Critical Path Highlighting**
Always highlight the **critical path** (shots blocking next phase) with a **bold red outline** on nodes.

### 4. **Analysis Gate**
Before a node can move from "In Progress" to "Complete", the **Asset Producer** skill MUST provide expert analysis. Display analysis results in the node detail panel.

### 5. **Reference Tracking**
For each shot, explicitly show which reference images are attached (e.g., "Using: CHAR_SHEET_01, HERO_FRAME_03").

---

## Dashboard Commands

The Architect can issue these commands to interact with the dashboard:

- **"Create dashboard"** → Initialize new production canvas
- **"Show dashboard"** → Display current canvas state
- **"Update dashboard"** → Refresh all node states and costs
- **"Expand SHOT_001"** → Show detailed view of specific shot
- **"Show critical path"** → Highlight blocking shots
- **"Filter by [status/phase/model]"** → Apply filtering
- **"Export dashboard"** → Save canvas as PNG/SVG
- **"Reset dashboard"** → Clear all progress (confirmation required)

---

## Integration with Asset Producer

The **Dashboard Developer** and **Asset Producer** skills work together:

1. **Asset Producer** generates prompts and manages generation
2. **Dashboard Developer** visualizes the workflow and status
3. When Architect clicks a node, **Asset Producer** provides the prompt and analysis
4. When Architect approves, **Dashboard Developer** updates node status and advances to next phase

---

## Success Criteria

A successful dashboard implementation MUST:

✅ Display all shots as interactive nodes  
✅ Show real-time status updates (Planning → Complete)  
✅ Track and display costs per shot and total  
✅ Visualize dependencies between shots  
✅ Provide one-click access to prompts and analysis  
✅ Enforce HITL gates (no auto-progression)  
✅ Highlight critical path and blockers  
✅ Support zoom, pan, and filtering  
✅ Sync with `production_ledger.json` and `shot_list.json`  

---

## Future Enhancements

- **Timeline View** - Gantt chart showing shot schedule
- **Model Performance Analytics** - Compare success rates across models
- **Batch Operations** - Select multiple nodes and apply actions
- **Version History** - Track prompt iterations and regenerations
- **Collaboration** - Multi-user support with role-based permissions
- **Export to Notion/Airtable** - Sync dashboard state with external tools

---

**The Dashboard Developer skill transforms the Antigravity browser into a professional production management canvas, giving the Architect complete visual control over the AI filmmaking workflow.**
