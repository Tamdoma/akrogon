# Brief 3: chart audit and schedule mirrors

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/check-scheduling-u3`. Edit only inside that worktree. Base: `9ea5dd0ae720970b37e0175d7b109c913d29a242`.

## 1. Goal

Rewrite the chart audit in `skills/chart-issues/assets/shapes.md` (Q3 3a) and mirror the 2a schedule in `skills/AREA.md`, `docs/guide/phases.md`, `docs/guide/merge.md`. Plan D2, D6, D7, D8, D9. The audit refuses `merge_checks` / repo-health criteria and gates repo-wide `checks`; mirrors state `checks` before review and after repair, `checks` then `merge_checks` at merge.

## 2. Numbered acceptance criteria

1. `shapes.md:132` placeholder names only leaf-owned proof and excludes a `merge_checks` command and repo-health claims outside leaf ownership.
2. `shapes.md:170` audit refuses a criterion citing a `merge_checks` command or claiming repo health outside leaf ownership, and allows a repo-wide `checks` command only when the chart names the property no smaller test proves.
3. The sentence `a leaf needing a larger repo-wide command gets it added to checks first` (and its `after a prerequisite leaf makes it pass` tail) is gone from `shapes.md`.
4. `skills/AREA.md:22` states worker returns carry changed-test evidence and A runs criterion proof plus every `checks` command before review, with `merge_checks` only at merge; file keeps 4 sections and 40-line cap.
5. `docs/guide/phases.md:91` states A runs changed tests as work lands, then criterion proof plus every `checks` command before handoff (and after repair), reusing unchanged evidence, `merge_checks` only at merge unless a criterion needs a whole run.
6. `docs/guide/merge.md:3` states B rebases then runs every `checks` command, then every `merge_checks` command.
7. No `full suite` / `full-suite` string remains in these four files.

## 3. Read-first list

- `skills/chart-issues/assets/shapes.md` lines 125-133 and 166-172 (owned audit sites).
- `skills/AREA.md` (owned, full 30-line file, section/line cap applies).
- `docs/guide/phases.md` lines 85-93 and `docs/guide/merge.md` lines 1-7 (owned mirror sites).
- `skills/merge-issue/SKILL.md` lines 33-35 (pattern to copy for the merge ordering sentence).
- `skills/implement-issue/ponytail.md` (read before editing).

## 4. Change list and needed interfaces

- Files: `skills/chart-issues/assets/shapes.md`, `skills/AREA.md`, `docs/guide/phases.md`, `docs/guide/merge.md` only. Owned paths: those four files.
- Change A (criteria 1-3): rewrite the :132 placeholder to exclude `merge_checks` and repo-health claims; rewrite the :170 audit paragraph to the refusal plus named-property gate; delete the `gets it added to checks first` sentence. Keep the `blocked-by` / operation-proof clauses in :170 untouched.
- Change B (criterion 4): rewrite the `Worker returns include changed-test evidence; A runs the final full suite.` bullet to the 2a mirror. Keep the other bullets and all four `##` sections.
- Change C (criterion 5): rewrite the `A runs changed tests as work lands, then the full suite...` sentence to the 2a mirror.
- Change D (criterion 6): rewrite `runs the configured checks` to `runs every checks command, then every merge_checks command`.
- Needed interfaces: none.
- Prerequisites: none. Independent of brief-1 and brief-2 (disjoint paths).
- Shared test resource: none. Prose-only.

## 5. Do-not, reasons and exceptions

- Do not touch any other file; reason: brief-1 and brief-2 own disjoint paths; exception: none, return a mismatch instead.
- Do not add a test asserting wording; reason: D9 vanity-test ban; exception: none.
- Do not ban every repo-wide command; reason: Q3 foreclosed 3b, the gate is the named property no smaller test proves; exception: none.
- Do not restructure `AREA.md` sections or exceed 40 lines; reason: implement-issue requires exactly Commands, Key files, Non-obvious patterns, See also as `##` sections at most 40 lines; exception: none.
- Do not change scope or an interface on mismatch; reason: A owns the plan; exception: return a mismatch naming the conflict, evidence, and smallest brief correction.
- Restated: other files untouched because parallel units own them (no exception); no wording tests because banned (no exception); no total repo-wide ban because 3b was foreclosed (no exception); keep AREA shape because the skill requires it (no exception); on conflict return a mismatch (exception: a revised brief from A).

## 6. Ordered steps

1. Read the four owned sites and the merge-issue pattern (criteria 1-7). No code yet.
2. No test to write: D9 forbids wording tests; proof is grep plus diff read plus the changed-test command.
3. Edit `skills/chart-issues/assets/shapes.md` Change A (criteria 1-3).
4. Edit `skills/AREA.md`, `docs/guide/phases.md`, `docs/guide/merge.md` Changes B, C, D (criteria 4-6).
5. Verify: `grep -rn "full suite\\|full-suite" skills/chart-issues/assets/shapes.md skills/AREA.md docs/guide/phases.md docs/guide/merge.md` returns nothing (criterion 7); `! grep -F "gets it added to" skills/chart-issues/assets/shapes.md`; read `git --no-pager diff` for refusal, gate, and mirrors (criteria 1-6); confirm `skills/AREA.md` is at most 40 lines with the 4 required `##` sections.
6. Run `bun install` once, then the section-7 command; paste output.
7. Commit only the four owned files with message `check-scheduling u3: chart audit and mirrors`. Record the commit ID.

Advisory size: about 4 files and under 16 turns.

## 7. Commands

`AKROGON_BASE=9ea5dd0ae720970b37e0175d7b109c913d29a242 bun test --changed="$AKROGON_BASE"` only. A runs the full suite separately.

## 8. Done-when, evidence and report

Done when criteria 1-7 hold, the section-7 command passes, and the chunk is committed. Paste the grep outputs, the diff, and the changed-test output. Link leaf plan criteria 3 and 4 to this diff. No end-to-end artifact (prose-only).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
