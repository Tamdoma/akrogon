# Plan: scratch-copy-removal

Direct synthesis (`debate: no`): this plan is built from brief.md and design.md only.

## Decisions

D1. Scratch copies are force-removed by owner state, never by `worktreeRemovable`. In `src/reconcile.ts`'s candidate loop, a `verify-*` copy is removed with `git worktree remove --force` unless its verify record is open (`end === undefined`) and its owner is alive (`ownerDead` false); a missing record removes like a dead owner. A `batch-*` copy is removed with `--force` when its owner record `<copy>.owner` is absent or unparsable, or names a dead owner; it stays while the owner is alive. `removeWorktree` gains a `force` parameter and the uncommitted/rebase/unreachable guards in `worktreeRemovable` are skipped on the forced path. (brief 1, 4, 9; design Q1, Round 2)

D2. A `<slug>-u<N>` copy is removed with `--force` only when the owner leaf is `merged`; a `failed` owner keeps today's guarded `removeWorktree` so `unreachable commits` (or another guard reason) is what `status` reports. Leaf slugs are resolved before the worker regex — the existing `leafBySlug.get(name)` and leaf branch order already does this and the plan keeps it. (brief 5, 6; design Q2)

D3. Live checks run before every scratch removal and before every candidate `removeWorktree` call: pane list unavailable (`live === null`) keeps everything as today; a live pane with `cwd` inside keeps with `live pane inside`; a process of this user with `cwd` or an open fd inside keeps with `process <pid> inside`. (brief 7, 8; design Q2 2a)

D4. `processesInside(paths)` in `src/reconcile.ts` reads `procRoot()` (from `src/scope.ts`) once per pass: for each numeric `<pid>` entry owned by this uid, it resolves `cwd` and every `fd/*` symlink target, skips unreadable/missing entries, and returns the paths that have at least one surviving pid. The store-sweep leaf reuses it. (design leaf architecture, shared helper)

D5. The build owner record lives at `<worktreeStore(repo)>/batch-<id>.owner` in `ownerSchema` JSON (`pid`, `boot_id`, `started`), written atomically (tmp + rename) by `buildStack` before `createSparseWorktree` and removed with the copy in `buildStack`'s `finally`. Reconcile also sweeps orphan `batch-*.owner` files in the store: a record whose copy is gone is deleted when its owner is dead and kept when the owner is alive, covering the write-to-add window. (design Round 2 correction, door interface)

D6. The `state.batch` name guard (`batchAttempts`) in the candidate loop is removed. It never protected a live build — `buildStack` mints a fresh `batch-<uuid>` unrelated to `state.batch.attempt` — and under D5 the owner record is the only guard. (design Round 2 correction)

