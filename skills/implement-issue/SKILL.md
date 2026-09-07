---
name: implement-issue
description: Execute an issue's implementation contract from `implementation/plan.md` or a legacy `implementation/agreement.md`, make the repo changes, run the listed verification steps, and always perform one additional QA reviewer-agent pass before final sign-off. Use when the user asks to implement an issue, execute an implementation folder, or carry out work defined in an implementation plan after the consult workflow, including all configured rebuttal rounds, has produced an `I-ready` issue. Expect issue state to be `I-ready` and advance it to `C-ready` when implementation is complete and ready for checking.
---

# Implement Issue

Run this workflow directly through the LLM. This skill is for execution, not for debate.

## Codebase Grounding

Before invoking any base-skill behavior, read the configured grounding from `issues/config.yaml`. Use `grounding.index` as the first lookup surface when present, then read the relevant index section, configured docs, and directly linked live codebase files relevant to the current issue. Do not perform broad scans of the codebase.

Before asserting a codebase contract, open the live surface that carries the asserted contract in the current pass. A `grounding.index` row is a pointer to grounding, not grounding by itself.

Use live code as behavior and contract truth; use the configured grounding docs as vocabulary and naming truth. When issue language diverges from the configured codebase vocabulary, surface the divergence, resolve it against those configured docs, and record the resolved term inside the issue artifacts under `## Doc/Code Tensions` in the same pass the divergence is discovered. When configured docs and live code disagree, record the tension either way.

Treat `## Grounding Anchors` and `## Doc/Code Tensions` as the durable issue-artifact capture surfaces for grounding.

This methodology is derived from the published `grill-with-docs` pattern at <https://www.aihero.dev/grill-with-docs> and <https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md>. Only the docs-first grounding, terminology challenge, fuzzy-language sharpening, concrete-scenario verification, live-surface verification, and inline durable-capture concepts apply. The source's forced user-interview behavior - its user-question API names, its sequential single-question pattern, its per-question gating, and its design-tree walking - is explicitly excluded.

## Per-Skill Anchor Map

This skill does not carry hardcoded document paths. When configured grounding is active, use `grounding.index` as the lookup map and `grounding.docs` as vocabulary entry points. Apply the configured entry points and the directly linked codebase surfaces relevant to the current issue; when `grounding: none` is configured, skip this section and follow the base workflow.

## Activation And Fallback

If `issues/config.yaml` is absent at the active checkout root, halt with this sentence: `Issue lifecycle is not initialized: run init-issues first to create issues/config.yaml, issues/.scripts/, and issues/worktrees/.`

Before invoking the codebase-grounding methodology, read `issues/config.yaml` from the active checkout root through `issues/.scripts/lifecycle.ts` / `parseIssuesConfig`. When an issue worktree is active, read that worktree's config; resolve and write issue lifecycle phase only against the control-root (primary checkout) `state.yaml`. The worktree's `state.yaml` is an inert snapshot — never gate phase on it. When `grounding: none` is configured, follow the base skill behavior and emit no grounding-specific footer or anchor capture for that turn.

When configured grounding is active, use `grounding.index` as the first lookup surface when present, then read the configured `grounding.docs` entries and any configured or directly linked live codebase surfaces relevant to the current issue. A present-but-malformed grounding config is a hard setup error from the lifecycle parser, not a silent fallback. Emit the `Grounding:` footer line as an honest list of every file actually consulted that turn, formatted as `Grounding: <path> (read), <path> (confirmed), <path> (diverged)`. When configured grounding is active but no files were consulted that turn, the line reads `Grounding: none`.

Use `(read)` when the file was consulted, `(confirmed)` when a cited contract was checked against that live surface and matched, and `(diverged)` when that check found a mismatch. For `(confirmed)` and `(diverged)`, cite the smallest stable locator that actually carries the asserted contract: prefer a symbol or leaf heading; use a line span only when no stable named surface exists. For partial index reads, use `(read, partial: <omitted span and reason>)`. Record per-contract confirmation or divergence details in `## Doc/Code Tensions`; the footer is the trail, not the full analysis.

Grounding reports codebase surfaces actually consulted: configured `index`/`docs` entry points, plus configured or followed live code/markdown surfaces. Issue work product under `issues/open/`, issue seeds, and phase artifacts remain artifact context, not grounding surfaces; durable lifecycle root artifacts listed in `grounding.surfaces` may appear.

When a pass relies on or edits an indexed file, spot-check that file's `grounding.index` row against live reality in the current pass. Record index drift in `## Doc/Code Tensions`.

