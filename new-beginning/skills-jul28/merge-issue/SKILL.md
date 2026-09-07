---
name: merge-issue
description: Finalize a merge-ready issue by merging its completed worktree branch into main, handling dirty-worktree auto-commit, merge detection, issue-folder cleanup, local worktree and branch cleanup, and default broadcast handoff.
input: One unstructured operator argument naming a D-merge issue root, a managed worktree name, or a managed worktree path.
---

# Merge Issue

Run this workflow directly through the LLM. This skill is the final issue-series step after `check-issue` has marked a configured issue merge-ready.

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

When configured grounding is active and `grounding.indexed_scopes` is declared, run the payload reference-index audit helper before merge continuation:

```bash
bun issues/.scripts/audit-reference-index-drift.ts --worktree <slug>
```

A `--worktree <slug>` mode derives `base`, `head`, and the repo from the configured managed branch/worktree resolution. It compares files added, renamed, or removed under `grounding.indexed_scopes` against rows in `grounding.index`. The LLM evaluates only `ambiguous` rows; `inline-repair-eligible` rows are repaired inline, `route-back-required` rows route back to `C-fix`. When `grounding.indexed_scopes` is absent or the helper is unavailable, skip the deterministic gate and perform the index-drift check LLM-natively against `grounding.index`.

After a successful merge, if a documentation-review classifier helper is available, run it. This repo ships one at `.claude/workflow/scripts/classify-merge-for-docs-review.ts`:

```bash
bun .claude/workflow/scripts/classify-merge-for-docs-review.ts <pre-merge-main-ref> HEAD --repo <checkout-root>
```

When it returns `trigger: true`, read the listed reasons and their reference-index rows, then apply the documentation/index rule below. When no such helper is available, decide the documentation/index rule LLM-natively. When `grounding: none` is configured, this skill defers to base `merge-issue` and does not run these helpers.

## Canonical Input

Accept exactly one target:

- a slug-only or marker-only issue root whose `state.yaml` phase is `D-merge`
- an explicit managed worktree name
- an explicit managed worktree path

Prefer the issue root when available. When the issue root is provided, resolve the managed worktree through the configured branch prefix and resolver output. If the issue slug and resolved managed branch/worktree target do not match cleanly, stop and ask for the explicit target.

Resolve the current lifecycle phase from the control-root (primary checkout) `state.yaml` through `issues/.scripts/lifecycle.ts`; issue paths are slug-only or marker-only and do not encode lifecycle phase, and a worktree's `state.yaml` copy is an inert snapshot, never the authority. Managed branch/worktree names come from the module/config instead of hardcoded `worktree-` derivation. At the start of every invocation, before any phase-gated branch or transition, derive the phase from a read executed in the current invocation that bypasses read-file caching and replay — the canonical lifecycle phase command `bun issues/.scripts/lifecycle.ts phase issue <slug>` (or `phase series <series> <leaf>` for a series leaf), or, only where that command is unavailable, a freshly executed shell read of the absolute control-root (primary checkout) `state.yaml` path (`cat` on POSIX, `Get-Content` in PowerShell) — and treat any phase value arriving via the read-file tool, injected/turn-start context, a compaction summary, prior-turn memory, a worktree `state.yaml` snapshot, or an 'unchanged/wasted since your last read' result as untrusted until it is re-derived from that read; the working-tree control-root file is canonical, so a committed-snapshot read (`git show HEAD:`) does not satisfy this requirement; the gate follows that freshly read control-root value.

## Merge Workflow

