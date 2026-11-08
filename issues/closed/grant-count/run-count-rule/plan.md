# Plan: run-count-rule

Prose-only leaf. Seven files, one rule family. Line references are `AKROGON_BASE` 5499e3da, verified against this worktree on 2026-11-04. `src/readiness.ts` `grantSchema` (lines 37-47) stays unchanged: bounds and `stop_line` remain free text, so only written rules change.

## Decisions

- D1: All four lifecycle skills carry one identical rule paragraph in place of the current `grants[]` reuse sentence, identical except for the seat's own name and artifact (`plan.md` in plan-issue, `implementation/report.md` in implement-issue, `review-<slot>.md` in check-issue, `review-B.md` in merge-issue). The trailing fixture sentences in check-issue and merge-issue stay untouched. Literal text in Interfaces I1.
- D2: `skills/check-issue/SKILL.md` `## check.review` gains one audit paragraph, appended at the end of the section before `## check.repair`. Literal text I2.
- D3: `skills/implement-issue/SKILL.md` `## implement` delegation paragraph (the one beginning "A run without delegation") gains one trailing clause on worker paid commands. Literal text I3.
- D4: `skills/chart-issues/SKILL.md` `## Take`, the grant paragraph beginning "Each leaf's `grants` records one scoped grant", gains three sentences after its closing "needs new approval." Literal text I4.
- D5: `skills/chart-issues/assets/shapes.md` `readiness.yaml` placeholder lines `bounds:` and `stop_line:` are replaced by the unit-stating forms. Literal text I5.
- D6: `skills/chart-issues/assets/standing-design.md` line 15's recorded-output clause is extended so a warned call past a repeat-count bound counts as covered and a call outside the grant still stops. Literal text I6.
- D7: No `src/`, `tests/` or `issues/` changes and no new tests. Standing design for this leaf: no test pins prose; review reads it against the done-criteria. The configured `checks` suite (`akrogon verify`) is the regression check; the leaf adds no `merge_checks` requirement.
- D8 (design-internal note): grant-count answer 3 once read "unless `plan.md` names the seat that runs that live proof"; the adopted final-shape pick (B F3, C S2) removed that exception — `check.review` launches no covered operation, period, and a missing needed live proof is a Fix for `check.repair`. The plan follows the adopted pick; no brief/design conflict.

## Read-first

