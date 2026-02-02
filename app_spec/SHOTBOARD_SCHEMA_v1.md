# Shotboard Schema v1

**Version:** 1.0  
**Date:** February 2, 2026  
**Purpose:** Define the canonical data structures for the Cine-AI Shotboard application

This schema defines the core entities and relationships for managing cinematic AI projects, from high-level project DNA to individual frame generations.

---

## Schema Overview

The Shotboard schema is organized hierarchically:

```
ProjectDNA
  └── SoulID (characters)
  └── EntityID (objects, locations)
  └── Scene
      └── Shot
          └── Frame
              └── PromptHistory
```

---

## 1. ProjectDNA

**Purpose:** The single source of truth for a project's visual identity, style, and creative constraints.

**Schema:**

```typescript
interface ProjectDNA {
  id: string;                    // Unique project identifier
  name: string;                  // Project name
  version: string;               // Project DNA version (e.g., "v1", "v2")
  createdAt: Date;
  updatedAt: Date;
  
  // Visual Identity
  lookName: string;              // e.g., "Noir Detective," "Warm Kodak"
  primaryReferences: string[];   // 2-3 film/photo references
  colorPalette: {
    temperature: "warm" | "cool" | "neutral";
    saturation: "low" | "medium" | "high";
    shadowTint: string;          // e.g., "blue shadows," "warm shadows"
  };
  
  // Lighting Philosophy
  lightingPhilosophy: string;    // e.g., "motivated practicals, window light"
  contrastStyle: "low" | "gentle" | "high" | "noir";
  
  // Camera Language
  cameraLanguage: {
    movement: "handheld" | "locked" | "dolly" | "hybrid";
    lensRange: string;           // e.g., "28-50mm," "35-85mm"
    framingRules: string[];      // e.g., ["rule of thirds," "negative space"]
  };
  
  // Texture Rules
  textureRules: {
    grainLevel: "none" | "subtle" | "medium" | "heavy";
    softness: "sharp" | "natural" | "soft";
    forbiddenTerms: string[];    // e.g., ["oversharpen," "HDR," "plastic"]
  };
  
  // Realism Pack Settings
  realismPackVersion: string;    // e.g., "v1"
  customRealismRules: string[];  // Project-specific overrides
  
  // Forbidden Drift
  forbiddenDrift: string[];      // 5+ things to never see
  
  // Canon Frame Anchors (Project-Level)
  canonStyleFrameId: string | null;      // Reference frame for global style
  canonCharacterFrameId: string | null;  // Reference frame for character identity
  canonLightingFrameId: string | null;   // Reference frame for lighting continuity
}
```

---

## 2. SoulID (Character Identity)

**Purpose:** Canonical definition of a character's identity, appearance, and personality.

**Schema:**

```typescript
interface SoulID {
  id: string;                    // Unique character identifier
  projectId: string;             // Reference to ProjectDNA
  name: string;                  // Character name
  version: string;               // Character version (e.g., "v1", "v2_aged")
  createdAt: Date;
  updatedAt: Date;
  
  // Physical Appearance (Invariants)
  physicalAppearance: {
    facialStructure: {
      jawline: string;
      noseShape: string;
      eyeSpacing: string;
      eyeColor: string;
      distinguishingMarks: string[];  // scars, moles, etc.
    };
    age: string;                 // e.g., "early 30s"
    skinTone: string;            // e.g., "olive with warm undertones"
    hair: {
      style: string;
      color: string;
      length: string;
      texture: string;
    };
    bodyType: string;            // e.g., "athletic build"
    posture: string;             // e.g., "slight slouch"
  };
  
  // Wardrobe
  signatureWardrobe: {
    name: string;                // e.g., "Detective Look"
    items: string[];             // e.g., ["worn leather jacket", "faded jeans"]
    accessories: string[];       // jewelry, props
  }[];
  
  // Personality & Mannerisms
  personality: {
    traits: string[];            // e.g., ["confident", "pensive"]
    vocalTone: string;
    speechQuirks: string[];
    mannerisms: string[];        // recurring gestures
  };
  
  // Reference Assets
  masterReferenceImage: string;  // URL or path to master reference
  additionalReferences: string[]; // Multi-angle references
  
  // Model-Specific IDs
  modelSpecificIds: {
    klingElementId?: string;
    klingCustomFaceId?: string;
    runwayReferenceId?: string;
    midjourneyCharacterRef?: string;
  };
}
```

