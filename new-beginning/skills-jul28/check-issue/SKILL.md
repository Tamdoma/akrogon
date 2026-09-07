---
name: check-issue
description: Review a completed or in-progress issue implementation against `implementation/plan.md` or a legacy `implementation/agreement.md`, compare the actual repo changes to the contract, and report severity-ordered findings, regressions, omissions, overreach, and verification gaps. Use when the user asks to check, review, verify, audit, or sign off an implemented issue. Expect issue state to enter review as `C-ready` or `C-fix`, advance to `C-fix` if fixes are needed, and report merge readiness; when both slot verdicts are merge-ready the lifecycle CLI auto-advances the state file to `D-merge`, and the actual merge stays with the manually run `merge-issue`.
---

# Check Issue

Run this workflow directly through the LLM. This skill is for contract review, not execution.

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

Contract review by this skill flags each of the following as a severity-ordered finding and routes the issue back to `C-fix` until repaired:

- Missing or stale `## Grounding Anchors` in `planning/plan.md` or `implementation/plan.md`.
- Missing or stale `## Doc/Code Tensions` when the implementation surface diverges from a doc the plan cited.
- Vocabulary drift in implementation output, consultant files, or merge audit text (use of off-vocabulary terms in place of the canonical vocabulary from configured grounding docs).
- Missing or stale rows in `grounding.index` for indexed files added, renamed, or removed by the implementation.
- Ungrounded codebase-contract assertions in consultant files or plans.

When `grounding: none` is configured the variant defers to base `check-issue` and does not produce these findings.

## Canonical Input

Prefer:

- `implementation/plan.md`

Legacy fallback:

- `implementation/agreement.md`

If the user points at the issue root, resolve it to `implementation/`.

## Slot Identity

Resolve the active review slot before reading or writing a reviewer-owned subsection. An explicit `slot a` or `slot b` in the invocation wins; otherwise read exactly one valid `a` or `b` line from `<install-root>/slot-default`. Missing or malformed identity is a hard error. Never infer a slot from runtime, model, role, reviewer-subsection occupancy, or `pair.yaml`, and never fall back to the peer slot. If `pair.yaml` is present beside the authoritative `state.yaml`, validate the resolved slot against its top-level provenance record and hard-fail on a `runtime` or `role` contradiction; a model-only mismatch is not a contradiction (one session legitimately spans models via safeguard or capacity fallback or an operator switch) — record the session-verified current model in your review metadata as usual. Slot A owns `### Review - A`; slot B owns `### Review - B`.

## Merge Release Authorization

When a recorded merge-readiness verdict completes both slots as merge-ready, the shared lifecycle CLI advances the issue to `D-merge` itself as part of that `status-verdict` write — a state-file change only, with no worktree finalize, no commit, and no operator approval. Treat that automated advance as authorized; report it and stop.

The canonical merge-release authorization is `Authorize reviewed issue release into the merge workflow.` It applies only when the automated dual-verdict advance has not fired — forcing `D-merge` without both slot verdicts recorded as merge-ready. An operator invocation authorizes that forced `D-merge` evaluation only when its entire approval text matches that sentence exactly; reject every near miss, paraphrase, or addition. Every operator-authorized `D-merge` clause below refers to this one canonical authorization.

## Issue Root State

Resolve the current lifecycle phase from the control-root (primary checkout) `state.yaml` through `issues/.scripts/lifecycle.ts`; the root prefix is the legacy mirror and shape cue, not the authoritative state value, and a worktree's `state.yaml` copy is an inert snapshot, never the authority. Every non-terminal review repair transition calls the `transition` verb in `issues/.scripts/lifecycle.ts` to update lifecycle state and checkpoint the review result; do not rename the visible issue root. At the start of every invocation, before any phase-gated branch or transition, derive the phase from a read executed in the current invocation that bypasses read-file caching and replay — the canonical lifecycle phase command `bun issues/.scripts/lifecycle.ts phase issue <slug>` (or `phase series <series> <leaf>` for a series leaf), or, only where that command is unavailable, a freshly executed shell read of the absolute control-root (primary checkout) `state.yaml` path (`cat` on POSIX, `Get-Content` in PowerShell) — and treat any phase value arriving via the read-file tool, injected/turn-start context, a compaction summary, prior-turn memory, a worktree `state.yaml` snapshot, or an 'unchanged/wasted since your last read' result as untrusted until it is re-derived from that read; the working-tree control-root file is canonical, so a committed-snapshot read (`git show HEAD:`) does not satisfy this requirement; the gate follows that freshly read control-root value.

