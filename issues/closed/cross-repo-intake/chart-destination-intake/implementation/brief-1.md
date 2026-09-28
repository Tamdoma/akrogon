# Brief-1: SKILL.md destination check (chart-destination-intake U1)

## 1. Goal

Implement plan D1, D2, D3-procedure, D4 in `skills/chart-issues/SKILL.md` so the door checks the source repo plus each selected registered destination at two checkpoints with plain `akrogon pull`, and exempts covered undelivered reports from immediate duplicate closure.

Binding facts copied in: checked set is source repo plus each selected registered destination, roots deduplicated within a checkpoint. Checkpoints are at destination selection and right before the handoff review. One check satisfies coincident checkpoints. The opening pull counts only when it coincides with a checkpoint. Source is never exempt, including when it is also the only destination. Mechanism is plain `akrogon pull` with cwd at each checked repo's registered root from `akrogon config` `repos`. No `--all`, no new command, flag, config key, or state field. Compare each checked destination's `issues/seeds/*.md` against chart scoped work, show candidates to the operator, operator confirms. Checking never imports unrelated seeds. Confirmed fully covered unowned reports of undelivered work stay open as `sources` until their completion owner delivers.

## 2. Numbered acceptance criteria

- AC1: SKILL.md states which repos are checked: source repo plus each selected registered destination, deduplicated within a checkpoint.
- AC2: SKILL.md states when: at destination selection and right before the handoff review, one check when both coincide, opening pull counts only when it coincides, source not exempt including sole-destination case.
- AC3: SKILL.md states how: plain `akrogon pull` with cwd at each checked repo's registered root from `akrogon config`, distinct from importing that repo's unrelated seeds.
- AC4: The delivered-or-duplicate close sentence (currently line 33) exempts confirmed fully covered, unowned reports of undelivered work: those stay open as `sources` until the completion owner delivers.
- AC5: No file outside `skills/chart-issues/SKILL.md` is modified.

Verification for AC1-AC4 is grep plus human read of the edited hunks, not an automated wording test. AC5 is verified with `git status --porcelain` and `git diff --name-only`.

## 3. Read-first list

- Worktree file `skills/chart-issues/SKILL.md` (Open `akrogon pull` paragraph ~:27, close rule ~:33, Handoff section).
- Leaf plan decisions D1-D4 (copied above; full plan at `/home/ivan/Work/infra/akrogon/issues/open/cross-repo-intake/chart-destination-intake/plan.md`, read-only).
- Leaf design binding Q1-A/Q2-A/Q3-A (read-only, same folder `design.md`).
- Existing pattern to copy: the Open paragraph `Run `akrogon pull` at open: ...` for pull-failure tone.
- This skill folder's `ponytail.md` at `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.
- Open the grounding index only on a gap in this list.

## 4. Change list and needed interfaces

- Edit only `skills/chart-issues/SKILL.md` in the assigned worktree.
- Add one destination-check block in the Handoff section before the preflight audit paragraph, covering AC1-AC3 plus the compare/show/confirm flow and the no-import-of-unrelated-seeds rule.
- Edit the :33 close sentence in place to add the AC4 exemption clause; keep the `akrogon close <owner/repo#n> --by <text>` reference intact.
- Needed interfaces (names only, no code change): `akrogon config` `repos` roots, `akrogon pull` at each checked root, `issues/seeds/*.md` with `Source: owner/repo#n`, leaf `sources`, `akrogon close`.
- Chunks that must land first: none. Paths this unit owns: `skills/chart-issues/SKILL.md`. Shared test resource: none. Consumed output: none.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/`, `plugin/`, `README.md`, any path under `issues/`, `shapes.md`, or `docs/guide/chart.md`: other units or exclusions own them, and `akrogon phase` refuses `issues/` diffs on the branch.
- Do not add a command, flag, config key, state field, or automatic matcher: design forbids them; matching is door proposal plus operator confirmation.
- Do not change completion closure or `akrogon close` behavior: Off route excludes them.
- Do not add an automated test asserting prose wording: plan D6 forbids it; verification is grep plus read.
- Do not widen scope or change an interface on mismatch: return a mismatch naming the conflicting requirement, actual code, and smallest brief correction; the exception is a revised brief from B authorizing that change.
- Reasons and exceptions restated: exclusions keep the diff to one owned file and locked scope intact; the only exception path is a B-revised brief.

## 6. Ordered steps

1. Read `skills/chart-issues/SKILL.md` fully in the worktree; note the :27 pull paragraph, :33 close sentence, and Handoff audit paragraph (covers AC1-AC4).
2. Add the destination-check block to the Handoff section covering AC1-AC3 and the compare/show/confirm + no-unrelated-import flow, reusing the :27 tone.
3. Edit the :33 close sentence in place for AC4; keep surrounding sentences unchanged.
4. Verify with `grep -n "destination" skills/chart-issues/SKILL.md`, `git diff --name-only`, and a full read of the diff; confirm AC5 single-file diff.
5. Run the section 7 command (covers no-code-change pass) and commit only this file.

Advisory size: about 1 file and under 6 turns; work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this changed-test command from the worktree root (base supplied):

```sh
AKROGON_BASE=a2f3e7a378d025930e12ac05ce8710f57f0752a2 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```

Install dependencies first if the worktree needs it. B runs the full suite separately; do not substitute it.

## 8. Done-when, evidence and report

Done when AC1-AC5 hold, the changed-test command passes, and only `skills/chart-issues/SKILL.md` is committed. Paste the grep output, the changed-test result, `git diff --name-only`, and the commit ID in the return. No end-to-end artifact is owed by this unit. State limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
