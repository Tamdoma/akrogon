# Brief 1: base-red-exit prose rule (single unit)

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/base-red-exit-u1` (detached at `88f252f`). Do all edits and commits there. Lane HEAD reused; no prerequisites.

## 1. Goal

State the locked base-red stop rule in `implement-issue` and `check-issue`, the chart rule in `plan-issue`, and mirror both in `skills/AREA.md` and `docs/guide/phases.md`. Plan decisions D1-D8.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md` Shared context holds the complete rule with every element of section 4 below; the sentence that a red criterion is never handed off as pre-existing, base red, or modulo anything stays verbatim; implement end and check.fix each carry a one-line reference placed before the generic repair sentence.
2. `skills/check-issue/SKILL.md` check.review states the same rule as the existing "specific concern" rerun case with the reviewing slot and `review-<slot>.md`; the failed-checks-block and rerun-only paragraphs stay intact.
3. `skills/plan-issue/SKILL.md` plan.synthesis states the chart rule and keeps a whole run the brief names.
4. `skills/AREA.md` gains one bullet under Non-obvious patterns; exactly the four second-level sections remain; at most 40 lines.
5. `docs/guide/phases.md` gains the planning limit with `merge_checks`, the brief-named whole-run qualification, and one base-exit sentence each in the implement and check sections; no other guide file changes.
6. Exactly one new commit in the worker worktree touching only the five owned paths; section 7 output pasted in the report.

No new tests: skill prose is proven by read, grep sweep, and existing checks. Trivial one-line-class edits throughout.

## 3. Read-first list

- This brief's section 4 (binding wording requirements, copied in).
- `skills/implement-issue/SKILL.md` Shared context red-criterion paragraph, implement end, check.fix (locate by heading and neighboring sentence; design line numbers are stale).
- `skills/check-issue/SKILL.md` check.review blocking and rerun paragraphs.
- `skills/plan-issue/SKILL.md` plan.synthesis section.
- `skills/AREA.md` and `docs/guide/phases.md` plan, implement, and check sections.
- `skills/implement-issue/ponytail.md`.
- Pattern to copy: the terse single-paragraph rule style of the neighboring Shared-context paragraphs in `implement-issue/SKILL.md`.
- Open the repo index only for a gap in this list.

## 4. Change list and needed interfaces

Owned paths (this unit owns all five; nothing must land first; no shared test resource; no consumed worker output):

1. `skills/implement-issue/SKILL.md`: full rule in Shared context beside the red-criterion paragraph. Required elements: trigger (red test or check with no cause in the leaf's diff: failing output plus `git diff "$AKROGON_BASE"...HEAD` shows no touched file or plausible cause; a judgment gate, never automatic); run that same command once, same command, args, whole-folder or single-file scope, in the corresponding working directory inside the detached base checkout, at `AKROGON_BASE`; allocate with `base_worktree=$(mktemp -d)` then `git worktree add --detach "$base_worktree" "$AKROGON_BASE"` (`mktemp` uses exported leaf `TMPDIR`, otherwise system temp; no fixed path); install dependencies there with the leaf's installation method; redirect logs outside the worktree; capture exit result, both log paths, failing names and tails from both runs; then `git worktree remove --force "$base_worktree"` before either outcome. Red on base: `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot A`, and `implementation/report.md` records base SHA, both log paths, failing names and tails from both runs; the exit is a stop, never a handoff, creating no path to check.review or merge. Green on base: existing repair path. Keep the existing `merge_checks` sentence.
2. Same file: one-line reference at implement end and one at check.fix, each before the generic repair sentence, no restatement.
3. `skills/check-issue/SKILL.md`: same rule in check.review with the reviewing slot (`--slot <A|B>`) and `review-<slot>.md` as the artifact; frame the triggered run as the existing specific-concern rerun case.
4. `skills/plan-issue/SKILL.md` plan.synthesis: one paragraph stating a plan proves the brief's done-criteria with the leaf's own tests and `checks` commands and adds no `merge_checks` or whole-suite requirement the brief does not name; a whole run the brief names stays.
5. `skills/AREA.md`: one bullet under Non-obvious patterns naming the base-red stop and the plan proof limit.
6. `docs/guide/phases.md`: planning paragraph states the complete limit including `merge_checks`; implement paragraph qualifies the whole-run exception as one the brief names and adds one base-exit sentence after the `checks`/`merge_checks` sentence; check paragraph adds one base-exit sentence after "Failed checks always block".

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/`, chart shapes, `merge-issue`, other guide files, or framework leaves: scope is five doc files. Exception: a revised brief from A.
- Do not write new tests of prose wording: standing design forbids them. Exception: none.
- Do not restate the full rule at implement end or check.fix: copies drift. Exception: none.
- Do not alter AREA section structure or exceed 40 lines: file invariant. Exception: none.
- Do not trust design line numbers: verified stale. Exception: none.
- Do not invent fixed temp paths or assign `TMPDIR`: the rule works with or without leaf-temp-dir. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface. Exception: a revised brief from A authorizing that change.

Reasons restated: scope keeps the diff reviewable; no wording tests keeps the suite honest; single-definition prevents drift; AREA shape is an implement invariant; stale numbers misplace edits; fixed paths would couple to another leaf; mismatches protect the locked design.

## 6. Ordered steps

1. Edit `skills/implement-issue/SKILL.md` Shared context per section 4 item 1 (criterion 1).
2. Add the two one-line references per section 4 item 2 (criterion 1).
3. Edit `skills/check-issue/SKILL.md` per section 4 item 3 (criterion 2).
4. Edit `skills/plan-issue/SKILL.md` per section 4 item 4 (criterion 3).
5. Edit `skills/AREA.md` per section 4 item 5 (criterion 4); verify `wc -l` and section headings.
6. Edit `docs/guide/phases.md` per section 4 item 6 (criterion 5).
7. Run `bun install` once, then the section 7 command; commit only the five paths in one commit; fill section 8 (criterion 6).

Advisory size: 5 files, under 24 turns.

## 7. Commands

Run only this changed-test command (base supplied: `AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5`):

```sh
: "${AKROGON_BASE:?AKROGON_BASE is required}" && AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5 bun test --changed="88f252f02eb36aacee6dadf6668c303374b692d5"
```

Criterion proof and every `checks` command belong to A after the final worker.

## 8. Done-when, evidence and report

Done when criteria 1-6 hold: five files edited per section 4, one commit, pasted command results. No end-to-end artifact applies to prose.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