D7. Owner helpers are shared: `ownerSchema`, `Owner`, `readOwner(path)` (parsed record or `undefined` on missing/unparsable) and `writeOwner(path)` (atomic tmp+rename of the current process's record) are exported from `src/reconcile.ts`; the run-dir `.owner` loop parses through `readOwner` and `src/batch.ts` writes through `writeOwner`. No other interface changes. (design leaf architecture)

D8. Design's open question — how a test kills a verify or build owner: a `Bun.spawn(['sleep','300'])` child gives a real live pid for the live-owner case and a killed pid (`child.kill`, awaited `child.exited`) for the dead case. Pane unavailability uses the fake herdr `paneListStdout`; the process veto seeds a `cwd`/`fd` symlink inside the fixture `AKROGON_PROC_ROOT`.

## Read first

- `src/reconcile.ts` — candidate loop, `worktreeRemovable`, `removeWorktree`, `removeMergedWorktree`, `ownerSchema`/`ownerDead`, `reconcileNeedsPanes`
- `src/batch.ts` — `buildStack` copy lifecycle
- `src/verify.ts` — `readVerifyRuns`, `VerifyRun` record fields
- `src/state.ts` — `Leaf`, `State`, `batch` record
- `src/scope.ts` — `procRoot()` override surface
- `src/config.ts` — `worktreeStore`, `within`
- `tests/reconcile.test.ts` — reconcile boundary tests (this leaf's cases live here)
- `tests/batch.test.ts` — `buildStack` tests
- `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/fake-proc.ts` — fixture, pane list, proc root fakes
- `learnings/LESSONS.md` — chrome-escapes-cgroup (a process outside the slice still counts inside a path); pattern-kill (never kill by pattern)

## Interfaces

- `src/reconcile.ts`: `export const ownerSchema` (already private), `export type Owner`, `export function readOwner(path: string): Owner | undefined`, `export function writeOwner(path: string): void`, `export function processesInside(paths: string[]): Set<string>`; `removeWorktree(path, force?: boolean)`.
- `src/batch.ts` (`buildStack`): owner record at `<dir>.owner` written before `createSparseWorktree`, removed with the copy in `finally`.
- `src/next.ts` callers of `reconcile`/`reconcileNeedsPanes` and `src/run-check.ts` `.owner` writer are unchanged.

## Waves

### Wave 1

- U1 `src/reconcile.ts` + the reconcile half of `tests/reconcile.test.ts` behavior: D1-D4, D6, D7 reader part. No prerequisites. Shared resource: none beyond the suite's isolated fixtures.

### Wave 2 (after U1: needs `writeOwner`/`readOwner`)

- U2 `src/batch.ts` + the `buildStack` case in `tests/batch.test.ts` behavior: D5, D7 writer part.
- U3 docs: `src/AREA.md` (reconcile and buildStack lines), `README.md` (reconcile paragraph names scratch copies and the build owner record). Independent files of U2.

The run delegates: wave 1 is one unit, wave 2 is two units with disjoint paths and no shared test resource.

## File/criterion checklist

- `src/reconcile.ts` — D1-D4, D6, D7
- `src/batch.ts` — D5, D7
- `tests/reconcile.test.ts` — criteria tests (already committed on this branch)
- `tests/batch.test.ts` — `buildStack` owner-record test (already committed)
- `src/AREA.md`, `README.md` — doc lines for the new removal rules

## Done-criteria → observation mapping

| # | Criterion | Proof | Command | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 | Killed `verify-*` copy at unreachable commit gone after reconcile | Store dir absent after `akrogon next --all`; record seeded with dead pid and `end`-less run | `bun test tests/reconcile.test.ts -t 'verify scratch copies are removed by owner state'` (red on base: `expect(dead).toBe(false)` got true — kept as `N unreachable commits`) | seconds | `src/reconcile.ts` changed |
| 2 | Live `verify-*` copy stays after reconcile | Store dir present after pass; `status` shows `verify <run> in progress`; copy holds an untracked file so only the live check can keep it | same test as 1 (red part asserted via `status` keep-reason once force rule exists) | seconds | `src/reconcile.ts`, `src/verify.ts` changed |
| 3 | Build paused with record+copy survives passes; killed builder loses copy and record | `sleep` child's `.owner` keeps `batch-owned` across two `next --all`; after `kill`, copy and `batch-*.owner` file gone | `bun test tests/reconcile.test.ts -t 'batch copies follow'` (red on base: `expect(owned).toBe(false)` got true — no owner concept exists) and `bun test tests/batch.test.ts -t 'owner record'` (red on base: shim at `worktree add` found no `batch-*.owner` — `buildStack` writes none today) | seconds | `src/reconcile.ts`, `src/batch.ts` changed |
| 4 | `batch-*` copy with no owner record removed | `batch-stray` copy (dirty) absent after pass | same test as 3 (`batch-stray`, `batch-gone.owner` orphan assertions) | seconds | `src/reconcile.ts` changed |
| 5 | `<slug>-u<N>` copy (unreachable commit + untracked `__pycache__/`) gone when owner `merged`; kept with `unreachable commits` when `failed` | `done-holder-u1` absent after pass; `done-holder-u2` present with `unreachable commit` reason in `status` | `bun test tests/reconcile.test.ts -t 'worker copies follow'` (red on base: `expect(worker).toBe(false)` got true — unreachable guard still applies) | seconds | `src/reconcile.ts` changed |
| 6 | Leaf slug ending in `-u<N>` handled as that leaf | `store/mine-u1` adopted as the merged leaf's worktree: removed, branch dropped, closed record cleared; a worker reading would have removed it through the wrong path or kept it | `bun test tests/reconcile.test.ts -t 'u<N>'` — green on base; proven to catch the defect under a deliberate worker-first classification break (`leafBySlug.get(name.replace(/-u\d+$/, ''))` resolved `mine` for `mine-u1`: branch kept, wrong leaf's record cleared) | seconds | `src/reconcile.ts` changed |
| 7 | No copy removed with a live pane inside or an unavailable pane list | `verify-pane` and `batch-pane` survive the unavailable pass; `verify-pane` survives with a pane inside while `batch-pane` (no pane) is removed in the same pass | `bun test tests/reconcile.test.ts -t 'pane is inside'` (red on base: dirty copy kept as `uncommitted`, no pane veto text) | seconds | `src/reconcile.ts` changed |
| 8 | Dead `verify-*` copy with a process inside stays, recorded with the pid | `status` shows the copy and the spawned child's pid; after the child dies the next pass removes it | `bun test tests/reconcile.test.ts -t 'process inside'` (red on base: `status` shows `uncommitted changes`, not the pid — no process check exists) | seconds | `src/reconcile.ts` changed |
| 9 | `verify-*` copy with no record removed like a dead-owner copy | `verify-no-record` at an unreachable commit absent after pass | `bun test tests/reconcile.test.ts -t 'no record'` (red on base: `expect(stray).toBe(false)` got true — unreachable guard) | seconds | `src/reconcile.ts` changed |

Suite checks `format`, `test`, `typecheck` run through `akrogon verify` at implement end; no done-criterion needs a whole run beyond that. All proof commands use the existing `bun test` runner on `tests/` files added in the test commit.

## Red evidence (recorded at plan.synthesis, run via `akrogon run-check --name 'test'`)

- Criterion 1/2: `expect(existsSync(dead)).toBe(false)` → `Received: true` at tests/reconcile.test.ts:571.
- Criterion 3/4: `expect(existsSync(owned)).toBe(false)` → `Received: true` at :624; batch.test.ts `expect(existsSync(record)).toBe(true)` → `Received: false` at :351 (shim reached `worktree add`, no `batch-*.owner` existed).
- Criterion 5: `expect(existsSync(worker)).toBe(false)` → `Received: true` at :648.
- Criterion 7: green base plus pane-inside segment passes today through the dirty guard; the new pane/veto assertions hold the new reasons (status shows `live pane`).
- Criterion 8: `expect(out.stdout).toContain(String(child.pid))` → `Received: ... Kept: .../verify-proc — uncommitted changes`.
- Criterion 9: `expect(existsSync(stray)).toBe(false)` → `Received: true` at :589.
- Criterion 6: green on base; red under the deliberate `leafBySlug.get(name.replace(/-u\d+$/, ''))` break — `expect((await branchExists(f, 'mine-u1')).code).toBe(1)` → `Received: 0` (worker-first reading cleared leaf `mine`'s record and never dropped `mine-u1`'s branch).
- Changed expectation: `unconfirmed verify worktrees are removed once the run ends` expects the dirty ended-run copy removed (criterion 1's force rule).

## Docs

- `src/AREA.md` — `src/reconcile.ts` and `src/batch.ts`/`buildStack` lines name owner records and the scratch force rule.
- `README.md` — the reconcile paragraph names verify/batch/worker scratch copies and the pane/process vetoes.
- `docs/guide/limits.md` cleanup line is still accurate (scratch copies are reconciler work); no guide change.
- `tests/AREA.md` — add one line for the new reconcile cases only if the file's key-file list goes stale (it already names `tests/reconcile.test.ts`; no change needed).

## Notes and limitations

- A verify copy's own `worktree` record on its leaf is untouched; only `removeWorktree`/`removeMergedWorktree` handles leaf-owned worktrees.
- The leaf's own worktree (`<slug>` dirs) is out of scope; store-sweep owns unregistered store entries, leaf temp, retired roots, locks and slice stops.
- `git worktree remove --force` on an unreachable detached commit was probe-verified at charting (design Proofs).
- No credentials, env values or operator actions needed; `akrogon status` shows no `Missing:` lines.
- Accepted cost carried from the design: an unpicked worker commit of a merged leaf is unrecoverable once gc prunes it.
- Tests were written first and committed on the leaf branch before product code (`test: scratch copy removal criteria…`, commit 0108f4c).
