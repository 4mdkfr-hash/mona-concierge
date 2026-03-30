# Plan C Skill System Design

**Date**: 2026-03-29
**Status**: Approved for implementation
**Author**: Aaron He Zhu + Codex
**Target Version**: 4.2.0

## Goal

Land Plan C without changing any existing skill names, slugs, or directory structure. Upgrade the repository from a well-organized skill library into a unified SEO and GEO operating system with consistent trigger rules, handoff behavior, state outputs, and cross-skill orchestration.

## Why This Change

The current repository already has strong domain coverage, but each `SKILL.md` behaves like a standalone specialist. High-growth marketplace skills win because they behave like a persistent operating layer:

- They define broad trigger conditions
- They leave reusable state behind
- They recommend exactly one next move
- They promote durable facts into shared memory
- They create repeatable user expectations across sessions

Plan C applies those strengths across all 20 skills while preserving the current taxonomy and marketplace identity.

## Non-Goals

- Do not rename any skill
- Do not change any directory name or slug
- Do not remove any of the 20 skills
- Do not add executable code or runtime dependencies
- Do not rewrite the underlying CORE-EEAT or CITE frameworks

## Design Summary

The repository will adopt a single contract used by all 20 skills:

1. Every skill gets a stronger trigger section
2. Every skill gets a compact quick-start section
3. Every skill declares what it reads, writes, and promotes
4. Every skill points to one primary next skill
5. Every skill emits a standardized handoff summary format
6. The four cross-cutting skills become the system protocol layer

## Repository Model

```text
Research   -> discover opportunities and inputs
Build      -> create or transform assets
Optimize   -> diagnose and repair assets
Monitor    -> detect movement and surface change
Cross      -> gate quality, define entity truth, and preserve state
```

The repository becomes a layered system:

- **Execution layer**: Research, Build, Optimize, Monitor
- **Protocol layer**: Cross-cutting

## Unified Contract

Every `SKILL.md` will expose the same high-signal structure near the top:

- `When This Must Trigger`
- `Quick Start`
- `Skill Contract`
- `Instructions`
- `Validation Checkpoints`
- `Reference Materials`
- `Next Best Skill`

### Skill Contract Fields

Each skill contract defines:

- **Reads**: what inputs the skill consumes
- **Writes**: what user-facing deliverable and handoff data it produces
- **Promotes**: what should become durable project state
- **Primary next skill**: the most natural follow-on action

## Shared State Model

Plan C standardizes the state model used across the library:

- `CLAUDE.md`: hot cache for active project strategy, priorities, and constraints
- `memory/decisions.md`: major decisions and chosen directions
- `memory/open-loops.md`: unresolved blockers, risks, and follow-ups
- `memory/entities/*.md`: entity truth records and disambiguation notes
- `memory/audits/**/*.md`: audit summaries
- `memory/research/**/*.md`: keyword, SERP, gap, and competitor summaries
- `memory/monitoring/**/*.md`: rank, alert, backlink, and reporting deltas
- `memory/content/**/*.md`: drafts, refresh plans, meta decisions, and schema notes

Not every run must physically write these files, but every skill must describe its outputs in this shared model so that agents and users know where state belongs.

## Cross-Cutting Protocol Layer

### content-quality-auditor

New system role: **Publish Readiness Gate**

- Determines whether content is ready to ship
- Produces a clear verdict
- Promotes critical veto issues and top improvement items

### domain-authority-auditor

New system role: **Citation Trust Gate**

- Determines whether a domain is strong enough to act as a trusted citation source
- Produces a trust verdict and risk register
- Promotes blocking domain risks and comparative authority context

### entity-optimizer

New system role: **Canonical Entity Profile**

- Acts as the source of truth for entity identity
- Standardizes sameAs, topical associations, disambiguation, and knowledge-base status
- Feeds brand identity into build, optimization, and monitoring work

### memory-management

New system role: **Campaign Memory Loop**

- Defines how project state is created, updated, promoted, and archived
- Receives high-value outputs from all other skills
- Prevents repeated re-explanation across sessions

## Category-Specific Behavior

### Research

Research skills must:

- surface demand, competition, and gap signals
- write concise findings that can influence strategy
- promote durable terms, priorities, and competitor facts

### Build

Build skills must:

- produce assets that are ready for review or implementation
- state assumptions and missing evidence
- hand off directly into quality, schema, or refresh workflows

### Optimize

Optimize skills must:

- identify defects and repair priorities
- write audit-style summaries
- promote unresolved blockers to `open-loops`

### Monitor

Monitor skills must:

- detect changes over time
- record deltas rather than only snapshots
- surface actionable escalation paths

## Marketplace Positioning Changes

The repo keeps its current 20-skill taxonomy, but messaging shifts from “20 tools” to “20 skills on one shared operating model.”

Top-level docs will emphasize:

- consistent triggers
- consistent outputs
- cross-skill handoffs
- shared memory and entity truth
- audit gates before publish and citation claims

## Risks

- Skill files could exceed the preferred 350-line guideline
- Over-standardization could make the library feel repetitive
- Added protocol language could obscure domain-specific value

## Mitigations

- Replace bulky repeated navigation blocks with smaller system-oriented sections
- Keep contract sections compact and standardized
- Push detailed system rules into shared reference docs
- Preserve each skill’s domain-specific middle sections and examples

## Acceptance Criteria

Plan C is complete when:

- all 20 `SKILL.md` files expose the unified contract
- all 20 skills define one primary next skill
- all 20 skills refer to the shared state model consistently
- cross-cutting skills clearly act as the protocol layer
- top-level docs reflect the operating-system positioning
- versions and manifests are synchronized
