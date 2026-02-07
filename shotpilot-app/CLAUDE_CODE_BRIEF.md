# ShotPilot Phase 2C: Frontend AI Integration

## CLAUDE CODE INSTRUCTIONS

You are implementing Phase 2C: Frontend AI Integration for ShotPilot Lite v1.0.

**CRITICAL:**
- Only use the CONDENSED KB in `shotpilot-app/kb/` (11 files, 82KB)
- IGNORE the full KB in root `/kb` directory (250K words, not used in Lite version)
- IGNORE files in `/app_spec` (outdated specifications)
- IGNORE root README.md (outdated)

---

## PROJECT OVERVIEW

**What is ShotPilot?**
A persistent AI copilot for cinematic AI filmmaking. It generates model-specific prompts using specialized knowledge and maintains context across projects/scenes/shots.

**Tech Stack:**
- Frontend: React + TypeScript + Vite (port 5174)
- Backend: Node.js + Express (port 3000)
- Database: SQLite (shotpilot.db)
- AI: Gemini 3.0 Flash

**Selected Models (6 total):**
- Image: Higgsfield, Midjourney, Nano Banana Pro, GPT Image 1.5
- Video: VEO 3.1, Kling 2.6

---

## WHAT'S ALREADY BUILT (Phase 1 + 2A-B)

### ✅ Backend (Complete - Don't Touch)

**Authentication:**
- `server/middleware/auth.js` - Session-based auth

**Services:**
- `server/services/creditService.js` - Credit management
- `server/services/geminiService.js` - Gemini 3.0 Flash integration
- `server/services/kbLoader.js` - Loads KB files from `shotpilot-app/kb/`
- `server/services/qualityCheck.js` - Shot completeness scoring

**API Endpoints (All Working):**
```javascript
// Auth
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout

// Credits
GET /api/user/credits
GET /api/user/usage

// AI
GET /api/models
POST /api/shots/:shotId/check-quality
POST /api/shots/:shotId/get-recommendations
POST /api/shots/:shotId/generate-prompt

// Variants
GET /api/shots/:shotId/variants
PUT /api/variants/:id
DELETE /api/variants/:id
```

### ✅ Frontend (Partial - UI Done, AI Integration Missing)

**Existing Pages:**
- `src/pages/ProjectInfo.tsx` - Project details form
- `src/pages/Characters.tsx` - Character bible CRUD
- `src/pages/Objects.tsx` - Object bible CRUD
- `src/pages/SceneManager.tsx` - Accordion navigation (scenes → shots)

**Existing Components:**
- Scene cards with collapsible shot lists
- Shot detail panels with 30+ editable fields
- Status dropdowns (Planning/In Progress/Complete)

**Navigation:**
Project Info | Characters | Objects | Scene Manager

**What's Missing:** AI generation UI (modal, recommendations, variants)

---

## YOUR TASK: Phase 2C Frontend AI Integration

Build the UI for AI-powered prompt generation. User flow:

1. User fills out shot details in Scene Manager
2. User clicks "Generate Prompt" button
3. Quality check runs (backend API)
4. If <70% complete → Show recommendations dialog
5. If ≥70% complete → Show generate prompt modal
6. User selects model and generates (costs 1 credit)
7. Variant appears with prompt and quality badge
8. Credit balance updates in header

---

## SPECIFIC COMPONENTS TO BUILD

### 1. Credit Balance Badge (Header)
**Location:** Add to existing header/navigation
**API:** `GET /api/user/credits`
**Display:** "85 Credits" with color coding:
- Green: >50 credits
- Yellow: 10-50 credits
- Red: <10 credits

**Update trigger:** After successful generation

---

### 2. Generate Prompt Button
**Location:** Inside shot detail panel (SceneManager.tsx)
**Position:** Below shot form fields, above variant list
**States:**
- Enabled: "Generate Prompt"
- Loading: "Checking Quality..."
- Disabled: "Incomplete Shot" (if <70%)

**On Click:**
1. Call `POST /api/shots/:shotId/check-quality`
2. If tier === 'production' → Open GeneratePromptModal
3. If tier === 'draft' → Open RecommendationsDialog

---

### 3. Recommendations Dialog
**Component:** `src/components/RecommendationsDialog.tsx`
**API:** `POST /api/shots/:shotId/get-recommendations`

