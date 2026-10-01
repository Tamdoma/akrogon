# Plan: base-red-exit

Debate ran (`debate: "yes"`, one rebuttal round). Both positions agree with no substantive behavioral fork; both rebuttals confirm agreement. This plan integrates them with three wording corrections from rebuttal B (D2, D4, D6).

## Decisions

- D1: Scope is five documentation files only: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/AREA.md`, `docs/guide/phases.md`. No `src/` change, no runner, no record store, no new tests, no chart-shape change, no `merge-issue` change, no framework-leaf edits, no dependency on leaf-temp-dir.
- D2: In `implement-issue`, the complete base-run rule lives in Shared context beside the red-criterion paragraph and explicitly covers implement end and check.fix. Both pass endings get a one-line reference placed before the generic repair instruction, so an unrelated base failure cannot be sent into worker repair first. The existing sentence that a red criterion is never handed off as pre-existing, base red, or modulo anything stays verbatim; the `failed` exit is a stop, never a handoff, and creates no path to check.review or merge.
- D3: The rule text in both skills: trigger is a red test or check with no cause in the leaf's diff (failing output plus `git diff "$AKROGON_BASE"...HEAD` shows no touched file or plausible cause; a judgment gate, never automatic). Run that same command once, same command, args, and whole-folder or single-file scope, in the corresponding working directory inside the detached base checkout, at `AKROGON_BASE`, in a worktree from `mktemp -d` (`mktemp` uses exported leaf `TMPDIR`, otherwise system temp; no fixed path). Install dependencies there with the leaf's installation method. Redirect logs to files outside the worktree, capture exit result, both log paths, failing names and tails from both runs, then `git worktree remove --force` before either outcome. Red on base: end the pass immediately with the seat-specific `failed` exit and record base SHA, both log paths, and failing names and tails from both runs in the pass artifact. Green on base: existing leaf repair path. The existing `merge_checks` sentence in the skill stays.
- D4: In `check-issue`, check.review carries the same rule beside the blocking-check and rerun paragraphs. The triggered base run is the existing "specific concern" rerun case, not a new trigger and not an automatic second run. The reviewing slot runs the `failed` exit and records in `review-<slot>.md`. `:49` (failed checks block) and `:51` (rerun only on code change, missing evidence, specific concern) stay.
- D5: In `plan-issue`, the chart rule lives in the plan.synthesis section where the checklist and verification are written (design's "verification near 55-59" pointer is stale; no such section exists live, so intent governs placement). Text: a plan proves the brief's done-criteria with the leaf's own tests and `checks` commands and adds no `merge_checks` or whole-suite requirement the brief does not name. A whole run the brief names stays, so this leaf keeps criterion 5's `bun test`.
- D6: `skills/AREA.md` gets one bullet under Non-obvious patterns naming the base-red stop and the plan proof limit. File keeps exactly its four second-level sections and stays at most 40 lines (currently 30).
- D7: `docs/guide/phases.md` gets edits in three sections only. Planning paragraph: the complete limit including `merge_checks`, not only whole-suite. Implement paragraph (~line 91): qualify the whole-run exception as one the brief names, and add one sentence on the base-run exit after the `checks`/`merge_checks` sentence. Check paragraph: one sentence on the same exit after "Failed checks always block". Other guide hits (`setup.md:53-54`, `merge.md:3,9`, unrelated "whole" uses) describe configuration or merge correctly and get no edit unless the criterion 4 sweep judges otherwise by meaning. Merge red checks still route to check.fix.
- D8: Proof is semantic read of the new prose against binding Q2 2a, Q3 3a, and the carried leaf-temp evidence line, plus the two exact criterion 4 grep sweeps judged by meaning, plus the three configured checks. No new tests and no runtime harness: the design already records the mktemp, detached-worktree, forced-remove, and failed-transition operation proofs.

Dependencies: none. Credentials: none (`AKROGON_BASE` and `TMPDIR` are lifecycle/OS environment, not `.env` secrets, so no env-name check applies). No brief/design conflict found.

## Read first

- `issues/open/base-red/base-red-exit/brief.md` and `design.md` (authoritative contract; design wins on any conflict).
- `skills/implement-issue/SKILL.md`: Shared context red-criterion paragraph, implement end, check.fix.
- `skills/check-issue/SKILL.md`: check.review blocking and rerun paragraphs.
- `skills/plan-issue/SKILL.md`: plan.synthesis section.
- `skills/AREA.md` (30 lines; four sections).
- `docs/guide/phases.md` plan, implement (~line 91), and check sections; `docs/guide/setup.md` and `docs/guide/merge.md` for the checks/merge boundary (read-only, no edit expected).
- `docs/reference-index.md` (grounding top).
- `skills/chart-issues/assets/shapes.md:132,170` (read-only chart proof rule).
- `src/phase.ts:193-207` (read-only: `failed` requires `--reason`, active phases require `--slot`).
- `learnings/LESSONS.md` and `learnings/history/2026-09-11-stale-rule-in-docs.md` (sweep the guide after changing a skill rule).

Locate every insertion point by heading and neighboring sentence, never by design line number.

## Interfaces

- Base worktree: `base_worktree=$(mktemp -d)`, `git worktree add --detach "$base_worktree" "$AKROGON_BASE"`, then `git worktree remove --force "$base_worktree"`; logs redirect to files outside `$base_worktree`.
- Stop: `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>` (implement uses A; review uses the reviewing seat).
- Artifact fields on red-on-base: base SHA, both log paths, failing test names and log tails from both runs.
- Sweep 1: `grep -rn "base" skills/implement-issue skills/check-issue skills/plan-issue skills/AREA.md docs/guide`.
- Sweep 2: `grep -rn "whole\|full suite\|merge_checks" skills/plan-issue docs/guide`.
- Checks: `bun run format`, `bun test`, `bun run typecheck`.

## Checklist

1. `skills/implement-issue/SKILL.md`: full rule in Shared context (D2, D3) plus one-line references at implement end and check.fix. Criterion 1.
2. `skills/check-issue/SKILL.md`: same rule in check.review as a specific-concern rerun (D4). Criterion 2.
3. `skills/plan-issue/SKILL.md`: chart rule in plan.synthesis (D5). Criterion 3.
4. `skills/AREA.md`: one bullet under Non-obvious patterns within the four sections and 40-line cap (D6). Criteria 1-3.
5. `docs/guide/phases.md`: planning limit with `merge_checks`, brief-named whole-run qualification, base-exit sentences in implement and check sections (D7). Criteria 1-3.
6. Run both sweep commands, paste full output into `implementation/report.md`, judge every hit by meaning. Criterion 4.
7. Run `bun install` first (`node_modules` is absent in the worktree), then `bun run format`, `bun test`, `bun run typecheck`; confirm `tests/docs-links.test.ts` and `tests/command-reference.test.ts` pass unchanged with no diff. Criterion 5.

## Verification

Not a slow-run leaf: no restart boundaries. `bun run format` covers only `src` and `tests`, so prose correctness rests on the reads and sweeps below, not on format.

| Criterion | Proof | Failure caught | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1 | Read `git diff "$AKROGON_BASE"...HEAD -- skills/implement-issue/SKILL.md` against D2/D3: trigger, once, same scope, corresponding base cwd, `AKROGON_BASE`, `mktemp -d`, dep install, logs outside, `--force` remove, red `failed` reason plus artifact fields, green repair, never automatic, red-criterion sentence intact, both pass endings referenced. | Omitted rule part, weakened red gate, missing phase coverage. | Minutes | Implement prose changes. |
| 2 | Read `git diff "$AKROGON_BASE"...HEAD -- skills/check-issue/SKILL.md` against D4: same rule, reviewing slot, `review-<slot>.md` record, no red handoff or ready/nits path, `:49`/`:51` intact. | Wrong slot or artifact, review handoff on base red, weakened block/rerun rules. | Minutes | Check prose changes. |
| 3 | Read `git diff "$AKROGON_BASE"...HEAD -- skills/plan-issue/SKILL.md` against D5 and shapes `:132,170`: leaf's own tests plus `checks` proof, no brief-unnamed `merge_checks` or suite requirement, brief-named whole run kept. | Planner-added suite or merge gate, dropped brief-named whole run. | Minutes | Planning prose changes. |
| 4 | Paste full output of Sweep 1 and Sweep 2 into the report, each hit judged by meaning including rebase and merge-only mentions. | Stale or contradictory documentation. | Seconds plus minutes to assess | Any owned prose change. |
| 5 | `bun install`, `bun run format`, `bun test`, `bun run typecheck`; `bun test tests/docs-links.test.ts tests/command-reference.test.ts` with `git status --porcelain` showing no diff in those files. | Configured check failure, broken guide link, damaged command contract. | Unknown until timed | Missing evidence, changed inputs, or specific concern. |

No new tests are derived: this is a skill-prose leaf and the acceptance criteria above are proven by read, sweep, and the existing checks.

## Known limitations

- One triggered base run still costs one full command when the original failure came from a whole-folder run, and outside inputs can differ between runs. The rule bounds investigation with a stop; it is not a cached or hermetic causality proof.
