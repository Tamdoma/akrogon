# Review A: run-count-rule

Base: 5499e3dab209ccc6fae14c8f4568e62e5c4c15c2. Reviewed head: 29f01f38bc0c7ad023844029dfd409705bb67acd. Diff: four commits, seven files, prose only.

## Evidence

- `git status --porcelain` empty; head is 4 commits ahead of base; `git --no-pager diff --name-only` lists exactly the seven files in the brief's What — `src/`, `tests/` unchanged; `issues/` does not exist in the worktree. Criterion 7 observed directly.
- The four `grants[]` paragraphs (plan-issue:35, implement-issue:54, check-issue:35, merge-issue:33) extracted by awk and read: identical added sentences differing only in seat name and artifact name (`plan.md`, `implementation/report.md`, `review-<slot>.md`, `review-B.md`). All criterion-1 elements present: `akrogon run-check` coverage, paid-or-live-stage counting, outcome-independent unit, `"known-good" never narrows a bound`, before/after count-line fields (grant entry it draws on, bound, count so far, unit; outcome, IDs, sessions, cost when known), earlier-artifacts read before first launch, unknown-never-a-number. Criterion-2 elements present: warn-in-artifact-and-visible-reply-and-continue for paid repeat-count bounds; live-change repeat bounds and the six stop-type clauses keep the operator-blocker stop; "the stop wins when both apply"; unknown prior use warns for repeat counts and stops when it blocks establishing a stop-type bound.
- `## check.review` carries the audit paragraph before the section's Finish/`recorded` pair: no covered launches, missing live proof is a Fix for check.repair, warned overrun informational with proof standing, unwarned/count-mismatch/unexplained-paid is a Fix naming `check-<name>-*.log` and `issues/timings.jsonl`, stop-bound blocks recorded under `Operator actions`. Criterion 3 observed.
- implement-issue:58 delegation paragraph ends with the worker-paid-count clause. Criterion 4 observed.
- `## Take` grant paragraph (chart-issues:65) carries all of: unit + plain-words consumer wording, nested unit as own bound, `stop_line` never restates a repeat count, renewal "N more after <date or commit>" + draws-on, door probe counts, door never warns and runs + every paid proof call waits for approval. `shapes.md` `bounds`/`stop_line` placeholders show the same (bounds placeholder includes the "every invocation that reaches a paid session, whatever its outcome" example; stop_line placeholder says "never a repeat count"). Criterion 5 observed.
- standing-design.md line 15 covering-grant clause extended: warned call past a repeat-count bound is covered, call outside the grant still stops. Criterion 6 observed.
- Report check: every proof command in `implementation/report.md` matches `plan.md` verbatim; cited `check-*` receipts exist and show exit 0 on head 29f01f38; `akrogon verify` receipt green on 29f01f38 (no rerun — no code change since and no specific concern). No `Test-Change:` trailers needed: no changed file matches the `src/test-files.ts` rule (`test`, `tests`, `*.test.*` patterns; SKILL.md/md files don't match).
- Docs: `docs/` grep for grant-bound/`stop_line` restatements returns only unrelated `akrogon timing` bounds (files.md:86) and autopilot CHART.md prose — no restatement of this rule exists, so no doc is made stale. No AREA.md in the diff.
- Brief-vs-design conflicts: none found; plan's D8 note about the dropped plan-named-seat exception matches the adopted final-shape pick (B F3/C S2).

## Findings

No Fixes. No Nits carried.

## Verdict

ready
