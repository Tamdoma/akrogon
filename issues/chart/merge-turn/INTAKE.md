# Intake: merge-turn

## Scope
Destination akrogon. Merges in one repo stop invalidating each other's check runs, issues-only commits on main stop forcing full reruns, and a fresh leaf worktree can run the configured checks without a repair round. One completion owner for Tamdoma/akrogon#57.

## Provenance
- GitHub: Tamdoma/akrogon#57
- Operator: 2026-10-05 chart-issues invocation

## Source: Tamdoma/akrogon#57
# Leaves merging at the same time each rebase and re-run the full check suite repeatedly; one leaf sat 3 hours in merge with no code change

Source: Tamdoma/akrogon#57
URL: https://github.com/Tamdoma/akrogon/issues/57

Unverified intake.

## Observation
On tamdoma/framework on 2026-10-05, several leaves of the epic `skill-rewrite-tooling` reached `merge` within about an hour of each other. Each merge seat (B) ran the full configured checks, including `bun run framework:verify` (30 to 40 minutes when the machine is quiet). When another leaf, or an operator commit, landed on `main` during that run, the seat rebased and ran the full suite again.

- `lane-orphan-check` entered `merge` at 13:57Z and was still in `merge` at 16:53Z, about 3 hours, with no code change after review. Its merge evidence holds `rebased`, `rebased-2`, `rebased-3`, `rebased-4`, and at 16:43Z it started another full run after `spec-mutation-anchors` merged.
- `spec-mutation-anchors` has four rebase evidence folders (`rebased-7e1e3cda4`, `rebased-db7cf0fd9`, `rebased-1e53697b4`, `rebased-fee844f58`) before it merged at 16:28Z, about 2.5 hours after entering `merge`.
- Operator commits that touch only `issues/` (`add issues` at 15:16Z, 15:53Z and 16:41Z) also moved `main` and were followed by new rebase folders and full re-runs.
- About 9 `bun run framework:verify` processes were running at once at 13:07Z, so each run was slower than a solo run.

A second condition added merge round trips. Fresh leaf worktrees have no `node_modules`, so the first merge `framework:verify` failed with `Cannot find package 'markdown-it'`. B sent the leaf back to `check.fix`, and seat A ran `bun install --frozen-lockfile` and re-ran the suite. Confirmed in the merge evidence of `context-acceptance`, `render-ready-loud`, `lane-orphan-check` and `size-fixture-boundary`. That is about one extra fix-and-review round each (30 to 60 minutes).

## Location
- `skills/merge-issue/SKILL.md` lines 37, 39 and 49 (rebase, run every `checks` and `merge_checks` command, push fast-forward only, and repeat fetch/rebase/checks after a non-fast-forward rejection).
- `src/next.ts` `ensureWorktree` (line 245 at `923c6c9`): `git worktree add` then `linkEnv`, with no dependency install.
- `src/config.ts` `repoSchema`.
- Observed in tamdoma/framework `issues/open/skill-rewrite-tooling/*/merge-evidence` and `issues/log.jsonl`.

## Reproduction
1. Use a consumer whose `checks` or `merge_checks` take tens of minutes.
2. Let three or more leaves reach `merge` close together, or commit to `main` while one is merging.
3. Count full check runs per leaf in `merge`. Observed above: four to five full runs for one leaf, with no code change.

Frequency: every time several leaves merge close together. For the missing install, every fresh leaf worktree in a consumer whose checks need installed packages.

## Expected behavior
Each leaf runs the full merge checks about once on the commit it pushes. A leaf whose code has not changed does not stay in `merge` for hours because of other merges or commits touching only `issues/`. A fresh leaf worktree can run the configured checks without a fix round.

## Urgency
High for repos with slow checks. Merge time grows with the number of leaves merging at once, and the parallel suites slow each other down. The epic's merges took 2 to 3 hours per leaf instead of about 40 minutes. Workarounds: avoid committing to `main` while leaves merge, and have seat A run `bun install --frozen-lockfile` before checks.

## Suspected cause
Main condition: merge-issue relies on ordinary git non-fast-forward refusal to serialize competing pushes (line 39), and the full check run happens between fetch and push (lines 37 and 49). With N leaves merging at once, at most one push wins per round. Every other leaf rebases and re-runs every check, so total check runs grow roughly with N squared, and the runs overlap and slow each other. Contributing conditions:

1. A rebase onto commits that change only `issues/` is treated as a change requiring a full re-run. Line 51 allows reusing an unchanged successful run only "when neither code nor integration changed", but nothing mechanical decides that, so seats re-run.
2. `ensureWorktree` creates the worktree without installing dependencies, and `repoSchema` has no setup step, so the first full check in a fresh worktree fails on missing packages.

Whose view: both (operator observation, agent inspection).

Files read: `skills/merge-issue/SKILL.md` (identical to the linked copy at `~/.codex/skills/merge-issue/SKILL.md`), `src/next.ts` lines 245 to 290, `src/config.ts` `repoSchema`, plus tamdoma/framework merge evidence folders and `review-B.md` files.

Not inspected: whether B logs record the non-fast-forward push rejections themselves (rebase folders were used as the signal). The cause of two SIGTERM (exit 143) merge-check terminations on `slice-boundary-anchors` and `spec-mutation-anchors` was not established and may be separate. Seat logs showing rebases with no intervening `main` change would disprove the main condition.

Related reports:
- Tamdoma/akrogon#48 (closed): the same slow check re-runs in every seat and round. It covers per-seat re-runs and keeps merge as the hard gate on the final rebased commit, but not concurrent merges re-running each other.
- Tamdoma/akrogon#50 (closed): check evidence still unrecorded after #48.

Searched Tamdoma/akrogon, all states: own reports created on or after 2026-10-03 (limit 30); "merge rebase checks" (limit 10); "worktree install node_modules" (limit 10, none found).

## Source: operator 2026-10-05
I just pulled an issue From another repo.This is a pretty big issue, because it seems that the merges are causing other leaves that are in the merge process to redo the testing because the main had changed. Please look into this and see if we can come up with an elegant solution to avoid that completely. While also making sure that everything merges correctly, there are no issue conflicts etc. The slot B and slot C consultants are already spawned in your herder tab. Use both of them.

## Agent findings
See slots/map-merged.md (merged A, B, C opening maps).