1. **NORMALIZE.** Run from the primary checkout on `main`, never inside the feature worktree. Resolve the target with `bun issues/.scripts/resolve-worktree.ts <worktree-name>` (JSON `{name,path,branch}`). Read the issue `plan.md`; confirm the authoritative lifecycle phase is `D-merge` and the paired folder exists in both checkouts. Then confirm the reviewed worktree deliverables are already durable by running `bun issues/.scripts/auto-commit-if-dirty.ts <worktree-name> --message "feat(<slug>): finalize changes"` (the standard finalize message); a clean already-committed worktree is the expected report, while a dirty target worktree is committed as finalize input. Rebase a worktree branch behind `main` (stop with the failing files on rebase failure). Record `git rev-parse main` at entry; if `main` changed by merge start, compute `git diff --name-only <recorded-main> <current-main>`, stop only when a changed path overlaps the full run write set (merge writes plus FINALIZE `docs:` / `chore(<slug>): remove merged issue folder` / `SERIES.md` writes plus SWEEP removals), name the offending path, and otherwise re-baseline the worktree branch onto current `main`, re-read `main`, and proceed under a bounded attempt count that stops with a report on non-convergence or rebase conflict. If `main` carries foreign (other-issue) uncommitted or untracked changes attributed by path outside the issue's `issues/open/<slug>/` root and plan-declared deliverables, ignore that path-disjoint foreign work: never stage, stash, commit, or revert it, and proceed. Disjoint dirt is left untouched and proceeded past; disjoint commits are re-baselined onto, with the same overlap stop condition and different proceed action. Stop only when a foreign change overlaps a path in the full run write set; name the offending path and classify the overlap before remedy. A semantic overlap is a NORMALIZE-time `SHARED-LOGIC` collision: use the existing propose-and-hold rule, do not stash, and stop. Only a non-semantic overlap gets the exact manual scoped-stash remedy `git -C <main-checkout> stash push -m "<owning-issue>" -- <paths>`. Every merge-issue git write against the `main` checkout is path-scoped to owned paths plus resolved index surfaces; `git add -A` and `git commit -a` are banned.
2. **AUDIT.** When configured grounding is active, run the `## Anchor Capture Format` pre-merge audit. Repair `inline-repair-eligible` rows inline; route `route-back-required` or unresolved `ambiguous` rows back to `C-fix` before continuing.
3. **MERGE.** Run `bun issues/.scripts/merge-branch.ts <worktree-name>` (JSON `{type,commits}`: `fast-forward`, `merge-commit`, or `conflict`). `merge-branch.ts` reconciles the issue's own `issues/open/<slug>/**` branch delta to the pre-merge control-root version, so the worktree snapshot never wins and FINALIZE still removes the folder, and it hard-stops on any cross-issue `issues/open/<other>/**` delta with the exact paths and a control-root remedy. `git merge -X theirs` is banned — a blanket strategy silently drops the other side of an add/add conflict on a shared registry. Resolve each conflict by file class:
   - **OWNED** (files the issue plan declares as deliverables): take the worktree side, `git checkout --theirs -- <path>`.
   - **SHARED-REGISTRY** (`reference-index.md`, `SERIES.md`, and other row-structured indexes): union by row key; never overwrite the whole file.
   - **SHARED-LOGIC** (both sides changed semantics): propose and hold. Leave the merge in progress without staging, resolving, or committing any semantic hunk. In the active `implementation/plan.md`, write `Status: Blocked`, `Blocked by: SHARED-LOGIC conflict in <paths>`, and `Unblocks when: operator accepts or replaces the proposed resolution`. For every conflicted path and hunk, record the base, ours, and theirs behavior; the recommended semantic result; why that result preserves the approved decisions; and the non-interactive commands that verify it. Keep both the proposal and every semantic hunk uncommitted. Invoke the target-qualified `status-write issue <slug> ...` or `status-write series <series> <leaf> ...` form with `merge.shared-logic-hold`, notify the operator, and stop. The same propose-and-hold rule applies when NORMALIZE finds a semantic collision, and when the plan is missing or empty, both sides' blame points to one commit, a pure delete meets substantive changes, or every resolution risks regression. This rule creates no exception to the path-scoped write rules or the `git add -A` and `git commit -a` bans.