- `issues/open/grant-count/run-count-rule/brief.md`, `design.md` (authoritative, read fresh)
- `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` — the `grants[]` reuse sentences
- `skills/chart-issues/SKILL.md` `## Take` (line ~65) and the `## Take` waits paragraph (line ~139)
- `skills/chart-issues/assets/shapes.md` lines 303-327 (`grants` shape)
- `skills/chart-issues/assets/standing-design.md` line 15 (recorded-output rule)
- `src/readiness.ts` lines 37-47 (`grantSchema` — unchanged reference)
- `learnings/LESSONS.md` — 2026-09-11 stale-rule-in-docs (docs sweep) and 2026-09-27 stale-door-checkout (compare against `origin/main`, done: branch is at `AKROGON_BASE`'s descendant, clean)
- `docs/reference-index.md`, `skills/AREA.md` — grounding, already read; docs grep for bound/`stop_line` restatements returned nothing (design carried this check; confirmed this session)

## Interfaces

Literal edit texts, applied verbatim.

- I1 — shared rule paragraph replacing each `grants[]` reuse sentence (seat/artifact tokens per file):
  > <Seat> reuses `grants[]` for the operations they cover, within their bounds; before each covered operation, paid model launches included, it compares operation, target, identity and bounds with the grant, records the grant reference, results and created IDs in its pass artifact, never widens it, and treats anything outside it as an operator blocker under the stop rule. Every covered launch runs through `akrogon run-check` and one that reaches its paid or live stage counts against its bound's unit, whatever its outcome and whatever the bound's wording; "known-good" never narrows a bound. A seat writes one count line per launch in <artifact> before the launch — the grant entry it draws on, the bound, the count so far and the unit — and completes it after the launch with the outcome, IDs, sessions and cost when known; before its first launch it reads the count lines in the leaf's earlier artifacts, and prior use that cannot be established is written as unknown, never as a number. Before a launch past a repeat-count bound of a paid operation a seat writes a warning in <artifact> and its visible reply and continues; live-change repeat bounds, spend caps, operation, target, identity, effects, expiry and `stop_line` clauses keep their operator-blocker stop, and the stop wins when both apply; unknown prior use warns for a repeat count, and when it prevents establishing compliance with a stop-type bound the seat takes the operator-blocker stop.

  Seat/artifact substitutions: plan-issue `A seat`/`plan.md`; implement-issue `A`/`implementation/report.md`; check-issue `Each review seat`/`review-<slot>.md`; merge-issue `The merge seat`/`review-B.md`.

- I2 — check.review audit paragraph (new paragraph, end of `## check.review`):
  > `check.review` launches no covered operation: live proofs run in implement and `check.repair` as today, and a needed live proof missing from the plan is a Fix for `check.repair`. The review audits the leaf's count: a warned overrun is information and the proof stands, while an unwarned overrun, a count that does not match the leaf's `check-<name>-*.log` files and `issues/timings.jsonl`, or paid activity the artifacts do not explain is a Fix, and a stop-type bound or `stop_line` clause that blocked the next launch is recorded under `Operator actions`.

- I3 — implement worker clause, appended at the end of the delegation paragraph ending "...each in its own worktree, using the worker protocol.":
  > A worker command that can reach a paid session counts against the grant bound by its unit, and A writes its count line in `implementation/report.md`.

- I4 — chart-issues `## Take` grant paragraph, appended after "needs new approval.":
  > Each repeat bound names its unit and what consumes one in plain words (for example, "at most 2 recorder invocations, counting every invocation that reaches a paid session, whatever its outcome"), and a nested unit, such as sessions per invocation, is its own bound; `stop_line` never restates a repeat count. A renewal entry states its new total or "N more after <date or commit>", and the next count line names the entry it draws on. The door's charting probe counts against the leaf grant it runs under, and the door itself never warns and runs: every paid proof call still waits for operator approval.

- I5 — shapes.md placeholder lines:
  > `bounds: <limits on use; each repeat bound names its unit and what consumes one in plain words, e.g. "at most 2 recorder invocations, counting every invocation that reaches a paid session, whatever its outcome"; a nested unit is its own bound>`
  > `stop_line: <never-cross condition; never a repeat count>`

- I6 — standing-design.md line 15 ending clause, replacing "A fresh call runs only under a covering grant, never as a silent fallback, and otherwise the seat takes the operator-blocker stop.":
  > A fresh call runs only under a covering grant, never as a silent fallback, and otherwise the seat takes the operator-blocker stop; a call past a repeat-count bound warned under the seat rule is covered, while a call outside the grant still stops.

## Checklist

One wave, three units. No unit depends on another's landing; owned paths are disjoint; no shared test resource. Agent docs affected: the seven files in What. No human doc is affected: a `docs/` grep for grant bound and `stop_line` restatements found none, and `docs/reference/limits.md` and `docs/use/autopilot.md` stay true.

### Wave 1

- U1 — lifecycle skills grant rule. Owns `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`. Serializes inside the unit because the four paragraphs must carry identical text (drift risk if split). Applies I1 ×4, I2, I3. Criteria 1, 2, 3, 4, 7.
- U2 — chart-issues Take grant paragraph. Owns `skills/chart-issues/SKILL.md`. Applies I4. Criteria 5, 7.
- U3 — chart assets. Owns `skills/chart-issues/assets/shapes.md` and `skills/chart-issues/assets/standing-design.md`. Applies I5, I6. Criteria 5, 6, 7.

No prerequisite landings; all three land in the same commit or separate commits, worker's choice of order within the unit.

## Verification

Every proof command exists at `AKROGON_BASE` (`awk`/`grep`/`git`/`comm`); each exercises the edited files it reads — the real boundary is the prose a seat or reviewer reads, and the product failure each catches is that specific clause absent or misplaced. All proofs are seconds; rerun trigger for each is any change since its last green run to the files it reads (the leaf's own rerun rule). No model or outside stages; no recordings; no restart boundaries (not a slow-run leaf).

- Criterion 1 (shared rule content, criteria 1 and 2 combined since I1 carries both). Command:
  `akrogon run-check --name crit12-shared-rule -- sh -c 'missing=0; for f in skills/plan-issue/SKILL.md skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md; do p=$(awk "BEGIN{RS=\"\"} /grants\\[\\]/{print; exit}" "$f"); for s in "akrogon run-check" "paid or live stage" "whatever its outcome" "known-good" "count line" "count so far" "cost when known" "earlier artifacts" "never as a number" "visible reply" "the stop wins" "stop-type bound" "draws on"; do echo "$p" | grep -qF "$s" || { echo "MISSING $f: $s"; missing=1; }; done; done; exit $missing'`
  Red at planning (all 13 substrings absent in all four paragraphs): `check crit12-shared-rule: 1 .../check-crit12-shared-rule-1793795484423-3486542.log`.
  Identical-wording element is observed by `git diff` showing the same added sentences in all four files with only seat/artifact tokens differing; the review seats confirm sameness by reading.
  Condition check for criterion 1/2 elements a decision can break: a warning written only into the artifact and not the visible reply (violates "visible reply") — caught by the `visible reply` substring check on the diff; a count line that reads the bound's wording as narrowing ("known-good" runs not counting) — caught by `whatever its outcome` plus `"known-good"` presence; unknown prior use recorded as a guessed number — caught by `never as a number` plus `stop-type bound` for the stop case. All are presence checks over the one paragraph that states the rule, the same place the seat reads it; no state flows past the prose, so no runtime case exists — the violation is the text itself failing to say it.
- Criterion 3 (check.review audit). Command:
  `akrogon run-check --name crit3-review-audit -- sh -c 'awk "BEGIN{RS=\"\"} /check\\.review/{print}" skills/check-issue/SKILL.md | grep -qE "no covered operation" && awk "BEGIN{RS=\"\"} /check\\.review/{print}" skills/check-issue/SKILL.md | grep -qE "warned overrun" && awk "BEGIN{RS=\"\"} /check\\.review/{print}" skills/check-issue/SKILL.md | grep -qE "timings.jsonl" && awk "BEGIN{RS=\"\"} /check\\.review/{print}" skills/check-issue/SKILL.md | grep -qE "Operator actions"'`
  Red at planning: `check crit3-review-audit: 1 .../check-crit3-review-audit-1793795488486-3486991.log`.
  Condition the decision can break: the audit text landing outside `## check.review` — the awk paragraph extractor matches the paragraph containing `check.review`, so I2's own wording satisfies it wherever it sits; section placement is pinned instead by `git diff` context (the hunk header shows the added paragraph's neighbors before `## check.repair`) and by the review seats' reading. Recorded as the traced limit of the grep for this prose criterion.
- Criterion 4 (worker paid commands counted). Command:
  `akrogon run-check --name crit4-worker-count -- sh -c 'awk "BEGIN{RS=\"\"} /delegat/{print}" skills/implement-issue/SKILL.md | grep -qE "worker command that can reach a paid session"'`
  Red at planning: `check crit4-worker-count: 1 .../check-crit4-worker-count-1793795488486-3486993.log`.
- Criterion 5 (chart-issues Take + shapes). Command:
  `akrogon run-check --name crit5-chart-grants -- sh -c 'missing=0; p=$(awk "BEGIN{RS=\"\"} /Each leaf.s .grants. records one scoped grant/{print; exit}" skills/chart-issues/SKILL.md); for s in "unit" "consumes one" "own bound" "never restates" "after <date or commit>" "draws on" "never warns and runs"; do echo "$p" | grep -qF "$s" || { echo "MISSING take-grant: $s"; missing=1; }; done; grep -q "every invocation that reaches a paid session, whatever its outcome" skills/chart-issues/assets/shapes.md || { echo "MISSING shapes bounds example"; missing=1; }; grep -qE "stop_line: <never-cross condition; never a repeat count>" skills/chart-issues/assets/shapes.md || { echo "MISSING shapes stop_line"; missing=1; }; exit $missing'`
  Red at planning (all 9 MISSING): `check crit5-chart-grants: 1 .../check-crit5-chart-grants-1793795494631-3487385.log`.
- Criterion 6 (standing-design covering-grant clause). Command:
  `akrogon run-check --name crit6-standing-design -- sh -c 'grep -oE "A fresh call runs only under a covering grant[^.]*" skills/chart-issues/assets/standing-design.md | grep -qE "repeat"'`
  Red at planning: `check crit6-standing-design: 1 .../check-crit6-standing-design-1793795494625-3487387.log`.
- Criterion 7 (diff scope). Command:
  `akrogon run-check --name crit7-diff-scope -- sh -c 'git --no-pager diff --name-only "$AKROGON_BASE"...HEAD | sort > /tmp/actual-files.txt && printf "%s\n" skills/chart-issues/SKILL.md skills/chart-issues/assets/shapes.md skills/chart-issues/assets/standing-design.md skills/check-issue/SKILL.md skills/implement-issue/SKILL.md skills/merge-issue/SKILL.md skills/plan-issue/SKILL.md | sort > /tmp/expected-files.txt && comm -3 /tmp/actual-files.txt /tmp/expected-files.txt | tee /tmp/diff-mismatch.txt && test ! -s /tmp/diff-mismatch.txt'`
  Red at planning (all seven files absent from the diff): `check crit7-diff-scope: 1 .../check-crit7-diff-scope-1793795497651-3487719.log`. At implement end this is an equality proof: it fails on an extra file and on a missing one, and `src/`, `tests/`, `issues/` are necessarily absent from the committed diff since `issues/` does not exist in the worktree.

Regression: `akrogon verify` (configured `checks`: format, test, typecheck) on the committed head — required by implement-issue's own implement-end rule, not an added criterion.

## Open limitation

The rule is written prose a seat must follow (signpost 1c): a seat can still miscount, and overspend past a bound is allowed-with-warning by operator choice 2b. The only reconciliation is the check.review audit against `check-<name>-*.log` and `issues/timings.jsonl`, which a seat's own sloppy bookkeeping can defeat silently — this residual risk was accepted by the operator when choosing written rules over command enforcement.

## Notes for review

- D8 records the final-shape supersession of the check.review plan-named-seat exception; the paragraph was dropped between grant-count answer 3 and the adopted picks.
- Leaf proof-coverage/coverage-audit edits other paragraphs of `skills/chart-issues/SKILL.md` `## Take` and `shapes.md` "Preflight and validation" (per its design and this leaf's design overlap note). Different paragraphs; a rebase conflict is resolved by keeping both.
- Brief and design agree on all seven criteria; every cited line was verified against the live worktree.
