# Brief-2: shapes.md outcomes + preflight (chart-destination-intake U2)

## 1. Goal

Implement plan D1, D3-outcomes, D5 in `skills/chart-issues/assets/shapes.md` so match dispositions and the destination preflight refusal are contract text, leaving the single-owner rule untouched.

Binding facts copied in: confirmed full unowned match goes verbatim into INTAKE.md under its own Source heading with a GitHub provenance line, and its identity goes into `sources` of every leaf under the delivering completion owner so existing completion closes it. Partial match stays open and is shown with its uncovered part. Identity already in any open/closed leaf `sources` or another chart intake is shown as a conflict for the operator, never reassigned silently. Failed or non-GitHub destination pull holds handoff to that destination only and is reported. Checking never imports unrelated seeds. Preflight refuses a handoff to a destination whose check right before the handoff review did not succeed, naming the destination. Single-owner rule at shapes.md:162 stays byte-identical.

## 2. Numbered acceptance criteria

- AC1: shapes.md states the full-match disposition: verbatim INTAKE.md copy under own Source heading with GitHub provenance line plus identity into `sources` of every leaf under the delivering completion owner.
- AC2: shapes.md states partial-match handling: stays open and is shown with its uncovered part.
- AC3: shapes.md states owned-elsewhere handling: identity in open/closed leaf `sources` or another chart intake is shown as a conflict, never silently reassigned.
- AC4: shapes.md states failed/non-GitHub pull handling: holds only that destination's handoff and is reported; checking never imports unrelated seeds.
- AC5: shapes.md preflight paragraph refuses a handoff to a destination whose check right before the handoff review did not succeed, naming the destination.
- AC6: The single-owner rule sentence at shapes.md:162 is unchanged; no file outside `skills/chart-issues/assets/shapes.md` is modified.

Verification for AC1-AC5 is grep plus human read of the edited hunks, not an automated wording test. AC6 is verified with `git diff` showing no hunk on the :162 sentence plus `git diff --name-only`.

## 3. Read-first list

- Worktree file `skills/chart-issues/assets/shapes.md` (intake provenance ~:62, single-owner rule :162, preflight paragraph :166).
- Leaf plan decisions D1/D3/D5 (copied above; full plan at `/home/ivan/Work/infra/akrogon/issues/open/cross-repo-intake/chart-destination-intake/plan.md`, read-only).
- Leaf design binding Q3-A and single-owner interface note (read-only, same folder `design.md`).
- Existing pattern to copy: the preflight paragraph's `Refuse ... and name ...` sentences for refusal tone.
- This skill folder's `ponytail.md` at `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.
- Open the grounding index only on a gap in this list.

## 4. Change list and needed interfaces

- Edit only `skills/chart-issues/assets/shapes.md` in the assigned worktree.
- Add outcome dispositions (AC1-AC4) in the intake/leaf-shapes area near the provenance and single-owner rules without touching the :162 sentence itself.
- Add one refusal sentence to the preflight paragraph for AC5, naming the destination.
- Needed interfaces (names only): INTAKE.md Source headings + GitHub provenance line, leaf `sources` fan-out under the completion owner, per-destination handoff hold.
- Chunks that must land first: none. Paths this unit owns: `skills/chart-issues/assets/shapes.md`. Shared test resource: none. Consumed output: none.

## 5. Do-not, reasons and exceptions

- Do not touch the :162 single-owner sentence, `src/`, `tests/`, `plugin/`, `README.md`, any path under `issues/`, `SKILL.md`, or `docs/guide/chart.md`: locked text, other units, or exclusions own them.
- Do not add a command, flag, config key, state field, or automatic matcher: design forbids them.
- Do not change completion closure or `akrogon close` behavior: Off route excludes them.
- Do not add an automated test asserting prose wording: plan D6 forbids it; verification is grep plus read.
- Do not widen scope or change an interface on mismatch: return a mismatch naming the conflicting requirement, actual code, and smallest brief correction; the exception is a revised brief from B authorizing that change.
- Reasons and exceptions restated: exclusions keep the diff to one owned file with locked text intact; the only exception path is a B-revised brief.

## 6. Ordered steps

1. Read `skills/chart-issues/assets/shapes.md` fully; locate the provenance rule, the :162 single-owner sentence, and the preflight paragraph (covers AC1-AC6).
2. Add AC1-AC4 outcome dispositions adjacent to those rules without editing the :162 sentence.
3. Add the AC5 refusal sentence to the preflight paragraph.
4. Verify with `grep -n "destination\|sources\|Refuse" skills/chart-issues/assets/shapes.md`, `git diff` on the :162 sentence (must be empty), and `git diff --name-only` (single file).
5. Run the section 7 command and commit only this file.

Advisory size: about 1 file and under 6 turns; work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this changed-test command from the worktree root (base supplied):

```sh
AKROGON_BASE=a2f3e7a378d025930e12ac05ce8710f57f0752a2 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```

Install dependencies first if the worktree needs it. B runs the full suite separately; do not substitute it.

## 8. Done-when, evidence and report

Done when AC1-AC6 hold, the changed-test command passes, and only `skills/chart-issues/assets/shapes.md` is committed. Paste the grep output, the :162 no-diff evidence, the changed-test result, `git diff --name-only`, and the commit ID in the return. No end-to-end artifact is owed by this unit. State limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