4. **FINALIZE.** On a clean merge, apply `## Automatic Actions` and evaluate the post-merge documentation review (run the documentation-review classifier helper when available, otherwise decide LLM-natively), then commit cleanup in this fixed order, each its own commit: the merge commit, an optional `docs:` commit, then cleanup of the merged standalone issue root and its recorded `seed_path` in both checkouts. For a series leaf, reconcile the merged leaf by row key without reintroducing a `State` column and retain the leaf folder plus `SERIES.md` row; a non-unique match no-ops and reports rather than guessing. When the last series leaf merges, remove the whole series folder, `SERIES.md`, master `state.yaml`, and recorded parent `seed_path` together; never delete a leaf folder while its series row survives. Run `bun issues/.scripts/prune-worktree.ts <worktree-name>` to remove the merged worktree directory, run `git branch -d <branch>` when its tip is reachable from `HEAD`, and handle stale managed cleanup per `## Edge Cases And References`. Removing the whole worktree does not substitute for handling the worktree-copy issue folder explicitly.
5. **SWEEP.** Run the payload merged-root classifier helper at `issues/.scripts/classify-merged-issue-roots.ts` with `bun` to classify leftover slug-only issue roots, root seeds, and series containers under the active issue root, otherwise classify them LLM-natively when the helper is unavailable: **MERGED** for standalone roots only when the configured managed branch is gone or an ancestor of `HEAD`, no live worktree for it is ahead of `main`, and its plan-declared deliverables are present in `HEAD`; branch-gone or ancestor roots without `HEAD`-present declared deliverables remain **PENDING**. Terminal series parent seeds can be **MERGED** only when every leaf is terminal and neither the parent nor any relevant leaf worktree is live; series containers can be **MERGED** only when every leaf is terminal, no leaf worktree is live, and all leaf branches are gone or ancestors of `HEAD`. **PENDING** means a live worktree is ahead, declared deliverables are absent from `HEAD`, a series leaf is non-terminal, or a leaf worktree is still live; **UNKNOWN** means the classifier cannot prove the residue is merged, including a terminal-looking series container with a present leaf branch that is not an ancestor of `HEAD`. Delete only `MERGED` residue (one attributed commit); after the final series leaf merges and the classifier reports the container `merged`, retire `issues/open/<series>/` (`SERIES.md`, all retained leaf folders, and `state.yaml`) in its own `chore(<series>): retire merged series container` commit when FINALIZE has not already removed it from recorded state. Keep and log every `PENDING`/`UNKNOWN` root or container with the reason; stop and report rather than guess.

## Automatic Actions

Do not prompt: invocation pre-authorizes pushing, documentation/index maintenance, broadcasting, evidence-backed conflict continuation, and cleanup.

After a successful merge:

1. Attempt `git push` to the configured remote and report `pushed`, `blocked`, `unavailable`, or `no remote configured`.
2. Evaluate documentation and reference-index maintenance. Commit any docs/index changes separately as `docs: update documentation after merge of <slug>` and attempt a second push for that commit.
3. Send the default broadcast handoff via the resolved broadcast skill (discovered by name match; see `## Edge Cases And References`) unless the current invocation explicitly says `do not broadcast`, `skip broadcast`, `quiet merge`, or equivalent; when no broadcast skill is installed, skip it and report `skipped (no broadcast skill installed)`.

Blocked push, unavailable broadcast delivery, and transient network errors are follow-ups; they do not block local cleanup.

## Output Standard

For every active, materialized, nonterminal issue run after target resolution, fresh-read the authoritative phase and current artifacts, derive exactly one legal successor token, and invoke `bun issues/.scripts/lifecycle.ts status-write issue <slug> <next-step>` for a standalone issue or `bun issues/.scripts/lifecycle.ts status-write series <series> <leaf> <next-step>` for a series leaf against the active checkout. Slug shorthand is permitted only when resolution is unique. When the same run performs a lifecycle transition, invoke `status-write` before `transition` so the checkpoint captures both. The shared lifecycle CLI resolves the control root and is the only run-status write surface; never construct or edit run-status YAML. The four exclusions are `init-issues`, pre-materialization `seed-issue`, unresolved-target errors, and successful terminal merge.

`merge-issue` is a next_step-only writer and acquires no slot identity; it never invokes `status-verdict`.

Happy-path report, max 6 lines:

- `Issue:` target issue and worktree
- `Merge:` fast-forward or merge-commit, with commit count
- `Push/docs:` push result and docs/index result
- `Cleanup:` worktree, branch, stale managed cleanup, and issue-folder result
- `Broadcast:` sent, explicitly skipped, or `skipped (no broadcast skill installed)`
- `Follow-up:` none or exact remaining item

Use the failure-mode report only when something blocks or partially completes: target, sync state, audit result, auto-commit result, merge result, conflicts and resolution, push status, docs/index status, worktree removal, branch deletion, stale cleanup, broadcast status, issue-folder handling, grounding, and follow-up needed.

## Edge Cases And References

### Documentation and Index Maintenance

When configured grounding is active, the pre-merge audit (`## Anchor Capture Format`) is the reference-index drift gate. When `grounding.indexed_scopes` is declared and the deterministic audit helper is available, it assigns each drift row its verdict; otherwise classify rows LLM-natively. Repair `inline-repair-eligible` rows inline and route the rest back to `C-fix`.

