# Plan: check-scheduling

Direct synthesis, `debate: no`. Built from `brief.md`, `design.md` and the live checkout at `9ea5dd0ae720970b37e0175d7b109c913d29a242`. No positions or rebuttals exist. Brief and locked design agree, so no conflict note. Concrete case: framework leaf `emdash-conversion` ran a 15-minute repo-wide suite at least 6 times across seats and rounds because C1 named `framework:verify` and `implement-issue/SKILL.md:52` forced a full-suite rerun after every repair; `merge_checks` (5375dbe) already exists as the merge-only home.

## Decisions

- D1: Prose-only across 7 files. Edit the owned surfaces in place, no new file, section, CLI verb, record file or phase guard (Q1 Off route). `src/` and `tests/` stay unchanged unless the existing suite needs a fix to stay green (expected none).
- D2: Term rule. Use `every checks command` for the pre-review set and `merge_checks` for the merge-only set. No new tier name. Keep two correct `full suite` uses: `brief-template.md:39` (do not substitute a full suite for targeted tests) and `init-akrogon/SKILL.md:20` (slow full-suite commands belong in `merge_checks`). Every other `full suite` / `full-suite` hit under `skills/ docs/guide` is replaced.
- D3: Implement-end proof (Q2 2a). `implement-issue/SKILL.md:48` states: after the last unit with worker worktrees gone, A supplies passing proof for every done-criterion, runs the changed tests including affected consumers and every `checks` command, reuses unchanged evidence; `merge_checks` run only at merge unless a done-criterion itself needs a whole run. `SKILL.md:52` second clause (`a full-suite rerun follows a repair...`) is deleted; the `checks` blocks / `advisory` Nits clause stays.
- D4: Repair proof (Q2 2a). `implement-issue/SKILL.md:62` (`check.fix`) states the same 2a obligation after every repair: criterion proof, changed tests with affected consumers, every `checks` command, unchanged evidence reused, `merge_checks` only at merge unless a criterion needs a whole run. Shared-context `SKILL.md:34` replaces `a red full suite sub-brief` with a red criterion-proof / `checks` sub-brief, keeping the slow-run in-branch fix reference. `worker-protocol.md:27` becomes: a red criterion proof or `checks` command becomes one more sub-brief with failing output pasted, worker repairs with changed tests, A reruns that proof and `checks`.
- D5: Delegation boundary. `SKILL.md:42`, `brief-template.md:37`, `worker-protocol.md:11,25`: workers receive only the resolved changed-test command; A owns criterion proof plus every `checks` command after the final worker. `worker-protocol.md:11` tail becomes `before criterion proof, checks and akrogon phase`. `brief-template.md:39` stays byte-meaning-unchanged.
- D6: Chart audit (Q3 3a). `shapes.md:132` placeholder names only leaf-owned proof and excludes a `merge_checks` command and repo-health claims. `shapes.md:170` audit refuses a criterion citing a `merge_checks` command or claiming repo health outside leaf ownership, allows a repo-wide `checks` command only when the chart names the property no smaller test proves, and deletes the `a leaf needing a larger repo-wide command gets it added to checks first` sentence. This supersedes `red-criterion.md` Q1 1a on that sentence; its reason still holds because merge runs `merge_checks` before every push (`merge-issue:33`).
- D7: Mirrors state the same schedule. `skills/AREA.md:22`, `docs/guide/phases.md:91`: A runs changed tests as work lands, then criterion proof plus every `checks` command before review and after repair, reusing unchanged evidence; `merge_checks` only at merge unless a criterion needs a whole run. `docs/guide/merge.md:3`: B rebases then runs every `checks` command, then every `merge_checks` command.
- D8: Exclusions stay byte-unchanged, verified by empty diff: `skills/merge-issue/SKILL.md` (both maps at merge), `skills/check-issue/SKILL.md` (rerun only on code change, missing evidence or a concern), `skills/init-akrogon/SKILL.md:20`, standing-design.md. `AREA.md` keeps 4 sections and 40-line cap.
- D9: No vanity test. No test asserts skill or guide wording (check-issue:45, LESSONS 2026-10-01). Proof is the C1 grep plus judgment, a read of each changed rule against Q2/Q3, and the existing blocking checks.

## Read-first paths

- `docs/reference-index.md`
- `skills/AREA.md`
- `tests/AREA.md`
- `learnings/LESSONS.md`
- `skills/implement-issue/SKILL.md` (owned, lines 34,42,48,52,62)
- `skills/implement-issue/worker-protocol.md` (owned, lines 11,25,27)
- `skills/implement-issue/brief-template.md` (owned, lines 37,39)
- `skills/chart-issues/assets/shapes.md` (owned, lines 132,170)
- `docs/guide/phases.md` (owned, line 91) and `docs/guide/merge.md` (owned, line 3)
- `skills/merge-issue/SKILL.md:33-39` and `skills/check-issue/SKILL.md:51` (excluded, must stay unchanged)
- `skills/init-akrogon/SKILL.md:20` (excluded, keeps `merge_checks` placement advice)

## Needed interfaces

None. The design states literal interfaces: none. Config keys `checks`, `merge_checks`, `test_changed` are read, not changed.

## Acceptance criteria

