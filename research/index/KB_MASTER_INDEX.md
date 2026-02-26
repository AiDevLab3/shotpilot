# Cine-AI Knowledge Base Master Index

**Version:** 3.0  
**Last Updated:** February 25, 2026

The Cine-AI Knowledge Base contains 250,000+ words of cinematography research, distilled into structured guides for AI image and video generation. This index maps every file in the repository.

---

## How the KB Is Organized

### 1. **Packs** — Universal Constraints (model-agnostic)
Rules and best practices for achieving specific outcomes. The **"what"** and **"why"**.

### 2. **Models** — Syntax Wrappers (model-specific)
Prompting mastery guides for each AI model. The **"how"** for each platform.

### 3. **Core** — Foundational Principles
Distilled core references for realism, character consistency, quality control, and spatial composition.

### 4. **Condensed** — RAG-Optimized Versions
AI-optimized versions of all guides (~18K tokens total), structured for efficient chunk indexing. These feed the app's RAG pipeline.

### 5. **Translation** — Cross-Model Mapping
How to translate cinematography concepts between models.

### 6. **Examples** — Copy/Paste Templates
Ready-to-use prompt templates demonstrating pack principles.

### 7. **Archive** — Historical Guides
Earlier versions and broader reference material preserved for context.

---

## Packs (Universal Constraints)

| Pack | Description |
|------|-------------|
| [Cinematic Realism Pack v1](../packs/Cine-AI_Cinematic_Realism_Pack_v1.md) | Eliminate AI/CGI look, enforce filmic realism, style/lighting continuity |
| [Character Consistency Pack v1](../packs/Cine-AI_Character_Consistency_Pack_v1.md) | Maintain character identity across shots, scenes, and models |
| [Quality Control Pack v1](../packs/Cine-AI_Quality_Control_Pack_v1.md) | Identify and fix common AI artifacts, troubleshoot, refine to professional standards |
| [Spatial Composition & Anatomy Pack v1](../packs/Cine-AI_Spatial_Composition_Anatomy_Pack_v1.md) | Cinematic composition, framing, depth, anatomical realism |
| [Motion Readiness Pack v1](../packs/Cine-AI_Motion_Readiness_Pack_v1.md) | Prepare hero frames for video generation, prevent motion artifacts |
| [cinematic-realism.md](../packs/cinematic-realism.md) | Condensed realism reference |
| [motion-readiness.md](../packs/motion-readiness.md) | Condensed motion readiness reference |

---

## Core Principles

| File | Description |
|------|-------------|
| [realism-principles.md](../core/realism-principles.md) | Foundational photographic realism criteria |
| [character-consistency.md](../core/character-consistency.md) | Core character identity preservation |
| [quality-control.md](../core/quality-control.md) | Quality assessment standards |
| [spatial-composition.md](../core/spatial-composition.md) | Composition and framing fundamentals |

---

## Models — Image Generation (33 models)

### Tier 1 — ShotPilot Specialists (10 models, API-integrated)

| Model | Guide | Type | Key Strengths |
|-------|-------|------|---------------|
| FLUX 2 | [Prompting Mastery](../models/flux_2/Prompting_Mastery.md) | Generator | Physics-based realism, JSON prompts, hex colors |
| FLUX Kontext | [Prompting Mastery](../models/flux_kontext/Prompting_Mastery.md) | Editor | Instruction-based edits, guidance scale control |
| GPT Image 1.5 | [Prompting Mastery](../models/gpt_image_1_5/Prompting_Mastery.md) | Generator/Editor | World knowledge, text rendering, identity preservation |
| Grok Imagine | [Prompting Mastery](../models/grok_imagine/Prompting_Mastery.md) | Generator | Dramatic aesthetics, film stock emulation |
| Kling Image V3 | [Prompting Mastery](../models/kling_image_v3/Prompting_Mastery.md) | Generator | Elements face control, series generation |
| Midjourney | [Prompting Mastery](../models/midjourney/Prompting_Mastery.md) | Generator | Aesthetic excellence, --oref consistency, photographer approach |
| Nano Banana Pro | [Prompting Mastery](../models/nano_banana_pro/Prompting_Mastery.md) | Editor | Thinking model (Gemini 3 Pro), 14 refs, edit-don't-reroll |
| Reve | [Prompting Mastery](../models/reve/Prompting_Mastery.md) | Editor | Surgical edits, 4 variants, no masking needed |
| Seedream 4.5 | [Prompting Mastery](../models/seedream_4_5/Prompting_Mastery.md) | Generator | SOTA typography, multi-image consistency |
| Topaz | [Prompting Mastery](../models/topaz/Prompting_Mastery.md) | Utility | Post-processing: upscale up to 6x, denoise, sharpen |

