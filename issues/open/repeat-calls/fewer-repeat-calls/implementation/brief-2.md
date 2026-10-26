# Sub-brief 2 (unit U2): src/next.ts read passing and root identity reuse

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u2`
Leaf: `/home/ivan/Work/infra/akrogon/issues/open/repeat-calls/fewer-repeat-calls`
Lane prerequisites already landed: `src/scope.ts` exports `Shell`, `paneShell`, optional `prior`/`shell` params; `src/config.ts` exports memoized `commonDirectory` and `remoteUrl`.

## 1. Goal

Remove repeated `pane list`/`tab list`/`pane process-info` reads inside one `akrogon next` pass where an earlier read in the same step already holds the answer with no herdr write, prompt or wait between (plan decisions D1 callers, D2, D3 `ensureWorktree`; criteria 1–3). File: `src/next.ts` only.

## 2. Numbered acceptance criteria

1. `observeBusy` returns `{ state: State; notified: boolean }` — `notified` is true only on the path that sends the `notification show` herdr call. All three call sites (`dispatchLeaf` loop, `dispatchSlot`, `recordDelivery`) destructure `.state`.
2. `dispatchLeaf` forwards its observation `live: Pane[]` to `allocate` only when no `observeBusy` call in that loop returned `notified`; `allocate(global, repo, leaf, invocation, listed?: Pane[])` uses `listed ?? (await panes(session))` for its `listed` binding and keeps `liveTabs`/`secondSeat` unchanged.
3. `allocate`'s scope sweep per recorded pane reads `paneShell` once and passes it to `inOwnScope(slice, id, session, shell)`.
4. `box(pane)` reads `const identity = await paneShell(pane.pane_id, session)` once, then calls `inOwnScope(slice, pane.pane_id, session, identity)` for the first check, `adoptShell(slice, pane.pane_id, session, identity)`, and `inOwnScope(..., identity)` on every poll iteration (the poll reads /proc only, 5 s deadline and error text unchanged).
5. `members` derives from the already-held list when `matches.length === 1` (`live.filter(pane.tab_id === tab.tab_id)`); the `panes()` re-list stays only in the `closed === true`/`matches.length === 0` paths (post-write).
6. `allocate` tracks `wrote` (set on `pane close`, `tab create`, `pane split`, `pane swap`) and returns `{ state: State | null; sight?: { panes: Pane[]; tabs: Tab[] } }` with `sight = wrote ? undefined : { panes: live, tabs: view }` when `state !== null`. `dispatchLeaf` and `broadcastPass` adapt (`allocated.state`, `allocated.sight`).
7. `dispatchSlot(..., seen?: { panes: Pane[]; tabs: Tab[] })` uses `seen?.panes ?? await panes(session)` and `seen?.tabs ?? await tabs(session)` for its `live`/`view`; `dispatchLeaf`/`broadcastPass` pass `allocated.sight`. `recordDelivery`'s `currentPane` re-read is unchanged.
8. `ensureWorktree` replaces both inline `rev-parse --git-common-dir` `command()` calls with `commonDirectory(repo.root)`/`commonDirectory(path)`; `expectedCommon === null || expectedCommon !== actualCommon` throws `Unrelated worktree: <path>` (the realpathSync wrappers drop since `commonDirectory` already realpaths).
9. Planned tests green in this worktree: `bun test tests/seat-containment.test.ts tests/next.test.ts tests/config.test.ts --timeout=30000` (the pre-committed criterion assertions: 2 process-info per boxing run, 3 `pane list`/1 `tab list` in the `neither` slice, git counts 1/1/1 for root `common-dir`/`get-url`/HEAD, changed-start refusal).
10. `bun run typecheck` clean.

## 3. Read-first list

- `src/next.ts` — `observeBusy` (~line 223), `currentPane` (~266), `ensureWorktree` (~334), `secondSeat` (~473), `allocate` (~515), `dispatchSlot` (~679), `dispatchLeaf` (~843), `broadcastPass` (~1265), `reconcileRepos` (~1482), `nextCommand` (~1582), `landedWake` (~1355)
- `src/scope.ts` — `paneShell`, `Shell`, `adoptShell`, `inOwnScope` signatures now on HEAD
- `src/config.ts` — `commonDirectory`, `remoteUrl`
- `tests/seat-containment.test.ts`, `tests/next.test.ts` (the committed criterion assertions), `tests/config.test.ts` `commonDirectory` test
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `src/next.ts` only: the signature and call-site changes in criteria 1–8. `import { commonDirectory }` already present; add `paneShell` to the `./scope` import; `type Shell` may be needed.
- Owned paths: `src/next.ts`. Depends on U1 (`scope.ts` exports) and U3 (`config.ts` memo) — both landed. No shared test resource.
- `observeBusy` shape: `Promise<{ state: State; notified: boolean }>`; `allocate` shape: `Promise<{ state: State | null; sight?: { panes: Pane[]; tabs: Tab[] } }>`.

## 5. Do-not, reasons and exceptions

- Do not edit any file but `src/next.ts` — scope/config/fakes landed already; the exception is a revised brief.
- Do not remove or reorder reads that the plan names kept: `panes()`/`members` after `closed === true` or `tab create`, `currentPane` before `agent start`, the `ready` `currentPane` before `agent prompt`, `recordDelivery`'s `currentPane`, `secondSeat` foreign reads, `panesForRepo`/`sessionPanes` in reconcile paths, `closeMergedTab`'s seated re-read — each follows a herdr write or expects outside change.
- Do not cache anything at `herdr()`/`panes()` in `src/shell.ts` — locked rejection 1a.
- Do not change `reconcileRepos`, `paneOwners`, `tab_closed` event handling, `hookScope`, `mergeTurn`, or error texts — only `observeBusy`'s return shape propagates.
- Do not write or edit tests — a red planned test is a mismatch returned to A.
- On any conflict with this brief, return a mismatch with evidence instead of widening scope; the exception is a revised brief from A authorizing the change.

Restated: one file; reuse only where zero herdr mutations intervened; keep every named fresh read; no caches, no test edits; conflicts come back as a mismatch, resolved only by a revised brief.

## 6. Ordered steps

1. Read `src/next.ts` regions listed; apply `observeBusy` → `{ state, notified }` and its three call sites (criteria 1–2).
2. Rewire `allocate` (listed param, sweep identity, box identity, members derivation, `wrote`/`sight`) and `dispatchSlot`'s `seen` (criteria 3–7). Update `dispatchLeaf`/`broadcastPass` call sites.
3. Swap `ensureWorktree`'s common-dir reads to `commonDirectory` (criterion 8).
4. `bun run typecheck`; run the test command in section 7; record results.
5. Commit with message `next: pass pane reads down inside one dispatch step` and return the sha.

Advisory size: 1 file, under 20 turns.

## 7. Commands

Run from the worktree:

- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u2 --name u2-typecheck -- bun run typecheck`
- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u2 --name u2-dispatch -- bun test tests/seat-containment.test.ts tests/next.test.ts tests/config.test.ts --timeout=30000`

Cite the printed `check <name>: <exit> <path>` lines. `u2-dispatch` must be fully green — every planned criterion assertion now has its product code.

## 8. Done-when, evidence and report

All acceptance criteria hold and both checks are green. Report with these four lines filled:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