1. `grep -rn "full suite\\|full-suite" skills docs/guide` is pasted and each match judged by meaning: none requires an undefined full suite or `merge_checks` after implement or a repair except through a done-criterion needing a whole run. `brief-template.md:39` and `init-akrogon/SKILL.md:20` may stay.
2. `skills/implement-issue/SKILL.md` states the 2a obligation for both implement end and `check.fix` (criterion proof, changed tests with affected consumers, every `checks` command, unchanged evidence reused, `merge_checks` only at merge unless a criterion needs a whole run), and the line-52 repair-rerun sentence is gone.
3. `skills/chart-issues/assets/shapes.md` audit refuses a criterion citing a `merge_checks` command or claiming repo health outside leaf ownership, allows a repo-wide `checks` command only with a named property no smaller test proves, and no longer contains the `added to checks first` sentence.
4. `skills/AREA.md`, `docs/guide/phases.md` and `docs/guide/merge.md` describe the same schedule as the skills; `merge-issue/SKILL.md:33` and `check-issue/SKILL.md:51` are unchanged.
5. `bun run format`, `bun test` and `bun run typecheck` pass; `tests/docs-links.test.ts` and `tests/command-reference.test.ts` pass unchanged.

## Ordered checklist

1. Rewrite `skills/implement-issue/SKILL.md:48,52` to the D3 implement-end 2a wording and delete the repair-rerun clause (criterion 2).
2. Rewrite `skills/implement-issue/SKILL.md:62` to the D4 repair 2a wording and `SKILL.md:34` red-sub-brief wording (criterion 2).
3. Rewrite `skills/implement-issue/SKILL.md:42`, `worker-protocol.md:11,25,27`, `brief-template.md:37` to the D5 delegation boundary, keeping `brief-template.md:39` meaning (criteria 1,2).
4. Rewrite `skills/chart-issues/assets/shapes.md:132,170` to the D6 audit rule and delete the `added to checks first` sentence (criteria 1,3).
5. Rewrite `skills/AREA.md:22`, `docs/guide/phases.md:91`, `docs/guide/merge.md:3` to the D7 mirror schedule (criteria 1,4).
6. Grep `docs/` for a restatement of the old rules (`full suite`, `added to checks first`); own or report hits instead of leaving a stale rule (criteria 1,4).
7. Diff to confirm `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/init-akrogon/SKILL.md`, standing-design.md untouched except allowed lines (criterion 4).
8. Run every blocking `checks` command and the two named test files (criterion 5).

## Affected docs

- Agent doc: `skills/implement-issue/SKILL.md` states the 2a proof schedule at implement end and repair.
- Agent doc: `skills/implement-issue/worker-protocol.md` moves criterion proof and `checks` to A, red proof becomes a repair sub-brief.
- Agent doc: `skills/implement-issue/brief-template.md` names A's separate criterion proof and `checks` run.
- Agent doc: `skills/chart-issues/assets/shapes.md` refuses `merge_checks` / repo-health criteria, gates repo-wide `checks`.
- Agent doc: `skills/AREA.md` mirrors the checks-then-merge_checks schedule.
- Human doc: `docs/guide/phases.md` mirrors A runs changed tests, then criterion proof plus every `checks` command.
- Human doc: `docs/guide/merge.md` mirrors B runs every `checks` command, then every `merge_checks` command.

## Verification

- Criterion 1: `grep -rn "full suite\\|full-suite" skills docs/guide` pasted in the report with a per-match judgment. Catches a leftover undefined full-suite requirement or a `merge_checks`-before-merge rule. Size: seconds. Rerun on any `skills/` or `docs/guide` edit.
- Criterion 2: `git --no-pager diff -- skills/implement-issue/SKILL.md skills/implement-issue/worker-protocol.md skills/implement-issue/brief-template.md` read for the 2a clauses at implement end and repair, plus `! grep -F "a full-suite rerun follows a repair" skills/implement-issue/SKILL.md`. Catches a missing proof clause or a surviving line-52 rerun. Size: seconds. Rerun on any implement-issue skill edit.
- Criterion 3: `git --no-pager diff -- skills/chart-issues/assets/shapes.md` read for the refusal, the named-property gate, plus `! grep -F "gets it added to" skills/chart-issues/assets/shapes.md`. Catches a kept prerequisite-route sentence or a missing refusal. Size: seconds. Rerun on any `shapes.md` edit.
- Criterion 4: `git --no-pager diff -- skills/AREA.md docs/guide/phases.md docs/guide/merge.md` read for the same schedule, plus `git --no-pager diff --exit-code -- skills/merge-issue/SKILL.md skills/check-issue/SKILL.md` empty. Catches a diverged mirror or an accidental edit to locked check rules. Size: seconds. Rerun on any worktree edit.
- Criterion 5: `bun run format`, `bun test`, `bun run typecheck`, and `bun test tests/docs-links.test.ts tests/command-reference.test.ts`. Catches red suite, type, format or link/reference regressions. Size: minutes. Rerun after any worktree change.
- Resolved changed-tests command: `AKROGON_BASE=9ea5dd0ae720970b37e0175d7b109c913d29a242 bun test --changed="$AKROGON_BASE"` (refresh `AKROGON_BASE` from `akrogon config` if the base moved; with the guard form from config when run as `checks.test_changed`).

## Dependencies, credentials, runtime

- Dependencies: none.
- Credentials: the design names no variable, so no `.env` presence check is required.
- Not a slow-run leaf: no restart boundaries.

## Open limitation

The schedule and audit are prose the seats and door apply; no automated check refuses a `merge_checks` run before merge or a repo-health done-criterion. A future seat that skips the rule can still rerun the same slow suite, and already-written repo-health criteria (framework `emdash-conversion` C1) stay an operator decision outside this leaf.