The normal review states are `C-ready` and `C-fix`.

- If the issue is still `I-draft`, `I-synth`, or `I-ready`, stop and finish implementation work first.
- If review finds real work to fix, advance the issue state to `C-fix` with the `transition` verb and keep the issue in the checking phase.
- If a re-check verifies the required fixes, advance the issue state from `C-fix` to `C-ready` with the `transition` verb and keep the merge approval separate.
- If review is clean enough for merge, record the merge-ready verdict through `status-verdict`. While the peer verdict is unrecorded or not merge-ready, the issue stays in `C-ready` or `C-fix`. When the `status-verdict` output shows both slots merge-ready, the CLI has already advanced the state to `D-merge` and set `merge.execute`; never call the `transition` verb for that advance yourself — report it and stop.
- Force `C-ready` or `C-fix` to `D-merge` without both slot verdicts merge-ready only on a separate operator invocation carrying the canonical authorization from `## Merge Release Authorization`. That approval authorizes making reviewed worktree deliverables durable by running `bun issues/.scripts/auto-commit-if-dirty.ts <worktree-name> --message "feat(<slug>): finalize changes"` and, if that command exits successfully, the lifecycle-state advance to `D-merge` plus any checkpointing required by that state write; it never authorizes running `merge-issue`, merging branches, rebasing, pushing, cleanup commits, worktree or branch deletion, broadcast handoff, or any other merge workflow step. Surface the finalize command report verbatim, including skipped issue-folder paths. If the finalize command exits non-zero, surface its output and do not advance to `D-merge`. After the state reaches `D-merge`, stop and tell the operator to run `merge-issue` manually.
- Keep blocked reasons inside the active `plan.md`; do not add a blocked prefix.

Treat the main checkout as the canonical control point for issue-folder naming. If issue-folder state has drifted between the main checkout and the active worktree copy, reconcile that drift before applying the next review-state rename.

Before any review-state rename, inspect the main checkout, the active worktree filesystem, and the active worktree git index for the same slug under multiple prefixes.

- Treat staged intermediate renames as active workflow state.
- The terminal `C-ready -> D-merge` or `C-fix -> D-merge` advance is normally the CLI's automated dual-verdict advance inside `status-verdict`; it changes the state file only and leaves the worktree untouched for `merge-issue`'s dirty-worktree auto-commit. For an operator-forced advance without dual merge-ready verdicts only, require the canonical authorization from `## Merge Release Authorization`, then run `bun issues/.scripts/auto-commit-if-dirty.ts <worktree-name> --message "feat(<slug>): finalize changes"`, surface its report verbatim, move the lifecycle state to `D-merge` only when it exits successfully, and stop; keep all `C-ready -> C-fix` and other intermediate review state as active workflow state.
- If the same slug exists under multiple prefixes anywhere in that combined state, stop and reconcile to one canonical root before applying `C-ready -> C-fix` or any `C-ready/C-fix -> D-merge` advance.
- After the rename, verify that exactly one prefixed root remains for that slug in the main checkout and in the active worktree.
- For live rename state, trust the filesystem plus `git ls-files --stage -- issues`. Do not treat `git status --short` add/delete output against `HEAD` as proof that duplicate live issue roots still exist once the filesystem and staged index agree on one canonical root.
- In the active worktree, use the `transition` verb for non-terminal review-state transitions. If legacy prefix drift already exists, reconcile it before any further review-state transition.

## Active Worktree Rule

When an active issue worktree exists, treat that worktree as the default location for all check-issue references, implementation-surface inspection, and content edits. Resolving lifecycle phase stays on the control-root (primary checkout) `state.yaml` per `## Issue Root State`; this rule governs which checkout the review reads and writes, not where phase is gated.

