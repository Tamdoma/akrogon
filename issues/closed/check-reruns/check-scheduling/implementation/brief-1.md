# Brief 1: implement-issue SKILL.md 2a schedule

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/check-scheduling-u1`. Edit only inside that worktree. Base: `9ea5dd0ae720970b37e0175d7b109c913d29a242`.

## 1. Goal

Rewrite `skills/implement-issue/SKILL.md` to the Q2 2a proof schedule. Plan D2, D3, D4, D5-part, D8, D9. After the last unit and after every repair, A proves every done-criterion, runs changed tests with affected consumers plus every `checks` command, reuses unchanged evidence; `merge_checks` run only at merge unless a criterion itself needs a whole run. Undefined `full suite` in this file is gone.

## 2. Numbered acceptance criteria

1. Line-48 region states the 2a implement-end obligation with all six parts: criterion proof, changed tests with affected consumers, every `checks` command, unchanged evidence reused, `merge_checks` only at merge, whole-run exception via a criterion.
2. Line-62 `check.fix` states the same 2a obligation after every repair.
3. Line-52 repair-rerun clause (`a full-suite rerun follows a repair...`) is gone; the `checks` blocks / `advisory` Nits clause stays.
4. Line-42 delegation boundary: workers receive only the resolved changed-test command, not A's criterion proof and `checks` run.
5. Line-34 red-sub-brief no longer names `full suite`; slow-run in-branch fix reference stays.
6. No `full suite` / `full-suite` string remains in this file.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` lines 30-63 (owned file, full context).
- `skills/merge-issue/SKILL.md` lines 33-35 (pattern to copy: `every checks command, then every merge_checks command` ordering language).
- `skills/implement-issue/ponytail.md` (read before editing).
- `docs/reference-index.md` only on a gap.

## 4. Change list and needed interfaces

- File: `skills/implement-issue/SKILL.md` only. Owned paths: that one file. No other file.
- Change A (criterion 1): replace `run the full suite once as A and every other blocking check` with 2a wording: supply passing proof for every done-criterion, run changed tests including affected consumers and every `checks` command, reuse unchanged evidence, `merge_checks` only at merge unless a criterion needs a whole run.
- Change B (criterion 3): delete the `, and a full-suite rerun follows a repair rather than an unchanged successful run` clause from the `Every command under checks blocks` sentence.
- Change C (criterion 2): extend the `check.fix` paragraph (`Do required work for Fixes only... Run the affected changed tests and required checks`) with the full 2a list.
- Change D (criterion 4): replace `not the full suite` with `not A's criterion proof and every checks command run`.
- Change E (criterion 5): replace `(a red full suite sub-brief, a slow-run leaf's in-branch fix)` with `(a red criterion-proof or checks sub-brief, a slow-run leaf's in-branch fix)`.
- Needed interfaces: none. Config keys `checks`, `merge_checks` are read, not changed.
- Prerequisites: none. This unit lands independently of brief-2 and brief-3 (disjoint paths).
- Shared test resource: none. Prose-only.

## 5. Do-not, reasons and exceptions

- Do not touch any other file; reason: brief-2 and brief-3 own disjoint paths and parallel picks conflict on overlap; exception: none, return a mismatch instead.
- Do not add a test asserting wording; reason: design D9 calls that a vanity test and check-issue rejects it; exception: none.
- Do not introduce a new tier name (e.g. `pre-review checks`); reason: design term rule fixes `every checks command` vs `merge_checks`; exception: none.
- Do not change `src/`, `tests/`, or anything under `issues/`; reason: design excludes them and `akrogon phase` rejects `issues/` diffs; exception: none.
- Do not change scope or an interface on mismatch; reason: A owns the plan; exception: return a mismatch naming the conflict, evidence, and smallest brief correction, and wait for a revised brief.
- Restated: other files stay untouched because parallel units own them (no exception); no wording tests because they are vanity tests (no exception); no new tier name because the term rule is locked (no exception); no `src/`/`tests/`/`issues/` because the design excludes them (no exception); on conflict return a mismatch (exception: a revised brief from A authorizes the change).

## 6. Ordered steps

1. Read the owned file and the merge-issue pattern (criteria 1-6). No code yet.
2. No test to write: D9 forbids wording tests; proof is grep plus diff read plus the changed-test command below.
3. Edit `skills/implement-issue/SKILL.md` Change A and B (criteria 1,3).
4. Edit `skills/implement-issue/SKILL.md` Change C, D, E (criteria 2,4,5).
5. Verify: `grep -rn "full suite\\|full-suite" skills/implement-issue/SKILL.md` returns nothing (criterion 6); `git --no-pager diff -- skills/implement-issue/SKILL.md` read for all six 2a parts at both sites and the deleted clause (criteria 1-3).
6. Run `bun install` once, then the section-7 command; paste output.
7. Commit only `skills/implement-issue/SKILL.md` with message `check-scheduling u1: SKILL.md 2a schedule`. Record the commit ID for the report.

Advisory size: about 1 file and under 8 turns.

## 7. Commands

`AKROGON_BASE=9ea5dd0ae720970b37e0175d7b109c913d29a242 bun test --changed="$AKROGON_BASE"` only. A runs the full suite separately.

## 8. Done-when, evidence and report

Done when criteria 1-6 hold, the section-7 command passes, and the chunk is committed. Paste the grep output (empty), the diff, and the changed-test output. Link criterion 2 of the leaf plan to this diff. No end-to-end artifact applies (prose-only).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