Before emitting a footer from a configured index, classify index coverage as `complete`, `partial: <omitted area and reason>`, or `not consulted`; line counts may be used as a diagnostic only and never as the status.


## Anchor Capture Format

Implementation work this skill performs must read and honor the plan's `## Grounding Anchors` before any edit. Before editing a target surface named by a grounding anchor, re-confirm its cited anchor against live code in the current pass; record divergence in `## Doc/Code Tensions` before the edit lands. When this issue adds a new file covered by configured `grounding.indexed_scopes`, add a row to `grounding.index` in the same edit pass. When this issue renames or removes such a file, update or remove the corresponding row in the same edit pass. Implementation is incomplete until the row update is in.

When `grounding: none` is configured the variant defers to base `implement-issue` and does not perform the anchor-honoring or reference-index row-update behaviors.

## Canonical Input

Prefer:

- `implementation/plan.md`

Legacy fallback:

- `implementation/agreement.md`

If the user points at the issue root, resolve it to `implementation/`.

## Issue Root State

Resolve the current lifecycle phase from the control-root (primary checkout) `state.yaml` through `issues/.scripts/lifecycle.ts`; the root prefix is the legacy mirror and shape cue, not the authoritative state value, and a worktree's `state.yaml` copy is an inert snapshot, never the authority. When implementation completes, call the `transition` verb in `issues/.scripts/lifecycle.ts` to advance `state.yaml` or the series master to `C-ready` and checkpoint the completed work; do not rename the visible issue root. At the start of every invocation, before any phase-gated branch or transition, derive the phase from a read executed in the current invocation that bypasses read-file caching and replay — the canonical lifecycle phase command `bun issues/.scripts/lifecycle.ts phase issue <slug>` (or `phase series <series> <leaf>` for a series leaf), or, only where that command is unavailable, a freshly executed shell read of the absolute control-root (primary checkout) `state.yaml` path (`cat` on POSIX, `Get-Content` in PowerShell) — and treat any phase value arriving via the read-file tool, injected/turn-start context, a compaction summary, prior-turn memory, a worktree `state.yaml` snapshot, or an 'unchanged/wasted since your last read' result as untrusted until it is re-derived from that read; the working-tree control-root file is canonical, so a committed-snapshot read (`git show HEAD:`) does not satisfy this requirement; the gate follows that freshly read control-root value.

The normal implementation state is `I-ready`.

The fidelity audit gates consult passes that are actively evaluating `I-synth -> I-ready`. `implement-issue` does not retroactively re-gate an issue that is already in `I-ready`; when the latest audit is missing, stale, or `drift`, append one short fidelity-gap entry to the active implementation plan's `## Addendum Log`, report the gap, and route any repair follow-up through `consult-issue`, but do not block execution solely to backfill legacy entry evidence.

- If the issue is still `I-draft`, stop and finish the implementation consultant passes plus their rebuttal addendums first.
- If the issue is still `I-synth`, stop and finish implementation synthesis first.
- If the issue is still `P-...`, stop and finish the consult flow first unless the issue was clearly mislabeled.
- Keep blocked reasons inside the active `plan.md`; do not add a blocked prefix.

After confirming the authoritative phase is `I-ready`, create or confirm the managed worktree with `bun issues/.scripts/create-worktree.ts <worktree-name>` from the active checkout root. For a standalone issue, `<worktree-name>` is the issue slug; for a series leaf, it is the series leaf key. If the script reports a path or branch mismatch, stop with that context.

- Do implementation edits against the active issue worktree.
- Treat the main checkout as the canonical control point for the issue folder.
- Do not try to reconcile speculative parallel work from other worktrees.

## Start Gate

1. Require an explicit issue root, implementation folder, or implementation plan path.
2. Resolve the canonical implementation plan:
   - prefer `plan.md`
   - fallback to `agreement.md`