- Before identifying the implementation surface, resolve the active worktree root (for example with `git worktree list`) and inspect the diff, changed files, and target surfaces there. A clean diff in the primary checkout while control-root bookkeeping says the work is done means inspect the worktree, not that the implementation is missing.
- Interpret user-provided issue paths, phase paths, file references, and relative paths as pointing to the active worktree copy unless the user explicitly says `main`, `primary checkout`, or gives an absolute path outside the worktree.
- Before reading an implementation surface (code, diffs, changed files, verification targets), resolve the active worktree root and translate matching references to that worktree.
- Write `## Review Addendum` and `## Addendum Log` updates to the implementation `plan.md` in the control root (primary checkout), the same document the synthesis and execution passes maintain; the worktree's issue-folder copy is an inert snapshot and never the review-artifact home.
- Both slots may review the same check cycle concurrently. Edit only your own `### Review - <slot>` subsection and append only your own `## Addendum Log` lines; re-read the file immediately before writing so a peer section written mid-pass is preserved, and never rewrite or reorder the peer's subsection.
- Do not read the implementation surface from the primary `main` checkout while an active issue worktree exists, and do not write review results into the worktree's issue-folder snapshot.
- Before writing a review artifact, verify the resolved absolute output path is under the control root's issues tree; if it resolves under the worktree's issue-folder copy, stop and switch to the control-root path.

## Start Gate

1. Require an explicit issue root, implementation folder, implementation plan path, or clear reference to the already-implemented work.
2. Resolve the canonical implementation plan:
   - prefer `plan.md`
   - fallback to `agreement.md`
3. Read the plan first.
4. Check whether entry to `I-ready` was backed by the non-synthesizing peer's latest `## Fidelity Audit` verdict of `faithful` for the current `planning/plan.md` and `implementation/plan.md` revisions. When an issue is already in `C-ready` or `C-fix` without that evidence, append one short fidelity-gap entry to the active implementation plan's `## Addendum Log` and record the gap in the review output and review addendum instead of treating it as a required-fix bounce. Read only the audit record for this check, not the peer's implementation position as audit evidence.
5. Identify the actual implementation surface:
   - diff if available
   - changed files if supplied
   - otherwise inspect the files the plan says should have changed

## Review Contract

Check the implementation against:

- the implementation plan
- the regression checklist
- the repo's actual changed state

Prioritize:

- missed contract items
- regressions
- overscoped work
- unnecessary net complexity growth
- weak or missing verification
- behavior mismatches
- drift from the host codebase's existing naming conventions, existing abstraction types, and established placement patterns for documents, scripts, and code, when the implementer did not surface a defensible reason for introducing new ones, judged with the same severity discipline already used for regressions and net complexity growth

## Review Standard

1. Lead with findings first, severity-ordered.
2. Tie each finding to:
   - a file or surface
   - the relevant plan requirement
   - the smallest safe fix

   Treat the host codebase's existing naming conventions, abstraction types, and placement patterns as relevant requirements when implicit. Treat a deviation reason as weak, and therefore a finding under the same severity discipline used for regressions and net complexity growth, when it identifies neither a specific existing primitive considered and the reason it does not fit, nor the relevant pattern space scanned and the reason it is empty for the artifact type.

3. Call out missing tests or missing verification explicitly.
4. If there are no findings, say so clearly and mention residual risk or testing gaps.
5. Keep summaries short after the findings.
6. Reflect the review result in the issue root state:
   - compose the target phase over the reviewer subsections that are present on disk: any present subsection with an open required-fix item targets `C-fix`; merge-ready requires every present subsection to be clean, so one present-and-clean reviewer subsection is enough to be merge-ready
   - if the current phase is `C-ready` and the composed target is `C-fix`, write `C-ready -> C-fix` through one `transition` command
   - if the current phase is `C-fix` and the composed target is `C-ready`, write `C-fix -> C-ready` through one `transition` command
   - if the composed target equals the current phase, hold without calling the transition command; same-phase outcomes such as `C-fix -> C-fix` are no-write holds because lifecycle transitions reject self-loops
   - when the composed result is merge-ready and the current phase is already `C-ready`, record the merge-ready verdict through `status-verdict` without calling the transition command; if its output still shows the peer verdict unrecorded or not merge-ready, record `merge-ready, awaiting peer verdict` and hold
   - when the `status-verdict` output shows both slots merge-ready, the CLI has already advanced the state to `D-merge` (state-file change only); record `merge-ready, advanced to D-merge`, never call the transition verb for it, and stop
   - a review run never advances to `D-merge` through the transition verb; forcing `C-ready -> D-merge` or `C-fix -> D-merge` without dual merge-ready verdicts requires a separate operator invocation carrying the canonical authorization from `## Merge Release Authorization`, then runs `bun issues/.scripts/auto-commit-if-dirty.ts <worktree-name> --message "feat(<slug>): finalize changes"`, surfaces its report verbatim, moves lifecycle state to `D-merge` only if the command exits successfully, and stops
