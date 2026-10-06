# Merged opening map: merge-turn

Sources: slots/map-A.md, slots/map-B.md, slots/map-C.md, all written blind 2026-10-05.

## Mechanism
- M1 (A,B,C) `skills/merge-issue/SKILL.md:37,39,49`: fetch, rebase, run every check, push. Git's non-fast-forward refusal is the only order and it speaks after the 30-40 minute run. `src/next.ts:626-628` prompts B for every leaf in `merge`; no per-repo limit.
- M2 (B,C) Live evidence is stronger than the seed: lane-orphan-check ran the full suite 7 times on one unchanged patch (1 red on missing deps, 1 after install, 5 after rebases), each rebase clean and each rerun green (`fw:.../lane-orphan-check/review-B.md:81,89,102,115,128`). The reruns found zero integration defects.
- M3 (A,C) `akrogon sync` (`src/sync.ts:136`) and operator "add issues" commits push issues-only commits to the same branch. (C) Merge seats write evidence and `log.jsonl` into tracked `issues/`, so the lifecycle produces the commits that invalidate it.
- M4 (A,B,C) `src/phase.ts:274-279` refuses `issues/` changes on leaf branches, so an issues-only commit and a leaf diff never overlap. (B,C) Two seats already reused evidence after `git diff --exit-code <tested> HEAD -- . ':!issues'` (`lane-orphan-check/review-B.md:139-147`, `spec-mutation-anchors/review-B.md:113`), with no rule naming it.
- M5 (A,B,C) `issues/config.yaml` defines the checks and lives inside `issues/`, so a blanket `issues/` exclusion would let a changed check list ride through.
- M6 (A,B,C) `src/next.ts:245-278` ensureWorktree installs nothing. (C) Worktrees under `issues/worktrees` resolve the registered checkout's `node_modules` by walking up, which hides the gap until `framework:verify` copies the tree. (B,C) The env-only red cost a full check.fix plus re-review with an empty diff.
- M7 (B,C) A completion wakes only `blocked-by` dependents (`src/next.ts:681`, `docs/guide/limits.md:11`). A waiting merge sibling needs a new wake path.
- M8 (B,C) Dispatch and phase moves hold the global flock briefly (`src/state.ts:139`). Holding it for a suite or an install would freeze every repo.

## Outside practice (read 2026-10-05)
(A,B,C) Not-rocket-science rule via Jane Street (Minsky): landed commit = tested commit; serial costs m x n wall time; speculation and batching buy time back. (A,B,C) GitHub merge queue, GitLab merge trains, Zuul: speculative parallel runs, restart cascade on failure, need spare CI capacity. (C) bors-ng: batch, test once, fast-forward to the tested commit, bisect on red. (A) firstmate#4453: identical symptom on one machine; "a simple serialized queue is enough at the volume of a single-machine fleet". (B,C) Nx, Bazel, Aviator, Mergify: skipping runs is safe only with declared inputs. (B,C) Bun frozen install, hardlinked cache: warm install is near free.

Synthesis (A,B,C): on one machine, parallel speculation competes for the same CPU (9 concurrent verifies observed), so a command-owned per-repo merge turn is the practitioner answer at this scale. Batching is the only option that also cuts total wait.

## Forks
1. merge-order (A,B,C): who orders merges, and where waiting leaves wait. Turn (A,B,C recommend) / batch / speculative train / skill-held lock (A,B,C reject).
2. issues-only (A,C vs B): reuse when tree outside `issues/` is identical and `checks`/`merge_checks` unchanged (A,C) / all writers wait for the turn (B) / move `issues/` off the code branch (A,B,C: too wide) / rerun always.
3. dependency-setup (A,B,C differ): repo `setup` command run at worktree creation and after rebase (A,B) / consumer check commands install themselves (C leans) / shared node_modules (A,B,C reject).
4. turn-release (B,C): release on merged, check.fix, failed; stuck holder; lost push reply before `merged`; re-entry order after check.fix.

## Pitfalls
- R1 (A,B,C) A stuck holder blocks every merge in the repo.
- R2 (B,C) Turn released on `merged` but seat died after push: recover from remote ancestry.
- R3 (B,C) Install or suite under the global lock freezes all phase calls.
- R4 (A,B,C) Waiting leaves with live tabs count toward `max_active`.
- R5 (C) Lockfile changed by rebase makes a once-only install stale.
- R6 (A,B,C) A turn does not prevent rebase conflicts. It surfaces them once, on the final base; `SKILL.md:41` stays.
- R7 (C) Serial runs on a 3-hour backlog still cost m x n wall time.
- R8 (C) Two unexplained SIGTERM kills at ~10 minutes may be harness tool timeouts; serial long runs must be able to finish.