### Additional Image Models (researched, not yet integrated)

| Model | Guide |
|-------|-------|
| Bria FIBO | [Prompting Mastery](../models/bria_fibo/Prompting_Mastery.md) |
| Higgsfield Cinema Studio v1.5 | [Prompting Mastery](../models/higgsfield_cinema_studio_v1_5/Prompting_Mastery.md) |
| Higgsfield DOP | [Prompting Mastery](../models/higgsfield_dop/Prompting_Mastery.md) |
| Ideogram | [Prompting Mastery](../models/ideogram/Prompting_Mastery.md) |
| Kling O1 Image | [Prompting Mastery](../models/kling_o1_image/Prompting_Mastery.md) |
| Kling O1 Edit | [Prompting Mastery](../models/kling_o1_edit/Prompting_Mastery.md) |
| PixVerse V5.6 | [Prompting Mastery](../models/pixverse_v5_6/Prompting_Mastery.md) |
| Qwen Image Max | [Prompting Mastery](../models/qwen_image_max/Prompting_Mastery.md) |
| Recraft V4 | [Prompting Mastery](../models/recraft_v4/Prompting_Mastery.md) |
| Wan 2.2 Image | [Prompting Mastery](../models/wan_2_2_image/Prompting_Mastery.md) |
| Z Image | [Prompting Mastery](../models/z_image/Prompting_Mastery.md) |

---

## Models — Video Generation (11 models)

| Model | Guide | Key Strengths |
|-------|-------|---------------|
| Veo 3.1 | [Prompting Mastery](../models/veo_3_1/Prompting_Mastery.md) | Ingredients-to-Video, identity consistency across settings |
| Sora 2 | [Prompting Mastery](../models/sora_2/Prompting_Mastery.md) | Physics simulation, complex scene understanding |
| Kling 2.6 | [Prompting Mastery](../models/kling_2_6/Prompting_Mastery.md) | Custom Face Models, Element Library |
| Kling 3.0 | [Prompting Mastery](../models/kling_3_0/Prompting_Mastery.md) | Latest Kling video generation |
| Kling Avatars 2.0 | [Prompting Mastery](../models/kling_avatars_2_0/Prompting_Mastery.md) | Avatar generation and animation |
| Kling Motion Control | [Prompting Mastery](../models/kling_motion_control/Prompting_Mastery.md) | Precise motion and camera control |
| Runway Gen-4.5 | [Prompting Mastery](../models/runway_gen4_5/Prompting_Mastery.md) | Single and multi-reference precision |
| Seedance 1.5 Pro | [Prompting Mastery](../models/seedance_1_5_pro/Prompting_Mastery.md) | Best-in-class lip-sync, dialogue scenes |
| Minimax Hailuo 02 | [Prompting Mastery](../models/minimax_hailuo_02/Prompting_Mastery.md) | Fast video generation |
| Wan 2.6 | [Prompting Mastery](../models/wan_2_6/Prompting_Mastery.md) | Fast generation, style consistency |
| LTX 2 | [Prompting Mastery](../models/ltx_2/Prompting_Mastery.md) | Lightweight video generation |
| Vidu Q3 | [Prompting Mastery](../models/vidu_q3/Prompting_Mastery.md) | Video generation |

---

## Condensed (RAG-Optimized)

These feed the app's RAG indexer at `app/kb/`. Structured for efficient chunk retrieval.

