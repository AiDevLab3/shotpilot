# Decisions Log

**Version:** 1.0  
**Date:** February 2, 2026  
**Purpose:** Track key architectural and design decisions for the Cine-AI Shotboard application

---

## Overview

This log documents important decisions made during the development of the Cine-AI Shotboard application, including the rationale, alternatives considered, and outcomes.

---

## Decision Template

```markdown
### [YYYY-MM-DD] Decision Title

**Status:** Proposed | Accepted | Rejected | Superseded  
**Deciders:** [Names/Roles]  
**Date:** YYYY-MM-DD

**Context:**
Brief description of the problem or situation requiring a decision.

**Decision:**
What was decided.

**Rationale:**
Why this decision was made.

**Alternatives Considered:**
- Alternative 1: Description and why it wasn't chosen
- Alternative 2: Description and why it wasn't chosen

**Consequences:**
- Positive consequences
- Negative consequences
- Trade-offs

**Related Decisions:**
Links to related decisions in this log.
```

---

## Decisions

### [2026-02-02] Knowledge Base Reorganization

**Status:** Accepted  
**Deciders:** Cine-AI Team  
**Date:** February 2, 2026

**Context:**
The knowledge base had grown organically with duplicate content across multiple folders (guides/, prompting_guides/). This created confusion about canonical sources and made app ingestion difficult.

**Decision:**
Reorganize into a clean kb/ structure with:
- kb/packs/ for universal constraints
- kb/models/ for model-specific guides
- kb/index/ for navigation
- kb/examples/ for templates
- app_spec/ for application implementation

**Rationale:**
- Single source of truth for each topic
- Clear separation between universal principles (packs) and model-specific syntax (models)
- Scalable structure for future app ingestion
- Eliminates redundancy and conflicting information

**Alternatives Considered:**
- Keep existing structure: Rejected due to redundancy and confusion
- Flat structure: Rejected due to lack of scalability
- Database-first approach: Rejected as premature; file-based KB is more flexible during development

**Consequences:**
- Positive: Clear structure, easier maintenance, app-ready
- Negative: One-time migration effort, potential broken links
- Trade-offs: Some historical context lost in consolidation

**Related Decisions:**
- Schema design (SHOTBOARD_SCHEMA_v1.md)

---

## Future Decisions

Document future decisions here as they are made during development.

---

**Status:** Active  
**Last Updated:** February 2, 2026  
**Maintained by:** Cine-AI Development Team