3. Read the implementation plan first.
4. Read the non-synthesizing peer's latest `## Fidelity Audit` in its implementation slot file when it exists. Append one short fidelity-gap entry to the active implementation plan's `## Addendum Log` for any missing, stale, or `drift` result, report the gap, and do not use the peer's implementation position as audit evidence.
5. Read every `### Review - <slot>` subsection of the active `## Review Addendum` when it exists — all slots' reviews, never only the latest or the one that triggered this pass. Treat open checklist items and sub-checklists from every slot's review as mandatory repair inputs for the current implementation pass. Also collect the quality-audit evidence from every review subsection and the active `### Quality Self-Check`: high- and medium-severity `AQ-` items are standing-promoted mandatory repair inputs — fix each one or record a one-line justification in the review-addendum update when a fix would conflict with the plan contract; low-severity items stay advisory and may be left as recorded.
6. Read the latest relevant entries in `## Addendum Log` before planning edits or execution. Treat recent addendums as amendments to the implementation contract unless the plan explicitly supersedes them.
7. If the plan is too vague to execute safely, stop and tell the user the issue needs another `consult-issue` implementation consult pass first, which may mean a rebuttal refresh or another synthesis pass depending on what is stale.

## Execution Contract

Treat the implementation plan as the source of truth for:

- target files and surfaces
- execution order
- constraints
- complexity posture
- regression checklist
- done means

Then read the live repo surfaces that the plan references before editing.

## Execution Workflow

1. Read the implementation plan and extract:
   - deliverables
   - target files
   - constraints
   - regression checks
2. Check whether the active `## Review Addendum` or the latest addendum entries change priorities, scope, verification, or repair instructions, and carry those changes into the execution checklist.
3. Inspect the live repo surfaces the work will touch, including host-codebase naming conventions, existing abstraction types, and established patterns for where documents, scripts, and code are placed.
4. Before editing, decide whether the requested behavior should extend, replace, or remove existing logic. Prefer integrating with existing seams over adding parallel paths.
5. Implement the issue end to end.
6. Run relevant verification from the plan and from the repo context.
7. Perform one explicit self-check against the plan:
   - what was implemented
   - what was intentionally unchanged
   - what still looks risky
   - quality self-check per `## Quality Self-Check`
8. Spawn one additional QA reviewer agent before final sign-off.
9. If QA finds issues:
   - fix them when safe
   - rerun affected verification
   - report any unresolved items explicitly
10. Finalize the implementation worktree before the lifecycle transition:
   - run `bun issues/.scripts/auto-commit-if-dirty.ts <worktree-name> --message "feat(<slug>): finalize changes"` from the control root
   - report the command's committed file count and any skipped issue-folder paths
   - if the command exits non-zero, surface its output and do not advance lifecycle state
11. When implementation plus QA is complete, the finalize command has exited successfully, and the issue is ready for independent review, advance the issue from `I-ready` to `C-ready` with one `transition` command:
   - standalone issue: `bun issues/.scripts/lifecycle.ts transition issue <slug> C-ready --message <commit-message>`
   - series leaf: `bun issues/.scripts/lifecycle.ts transition series <series> <leaf> C-ready --message <commit-message>`

The spawned QA reviewer owns checklist bookkeeping after verification:

- update completed checklist items in the active `implementation/plan.md`
- check off relevant sub-checklists and regression items only when the work or evidence is actually complete
- update the active `## Review Addendum` checklist and sub-checklists to reflect what was actually fixed and verified
- leave unchecked items untouched if they were not verified
- call out any checklist items that appear ambiguous or stale instead of guessing
- judge duplication and consolidation against the active worktree state, not against imagined changes in other worktrees

## Quality Self-Check

Read `advisory-quality-standards.md` in this skill's folder and apply it before the QA reviewer pass. The repo `skills/` tree is canonical; deployed copies and sidecars must remain byte-identical except for the install-root slot marker.

Inventory every new or modified file and the clone or dependency relationships created directly by the change. Select each file's Tier-2 band before measuring it. Tier 1 is diff-bounded; unchanged pre-existing debt is context unless the implementation worsened it or newly coupled to it. A prose one-liner stating `dimension not applicable to this diff` with its basis is permitted so small changes remain proportional.

Maintain exactly one active prose-only `### Quality Self-Check` block in the issue's `implementation/plan.md` and refresh it in place on later passes. Append one short `## Addendum Log` line per pass rather than duplicating the report.

Record the assessed changed-file inventory and measurement method or command. For each item, use the sidecar's persistent `AQ-` ID and include severity, dimension, affected surface, measured value, threshold, source, and smallest remedy. Record honest exceedances, justified non-applicability, and `not measured` results with the reason and smallest optional analyzer. Never use task-list or checkbox syntax in this block.

A measured exceedance is advisory and must not trigger an automatic fix. Fix it only when the implementation plan already requires the work or the operator explicitly promotes its `AQ-` ID. During implementation, place a promoted item in the main implementation checklist as a normal mandatory plan item and retain the advisory prose as evidence.

## Mandatory QA Reviewer Pass

