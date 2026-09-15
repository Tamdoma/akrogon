# Brief 1: chart-prose asset edits

## 1. Goal

Apply all five plan decisions (D1–D5): prose-only edits to three files under `skills/chart-issues/assets/` in the worktree. Line numbers are at base 735cd63; locate by content, not line number.

## 2. Acceptance criteria

1. `grep -n "never cut" skills/chart-issues/assets/questions.md` is empty.
2. `grep -rn "Forks open" skills/chart-issues/` is empty and `grep -c "^## Fog$" skills/chart-issues/assets/shapes.md` prints 1.
3. `grep -n "binding only for the answer it changes" skills/chart-issues/assets/shapes.md` prints one line.
4. `grep -n "verbatim into each leaf design" skills/chart-issues/assets/standing-design.md` is empty; `grep -n "installed path" skills/chart-issues/assets/shapes.md skills/chart-issues/assets/standing-design.md` prints one line in each file.
5. `grep -n "before state.yaml" skills/chart-issues/assets/shapes.md` prints one line and `grep -n "plan.positions when debate" skills/chart-issues/assets/shapes.md` prints the sample phase line.
6. `git diff origin/main --stat` lists only files under `skills/chart-issues/`.

## 3. Read-first list

- `skills/chart-issues/assets/questions.md` (line 27 target)
- `skills/chart-issues/assets/shapes.md` (lines 26-27, 80, 142, 152, 166, 170)
- `skills/chart-issues/assets/standing-design.md` (last line)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

All replacement strings are literal; use them exactly.

**questions.md** — replace the entire sentence at line 27 with:

"Every round uses this shape, on every harness and at every effort level: the opening paragraph, the sentences under each question, the research line, the labelled recommendation with its reason, the pitfalls line, the reply key and the challenge check. A small round keeps the parts that carry the decision, the reply key and the challenge check. Number questions continuously within a round and restart at 1 in the next round."

**shapes.md** — five edits:

a) Delete lines 26-27: the `## Forks open` heading and its `- [<fork>](forks/<fork-slug>.md): <what blocks it, if anything>` line, plus the now-orphaned blank line so `## Forks taken`'s list is followed by one blank line then `## Fog`. `## Fog` and `## Off route` stay.

b) In the paragraph at line 80, replace the sentence "A taken fork is never reopened: a correction before handoff is a new fork naming the one it supersedes, the original stays verbatim, and only the effective answer becomes a binding decision." with "Append each explicit operator correction with its date, preserve earlier answers, and treat the last appended correction as binding only for the answer it changes." Then append at the end of that same paragraph: "A fork file with no operator answer under `## Taken` is open, and CHART.md lists none." Every other sentence in the paragraph stays unchanged.

c) Replace the placeholder line `<standing creation-locked block and current interpretation from standing-design.md>` (line 142) with `<installed path of standing-design.md, then the current interpretation: how its rules apply to this leaf>`.

d) Change the sample yaml line `phase: plan.synthesis` (line 152) to `phase: plan.synthesis  # plan.positions when debate: 'yes'`.

e) In the first preflight paragraph (line 166, the one ending "...before writes. Emit prerequisite leaves before dependents so no written state names a not-yet-created prerequisite."), append: "Refuse the handoff while any fork file lacks an operator answer or `## Fog` is not empty."

f) In the final paragraph (line 170, starting "Write the leaf files and immediate-child indexes"), insert before "then run `akrogon status`": "Write brief.md and design.md before state.yaml, and a prerequisite leaf's files before its dependents', because dispatch picks up any folder holding a state.yaml." — i.e. the paragraph opens "Write the leaf files and immediate-child indexes directly at the registered root, then run..."; the new sentence goes immediately before "then run `akrogon status` there and inspect the actual result." Read the sentence boundaries carefully: the result should read "...directly at the registered root. Write brief.md and design.md before state.yaml, and a prerequisite leaf's files before its dependents', because dispatch picks up any folder holding a state.yaml. Then run `akrogon status`..." — adjust capitalization of "Then" accordingly.

**standing-design.md** — replace the last line "Carry the block above verbatim into each leaf design." with "Each leaf design names this file's installed path and writes its own interpretation of these rules."

## 5. Do-not, reasons and exceptions

- Do not touch `skills/chart-issues/SKILL.md`: its "every fork in every chart is taken" line already matches the open-inventory rule; the design excludes it.
- Do not touch anything under `issues/`, `src/`, `tests/`, `docs/`, or any other skill folder: done-criterion 6 limits the diff to `skills/chart-issues/`.
- Do not reword the quoted strings: they are locked design wording; paraphrase fails the grep criteria.
- Do not delete `## Fog` or `## Off route` from the CHART template: only `## Forks open` leaves.
- If any target text is absent or differs from what this brief quotes, return a mismatch naming the conflicting requirement and the actual file content instead of improvising; the exception is a revised brief from B authorizing the change.

Restated: exclusions exist because the diff is locked to three asset files with verbatim wording; the only exception is a revised brief from B.

## 6. Ordered steps

1. questions.md: replace line 27 sentence. Verify criterion 1.
2. shapes.md: delete `## Forks open` block (a). Verify criterion 2 partially.
3. shapes.md: corrections sentence + open-inventory append (b). Verify criterion 3.
4. shapes.md: standing placeholder (c). Verify criterion 4 partially.
5. standing-design.md: last line. Verify criterion 4 fully.
6. shapes.md: sample phase comment (d). Verify criterion 5 partially.
7. shapes.md: preflight refusal (e).
8. shapes.md: write-order sentence (f). Verify criterion 5 fully.
9. Run all criterion greps and `git diff origin/main --stat`. Verify criterion 6.

Advisory size: 3 files, under 15 turns.

## 7. Commands

Changed-test command: `AKROGON_BASE=735cd630afe03fe21b773aafeabdddddc88ca612 bun test --changed="$AKROGON_BASE"` — run once after edits; no test file reads these assets so it may report no tests, which is fine.

Criterion greps are in section 2; run each from the worktree root.

## 8. Done-when, evidence and report

All six criteria verified with pasted grep/diff output, plus the changed-test command output. No end-to-end artifact required: prose-only leaf, no user-visible flow.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
