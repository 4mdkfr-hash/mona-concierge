# Skill Contract

This repository uses one contract across all 20 skills. The contract keeps each skill specialized while making the full library feel like one operating system.

## Required Top Sections

Every `SKILL.md` should expose these sections near the top:

- `When This Must Trigger`
- `Quick Start`
- `Skill Contract`
- `Instructions`
- `Validation Checkpoints`
- `Reference Materials`
- `Next Best Skill`

## Section Meanings

### When This Must Trigger

This section answers:

- what intent should activate the skill
- when the skill is a strong recommendation
- when it becomes the required first move

Prefer:

- direct user phrasing
- short operational bullets
- high-frequency business scenarios

### Quick Start

This section should get a user moving in under 30 seconds.

Include:

- one shortest valid invocation
- one common scenario
- one short output expectation

### Skill Contract

This section defines operational behavior in four fields:

- **Reads**: user-provided inputs, tool data, and prior project state
- **Writes**: the main user-facing deliverable plus a reusable handoff summary
- **Promotes**: stable facts, blockers, and decisions worth storing for future work
- **Primary next skill**: the most natural follow-up skill in the library

## Handoff Summary Format

Every skill should be able to produce a concise handoff summary using this shape:

```markdown
### Handoff Summary

- **Objective**: what was analyzed, created, or fixed
- **Key Findings / Output**: the highest-signal result
- **Evidence**: URLs, data points, or sections reviewed
- **Open Loops**: blockers, missing inputs, or unresolved risks
- **Recommended Next Skill**: one primary next move
```

## Promotion Rules

Promote only durable information:

- current strategic priorities
- approved decisions
- stable brand/entity facts
- critical blockers
- recurring terminology
- high-signal audit findings

Do not promote:

- transient tool logs
- low-signal observations
- large raw datasets
- speculative claims without evidence

## Category Defaults

### Research

- Reads: topics, competitors, search behavior, user goals
- Writes: opportunity summaries and strategic findings
- Promotes: priorities, terminology, competitor facts, and candidate entity signals

### Build

- Reads: briefs, target keywords, page intent, entity inputs
- Writes: drafts, metadata, markup, optimization outputs
- Promotes: chosen messaging, approved structure, publish blockers

### Optimize

- Reads: existing assets, audits, issues, performance symptoms
- Writes: repair plans and scored findings
- Promotes: blockers, recurring defects, remediation priorities

### Monitor

- Reads: previous baselines, new performance data, thresholds
- Writes: deltas, trend summaries, alerts, reports
- Promotes: major changes, confirmed anomalies, follow-up actions

### Cross-cutting

- Reads: outputs from every other category
- Writes: gates, truth records, and memory structure
- Promotes: the canonical state other skills should trust

## Protocol Layer vs Execution Layer

| Behavior | Execution Layer (16 skills) | Protocol Layer (4 skills) |
|----------|---------------------------|--------------------------|
| Triggering | User invocation or intent match | User + hook auto-trigger + other skill recommendation |
| Output format | Report or asset + handoff summary | Gate verdict (SHIP/FIX/BLOCK or TRUSTED/CAUTIOUS/UNTRUSTED) + handoff summary |
| Write scope | Own category WARM path only | Can write HOT + manage archives + cross-category aggregation |
| Cross-reference | Via Next Best Skill | Mandatory gate check in handoff summaries |

## Gate Verdicts

Protocol-layer skills must produce a clear verdict, not just scores:

- `content-quality-auditor`: **SHIP** (no veto items, scores above threshold) / **FIX** (issues found, none are veto) / **BLOCK** (veto item T04, C01, or R10 failed)
- `domain-authority-auditor`: **TRUSTED** (no veto items, scores above threshold) / **CAUTIOUS** (issues found, none are veto) / **UNTRUSTED** (veto item T03, T05, or T09 failed)

## Save Results Template

Every skill must include this flow at the end of its execution:

After delivering findings to the user, ask:

> "Save these results for future sessions?"

If yes, write a dated summary to the appropriate WARM path using filename `YYYY-MM-DD-<topic>.md` containing:

- One-line verdict or headline finding
- Top 3-5 actionable items
- Open loops or blockers
- Source data references

If any veto-level issue was found (CORE-EEAT T04/C01/R10 or CITE T03/T05/T09), also append a one-liner to `memory/hot-cache.md` without asking.

## Write Paths by Category

| Category | Write Path | Content |
|----------|-----------|---------|
| Research (4 skills) | `memory/research/<skill>/` | keyword opportunities, competitor findings, SERP notes, content gaps |
| Build (4 skills) | `memory/content/` | content briefs, meta tag decisions, schema annotations, publish status |
| Optimize (4 skills) | `memory/audits/<skill>/` | audit summaries, veto items, fix priorities |
| Monitor (4 skills) | `memory/monitoring/` | rank deltas, alert history, backlink changes |
| Cross-cutting (4 skills) | per-role paths | see protocol-layer definitions |