**Response Format:**
```json
[
  {
    "field": "camera_angle",
    "recommendation": "Low angle (camera below subject)",
    "reasoning": "Your shot mentions 'powerful detective'...",
    "alternatives": ["Eye level", "Dutch angle", "High angle"]
  }
]
```

**UI Structure:**
```
┌─────────────────────────────────────────┐
│ ⚠️  Missing Context Detected            │
│                                         │
│ Your shot is 45% complete. AI can     │
│ help fill in the gaps.                 │
│                                         │
│ ┌───────────────────────────────────┐ │
│ │ Camera Angle                       │ │
│ │                                    │ │
│ │ ✨ Recommended: Low angle          │ │
│ │ "Elevates character psychologically"│ │
│ │                                    │ │
│ │ Alternatives:                      │ │
│ │ • Eye level                        │ │
│ │ • Dutch angle                      │ │
│ │ • High angle                       │ │
│ │                                    │ │
│ │ [Accept] [Choose Alternative ▼]   │ │
│ └───────────────────────────────────┘ │
│                                         │
│ [Repeat for each missing field]        │
│                                         │
│ [Skip & Generate Anyway] [Save & Gen]  │
└─────────────────────────────────────────┘
```

**Behavior:**
- "Accept" → Auto-populate shot field with recommendation
- "Choose Alternative" → Dropdown to select alternative
- User can also type custom value
- "Save & Gen" → Update shot, then open GeneratePromptModal
- "Skip" → Open modal anyway (creates draft-tier prompt)

---

### 4. Generate Prompt Modal
**Component:** `src/components/GeneratePromptModal.tsx`
**API:**
- `GET /api/models` (populate dropdown)
- `POST /api/shots/:shotId/generate-prompt`

**UI Structure:**
```
┌─────────────────────────────────────────┐
│ Generate Prompt                     [×] │
├─────────────────────────────────────────┤
│ Shot Context:                           │
│ ┌───────────────────────────────────┐  │
│ │ Shot #3: Medium shot               │  │
│ │ Scene: Detective's Office          │  │
│ │ Description: Detective examines... │  │
│ │ Quality: Production (85%)          │  │
│ └───────────────────────────────────┘  │
│                                         │
│ Select Model:                           │
│ [Midjourney                        ▼]  │
│                                         │
│ Credit Balance: 85 Credits              │
│ Generation Cost: 1 Credit               │
│                                         │
│         [Cancel]  [Generate (1 ⭐)]     │
└─────────────────────────────────────────┘
```

**After Generation (Success):**
```
┌─────────────────────────────────────────┐
│ Prompt Generated! ✓                 [×] │
├─────────────────────────────────────────┤
│ Model: Midjourney                       │
│ Quality: Production                     │
│                                         │
│ Generated Prompt:                       │
│ ┌───────────────────────────────────┐  │
│ │ Medium shot of world-weary        │  │
│ │ detective in fedora and trench    │  │
│ │ coat, examining crime scene       │  │
│ │ photos under single desk lamp...  │  │
│ │                                   │  │
│ │ [Copy to Clipboard]               │  │
│ └───────────────────────────────────┘  │
│                                         │
│ AI Assumptions:                         │
│ - Inferred film noir aesthetic         │
│ - Assumed 50mm lens for medium shot    │
│                                         │
│ Credits Remaining: 84                   │
│                                         │
│                          [Close]        │
└─────────────────────────────────────────┘
```

**Request:**
```javascript
POST /api/shots/:shotId/generate-prompt
Body: { modelName: 'midjourney' }
```

**Response:**
```json
{
  "variant": {
    "id": 1,
    "shot_id": 5,
    "model_name": "midjourney",
    "prompt_used": "Medium shot of world-weary detective...",
    "quality_tier": "production",
    "created_at": "2026-02-05T..."
  },
  "assumptions": "- Inferred film noir...",
  "credits_remaining": 84
}
```

**Error Handling:**
- 403 Forbidden → "Insufficient Credits" dialog
- 500 Error → "Generation failed, credit refunded"
- Network error → "Connection lost, please retry"

---

### 5. Variant Display
**Location:** Below shot form in shot detail panel
**API:** `GET /api/shots/:shotId/variants`