| File | Category |
|------|----------|
| [01_Core_Realism_Principles.md](../condensed/01_Core_Realism_Principles.md) | Core principles |
| [02_Model_Flux_2.md](../condensed/02_Model_Flux_2.md) | Model syntax |
| [02_Model_GPT_Image.md](../condensed/02_Model_GPT_Image.md) | Model syntax |
| [02_Model_Grok_Imagine.md](../condensed/02_Model_Grok_Imagine.md) | Model syntax |
| [02_Model_Higgsfield_Cinema_Studio.md](../condensed/02_Model_Higgsfield_Cinema_Studio.md) | Model syntax |
| [02_Model_Kling_26.md](../condensed/02_Model_Kling_26.md) | Model syntax |
| [02_Model_Midjourney.md](../condensed/02_Model_Midjourney.md) | Model syntax |
| [02_Model_Minimax_Hailuo_02.md](../condensed/02_Model_Minimax_Hailuo_02.md) | Model syntax |
| [02_Model_Nano_Banana_Pro.md](../condensed/02_Model_Nano_Banana_Pro.md) | Model syntax |
| [02_Model_Reve.md](../condensed/02_Model_Reve.md) | Model syntax |
| [02_Model_Seedance_15_Pro.md](../condensed/02_Model_Seedance_15_Pro.md) | Model syntax |
| [02_Model_Seedream_45.md](../condensed/02_Model_Seedream_45.md) | Model syntax |
| [02_Model_Sora_2.md](../condensed/02_Model_Sora_2.md) | Model syntax |
| [02_Model_Topaz.md](../condensed/02_Model_Topaz.md) | Model syntax |
| [02_Model_VEO_31.md](../condensed/02_Model_VEO_31.md) | Model syntax |
| [02_Model_Wan_22_Image.md](../condensed/02_Model_Wan_22_Image.md) | Model syntax |
| [02_Model_Wan_26.md](../condensed/02_Model_Wan_26.md) | Model syntax |
| [02_Model_Z_Image.md](../condensed/02_Model_Z_Image.md) | Model syntax |
| [03_Pack_Character_Consistency.md](../condensed/03_Pack_Character_Consistency.md) | Technique pack |
| [03_Pack_Image_Quality_Control.md](../condensed/03_Pack_Image_Quality_Control.md) | Technique pack |
| [03_Pack_Motion_Readiness.md](../condensed/03_Pack_Motion_Readiness.md) | Technique pack |
| [03_Pack_Quality_Control.md](../condensed/03_Pack_Quality_Control.md) | Technique pack |
| [03_Pack_Spatial_Composition.md](../condensed/03_Pack_Spatial_Composition.md) | Technique pack |
| [03_Pack_Video_Quality_Control.md](../condensed/03_Pack_Video_Quality_Control.md) | Technique pack |
| [04_Translation_Matrix.md](../condensed/04_Translation_Matrix.md) | Cross-model translation |

---

## Translation

| File | Description |
|------|-------------|
| [translation-matrix.md](../translation/translation-matrix.md) | Cross-model parameter mapping for cinematography concepts |

---

## Examples

| File | Description |
|------|-------------|
| [Cinematic Realism Master Prompt Template](../examples/Cinematic_Realism_Master_Prompt_Template.md) | Canonical prompt template referencing realism pack rules |

---

## Archive

Historical guides and broader reference material from earlier KB versions:

| File | Topic |
|------|-------|
| [MODEL_SELECTION_GUIDE.md](../archive/MODEL_SELECTION_GUIDE.md) | Model selection criteria |
| [advanced_prompt_engineering_guide.md](../archive/advanced_prompt_engineering_guide.md) | Advanced prompting techniques |
| [ai_agent_interaction_protocol.md](../archive/ai_agent_interaction_protocol.md) | Agent communication protocols |
| [api_vs_direct_prompting_guide.md](../archive/api_vs_direct_prompting_guide.md) | API vs direct prompting comparison |
| [audio_design_guide.md](../archive/audio_design_guide.md) | Audio design for film |
| [cross_model_consistency_integration_framework.md](../archive/cross_model_consistency_integration_framework.md) | Consistency across models |
| [cross_model_translation_reference.md](../archive/cross_model_translation_reference.md) | Earlier translation reference |
| [ethics_legal_guide.md](../archive/ethics_legal_guide.md) | Ethics and legal considerations |
| [global_style_system_methodology_guide.md](../archive/global_style_system_methodology_guide.md) | Style system methodology |
| [image_generation_guide.md](../archive/image_generation_guide.md) | Image generation techniques |
| [post_production_guide.md](../archive/post_production_guide.md) | Post-production workflow |
| [shot_planning_guide.md](../archive/shot_planning_guide.md) | Shot planning methodology |
| [universal_prompting_techniques_guide.md](../archive/universal_prompting_techniques_guide.md) | Universal prompting techniques |
| [vfx_guide.md](../archive/vfx_guide.md) | Visual effects guide |
| [video_analysis_guide.md](../archive/video_analysis_guide.md) | Video analysis techniques |
| [video_generation_guide.md](../archive/video_generation_guide.md) | Video generation workflow |

---

## Stats

- **Total files**: 88
- **Model guides**: 33 (10 Tier 1 image + 12 video + 11 additional image)
- **Packs**: 7 (5 full + 2 condensed)
- **Core principles**: 4
- **Condensed (RAG-ready)**: 25
- **Archive**: 16
- **RAG chunks indexed**: 1,229 (from condensed + app/kb/)

---

**[← Back to README](../../README.md)** | **[Architecture →](../../docs/ARCHITECTURE.md)** | **[Vision →](../../docs/VISION.md)**