After merge and push, use the classifier result with the merged commits, changed files, and issue plan. Skip docs for minor fixes, internal refactors, tests/CI-only changes, and typo edits. Update docs/index when the merge changes agent- or user-facing contracts, conventions, routing, schemas, guides, subroutines, libraries, or indexed files whose linked docs may be stale.

When that rule calls for a documentation or index update, perform it surgically. Make the smallest edit that records the merge's new current truth, and integrate it into the existing relevant passage rather than appending a detached or dated note. In the same edit, delete or rewrite any prose the merge made stale or no longer true, and never leave new content standing next to the old content it contradicts. This governs how the prose update is written; it does not change the row-key union rule for row-structured indexes.

### Stale Managed Cleanup

After target cleanup succeeds, inspect `git worktree list --porcelain` for `prunable` entries. Only managed stale worktrees under `issues/worktrees/` are automatic cleanup candidates. If every prunable entry is managed, run `git worktree prune --verbose`; for each recorded managed stale branch, delete the exact local branch with `git branch -d <branch>` only when its tip is reachable from `HEAD`. If any prunable entry is outside `issues/worktrees/`, stop stale cleanup and report manual review.

### Legacy Cleanup Ban

Legacy `.temp`, `-DONE`, rename-helper, and temp-folder cleanup is forbidden unless the user explicitly points to a separate repo artifact that still requires it.

### Failure Rule

On merge, conflict-resolution, or cleanup failure, keep the issue in `D-merge` lifecycle state, keep the branch unless it is confirmed merged into `HEAD`, preserve any partially handled issue-folder state, and record material blocked details in the active `plan.md`. A SHARED-LOGIC failure uses the exact uncommitted proposal and blocked fields from `## Merge Workflow` and leaves every semantic hunk unstaged. If stale managed cleanup fails after the target merge cleanup succeeded, report stale cleanup as partial without downgrading the completed target merge.

### Support Files

Use project-local support files from the active checkout:

- `issues/.scripts/resolve-worktree.ts <worktree-name>` returns JSON `{name,path,branch}` and requires an explicit argument.
- `issues/.scripts/auto-commit-if-dirty.ts <worktree-name> --message <standard-finalize-message>` commits deliverables and owned issue artifacts or reports clean, while skipping and reporting foreign issue paths; the literal message template is pinned in NORMALIZE.
- `issues/.scripts/merge-branch.ts <worktree-name>` probes ancestry before merge and returns JSON `{type,commits}`.
- `issues/.scripts/prune-worktree.ts <worktree-name>` removes the configured managed worktree, using `--force` only when all dirty paths are inside the owned standalone issue root or owning series container.

When configured grounding is active, the audit/classifier helpers are invoked only by this skill. The reference-index audit and merged-root classifier ship through `issues/.scripts/`; the docs-review classifier remains repo-local under `.claude/workflow/scripts/`. When a codebase does not provide a helper or audit opt-in, the corresponding check runs LLM-natively.

For the broadcast handoff, discover an installed broadcast skill by name match rather than a fixed skill name. A skill qualifies when its directory name contains `broadcast` (case-insensitive), so any of `broadcast-issue`, `cast-broadcast-framework-update`, or similar is picked up. Search these roots in order: `<repo-root>/skills/`, the current deployed `<skills-root>/`, then the remaining deployed roots among `~/.claude/skills/`, `~/.codex/skills/`, and `~/.pi/agent/skills/`, skipping duplicates. Resolve to exactly one skill with this deterministic tie-break: (1) prefer an exact `broadcast-issue` directory if present; (2) otherwise any `*broadcast*` directory; (3) an earlier search root wins (repo-owned before current deployed before other deployed roots); (4) within one root, the lexicographically first matching directory name wins. The first root that yields a match is authoritative; do not look in later roots once one matches. If no `*broadcast*` skill exists in any root, skip the broadcast and report it as `skipped (no broadcast skill installed)`. When one is resolved, invoke it per its own contract, and follow its own input format and bullet/overflow gates.

### Edge Cases

- **D6** (Windows CRLF stderr noise): filter stderr without swallowing the git exit status; in bash, capture the command status from `${PIPESTATUS[0]}` after filtering; do not change `core.safecrlf` or `.gitattributes`.
- **D8** (broadcast-bullet-overflow): follow the resolved broadcast skill's own bullet/overflow gates; when the update exceeds that surface, invoke the broadcast skill twice rather than truncating mid-bullet.
