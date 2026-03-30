# Plan C Skill System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Land Plan C by introducing a unified contract across all 20 skills without changing names, slugs, or directory layout.

**Architecture:** Add one shared contract spec and state model, establish the four cross-cutting skills as the protocol layer, then propagate the same structure across research, build, optimize, and monitor skills. Finish by syncing documentation and versions.

**Tech Stack:** Markdown content repo, AgentSkills-compatible `SKILL.md`, JSON manifests, shell validation script

---

### Task 1: Add Plan C design artifacts

**Files:**
- Create: `docs/2026-03-29-plan-c-skill-system-design.md`
- Create: `docs/2026-03-29-plan-c-skill-system.md`

**Step 1: Write the design doc**

Capture the system goals, non-goals, contract structure, shared state model, and cross-cutting protocol roles.

**Step 2: Write the implementation plan**

Document the staged rollout and verification expectations for the content rewrite.

**Step 3: Verify docs exist**

Run: `ls docs`
Expected: both new Plan C files are listed in `docs/`

### Task 2: Create shared contract references

**Files:**
- Create: `references/skill-contract.md`
- Create: `references/state-model.md`

**Step 1: Write the contract reference**

Define the standard meanings of `When This Must Trigger`, `Quick Start`, `Skill Contract`, and `Next Best Skill`.

**Step 2: Write the state model reference**

Define the canonical paths and what belongs in each memory artifact.

**Step 3: Verify links render conceptually**

Read both files and confirm they are generic enough to support all 20 skills.

### Task 3: Establish the protocol layer in cross-cutting skills

**Files:**
- Modify: `cross-cutting/content-quality-auditor/SKILL.md`
- Modify: `cross-cutting/domain-authority-auditor/SKILL.md`
- Modify: `cross-cutting/entity-optimizer/SKILL.md`
- Modify: `cross-cutting/memory-management/SKILL.md`

**Step 1: Add unified top sections**

Insert the new trigger, quick start, and skill contract structure into all four files.

**Step 2: Assign protocol roles**

Make each file explicitly describe its operating-system role.

**Step 3: Add state and promotion guidance**

Tie each file to the shared state model and define what information should be promoted.

**Step 4: Verify line count discipline**

Run: `wc -l cross-cutting/*/SKILL.md`
Expected: files remain close to the repository guideline and avoid unnecessary repetition.

### Task 4: Apply the contract to research skills

**Files:**
- Modify: `research/keyword-research/SKILL.md`
- Modify: `research/competitor-analysis/SKILL.md`
- Modify: `research/serp-analysis/SKILL.md`
- Modify: `research/content-gap-analysis/SKILL.md`

**Step 1: Standardize top structure**

Rename and reshape the trigger and quick-start sections.

**Step 2: Add compact contract blocks**

Define shared reads, writes, promotes, and one primary next skill.

**Step 3: Make research outputs state-aware**

Tie findings to `memory/research`, `memory/decisions`, and `memory/entities`.

### Task 5: Apply the contract to build skills

**Files:**
- Modify: `build/seo-content-writer/SKILL.md`
- Modify: `build/geo-content-optimizer/SKILL.md`
- Modify: `build/meta-tags-optimizer/SKILL.md`
- Modify: `build/schema-markup-generator/SKILL.md`

**Step 1: Standardize top structure**

Apply the shared trigger, quick start, contract, and next-skill pattern.

**Step 2: Make outputs explicit**

Describe each deliverable and the state it should write or promote.

**Step 3: Connect build work to protocol gates**

Point build skills into the correct quality, entity, or technical follow-up.

### Task 6: Apply the contract to optimize skills

**Files:**
- Modify: `optimize/on-page-seo-auditor/SKILL.md`
- Modify: `optimize/technical-seo-checker/SKILL.md`
- Modify: `optimize/internal-linking-optimizer/SKILL.md`
- Modify: `optimize/content-refresher/SKILL.md`

**Step 1: Standardize top structure**

Apply the same contract block and next-skill rule.

**Step 2: Normalize audit outputs**

Tie findings to `memory/audits` and `memory/open-loops`.

**Step 3: Clarify repair handoffs**

Ensure each skill recommends the single most natural follow-up.

### Task 7: Apply the contract to monitor skills

**Files:**
- Modify: `monitor/rank-tracker/SKILL.md`
- Modify: `monitor/backlink-analyzer/SKILL.md`
- Modify: `monitor/performance-reporter/SKILL.md`
- Modify: `monitor/alert-manager/SKILL.md`

**Step 1: Standardize top structure**

Add consistent trigger, quick start, contract, and next-skill sections.

**Step 2: Normalize delta handling**

Tie monitoring outputs to `memory/monitoring` and `memory/open-loops`.

**Step 3: Connect monitoring to action**

Ensure changes surface into alerts, investigations, or reports clearly.

### Task 8: Update top-level positioning and version sync

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `VERSIONS.md`
- Modify: `.claude-plugin/plugin.json`
- Modify: `marketplace.json`

**Step 1: Update repository positioning**

Describe the library as a unified operating model across 20 skills.

**Step 2: Sync versions**

Bump skill and manifest versions to `4.2.0`.

**Step 3: Update changelog**

Summarize Plan C as a repo-wide contract and protocol-layer release.

### Task 9: Validate the content system

**Files:**
- Test: all 20 `SKILL.md` files

**Step 1: Run skill validation**

Run:
```bash
for f in research/* build/* optimize/* monitor/* cross-cutting/*; do ./scripts/validate-skill.sh "$f"; done
```

Expected: all skills pass repository validation.

**Step 2: Check version consistency**

Run:
```bash
rg -n '4\\.2\\.0|4\\.1\\.0' README.md CLAUDE.md VERSIONS.md .claude-plugin/plugin.json marketplace.json research build optimize monitor cross-cutting
```

Expected: `4.2.0` is present where intended and stale `4.1.0` values are removed from updated content.

**Step 3: Review git diff**

Run: `git diff --stat`
Expected: design docs, shared references, top-level docs, and all 20 skill files are included.
