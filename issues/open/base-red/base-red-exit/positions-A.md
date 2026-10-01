# Positions A: base-red-exit

## Recommendation

Add one shared base-run rule to `implement-issue` and `check-issue`, add the chart rule to `plan-issue`, mirror both in `skills/AREA.md` and `docs/guide/phases.md`. No `src/` change, no new tests. Define the rule once per skill file and reference it from the other sections so the three copies cannot drift.

Concrete scenario checked: framework `emdash-content-fixes` whole-folder reds with content-only diff. New path: seat confirms no diff cause, runs the same whole-folder command once at `AKROGON_BASE` in a `mktemp -d` detached worktree, installs deps as the leaf does, saves logs outside the worktree, removes with `--force`, sees red, ends with `failed` plus SHA, both log paths, names and tails in the report. One base run replaces ~1h of digging.

## Concrete changes

- C1 `skills/implement-issue/SKILL.md`, Shared context (live: red-criterion paragraph, design says ~line 34): define the full rule. Trigger: red test or check with no cause in the leaf's diff (failing output plus `git diff AKROGON_BASE...HEAD` shows no touched file or plausible cause; a judgment gate, never automatic). Steps: run that same command once, same mode (same command, args, cwd; whole folder stays whole folder, single file stays single file), at `AKROGON_BASE` in a detached worktree from `mktemp -d` (`base_worktree=$(mktemp -d)`, `git worktree add --detach "$base_worktree" "$AKROGON_BASE"`), install deps there as the leaf does, redirect logs to files outside the worktree, keep result and evidence, then `git worktree remove --force "$base_worktree"` before the red/green branch. Red there too: `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot A`, report records base SHA, both log paths, failing names and tails from both runs. Green there: leaf's own failure, repair as today. One line keeps `SKILL.md:34` intact: still never handed off as pre-existing except through this exit.
- C2 same file, implement end (design ~48) and check.fix (design ~62): one-line reference each to the Shared-context rule, no restatement. Keeps the existing `merge_checks` sentence untouched.
- C3 `skills/check-issue/SKILL.md`, check.review (live: rerun paragraph, design says 49-51): same rule verbatim in meaning, with `failed` exit for the reviewing slot and the record in `review-<slot>.md`. Keep `:49` (failed checks block) and `:51` (rerun only on code change, missing evidence, specific concern); the base run is the rerun gate for the no-diff-cause case, not a fourth trigger.
- C4 `skills/plan-issue/SKILL.md`, plan.synthesis section: chart rule in one paragraph. A plan proves the brief's done-criteria with the leaf's own tests and `checks` commands and adds no `merge_checks` or whole-suite requirement the brief does not name. A whole run the brief names stays. Note for review: design cites "verification near 55-59" but the live file has no such section; intent lands in plan.synthesis.
- C5 `skills/AREA.md`: one bullet under Non-obvious patterns naming the base-run exit and the plan chart rule. Keep file at most 40 lines with exactly the four second-level sections.
- C6 `docs/guide/phases.md`: three small edits only. Plan paragraph: plans add no whole-suite requirement. Implement paragraph (line 91): after the `checks`/`merge_checks` sentence, one sentence on the base-run exit. Check paragraph: after "Failed checks always block", one sentence on the same exit. Other hits (`setup.md:53-54`, `merge.md:3,9`, `files.md`, `idea.md`) describe merge checks or whole epics correctly and get no edit; implement judges each grep hit by meaning per criterion 4.
- C7 Non-changes: no `src/`, no runner, no record store, no automatic base run, no `merge-issue` change, no chart-shape change, no framework-leaf edits, no dependency on leaf-temp-dir (`mktemp -d` uses leaf `$TMPDIR` when exported, system temp otherwise).

## Risks

- R1 Wording drift across three skill files plus AREA plus guide. Mitigation: C1/C3 share one wording, C2 references instead of restating, C5/C6 are one-sentence mirrors.
- R2 Stale line numbers in design (plan-issue 55-59, implement 34/48/62). Mitigation: implement locates live paragraphs by heading and neighboring sentence, never by number.
- R3 Base logs lost inside the removed worktree. Mitigation: rule states logs redirect outside the worktree before `--force` remove; report holds names and tails since temp expires in 7 days.
- R4 Leftover worktree on interrupted run, or plain `remove` refusal on untracked test output. Mitigation: literal `--force` in the rule per the operation proof; no new cleanup code.
- R5 Trigger abused as automatic rerun after every failure. Mitigation: rule states the diff-cause judgment gate first and "never runs automatically" last.
- R6 Dep-install cost surprises on big repos. Mitigation: accepted; still one install versus unbounded digging, and the #50 case shows the saving.

## Simpler alternative

- O1 Minimal refs only: put the full rule in `implement-issue` Shared context and make `check-issue` point at it by path. Rejected: review seats read only their own skill plus ponytail; a cross-file pointer is missed under pressure and breaks the writer/checker-share-one-rule standing line.
- O2 Full restatement in every section (implement end, check.fix, check.review, AREA, guide). Rejected: five copies drift; C1 plus one-line refs is the smallest text that keeps every seat covered. O2 is the fallback if review finds a seat missing the rule.

## Acceptance evidence

- E1 Criteria 1-3: read the new prose against binding Q2 2a, Q3 3a, and the carried leaf-temp line (names plus tails in the file, not only links). Check every part is present: trigger, once, same mode, `AKROGON_BASE`, `mktemp -d` detached worktree, `--force` remove, red `failed` reason, report/review contents, green repair, never automatic, plan chart rule with brief-named whole run kept.
- E2 Criterion 4: `grep -rn "base" skills/implement-issue skills/check-issue skills/plan-issue skills/AREA.md docs/guide` and `grep -rn "whole\|full suite\|merge_checks" skills/plan-issue docs/guide`, each hit judged by meaning; no hit contradicts the rule.
- E3 Criterion 5: `bun run format`, `bun test`, `bun run typecheck` pass; `tests/docs-links.test.ts` and `tests/command-reference.test.ts` pass unchanged (prose-only, no new links or command contracts).
- E4 Literal check: `failed --reason` form matches `src/phase.ts:193-207` (`failed` requires `--reason`, `--slot` required on active phases) and the `check-issue/SKILL.md:25` precedent; worktree add/remove matches the check-proof operation proofs (detached add, `--force` on untracked output).

Read-first for synthesis: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/AREA.md`, `docs/guide/phases.md`, `docs/reference-index.md`, `skills/chart-issues/assets/shapes.md:132,170`, `src/phase.ts:193-207`. Credentials: none.
