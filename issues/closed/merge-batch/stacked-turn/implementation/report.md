# Implementation report — stacked-turn

Delegated run: two sub-briefs in one wave (U1 `src/`, U2 docs/skill), then an A-side contract repair pass on the leaf branch.

## Changed files and reasons

- `c0fa7fd` feat (U1, worker): `src/state.ts` `batchSchema` + `members {slug, base, head, tip}`; `src/attempts.ts` `members` union field, `readAttempts`, `redMemberHeads`; `src/batch.ts` `buildStack` member stacking + `pickMembers` + `move`/`branchSha` exports; `src/next.ts` member snapshot in `mergeTurn`, apply-time drift filter + rebuild loop, `mergeContext` ` members=`, `reconcileBatch` member moves + dependent dispatch; `src/phase.ts` record-aware `requireBatchTop`, per-member original-range trailer checks, push-time member drift refusal, `restack` re-snapshot, green/landed-verify member moves, stacked `check.fix` red ending.
- `6de1e18` docs (U2, worker): `skills/merge-issue/SKILL.md` merge section rewritten to the stacked contract; `src/AREA.md`, `docs/guide/{merge,next,phases,state,files}.md` updated.
- `7f2ee05` fix (A repair of U1 contract deviations):
  - `buildStack` members rebase via `rebase --onto <tip> <base> <head>` with `rebase --abort` on conflict — the worker's `git merge --no-edit` violated locked design D2 ("rebase, never merge"); caught because the planned green test wrongly asserted `isAncestor(member.head, top)`, impossible under rebase; the test was corrected instead.
  - Removed the invented `landed`/`reconcileOnly` deferral in `phaseCommand`/`mergeWake`/`mergeTurn`/`mergePass`/`akrogon.ts` — an unconditional `mergePass` after a committed move is the pre-existing contract; the deferral reintroduced the wait this leaf removes.
  - `reconcileBatch` member moves use `move()` — the worker's `update-ref` left member worktrees dirty so merged cleanup could never reap them (the door note requires `git branch -d` to work post-landing).
  - `Batch.members` is the required `z.infer` field; dropped the `Omit` type + `readState` strip so parsed state can't lie about `members`. Test literals carry `members: []`.
  - `pickMembers` records degenerate members (`sha` missing or `== built_on`) per plan D6 instead of skipping them — the old code and the design both let them ride the stack.
- `implementation/brief-1.md`, `implementation/brief-2.md`: the wave sub-briefs.

## Commands and results

| Command | Commit | Result |
|---|---|---|
| `bun run typecheck` | 7f2ee05 | 0 errors |
| `bun test tests/batch.test.ts tests/batch-dispatch.test.ts` | 7f2ee05 | 39/39 |
| `bun test <12 merge-adjacent files>` | 7f2ee05 | 223/223 |
| `akrogon run-check --name test -- bun test --timeout=30000` (full suite) | 7f2ee05 | 836/836 |
| `akrogon run-check --name format -- prettier --check` | 7f2ee05 | clean after `prettier --write` |
| `akrogon run-check --name typecheck` | 7f2ee05 | clean |
| `akrogon verify` | 7f2ee05 | green (`verify leaf 7f2ee05: green`), run 980c86c3 |

Worker returns: `/tmp/u1-report.md`, `/tmp/u2-report.md` (U2 clean; U1 returned green tests but had silently resolved contract mismatches — repaired in `7f2ee05`, listed above).

## Criterion → proof

1. Holder's record snapshots every other unstopped eligible leaf in queue order — `a clean waiting leaf stacks under the holder`, `a stopped waiting leaf is never stacked`, `the holder gets a batch record...` (batch-dispatch).
2. Prompt `members=` only when nonempty — `expectedPrompt`/`mergeText` assertions across dispatch tests.
3. Only the holder's B prompted; one verify on the stacked tree — `members=bb` prompt assertions; `mergePrompts` never contain member panes.
4. Green push fast-forwards once, moves member branches to `tip` post-landing, all stacked leaves to `merged`, one attempt line with `{slug, head}` members — `a clean waiting leaf stacks under the holder and lands with it in one push`.
5. Conflicting member skipped, waits; holder conflict → solo — `a member that conflicts with the stack is skipped`, `a holder that cannot be rebased takes a solo turn`.
6. Push-time drift → refused → restack re-snapshot — `a drifted member refuses the push and the restack drops it` (head change, stop, phase exit).
7. Red stack → `stack red; holder turn restarts alone`, member heads recorded, holder ref restored, restart-at-once — `a red stack records member heads, clears the batch and restarts the holder alone`.
8. Red-skip keyed on (head, base): same-base re-entry after head change proved via restack; old-base red head stacks on the moved base — same test + `a member head red on the old base stacks on the moved base`.
9. Crash recovery: landed candidate moves every still-merge member once — `reconcile moves every still-merge stacked member to merged exactly once`.
10. Docs/skill describe the turn — U2 commit; `tests/docs-links.test.ts` green.

## Base and head

- `AKROGON_BASE`: `f412697` (origin/main at pass start; refresh rebased `2d69806` → `672d07a` cleanly).
- Head: `7f2ee05` (`fix: restore the pinned stacked-turn contract after unit review`).

## Known limitations

- Member-branch landing (`git branch -d`) is asserted via `origin/main` ancestry, not ref existence: merged cleanup reaps the moved branches by design (door note).
- U1's report noted two test-only assertions that had to be corrected (rebase-impossible ancestry, deferred-wake dependence); both corrections are in `7f2ee05` with `Test-Change:` trailers.

## Unverified criteria

None.