---

## 3. EntityID (Objects, Locations, Props)

**Purpose:** Canonical definition of non-character entities that need consistency.

**Schema:**

```typescript
interface EntityID {
  id: string;                    // Unique entity identifier
  projectId: string;             // Reference to ProjectDNA
  type: "object" | "location" | "prop" | "vehicle";
  name: string;                  // Entity name
  version: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Visual Description
  description: string;           // Detailed visual description
  keyFeatures: string[];         // Defining characteristics
  
  // Reference Assets
  masterReferenceImage: string;
  additionalReferences: string[];
  
  // Model-Specific IDs
  modelSpecificIds: {
    klingElementId?: string;
    veoIngredientId?: string;
    runwayReferenceId?: string;
  };
}
```

---

## 4. Scene

**Purpose:** A narrative unit containing multiple shots with shared context.

**Schema:**

```typescript
interface Scene {
  id: string;                    // Unique scene identifier
  projectId: string;             // Reference to ProjectDNA
  sceneNumber: number;           // Sequential scene number
  name: string;                  // Scene name
  description: string;           // Narrative description
  createdAt: Date;
  updatedAt: Date;
  
  // Scene Context
  location: string;              // e.g., "Interior diner booth"
  timeOfDay: string;             // e.g., "night"
  weather: string;               // e.g., "rain"
  
  // Scene-Level Lighting Lock
  lightingLock: {
    source: string;              // e.g., "practical lamp"
    direction: string;           // e.g., "frame-right at 35°"
    quality: string;             // e.g., "soft diffused"
    contrastRatio: string;       // e.g., "gentle contrast"
    fill: string;                // e.g., "minimal fill"
  };
  
  // Characters in Scene
  characterIds: string[];        // References to SoulID
  entityIds: string[];           // References to EntityID
  
  // Shots in Scene
  shots: string[];               // References to Shot IDs
}
```

---

## 5. Shot

**Purpose:** A single camera setup within a scene.

**Schema:**

```typescript
interface Shot {
  id: string;                    // Unique shot identifier
  sceneId: string;               // Reference to Scene
  shotNumber: string;            // e.g., "003A", "003B"
  version: number;               // Shot version (v1, v2, v3...)
  createdAt: Date;
  updatedAt: Date;
  
  // Shot Type
  shotType: "establishing" | "wide" | "medium" | "closeup" | "extreme_closeup" | "insert";
  
  // Camera Rig
  cameraRig: {
    lens: string;                // e.g., "50mm"
    aperture: string;            // e.g., "f/4"
    focusBehavior: string;       // e.g., "natural focus falloff"
    cameraHeight: string;        // e.g., "eye level"
  };
  
  // Composition
  composition: {
    framing: string;             // e.g., "medium close-up"
    blocking: string;            // subject positioning
    negativeSpace: string;       // e.g., "frame-left with space frame-right"
  };
  
  // Motion
  cameraMovement: "static" | "dolly_in" | "dolly_out" | "pan" | "handheld" | "custom";
  customMovement?: string;
  
  // Characters & Entities
  characterIds: string[];        // SoulIDs in this shot
  entityIds: string[];           // EntityIDs in this shot
  
  // Frames
  frames: string[];              // References to Frame IDs
  heroFrameId?: string;          // Primary/hero frame for this shot
  
  // Shot Locks (separate from status)
  locks: {
    compositionLocked: boolean;
    characterLocked: boolean;
    entitiesLocked: boolean;
    lightingLocked: boolean;
    lensLocked: boolean;
    motionReadyLocked: boolean;
  };
  
  // Iteration Tracking
  iterationsCount: number;       // Number of regeneration attempts (default 0)
}
```

