# Plan: command-deletions-batch

Debate is off (`debate: "no"`); this plan synthesizes the brief and locked design directly. Eight change groups delete dead machinery and replace hand edits with commands. Valid input behaves as before except where a group names the change.

## Read first

- `issues/open/command-deletions/command-deletions-batch/brief.md` and `design.md` (binding decisions verbatim)
- `src/next.ts` — `busy`, `dispatchSlot`, `dispatchLeaf`, `activeCount`, `allocate`, `nextCommand`, `seatFor`, `peerOf`
- `src/phase.ts` — `commitMove`, `requireCodeOnly`, `recoverMerge`, `phaseCommand`
- `src/routing.ts` — `routing.failed`
- `src/state.ts` — `withLock`, `withRepoLock`
- `src/config.ts` — `repoSchema`, `effectiveConfig`
- `src/pull.ts` — `pullRepo`; `src/sync.ts` — `syncCommand`, `lockPaths`
- `tests/helpers.ts`, `tests/fake-herdr.ts` — fixtures; `agent_status: 'unknown'` already supported
- `tests/next.test.ts`, `tests/phase.test.ts`, `tests/sync.test.ts`, `tests/config.test.ts`
- `docs/guide/{phases,problems,next,setup,cheat,in-practice,install,limits}.html`
- `learnings/LESSONS.md`

## Decisions

- **D1 — Unknown pane waits like a busy pane.** `busy(pane)` in `src/next.ts` becomes `agent_status === 'working' || 'blocked' || 'unknown'`; `idle` unchanged. Delete `seatFor`, `peerOf`, the `!idle` branch in `dispatchSlot` that set `attempts[slot] = 2`, and the merge-seat early return in `dispatchLeaf`. `dispatchSlot` reads `currentPane(recorded.pane[slot])` and calls `observeBusy`/`launch` with `slot`. With busy ∪ idle covering all five statuses, `pane.agent !== null && busy(pane)` returns; the post-start recheck collapses to `if (!idle(ready)) return;`. An `unknown` pane now starts the busy clock and gets the 60-minute notice.
- **D2 — `failed` exits by command.** `routing.failed.next` = `['plan.positions', 'plan.rebuttal', 'plan.synthesis', 'implement', 'check.review', 'merge']` (no `check.fix`, `merged`, `failed`). `commitMove` fix_rounds: `to === 'check.fix' ? recorded.fix_rounds + 1 : recorded.phase === 'failed' ? 0 : recorded.fix_rounds`. The `failed` slot waiver in `transition` stays.
- **D3 — Merge recovery deleted; empty branches refused.** Delete `recoverMerge` and its call in `dispatchLeaf`; the `merged` check reads `state.phase` directly. A merge leaf whose A pane is idle is re-prompted through `dispatchSlot` like any phase. `requireCodeOnly` keeps the `issues` diff first, then runs `git diff --name-only <target>...HEAD` with no pathspec and throws `Empty leaf branch: no changes against <target>` on an empty result. Remove `recoverMerge` from the `next.ts` import and drop `run`/`retryCommand`/`Result` from `phase.ts` imports (unused after deletion).
- **D4 — Per-repo `max_active` deleted.** Remove the key from `repoSchema` (strict object then refuses it in `issues/config.yaml`), the `repo_max_active` line in `effectiveConfig` (spread `repoConfig` directly), `ActiveCounts`, `perRepo`, and the per-repo check in `allocate`. `activeCount` returns `Promise<number>`; `allocate` compares `total >= global.max_active` only.
- **D5 — Debate gate.** In `dispatchLeaf`, after the `failed` notification block and before the dependency check: a leaf with `debate === 'yes'`, `phase === 'plan.synthesis'`, missing `positions-A.md` or `positions-B.md` throws `Debate leaf skipped its debate: <slug>; set phase: plan.positions`. The existing catch reports it and returns `'skipped'` → exit 1, before any tab, pane or worktree is created. The `debate` key, template and guide lines stay.
- **D6 — Repo lock deleted.** Remove `withRepoLock` from `src/state.ts` and its callers: `phaseCommand` and `syncCommand` keep `withLock(globalHome()/.lock)` around their bodies; `dispatchLeaf` and `pullRepo` run their bodies directly. `sync.ts` `lockPaths` holds only the global lock path when inside the repo, and the three tracked/incoming/replayed lock checks run only `if (lockPaths.length > 0)` — an empty pathspec makes `git ls-files` list every tracked file and would break sync for any repo not containing the global home. The `basename === '.lock'` staging exclusion, `**/.lock` pathspec and `src/init.ts` `.lock` ignore line stay.
- **D7 — Hook path.** `nextCommand`: `const hooked: boolean = event !== undefined;`. Selection, `paneOwners` and the `input === undefined && hookPane !== undefined` branch stay. A typed `akrogon next` inside a leaf pane now sweeps the current repo and runs `cleanupRepos` like a typed `next` anywhere else.
- **D8 — Guide lines.** Delete the stand-in why box (`phases.html:74`), the stand-in sentence in the attempts row (`problems.html:60`), the per-repo `max_active` clause (`next.html:65`), the commented `max_active` line (`setup.html:65`), and `max_active` from the repo config comment (`cheat.html:89`). The `phase: failed` row (`problems.html:61`) names `akrogon phase <slug> <phase>` as the exit. Per the design's deleted-machinery rule, also remove the repo-cap sentences in `in-practice.html:106`, `install.html:80` and `limits.html:59` — the brief's five-file list is not exhaustive against that rule. `phases.html:66` and `in-practice.html:86,120` keep `akrogon phase <slug> implement`, still a valid exit.
- **D9 — Test deletions and rewrites.** `next.test.ts`: `:257` drops the peer-pane assertion (all three prompts same pane); the `:369` loop splits — `idle`/`done` keep clearing assertions, `unknown` keeps `agent: 'fake'` and asserts no prompt, unchanged attempts, `busy_since` set; `:398` and `:430` rewritten to expect waiting with `busy_since`, no peer prompt; per-repo `max_active` cases `:534`, `:571`, `:589` deleted, `:609` rewritten on the global cap only; gh probe locks `:673`, `:906`, `:1509` and `REMOVE_BEFORE_LOCK` `:1298` point at `resolve(f.home, '.lock')`; `:1065` drops the `repo` scope; typed-`next` cases `:472`, `:524` now expect the merged leaf's tab closed and worktree removed in the same run. `phase.test.ts`: probes `:267`, `:541`, `:546`, `:634` → `f.home/.lock`. `sync.test.ts`: `:25` expects clean status; `locksFree` checks the global lock only; `:246` covers the global lock; `:273-283` deleted; the `:303` location loop drops `issues/.lock`; `:147` drops `issues/.lock` (`issues/nested/.lock` keeps basename coverage). `config.test.ts`: `:19-32`, `:56` drop `repo_max_active`; new case asserts a repo `max_active` key fails parse naming the key.
- **D10 — `tests/fetch-deadline-harness.ts` deleted.** Note for review: the design says repoint it to the global lock, but its only scenario is `recoverMerge`'s fetch deadline, which D3 deletes — `next` dispatch then holds no `retryCommand` call. Keeping it means inventing a new scenario; deleting it with its `next.test.ts:1310` test is the merge auto-recovery test deletion the brief's Tests section requires.