This step is required every time.

After the main implementation is complete:

1. Spawn one QA reviewer agent.
2. Give it:
   - the implementation plan path
   - the changed file list
   - the main risks from the plan
   - the regression checklist
3. Ask it to check:
   - contract compliance
   - missed files
   - regressions
   - overscoped changes
   - verification gaps
   - unnecessary duplication or newly redundant code that should have been consolidated
   - drift from host-codebase naming conventions, abstraction types, or placement patterns for documents, scripts, and code, unless the implementer surfaced an explicit and defensible reason in the implementation summary or the implementation `plan.md`
   - proportional Quality Self-Check evidence: confirm coverage of the actual changed-file inventory, reproduce every reported threshold exceedance, inspect the basis for every `not measured` or non-applicable result, and sample below-threshold calculations when no command makes them mechanically reproducible; treat missing or unsupported evidence as a workflow-compliance defect while reproduced exceedances remain advisory
4. Ask it to update both the active `## Review Addendum` checklist and the main implementation checklist/subchecklists to match the verified implementation state.
5. Do not finalize until the QA pass returns.

If the environment truly cannot spawn agents, state that clearly and perform a degraded self-QA pass instead, but treat that as second-best.

## Editing Standard

Before editing, scan the host codebase enough to understand its naming conventions, the abstraction types it already uses, and the established patterns for where documents, scripts, and code are placed. Implement using those same conventions, abstraction types, and placement patterns where the host codebase already provides a primitive that fits. Introduce new names, new abstraction types, or new placement locations only when the host codebase does not already provide a primitive that fits, and name the reason in the implementation summary so the QA reviewer pass and `check-issue` can judge it. When the deviation is material to later review, also record one short sentence inside the existing implementation `plan.md`. This rule is independent of any specific stack or framework.

1. Follow the plan's execution order unless live repo evidence shows a safer order.
2. Keep changes scoped to the issue contract.
3. Implement organically: prefer extending or reshaping existing code over bolting on parallel codepaths, duplicate helpers, or shadow abstractions.
4. When new code would make existing code redundant, consolidate or remove the redundant surface in the same issue when that cleanup is safe and clearly implied by the contract.
5. If safe consolidation is desirable but would materially broaden the issue, stop short of speculative refactors and call out the redundancy explicitly.
6. Do not silently broaden the issue.
7. Preserve existing user changes that are unrelated.
8. Prefer the smallest safe implementation that satisfies the plan.
9. In a worktree workflow, treat the checked-out worktree as the source of truth for implementation decisions.

## Verification Standard

Always verify against three things:

1. the implementation plan
2. the changed code or files
3. the explicit regression checklist

Every implementation must include at least one concrete verification path.
Prefer automated regression tests when the surface supports them; otherwise run explicit validation or manual regression steps and report them plainly.

## Output Standard

For every active, materialized, nonterminal issue run after target resolution, fresh-read the authoritative phase and current artifacts, derive exactly one legal successor token, and invoke `bun issues/.scripts/lifecycle.ts status-write issue <slug> <next-step>` for a standalone issue or `bun issues/.scripts/lifecycle.ts status-write series <series> <leaf> <next-step>` for a series leaf against the active checkout. Slug shorthand is permitted only when resolution is unique. When the same run performs a lifecycle transition, invoke `status-write` before `transition` so the checkpoint captures both. The shared lifecycle CLI resolves the control root and is the only run-status write surface; never construct or edit run-status YAML. The four exclusions are `init-issues`, pre-materialization `seed-issue`, unresolved-target errors, and successful terminal merge.

`implement-issue` is a next_step-only writer and acquires no slot identity; it never invokes `status-verdict`.

Your final response should cover:

- what you implemented
- what you verified
- what the QA reviewer found
- any unresolved items

End every terminal-facing response with the `Grounding:` footer line first, then:

`My last operation: <operation label>`

If there is a next issue-phase action for the user, add a separate line immediately below it:

`Next step: <short issue-phase instruction>`

Use labels such as:

- `issue implementation in progress`
- `issue implementation with QA pass`
- `issue implementation blocked`
- `issue implementation completed with follow-up items`

Keep `My last operation` short and accurate.
Write `Next step` for the user, not for the workflow engine:

- only describe the next step in the current issue phase
- do not add general suggestions or optional ideas
- use one short, plain sentence
- prefer direct wording such as `Next step: Run check-issue in the peer slot to review the completed implementation.`
- if there is no next issue-phase action for the user, say `Next step: None.`