7. Persist the review result in the control-root (primary checkout) `plan.md` before finishing:
   - maintain exactly one active `## Review Addendum` container in the implementation `plan.md`; inside it create or refresh only your own `### Review - A` or `### Review - B` subsection and never edit the peer slot's subsection
   - treat the container as the repair source of truth: every unchecked required-fix item across all present reviewer subsections is mandatory until verified-and-checked; no clean peer subsection and no write order retires another subsection's open item
   - the implementer/QA repair pass may check a verified fix item inside a reviewer subsection without altering that subsection's verdict prose, metadata, or the peer subsection
   - record the checking slot and addendum author explicitly as `A` or `B`
   - record the checker LLM/model with the most specific label you can verify from the current session; do not guess or invent a model name
   - use sub-checklists when a finding needs multiple concrete fix or verification steps
   - when a re-check finds something still wrong, uncheck the relevant item or sub-item instead of creating a competing checklist
   - append a short dated note under `## Addendum Log` for each review cycle that includes the same reviewer identity so history is preserved
   - immediately before writing your own subsection or the phase, re-read the live `plan.md` and the control-root `state.yaml`; if a peer wrote since you started, reconcile against the current content by recomputing composition over the now-present subsections instead of overwriting; reconcile the within-subsection two-writer case, owner-reviewer content versus implementer/QA verified-checkbox flips, at field and checkbox granularity so neither write reverts the other; this fresh-read-before-write rule lands in lockstep with `stale-state-read`
   - do not leave the repair instruction only in the terminal response

## Advisory Quality Pass

Read `advisory-quality-standards.md` in this skill's folder and apply it after the blocking review. The repo `skills/` tree is canonical; deployed copies and sidecars must remain byte-identical except for the install-root slot marker.

Run the pass in this order:

1. Decide blocking findings under the unchanged `## Review Contract`.
2. Inventory and measure the diff-bounded quality surface against the sidecar, selecting each Tier-2 band before measuring.
3. Persist advisory results under `#### Advisory (non-blocking)` inside the current reviewer's owned subsection.
4. Compose lifecycle state from required items in `#### Fix Checklist` exactly as `## Review Standard` defines; advisory prose has no effect on composition.

Start the advisory block with this exact sentence: `These items have no bearing on merge readiness unless the operator explicitly promotes a named item.` Follow it with severity-ordered prose bullets carrying the sidecar's `AQ-` IDs and evidence fields.

```markdown
#### Advisory (non-blocking)

These items have no bearing on merge readiness unless the operator explicitly promotes a named item.

- AQ-COMPLEXITY-01 — medium — Complexity — `parseInput` measured 12 versus the advisory threshold of 10 (McCabe/NIST); extract the validation branch.
```

When no threshold is exceeded, state that in prose and retain required `not measured`, non-applicable, and no-timing-budget disclosures. Never use task-list or checkbox syntax in advisory output. Append only a one-line `## Addendum Log` summary with reviewer identity, advisory item count, and measurement gaps; do not copy the advisory prose into the log.

On explicit operator instruction naming an `AQ-` ID during review, copy that item into the same reviewer's `#### Fix Checklist` as a normal unchecked required item, record its advisory provenance, and leave the advisory bullet in place as evidence.

## Review Addendum Format

Use this active structure in `implementation/plan.md`. Maintain exactly one `## Review Addendum` container; inside it, each reviewer owns one subsection and creates or refreshes only its own subsection. A review pass never edits the peer's subsection. The container is the implementer's repair source of truth: every unchecked required-fix item across all present reviewer subsections is a mandatory repair input until it is verified-and-checked. The implementer/QA repair pass may check a verified fix item inside a reviewer subsection without altering that subsection's verdict prose, metadata, or the peer subsection.

