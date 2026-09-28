# Brief-3: guide/chart.md operator explanation (chart-destination-intake U3)

## 1. Goal

Implement plan D1 and D4-guide in `docs/guide/chart.md` so the operator handoff section explains the destination check in plain words and the closure sentence carries the covered-report exemption.

Binding facts copied in: before handoff the door checks the source repo plus each selected destination by running `akrogon pull` in each checked repo's registered root, at destination selection and again right before the handoff review. A report in a destination repo describing the handed-off work becomes visible before handoff so it can enter leaf `sources` and close with the delivering issue. Confirmed fully covered, unowned reports of undelivered work stay open as `sources` until their completion owner delivers instead of being duplicate-closed during charting. A failed destination refresh holds only that destination's handoff.

## 2. Numbered acceptance criteria

- AC1: The handoff section "Turn the answers into a buildable contract" explains in plain words that the door checks the source repo plus each selected destination before handoff, when (at selection and right before the review), and how (`akrogon pull` in each registered root).
- AC2: The same section states what happens to a covered destination report: it can enter leaf `sources` and close when the delivering issue completes.
- AC3: The closure sentence (currently line 128) exempts confirmed fully covered, unowned reports of undelivered work from immediate duplicate closure.
- AC4: No file outside `docs/guide/chart.md` is modified.

Verification for AC1-AC3 is grep plus human read of the edited hunks, not an automated wording test. AC4 is verified with `git status --porcelain` and `git diff --name-only`.

## 3. Read-first list

- Worktree file `docs/guide/chart.md` (closure sentence :128, handoff section "Turn the answers into a buildable contract").
- Leaf plan decisions D1/D4 and AC4 (copied above; full plan at `/home/ivan/Work/infra/akrogon/issues/open/cross-repo-intake/chart-destination-intake/plan.md`, read-only).
- Existing pattern to copy: the guide's short plain-words paragraphs under the handoff section (no skill jargon, no command dump).
- This skill folder's `ponytail.md` at `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.
- Open the grounding index only on a gap in this list.

## 4. Change list and needed interfaces

- Edit only `docs/guide/chart.md` in the assigned worktree.
- Add one short plain-words paragraph to the handoff section for AC1-AC2; edit the :128 closure sentence in place for AC3.
- Needed interfaces (names only): `akrogon pull`, registered repo roots, leaf `sources`, delivering issue completion.
- Chunks that must land first: none. Paths this unit owns: `docs/guide/chart.md`. Shared test resource: none. Consumed output: none.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/`, `plugin/`, `README.md`, any path under `issues/`, `SKILL.md`, or `shapes.md`: other units or exclusions own them.
- Do not paste skill procedure or preflight wording into the guide: the guide stays plain-words operator view.
- Do not change completion closure or `akrogon close` behavior: Off route excludes them.
- Do not add an automated test asserting prose wording: plan D6 forbids it; verification is grep plus read.
- Do not widen scope or change an interface on mismatch: return a mismatch naming the conflicting requirement, actual code, and smallest brief correction; the exception is a revised brief from B authorizing that change.
- Reasons and exceptions restated: exclusions keep the diff to one owned file in operator voice; the only exception path is a B-revised brief.

## 6. Ordered steps

1. Read `docs/guide/chart.md` fully; locate the :128 closure sentence and the handoff section (covers AC1-AC3).
2. Add the plain-words destination-check paragraph to the handoff section for AC1-AC2.
3. Edit the :128 closure sentence in place for AC3.
4. Verify with `grep -n "destination\|duplicate\|sources" docs/guide/chart.md`, a full diff read, and `git diff --name-only` (single file).
5. Run the section 7 command and commit only this file.

Advisory size: about 1 file and under 6 turns; work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this changed-test command from the worktree root (base supplied):

```sh
AKROGON_BASE=a2f3e7a378d025930e12ac05ce8710f57f0752a2 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```

Install dependencies first if the worktree needs it. B runs the full suite separately; do not substitute it.

## 8. Done-when, evidence and report

Done when AC1-AC4 hold, the changed-test command passes, and only `docs/guide/chart.md` is committed. Paste the grep output, the changed-test result, `git diff --name-only`, and the commit ID in the return. No end-to-end artifact is owed by this unit. State limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
