# Review B — command-deletions-batch

Base: `26a7bc2613af4a2c9d579351bc66e87cd1af1427`
Head: `cf96418` (21 files, +511/−590)

## Evidence

- `bun test`: 217 pass / 0 fail, artifact `/tmp/akrogon-command-deletions-batch-test.log`.
- Done-criterion greps clean: `seatFor|peerOf|recoverMerge|withRepoLock|issues/.lock|repo_max_active|perRepo` absent from `src/`; `stand-in|other pane` absent from `docs/guide/`.
- AREA.md path check: all 18 paths named by `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md` exist from repo root.
- Repo-wide sweep: remaining `stand-in`/`withRepoLock`/`recoverMerge` mentions are confined to `issues/closed/` artifacts and audit notes, not live surface.

## Findings

No Fix findings.

### Verified behaviors

- `src/routing.ts`: `failed.next` covers the six exits; `check.fix` refused from `failed`.
- `src/phase.ts`: `fix_rounds` resets on any `failed` exit; `requireCodeOnly` refuses empty diffs naming the target; `recoverMerge` deleted.
- `src/next.ts`: stand-in/peer/seat block deleted; `dispatchSlot` early return on non-idle is equivalent to the old unreachable `continue`; debate gate throws per-leaf, caught by the dispatch `try` and reported as `skipped`, so one misconfigured leaf cannot abort the sweep; `hooked = event !== undefined` and deleted-pane `pane get` failure → `skipped` match prior behavior.
- `src/state.ts`/`pull.ts`/`sync.ts`: `withRepoLock` and `issues/.lock` removed; `sync.ts` wraps the three lock checks in `lockPaths.length > 0`, which is required because an empty pathspec would make `git ls-files` list every tracked file.
- `src/config.ts`: `repoSchema` drops `max_active`; `effectiveConfig` spread no longer reintroduces it; repo-level `max_active` is rejected with stderr naming the key.
- Tests: `fetch-deadline-harness.ts` deletion is consistent with plan D10 (its only scenario was `recoverMerge`'s fetch deadline); probe lock paths moved to `f.home/.lock`; `attempts` equality and `busy_notified` assertions cover the new contract.
- Docs: eight guide files updated; per-repo `max_active`, stand-in, and `issues/.lock` references removed; `problems.html` retry advice now says the leaf fails after three tries.

### Nits

None.

## Verdict

ready