```markdown
## Review Addendum

### Review - A

- Last review date: YYYY-MM-DD
- Checked by slot: A
- Checker LLM: [verified model/session label]
- Addendum authored by: A
- Issue state: C-ready | C-fix | D-merge
- Merge readiness: merge-ready, awaiting peer verdict | merge-ready, advanced to D-merge | not yet merge-ready
- Summary: [1-2 lines]

#### Fix Checklist
- [ ] Finding or required fix
  - [ ] Sub-step or verification

#### Advisory (non-blocking)

These items have no bearing on merge readiness unless the operator explicitly promotes a named item.

- AQ-COMPLEXITY-01 — medium — Complexity — `parseInput` measured 12 versus the advisory threshold of 10 (McCabe/NIST); extract the validation branch.

### Review - B

- Last review date: YYYY-MM-DD
- Checked by slot: B
- Checker LLM: [verified model/session label]
- Addendum authored by: B
- Issue state: C-ready | C-fix | D-merge
- Merge readiness: merge-ready, awaiting peer verdict | merge-ready, advanced to D-merge | not yet merge-ready
- Summary: [1-2 lines]

#### Fix Checklist
- [ ] Finding or required fix
  - [ ] Sub-step or verification

#### Advisory (non-blocking)

These items have no bearing on merge readiness unless the operator explicitly promotes a named item.

- AQ-COMPLEXITY-01 — medium — Complexity — `parseInput` measured 12 versus the advisory threshold of 10 (McCabe/NIST); extract the validation branch.
```

Use the same reviewer identity fields in each `## Addendum Log` entry so later readers can see which agent and which LLM performed every check. The active `## Review Addendum` container is the implementer's checklist source of truth. `## Addendum Log` is the history trail.

## What To Inspect

Inspect whatever is necessary to judge compliance:

- implementation plan
- changed files
- relevant tests or validation output
- target surfaces named in the plan

Do not re-implement the issue.

## Output Standard

For every active, materialized, nonterminal issue run after target resolution, fresh-read the authoritative phase and current artifacts, derive exactly one legal successor token, and invoke `bun issues/.scripts/lifecycle.ts status-write issue <slug> <next-step>` for a standalone issue or `bun issues/.scripts/lifecycle.ts status-write series <series> <leaf> <next-step>` for a series leaf against the active checkout. Slug shorthand is permitted only when resolution is unique. When the same run performs a lifecycle transition, invoke `status-write` before `transition` so the checkpoint captures both. The shared lifecycle CLI resolves the control root and is the only run-status write surface; never construct or edit run-status YAML. The four exclusions are `init-issues`, pre-materialization `seed-issue`, unresolved-target errors, and successful terminal merge.

When the same run also records a merge-readiness verdict, invoke `status-write` before `status-verdict`. When recording a merge-readiness verdict, invoke the target-qualified `status-verdict issue <slug> ...` or `status-verdict series <series> <leaf> ...` form for the active review slot; the shared CLI preserves the peer verdict.

Default output shape:

- findings
- open questions or assumptions
- brief contract-coverage summary

When advisory items exist, include an easy-to-scan response-body table above the `Grounding:` footer block with columns `AQ- ID`, `Severity`, `Dimension`, `Measured vs threshold`, and `Smallest remedy`. When no advisory items exist, omit the table and state in prose that the advisory pass found no items.

Also include:

- the issue state change you applied
- whether the main checkout and worktree issue-folder names were kept in sync
- the `plan.md` path you updated to persist the review result

End every terminal-facing response with the `Grounding:` footer line first, then:

`My last operation: <operation label>`

If there is a next issue-phase action for the user, add a separate line immediately below it:

`Next step: <short issue-phase instruction>`

Use labels such as:

- `issue contract review`
- `issue contract review with findings`
- `issue contract review clean`
- `issue contract review blocked`

Keep `My last operation` short and accurate.
Write `Next step` for the user, not for the workflow engine:

- only describe the next step in the current issue phase
- do not add general suggestions or optional ideas
- as the single exception, when your verdict is merge-ready, the peer verdict is still outstanding, and open advisory items exist, use `Next step: Approve D-merge to finish the issue, or rerun implement-issue first to fix the advisory quality items.`; do not name individual `AQ-` IDs there, and do not apply this exception to blocked verdicts
- use one short, plain sentence
- after the automated dual-verdict advance or an operator-forced `D-merge` approval, prefer direct wording such as `Next step: Run merge-issue in the active slot manually to merge the approved issue.`
- if there is no next issue-phase action for the user, say `Next step: None.`
