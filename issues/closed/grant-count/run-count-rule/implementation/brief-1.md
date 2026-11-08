# Sub-brief 1: lifecycle skills grant rule (unit U1)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/run-count-rule-u1 (detached HEAD 5499e3da; all file work happens there, never in the leaf checkout).

## 1. Goal

Prose edits implementing plan decisions D1, D2, D3 for leaf `run-count-rule`: replace the `grants[]` reuse sentence with the count-rule paragraph in four lifecycle skills (identical text, seat/artifact substitutions only), add the `check.review` audit paragraph in check-issue, and add the worker-paid-count clause in implement-issue.

## 2. Numbered acceptance criteria

1. In each of `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, the paragraph containing `grants[]` contains every substring: `akrogon run-check`, `paid or live stage`, `whatever its outcome`, `known-good`, `count line`, `count so far`, `cost when known`, `earlier artifacts`, `never as a number`, `visible reply`, `the stop wins`, `stop-type bound`, `draws on`. The same added sentences appear in all four files differing only in the seat name and artifact name.
2. `skills/check-issue/SKILL.md` `## check.review` ends (before `## check.repair`) with a new paragraph containing `no covered operation`, `warned overrun`, `check-<name>-*.log`, `issues/timings.jsonl`, `Operator actions`.
3. `skills/implement-issue/SKILL.md` `## implement` delegation paragraph (ending "...each in its own worktree, using the worker protocol.") ends with a sentence containing `worker command that can reach a paid session` and `count line`.
4. The four files' pre-existing first sentences of each `grants[]` paragraph and every other line of each file are unchanged.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/plan-issue/SKILL.md` line 35, `skills/implement-issue/SKILL.md` line 54, `skills/check-issue/SKILL.md` line 35, `skills/merge-issue/SKILL.md` line 33 — the four existing `grants[]` paragraphs.
- `skills/check-issue/SKILL.md` `## check.review` section (lines ~37-75) — the insertion point; the last paragraph before `## check.repair` currently begins "Rerun checks only for a code change...".
- `skills/implement-issue/SKILL.md` `## implement` second paragraph (begins "A run without delegation — `inline` config or serial-solo").

## 4. Change list and needed interfaces

Paths this unit owns (touch no others): the four SKILL.md files above. No preceding-worker output; nothing else must land first.

- plan-issue line 35 paragraph becomes (replace the single sentence, keeping the paragraph's position and surrounding blank lines):
  > A seat reuses `grants[]` for the operations they cover, within their bounds; before each covered operation, paid model launches included, it compares operation, target, identity and bounds with the grant, records the grant reference, results and created IDs in its pass artifact, never widens it, and treats anything outside it as an operator blocker under the stop rule. Every covered launch runs through `akrogon run-check` and one that reaches its paid or live stage counts against its bound's unit, whatever its outcome and whatever the bound's wording; "known-good" never narrows a bound. A seat writes one count line per launch in `plan.md` before the launch — the grant entry it draws on, the bound, the count so far and the unit — and completes it after the launch with the outcome, IDs, sessions and cost when known; before its first launch it reads the count lines in the leaf's earlier artifacts, and prior use that cannot be established is written as unknown, never as a number. Before a launch past a repeat-count bound of a paid operation a seat writes a warning in `plan.md` and its visible reply and continues; live-change repeat bounds, spend caps, operation, target, identity, effects, expiry and `stop_line` clauses keep their operator-blocker stop, and the stop wins when both apply; unknown prior use warns for a repeat count, and when it prevents establishing compliance with a stop-type bound the seat takes the operator-blocker stop.

- implement-issue line 54 paragraph: identical text, with `A reuses` for the first `A seat reuses`, and `implementation/report.md` in place of `plan.md` in both the count-line and warning sentences.
- check-issue line 35 paragraph: identical text, first words `Each review seat reuses`, artifact `review-<slot>.md`; the paragraph's existing trailing fixture sentences ("When `akrogon config` prints `setup`... labelled apart from still-to-delete ones.") stay appended unchanged.
- merge-issue line 33 paragraph: identical text, first words `The merge seat reuses`, artifact `review-B.md`; the existing trailing fixture sentences stay appended unchanged.
- check-issue `## check.review`: append this new paragraph after the paragraph beginning "Rerun checks only for a code change" and before `## check.repair`:
  > `check.review` launches no covered operation: live proofs run in implement and `check.repair` as today, and a needed live proof missing from the plan is a Fix for `check.repair`. The review audits the leaf's count: a warned overrun is information and the proof stands, while an unwarned overrun, a count that does not match the leaf's `check-<name>-*.log` files and `issues/timings.jsonl`, or paid activity the artifacts do not explain is a Fix, and a stop-type bound or `stop_line` clause that blocked the next launch is recorded under `Operator actions`.
- implement-issue `## implement`: append to the delegation paragraph (ending "...using the worker protocol.") this sentence:
  > A worker command that can reach a paid session counts against the grant bound by its unit, and A writes its count line in `implementation/report.md`.

## 5. Do-not, reasons and exceptions

- Do not touch any other file or any other line: the leaf's diff scope is exactly seven files and these are four of them (criterion 7); exception: none — a needed change outside the list returns a mismatch.
- Do not paraphrase or shorten the verbatim texts: done-criterion 1 requires the same rule in the same words; exception: only the named seat/artifact substitutions.
- Do not reorder, split or merge paragraphs, and keep single trailing newlines and the files' prose style (long sentences are the house style); exception: none.
- Do not commit anything besides one commit containing only these edits; exception: none.
- A conflict between these instructions and the live file state is a mismatch returned to A, never scope expanded; the exception is a revised brief from A.

Reasons and exceptions restated: stay inside the owned paths and verbatim texts because the diff scope and identical-wording criteria depend on them; report conflicts as mismatch, fixed only by a revised brief from A.

## 6. Ordered steps

1. Read the four files' grant paragraphs and insertion points (criteria 1-4).
2. Apply the four paragraph replacements with the per-file seat/artifact substitutions (criterion 1).
3. Append the I2 paragraph to `## check.review` in check-issue (criterion 2).
4. Append the I3 sentence to the delegation paragraph in implement-issue (criterion 3).
5. Verify: `for f in skills/plan-issue/SKILL.md skills/implement-issue/SKILL.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md; do p=$(awk "BEGIN{RS=\"\"} /grants\\[\\]/{print; exit}" "$f"); for s in "akrogon run-check" "paid or live stage" "whatever its outcome" "known-good" "count line" "count so far" "cost when known" "earlier artifacts" "never as a number" "visible reply" "the stop wins" "stop-type bound" "draws on"; do echo "$p" | grep -qF "$s" || echo "MISSING $f: $s"; done; done` prints nothing.
6. Verify: `grep -c "no covered operation" skills/check-issue/SKILL.md` prints 1; `grep -c "worker command that can reach a paid session" skills/implement-issue/SKILL.md` prints 1; `git status --porcelain` lists exactly the four files.
7. Commit all changes as one commit, e.g. `skills: count covered launches against grant bounds with warn-and-run`; no `Test-Change` trailer needed (no file is matched by `src/test-files.ts`; SKILL.md files are not test files).

Advisory size: 4 files, about 16 turns.

## 7. Commands

This unit changes prose only; there are no unit tests to run and the criterion greps above are A's proof. The worker runs only the step-5/6 verification greps — those do not need `akrogon run-check` since nothing is kept as evidence (A's own criterion runs are the evidence). If the worker wants to show output, paste the step-5/6 results in the report.

## 8. Done-when, evidence and report

Done when all four edits are applied, the greps pass, `git status` is clean after the commit, and the commit id is reported.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
