# Phase 10: Implementation Roadmap

**Date:** 2026-02-08
**Scope:** Remaining work items, timeline options, risks, success metrics

---

## 1. Remaining Work Items

### CRITICAL (Blocking — Must Do Before Launch)

| # | Item | Effort | Dependencies |
|---|---|---|---|
| 1 | Fix pack path references in kbLoader.js | 10 min | None |
| 2 | Fix pack path references in qualityCheck.js | 5 min | None |
| 3 | Verify app still starts and serves correctly | 5 min | Items 1-2 |

### HIGH (Recommended Before Launch)

| # | Item | Effort | Dependencies |
|---|---|---|---|
| 4 | Create condensed 03_Pack_Spatial_Composition.md | 25 min | None |
| 5 | Add spatial_composition to kbLoader.js PACK_FILES | 5 min | Item 4 |
| 6 | Add spatial_composition to qualityCheck.js loading | 5 min | Item 4 |

### LOW (Deferred — Post-Launch)

| # | Item | Effort | Dependencies |
|---|---|---|---|
| 7 | Add cache TTL to kbLoader.js | 15 min | None |
| 8 | Consolidate aspect ratio specs into Translation Matrix | 20 min | None |
| 9 | Add "Last Updated" dates to all model files | 10 min | None |
| 10 | Remove redundant Cinematic Realism full pack | 5 min | None |

---

## 2. Timeline Options

### Option A: Essential Fix + Launch (30 minutes)

**Scope:** Fix pack paths only. Skip Spatial Composition Pack.

| Step | Task | Time |
|---|---|---|
| 1 | Update kbLoader.js PACK_FILES to use condensed 03_* files | 10 min |
| 2 | Update qualityCheck.js to use condensed 03_* files | 5 min |
| 3 | Verify server starts, test quality check flow | 10 min |
| 4 | Commit + push | 5 min |

**Result:**
- All TIER 1 & 2 KB optimizations take effect immediately
- 11 optimized KB files active
- No spatial composition coverage
- Ready for Phase 3 (app development) or launch testing

**Risk:** LOW — minimal code changes, high confidence

### Option B: Full Optimization + Launch (1 hour)

**Scope:** Fix pack paths + create Spatial Composition Pack + integrate.

| Step | Task | Time |
|---|---|---|
| 1 | Update kbLoader.js PACK_FILES to use condensed 03_* files | 10 min |
| 2 | Update qualityCheck.js to use condensed 03_* files | 5 min |
| 3 | Create condensed 03_Pack_Spatial_Composition.md | 25 min |
| 4 | Add spatial pack to kbLoader.js and qualityCheck.js | 10 min |
| 5 | Verify server starts, test quality check flow | 5 min |
| 6 | Commit + push | 5 min |

**Result:**
- All TIER 1 & 2 KB optimizations take effect
- 12 optimized KB files active (including spatial composition)
- Complete KB coverage for AI filmmaking
- Ready for Phase 3 or launch testing

**Risk:** LOW — well-defined source material exists, straightforward condensation

### Option C: Full Optimization + All Deferred Items (2 hours)

**Scope:** Everything from Option B + all deferred LOW items.

| Step | Task | Time |
|---|---|---|
| 1-6 | Same as Option B | 60 min |
| 7 | Add cache TTL to kbLoader.js | 15 min |
| 8 | Consolidate aspect ratios into Translation Matrix | 20 min |
| 9 | Add "Last Updated" dates to model files | 10 min |
| 10 | Remove redundant Cinematic Realism full pack | 5 min |
| 11 | Final verification + commit + push | 10 min |

**Result:**
- Fully optimized, clean repository
- All audit findings addressed
- Maximum polish
- Ready for Phase 3 or launch testing

**Risk:** LOW-MEDIUM — aspect ratio consolidation requires careful cross-referencing

---

## 3. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Pack path change breaks loading | LOW | HIGH | readKBFile() already handles missing files gracefully; verify after change |
| Spatial Pack content quality | LOW | MEDIUM | Source material is well-written; condensation is straightforward |
| Token budget exceeded | VERY LOW | LOW | Adding 1,040 tokens to 17K = 18K, still <2% of 1M limit |
| Condensed packs missing critical content | LOW | MEDIUM | Condensed files were derived from full packs; verified during TIER 1-2 work |
| Server won't start after changes | VERY LOW | HIGH | Changes are to data files and 2 service files; graceful fallbacks exist |

---

## 4. Success Metrics

### KB Quality Metrics

| Metric | Before Audit | After Audit | Target |
|---|---|---|---|
| Average readability score | 7.8/10 | 9.0/10 | >= 8.5/10 |
| Files with stale model references | 2 | 0 | 0 |
| Content conflicts across files | 3 | 0 | 0 |
| Deprecated parameters | 6 | 0 | 0 |
| Pack path correctness | 0/3 correct | 3/3 correct | 3/3 |
| Knowledge gaps (major) | 1 (spatial) | 0 | 0 |

### Operational Metrics

| Metric | Value |
|---|---|
| Total condensed KB tokens | ~18,074 |
| Gemini context utilization | 1.8% |
| Cost per shot workflow | ~$0.025 |
| Files actively loaded by code | 11 → 12 |
| Pack content matched to code | 0/3 → 3/3 (or 4/4 with spatial) |

---

## 5. Recommendation

**Option B (Full Optimization + Launch) — 1 hour**

Rationale:
- The pack path fix is CRITICAL and takes only 15 minutes
- The Spatial Composition Pack fills the single remaining knowledge gap
- Source material already exists and is well-written
- Total effort is modest (1 hour) for complete KB coverage
- Option A leaves a known gap; Option C adds polish with diminishing returns
- After Option B, the KB is fully optimized and the project can move to Phase 3 (app development) or launch testing with confidence

---

## 6. Post-Audit Next Steps (After KB Optimization)

Once KB optimization is complete, the project moves to:

1. **Phase 3: Application Development** — remaining UI/UX features, API integration testing, deployment prep
2. **Launch Testing** — end-to-end quality check flow, prompt generation verification, multi-model testing
3. **User Acceptance** — test with real shot planning workflows

These are outside the scope of the KB audit but represent the natural next phase.
