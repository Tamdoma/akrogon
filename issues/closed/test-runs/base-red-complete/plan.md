# Plan: base-red-complete

Rewrite the base-run paragraphs in `skills/implement-issue/SKILL.md` (line 38) and `skills/check-issue/SKILL.md` (line 59) so a "red on base" stop requires completed, comparable runs; an incomplete base run gets its own stop and never a rerun or a base-defect claim. Prose-only leaf, `debate: no`, no positions or rebuttals exist.

## Decisions

- D1. "Red on base" requires both runs completed. Completed means the checked command's own exit status and terminal result, kept before any reporting pipeline (`echo`, `grep`, `head`). Both runs use the same command, args, scope, dependency install and material conditions; the seat records why the base failure explains the leaf failure. Failing test names need not match. Only then does `failed --reason "<command> red on base <sha>"` apply. (Fork base-red-rule Q1 1a, brief What bullet 1.)
- D2. A completed base run that does not establish that comparison sends the leaf failure to the existing repair path. (Q1 1a.)
- D3. A run killed, interrupted or crashed before its terminal result is incomplete: keep its logs and termination cause, stop with `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>" --slot <slot>`, no automatic rerun, no base-defect claim. (Q2 2a.) Slot token: `A` in implement-issue, `<A|B>` in check-issue, matching each paragraph's existing stop.
- D4. One line: the base run uses the active harness's longest run mode; a run still killed before its terminal result is incomplete under D3. Mitigation, not a guarantee. (Q3 3a.)
- D5. Everything else in both paragraphs is preserved verbatim in effect: trigger and judgment gate, single base run, `mktemp -d` + `git worktree add --detach`, dependency install, log redirection, `git worktree remove --force` before either outcome, report/review artifact fields, "a stop, never a handoff", and check-issue's "specific concern rerun case" clause.
- D6. One copy of each rule per paragraph, in the paragraph's existing style, no new heading, no new state, slot, phase or retry. The `failed` command is existing; only the free-text reason is new.
- D7. The `implementation/report.md` walk-through (criterion 3) cites the two #53 passages and maps them onto the new rules: the 25-minute-killed base run (`report.md` base-run table, no final counts) reaches the D3 stop; the completed whole-file pair (leaf fixture 07, base fixture 13, both `238 pass / 1 fail`, same `setViewportSize` tail at `unchanged-output.ts:527`) reaches the D1 stop, including that names differ.

## Read-first

- `skills/implement-issue/SKILL.md` (base-run paragraph, line 38)
- `skills/check-issue/SKILL.md` (base-run paragraph, line 59)
- `issues/chart/test-runs/forks/base-red-rule.md` (taken answers)
- `/home/ivan/Work/infra/tamdoma/framework/issues/open/emdash-cms/emdash-operations/emdash-fleet-backup/implementation/report.md` lines 175-215 (#53 evidence for the criterion-3 walk-through)
- `learnings/history/2026-09-11-stale-rule-in-docs.md` (grep docs for the changed rule; done: no `docs/` hit)

## Interfaces

- Existing, kept: `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>`
- Existing command, new free-text reason: `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>" --slot <slot>` (D3 slot token per file). No new phase, state field or command surface.

## Checklist

Wave 1 (disjoint paths, no shared resource, no interdependency):

- U1 `skills/implement-issue/SKILL.md`: rewrite the line-38 paragraph per D1-D6, `--slot A`, artifact `implementation/report.md`.
- U2 `skills/check-issue/SKILL.md`: rewrite the line-59 paragraph per D1-D6, `--slot <A|B>` for the reviewing slot, artifact `review-<slot>.md`, keep the "existing specific concern rerun case" clause.

Wave 2:

- U3 `<leaf>/implementation/report.md` (artifact under the leaf folder, not the worktree diff): record the prose changes and the criterion-3 walk-through per D7. Depends on U1+U2 landing so the walk-through describes the final wording.

Docs: checklist names every affected agent and human doc — the two SKILL.md files above; no other doc is affected. `docs/` has no base-run rule copy (grep clean). `skills/AREA.md:25` summarises the mechanism ("one base run", "stops") without asserting the conditions this leaf adds and stays accurate; no edit allowed anyway under criterion 4. Chart/test-runs files describe this change already.

## Criterion proofs

| # | Criterion | Proof | Failure caught | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 | implement-issue paragraph states each rule once, `--slot A` | Read the diff hunk for `skills/implement-issue/SKILL.md` (`git diff "$AKROGON_BASE"...HEAD -- skills/implement-issue/SKILL.md`) against the D1-D6 list and the brief's What bullets | A missing, duplicated or contradicted rule; wrong slot token | seconds | Any edit to the paragraph |
| 2 | check-issue paragraph states the same rules, `--slot <A|B>`, `review-<slot>.md` | Same command scoped to `skills/check-issue/SKILL.md` | Same as 1 | seconds | Any edit to the paragraph |
| 3 | report.md walks both paragraphs through the #53 evidence | Re-read framework `implementation/report.md:175-215` and check the report maps killed-at-25-min to D3 and the completed whole-file pair (07 vs 13, 238/1 both, same capture tail) to D1 | A walk-through that reaches the wrong rule or cites wrong evidence | seconds | Any edit to report.md or the paragraphs |
| 4 | diff lists only the two SKILL.md files | `git diff "$AKROGON_BASE"...HEAD --stat` | Out-of-scope file change | seconds | Any commit on the branch |

No leaf tests: prose-only leaf and the design's standing rule forbids text-grep tests ("no vanity tests"). No `checks` runs are required by the brief beyond criterion 4's diff stat; `bun run format` may be run to confirm markdown formatting stays clean. No slow runs; no restart boundaries apply. `merge_checks` is empty and unused.

## Notes and limitations

- Brief/design conflict check: none; the design resolves every What bullet into D1-D6.
- `skills/AREA.md:25` keeps its generic one-line mechanism summary; if review reads it as needing the new conditions, that is out of this leaf's locked file list and must go to a follow-up leaf, not this diff.
- No credentials are named by the design; `akrogon status` shows no `Missing:` lines. No grants, produces or live calls.
- AKROGON_BASE at plan time: `4b74a0870fa3243f6b79e658204ff0f7ff3b4716`.
