# Version Audit — February 19, 2026

## Summary

Audited 6 KB guides against current fal.ai endpoints. Found 4 outdated guides, 2 current.

---

## 1. Kling O1 Image → **LEGACY** (superseded by Kling O3 Image)

- **Guide:** `kb/models/kling_o1_image/Prompting_Mastery.md`
- **Finding:** fal.ai now offers `kling-image/o3/text-to-image` and `kling-image/o3/image-to-image` ("top-tier with flawless consistency"). O1 Image endpoints are not listed as "new".
- **Action:** Added legacy version note at top of guide pointing to O3. Also documented O3 Image in the Kling 3.0 guide's expanded O3 section.
- **TODO:** Create dedicated `kling_o3_image/` guide or fold into Kling 3.0 ecosystem guide.

## 2. Kling O1 Edit → **LEGACY** (superseded by Kling O3 Edit + Omni)

- **Guide:** `kb/models/kling_o1_edit/Prompting_Mastery.md`
- **Finding:** fal.ai now offers:
  - `kling-video/o3/standard/video-to-video/edit` ($0.252/s) — replaces O1 Edit
  - `kling-video/o3/pro/video-to-video/edit` — pro tier
  - `kling-video/o3/*/video-to-video/reference` — **NEW** "Kling O3 Omni" for reference-guided V2V
- **Action:** Added legacy note to O1 Edit guide. Expanded Kling 3.0 guide with comprehensive O3 endpoint table covering all 12 O3 endpoints (image, video, edit, omni).
- **TODO:** Create dedicated Kling O3 Edit guide if warranted by complexity.

## 3. Kling O3 Omni — **NEW** (added to Kling 3.0 guide)

- **Finding:** `kling-video/o3/*/video-to-video/reference` is a new capability: generates new shots guided by input reference video, preserving cinematic language (motion, camera style).
- **Action:** Added full documentation section in Kling 3.0 guide under "O3 Omni — Reference Video-to-Video".

## 4. Wan 2.2 Image → **LEGACY** (superseded by Wan 2.6)

- **Guide:** `kb/models/wan_2_2_image/Prompting_Mastery.md`
- **Finding:** Wan 2.6 now includes `wan/v2.6/text-to-image` and `wan/v2.6/image-to-image`, directly superseding Wan 2.2 Image's functionality. Wan 2.6 also has video, reference-to-video, and flash variants.
- **Action:** Marked as legacy with version note. Updated shotpilot-app condensed version.

## 5. Seedream 4.5 → **CURRENT** ✅

- **Guide:** `kb/models/seedream_4_5/Prompting_Mastery.md`
- **Finding:** fal.ai confirms BOTH `bytedance/seedream/v4` AND `bytedance/seedream/v4.5` exist as separate models. v4.5 includes text-to-image and edit endpoints. The guide correctly covers v4.5.
- **Action:** No changes needed. Guide is accurate.

## 6. Minimax Hailuo 02 → **OUTDATED** (Hailuo 2.3 now available)

- **Guide:** `kb/models/minimax_hailuo_02/Prompting_Mastery.md`
- **Finding:** fal.ai now offers Hailuo 2.3 family:
  - `minimax/hailuo-2.3/pro/*` (1080p)
  - `minimax/hailuo-2.3/standard/*` (768p)
  - `minimax/hailuo-2.3-fast/pro/*` (1080p, fast)
  - `minimax/hailuo-2.3-fast/standard/*` (768p, fast)
  - Hailuo 02 endpoints still available but no longer latest
- **Action:** Added version note to guide and shotpilot-app condensed version.
- **TODO:** Create dedicated `minimax_hailuo_2_3/` guide.

## 7. Seedance 1.5 Pro → **CURRENT** ✅

- **Guide:** `kb/models/seedance_1_5_pro/Prompting_Mastery.md`
- **Finding:** fal.ai shows Seedance 1.5 Pro as the latest version (text-to-video, image-to-video with audio). Older v1 Pro/Lite/Fast variants exist but 1.5 Pro is current.
- **Action:** No changes needed.

---

## Files Modified

| File | Change |
|------|--------|
| `kb/models/kling_o1_image/Prompting_Mastery.md` | Added legacy banner pointing to O3 |
| `kb/models/kling_o1_edit/Prompting_Mastery.md` | Added legacy banner pointing to O3 Edit + Omni |
| `kb/models/kling_3_0/Prompting_Mastery.md` | Expanded O3 section: 12 endpoints, O3 Image, Edit, Omni docs (v2.0→v2.1) |
| `kb/models/wan_2_2_image/Prompting_Mastery.md` | Added legacy banner pointing to Wan 2.6 |
| `kb/models/minimax_hailuo_02/Prompting_Mastery.md` | Added version note about Hailuo 2.3 |
| `shotpilot-app/kb/02_Model_Wan_22_Image.md` | Added legacy note |
| `shotpilot-app/kb/02_Model_Minimax_Hailuo_02.md` | Added Hailuo 2.3 note |

## New Guides Needed

1. **Minimax Hailuo 2.3** — Full guide for the 2.3/2.3-Fast family
2. **Kling O3 Image** — Dedicated guide (or expand Kling 3.0 ecosystem coverage)
3. **Kling O3 Edit** — If editing workflows warrant standalone documentation
