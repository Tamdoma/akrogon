# Implementation report: docs-reference-records

Base `0680fda60062a72354f09c08a6c8f5ebe3fd00bd` (origin/main, unchanged at both refreshes). Head `6bb7a45803eaabc52ddcf4649bb4db8a53488082`. No refresh moved the branch.

Mode: delegated, wave 1 = U1, U2, U3 in parallel worktrees `<worktree_store>/docs-reference-records-u1..u3`; wave 2 = U4. All worker worktrees removed.

## Changed files

| Commit | File | Unit | Reason |
|---|---|---|---|
| a41cb174 | docs/reference/files.md | U1 | issues/ layout, record files, repo JSONL records, timing and flaky reports, worktree store (D7) |
| dde8cb56 | docs/reference/state-and-phases.md | U2 | phase table with who moves each, how a move works, every stateSchema field, nested records (D5, D6) |
| 17831e76 | docs/reference/releases-and-updates.md | U3 | release vs checkout, following main, deploy triggers, failed deploy report, rollback pointer (D8) |
| 6bb7a458 | docs/reference/limits.md | U4 | what Akrogon does not do, what stays the operator's job (D9) |

No other path changed. No tests changed.

## Sources per page (for B's line-by-line check)

Workers returned file:symbol sources for every claim group; summarized here.

- files.md: `src/config.ts` (config.yaml, ISSUE/EPIC slots lookup, `worktreeStore`), `src/pull.ts` + `src/sync.ts` `eligibleRecord` (seeds/, sync exclusions), `src/state.ts` (leaf depth 2 or 3), `src/park.ts`, `src/phase.ts` `ownerScope`/`packFolder` + `src/pack.ts` + `src/evidence.ts` (closed/ and evidence pack, `akrogon log`), `src/readiness.ts`, `src/run-check.ts` (log name and status line), `src/log.ts`, `src/timing.ts`, `src/attempts.ts`, `src/verify.ts` (JSONL records), `src/timing-report.ts` + `src/akrogon.ts` timing case (timing report forms), `src/flaky.ts` (flaky report), skills plan-issue, implement-issue (+ brief-template.md), check-issue, merge-issue, chart-issues (record writers).
- state-and-phases.md: `src/routing.ts` (`routing`, `requiredSlots`), `src/phase.ts` (`transition`, `commitMove`, `moveGuards`, `announceFailed`, `phaseCommand`, `commandMerged`), `src/land.ts` `handOff`, `src/next.ts` (`observeBusy`, `ensureWorktree`, `allocate`, `dispatchSlot`, merge turn, reconcile, `broadcastPass`, debate-leaf refusal), `src/reconcile.ts` (worktree clear), `src/turn.ts` (`merge_stamp`, deps), `src/config.ts` (rebuttal default), `src/state.ts` schemas, `skills/merge-issue/SKILL.md`, `skills/chart-issues/assets/shapes.md`.
- releases-and-updates.md: `src/release.ts` (`releasesDir`, `currentLink`, `ensureCurrent`, `buildRelease`, `pruneReleases` with 24h lifetime, `writeDeployFailure`), `src/install.ts` `planSkillLinks`, `src/self-update.ts` (`selfUpdate`, `gitStage`, `moveCheckout`, `deployStage`, printed strings), `src/next.ts` (`nextCommand`, `mergeWake`, `landedWake`), `src/status.ts` (deploy failed line), `src/rollback.ts`.
- limits.md: `src/next.ts` (resume/unpause selection, `dispatchDependents`, sweep order, `blockDetail`, `activeCount`/`allocate`, inputs refusal, pause guards), `src/pause.ts`, `src/park.ts`, `src/phase.ts:311` (no `--slot` out of failed), `src/akrogon.ts` (pause/unpause/stop/start/park/unpark cases), skills chart-issues, check-issue (lines 29, 31, 67, 83, 97), learn-issues, watch-issues.

A spot-checked against code: `commitMove` clears and counters (src/phase.ts:137-153), every quoted self-update/deploy message string (src/self-update.ts, src/status.ts), fetch/push failure text (src/self-update.ts:332-333), 24h prune lifetime (src/release.ts:150), timing usage line (src/akrogon.ts:177), stop/start/park/pause/rollback/flaky command cases, lesson lines left for the operator to commit (skills/check-issue/SKILL.md:67, 97).

## Decisions taken while writing

- D5 `failure.cause: attempts`: grep found only one writer, `cause: 'blocked'` in `src/phase.ts` `transition`. `attempts` is read in `src/next.ts:734-738` and never written, so the page documents only `blocked`.
- `phase` field: besides `akrogon phase`, the command's own land run moves a leaf to merged (`commandMerged`). The page says "only akrogon commands change it" and names both.
- Failed deploy: code shows a failure at or before `flip` leaves `current` on the active release, while a failure in `reload` or `record` happens after the flip. The page states this precisely rather than the brief's broader "active release stays in place".
- Old README and guide claims not carried, because code contradicts them: deploy on any `akrogon next` (a Herdr-hook `next` does not self-update), checkout move by `git reset --keep` (code uses read-tree plus update-ref), the old cleanup-timing limit, the "old priority values" note.

## Criteria and proof (head 6bb7a458)

| Criterion | Command (plan.md) | Result |
|---|---|---|
| C1 pages exist and cover subjects | c1-pages | `check c1-pages: 0 implementation/check-c1-pages-1792766455111-561197.log` (red at synthesis: `check-c1-pages-1792766098430-537552.log`). Coverage: B review against D5–D9 |
| C2 pictures with alt text | c2-pictures | `check c2-pictures: 0 implementation/check-c2-pictures-1792766455201-561251.log` (red at synthesis) |
| C3 no dates | c3-no-dates | `check c3-no-dates: 0 implementation/check-c3-no-dates-1792766455279-561314.log` (red at synthesis) |
| C3 no retired surface | `bun test --timeout=30000 tests/hold-retired.test.ts` | `check c3-retired: 0 implementation/check-c3-retired-1792766455816-561462.log`, 6 pass |
| C3 every statement matches src/skills | B line-by-line review | sources listed above |
| Links resolve (review aid) | links-all over docs/reference/*.md | `check links-all: 0 implementation/check-links-all-1792766455367-561370.log` |

Worker targeted checks (dates, links, prettier per page) all exit 0, logs `implementation/check-u{1..4}-*.log`. U1's link check exited 1 in its own worktree only because `state-and-phases.md` was not yet there (expected per brief), green after landing (links-all).

## akrogon verify

`akrogon verify` on head 6bb7a458, wall time 2m44s: `verify leaf 6bb7a45803eaabc52ddcf4649bb4db8a53488082: green`.

- format: `implementation/check-format-1792766461127-562045.log` (exit 0)
- test: `verify test: 0 implementation/check-test-1792766620489-562045.log` (1115 pass, 0 fail)
- typecheck: `verify typecheck: 0 implementation/check-typecheck-1792766622793-562045.log`

## Known limitations

- `tests/docs-links.test.ts` does not scan nested docs yet (retarget owned by docs-reference-commands); links checked by links-all above and B review.
- limits.md dropped old-guide claims on sync, delivery retry and broadcast details because the worker could not trace them in its sources; these subjects have other homes in the page map.

## Unverified criteria

- C3 "every statement matches" is by design proven by B's per-page review.