**UI Structure:**
```
┌─────────────────────────────────────────┐
│ Generated Variants (3)                  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🎨 Midjourney  🟢 Production        │ │
│ │ 2 hours ago                         │ │
│ │                                     │ │
│ │ Medium shot of world-weary...      │ │
│ │ [Show Full Prompt ▼]               │ │
│ │                                     │ │
│ │        [Copy] [Edit] [Delete]      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📷 Higgsfield  🟡 Draft             │ │
│ │ 1 day ago                           │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Quality Badges:**
- 🟢 Production (≥70%) - Green badge
- 🟡 Draft (<70%) - Yellow/orange badge

**Empty State:**
```
┌─────────────────────────────────────────┐
│ No prompts generated yet                │
│                                         │
│ Click "Generate Prompt" to create      │
│ your first AI-optimized prompt.        │
└─────────────────────────────────────────┘
```

---

### 6. Insufficient Credits Dialog
**Trigger:** When user has 0 credits
**Display:** Before opening generate modal
```
┌─────────────────────────────────────────┐
│ Insufficient Credits                [×] │
├─────────────────────────────────────────┤
│ You need at least 1 credit to          │
│ generate a prompt.                      │
│                                         │
│ Current Balance: 0 Credits              │
│                                         │
│          [Get More Credits]             │
└─────────────────────────────────────────┘
```

---

## EXISTING CODE PATTERNS TO FOLLOW

### API Calls
**Pattern from existing code:**
```typescript
// src/services/api.ts (check if exists, otherwise create)
export async function fetchWithAuth(url: string, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important for session auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
```

### State Management
**Pattern from SceneManager.tsx:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function handleAction() {
  setLoading(true);
  setError(null);
  try {
    const result = await api.doSomething();
    // Update state
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

### Modal Pattern
Look at existing modal implementations in the codebase. If none exist, use a simple overlay pattern:
```typescript
{showModal && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      {/* Modal content */}
    </div>
  </div>
)}
```

---

## FILE STRUCTURE TO CREATE
```
src/
├── components/
│   ├── CreditBadge.tsx           (NEW)
│   ├── GeneratePromptButton.tsx  (NEW)
│   ├── GeneratePromptModal.tsx   (NEW)
│   ├── RecommendationsDialog.tsx (NEW)
│   ├── VariantList.tsx           (NEW)
│   ├── VariantCard.tsx           (NEW)
│   └── QualityBadge.tsx          (NEW)
│
├── services/
│   ├── api.ts                    (UPDATE - add AI endpoints)
│   └── creditService.ts          (NEW - frontend credit tracking)
│
└── pages/
    └── SceneManager.tsx          (UPDATE - add button, variants)
```

---

## TESTING CHECKLIST

After implementation, test:

1. ✅ Credit badge appears in header with correct balance
2. ✅ Generate button appears on shot detail panel
3. ✅ Click generate → quality check runs
4. ✅ If incomplete → recommendations dialog shows
5. ✅ Accept recommendation → field auto-populates
6. ✅ Skip recommendations → modal opens anyway
7. ✅ Generate modal shows model dropdown
8. ✅ Select model → generate → success
9. ✅ Variant appears in list with badge
10. ✅ Credit balance decrements
11. ✅ Copy prompt works
12. ✅ 0 credits → insufficient credits dialog
13. ✅ Error handling works for all edge cases

---

## CRITICAL REMINDERS

**DO:**
✅ Use condensed KB location: `shotpilot-app/kb/`
✅ Follow existing UI patterns from SceneManager
✅ Use session-based auth (credentials: 'include')
✅ Handle loading states for all async operations
✅ Show user-friendly error messages
✅ Update credit balance after generation
✅ Test with actual backend running

**DON'T:**
❌ Read or reference files in root `/kb` directory
❌ Read or reference files in `/app_spec`
❌ Implement all 21 models (only 6 are selected)
❌ Create new backend endpoints (all exist)
❌ Modify database schema
❌ Change authentication system

---

## GETTING STARTED

1. Start backend: `npm run server` (port 3000)
2. Start frontend: `npm run dev` (port 5174)
3. Verify existing pages work
4. Begin with CreditBadge (simplest component)
5. Test each component before moving to next
6. End with full user flow test