---

## 6. Frame

**Purpose:** A single generated image or video frame.

**Schema:**

```typescript
interface Frame {
  id: string;                    // Unique frame identifier
  shotId: string;                // Reference to Shot
  frameNumber: number;           // Sequential frame number in shot
  version: number;               // Frame version
  createdAt: Date;
  updatedAt: Date;
  
  // Generation Details
  model: string;                 // e.g., "higgsfield_cinema_studio_v1_5"
  generationType: "image" | "video" | "image_to_video";
  generationAttemptNumber: number; // Attempt number for this frame variant
  
  // Prompt
  promptId: string;              // Reference to PromptHistory
  compiledPrompt: string;        // Final compiled prompt sent to model
  negativePrompt: string;        // Negative prompt used
  
  // Assets
  outputUrl: string;             // Generated image/video URL
  referenceImageUrl?: string;    // Reference image used (if any)
  thumbnailUrl?: string;
  
  // Quality Scores
  qualityScores: {
    aiSheenScore: number;        // 0-100 (lower is better)
    lightingContinuity: number;  // 0-100 (higher is better)
    characterIdentityLock: number; // 0-100 (higher is better)
    cinematicHierarchy: number;  // 0-100 (higher is better)
    overallScore: number;        // 0-100 (higher is better)
  };
  
  // Status
  status: "generating" | "completed" | "approved" | "rejected" | "needs_refinement";
  
  // Metadata
  modelParameters: Record<string, any>; // Model-specific parameters
  generationTime: number;        // Time taken to generate (seconds)
}
```

---

## 7. PromptHistory

**Purpose:** Track prompt evolution and compilation for debugging and learning.

**Schema:**

```typescript
interface PromptHistory {
  id: string;                    // Unique prompt identifier
  frameId: string;               // Reference to Frame
  createdAt: Date;
  
  // Prompt Components
  sceneIntent: string;           // Human-readable scene description
  projectLook: string;           // From ProjectDNA
  realismPackInjection: string;  // From Realism Pack
  modelWrapper: string;          // Model-specific syntax
  
  // Compilation Details
  compiler: "manual" | "gpt" | "custom";
  compilerVersion?: string;
  
  // Delta (if refinement)
  isDelta: boolean;
  deltaFrom?: string;            // Reference to previous PromptHistory ID
  deltaChanges?: {
    added: string[];
    removed: string[];
    modified: string[];
  };
  
  // Full Prompt
  fullPrompt: string;            // Complete compiled prompt
  negativePrompt: string;
}
```

---

## Relationships Summary

```
ProjectDNA (1) ──< SoulID (many)
ProjectDNA (1) ──< EntityID (many)
ProjectDNA (1) ──< Scene (many)

Scene (1) ──< Shot (many)
Scene (1) ──< SoulID (many, via characterIds)
Scene (1) ──< EntityID (many, via entityIds)

Shot (1) ──< Frame (many)
Shot (1) ──< SoulID (many, via characterIds)
Shot (1) ──< EntityID (many, via entityIds)

Frame (1) ── PromptHistory (1)
```

---

## Implementation Notes

### Database Considerations
- Use UUID for all IDs
- Index on projectId, sceneId, shotId for fast lookups
- Store URLs as strings; actual assets in S3 or similar
- Use JSONB for flexible metadata fields (modelParameters, etc.)

### Versioning Strategy
- ProjectDNA: version when look changes significantly
- SoulID: version when character appearance changes (aging, costume)
- Shot: version for each regeneration attempt
- Frame: version for refinements of same generation

### Quality Score Calculation
- Implement as separate service/function
- Can be AI-powered (GPT-4 Vision) or rule-based
- Store scores for historical analysis and learning

---

**Schema Version:** 1.0  
**Last Updated:** February 2, 2026  
**Maintained by:** Cine-AI Development Team