## Ordered checklist

1. `src/routing.ts` — `failed.next` list.
2. `src/config.ts` — drop `max_active` from `repoSchema`; `effectiveConfig` spreads `repoConfig`.
3. `src/state.ts` — delete `withRepoLock`.
4. `src/phase.ts` — `commitMove` fix_rounds; `requireCodeOnly` empty-diff check; delete `recoverMerge`; `phaseCommand` single lock; trim imports.
5. `src/pull.ts` — unwrap `pullRepo`; trim import.
6. `src/sync.ts` — single lock; `lockPaths` global-only with the `length > 0` guard.
7. `src/next.ts` — `busy` + `unknown`; delete `seatFor`/`peerOf`/`!idle` branch/merge-seat block/`recoverMerge` call/`withRepoLock` wrap; `activeCount` → number; `allocate` global cap; debate gate; `hooked = event !== undefined`.
8. `tests/` — edits and deletions per D9–D10; new cases for done-criteria 2, 3, 4, 5, 6, 7, 9.
9. `docs/guide/` — edits per D8.
10. Verify: `bun run format`, `bun run typecheck`, `bun test`, then `bash -o pipefail -c 'bun test 2>&1 | tee /tmp/akrogon-command-deletions-batch-test.log'` and the two done-criterion-1 greps.

## Acceptance criteria (from done-criteria)

1. `grep -rn "seatFor\|peerOf\|recoverMerge\|withRepoLock\|issues/.lock\|repo_max_active\|perRepo" src/` empty; `grep -rn "stand-in\|other agent's pane\|other pane" docs/guide/` empty.
2. Test: `unknown` pane → no prompt, unchanged attempts, `busy_since` set.
3. Test: `phase <slug> plan.synthesis` on `failed` → attempts `{A:0,B:0}`, `done:[]`, `fix_rounds:0`; `phase <slug> check.fix` on `failed` → illegal move, no state/log write.
4. Test: `phase <slug> check.review --slot B` on `implement` with HEAD == target → refused naming target, no state/log write.
5. Test: `next` on `merge` leaf, branch ancestor of target, A idle → prompts A, phase unchanged.
6. Test: `next` on `debate: yes` at `plan.synthesis` without positions files → exit 1, prints slug + `plan.positions`, no tab/pane/worktree, state unchanged; with both files → dispatches.
7. `akrogon config` has no `repo_max_active`; repo `max_active` key fails parse naming it.
8. Every gh probe asserts the global `.lock` under `AKROGON_HOME`; no test or source names `issues/.lock`.
9. Test: typed `next` with `HERDR_PANE_ID` on a leaf pane, no event → sweeps repo and removes a merged leaf's worktree.
10. `bun test`, `bun run typecheck`, `bun run format` pass.
11. Test run tee'd to `/tmp/akrogon-command-deletions-batch-test.log`, exit 0, path recorded in the report.

## Open limitation

Two overlapping `akrogon pull` runs are no longer serialized; the worst case is a file-not-found error on one with correct seeds on disk (accepted in design 4a). A merge session that dies after pushing is re-prompted and records `merged` itself — correct only because the merge skill is idempotent through push.

Dependencies: none. Credentials: none.
