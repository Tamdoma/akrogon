# Brief-fix1: peer-generic challenge-check template (F1)

Repair round 1 of 3. Single unit: one template line plus verification.

## 1. Goal

Fix review-A finding F1 on head `ffd7be0`: the round template at `skills/chart-issues/assets/questions.md:24` names slot B literally, contradicting the peer-generic exchange (plan D4, locked interface "challenge check carries every peer's rebuttal"). Plan criteria unchanged, not weakened.

## 2. Numbered acceptance criteria

1. Line 24 reads peer-generic, e.g. "including each named peer's remaining disagreements", with no literal slot name.
2. `grep -rn "(both)" skills/chart-issues docs/guide/chart.md` still prints nothing.
3. No other literal slot-B rule language remains in the three owned files (a sweep for `B's`, `B gets`, `B reads`, `send B` shows only prose that names both slots' work explicitly, such as the guide's "blind to both A's and B's work").
4. Diff against base still lists only the three owned files.

No new test file: one-line prose fix with no runtime path. Verification is grep plus diff plus the changed-test command.

## 3. Read-first list

- `skills/chart-issues/assets/questions.md` lines 10-27 (template holding line 24)
- `skills/chart-issues/assets/questions.md` lines 42-50 (peer-generic exchange, the wording to match)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Open the grounding index only on a gap in this list.

## 4. Change list and needed interfaces

- `skills/chart-issues/assets/questions.md` line 24 only: replace "including B's remaining disagreements" with peer-generic phrasing matching D4 ("each named peer's remaining disagreements" or equivalent).
- No code signatures or data shapes: markdown only. No preceding worker output.

## 5. Do-not, reasons and exceptions

- Do not touch any other file or line. Reason: repair scope is F1 alone; anything else widens the diff. Exception: none.
- Do not reword surrounding template lines. Reason: review passed them; churn risks new findings. Exception: none.
- Do not return without the section 8 report lines. Reason: B cannot accept an unattested repair. Exception: none.
- Do not change scope on your own; return a mismatch with evidence naming the conflict, the actual surface, and the smallest brief fix. Reason: plan is the contract. Exception: a revised brief from B authorizing the change.

Restated: one line changes because F1 names exactly one line; everything else stays fixed unless a revised brief from B says otherwise.

## 6. Ordered steps

1. Read lines 10-27 and confirm the literal "B's" on line 24. File: questions.md. Criterion: 1 (red).
2. Edit line 24 to peer-generic wording. File: questions.md. Criterion: 1.
3. Run the grep in criterion 2, the sweep in criterion 3, and `git --no-pager diff --name-only` for criterion 4. Criteria: 2, 3, 4.
4. Run the section 7 changed-test command. Criteria: all (no code changed).

Advisory size: about 1 file and under 6 turns. Work clearly beyond this returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Only this changed-test command, with the supplied base:

```sh
AKROGON_BASE=9aaadd379d9c46c49fd0b6a6460c6c39f898fc53 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```

B runs the full suite separately. Do not run `bun run format`, `bun run typecheck`, or full `bun test`.

## 8. Done-when, evidence and report

Done when criteria 1-4 hold with pasted grep, sweep, diff-name, and changed-test outputs. No end-to-end artifact exists for a prose-only repair.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
