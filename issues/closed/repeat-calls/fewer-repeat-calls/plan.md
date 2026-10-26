# Plan: fewer-repeat-calls

Read first: `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `learnings/LESSONS.md`, `src/scope.ts`, `src/shell.ts` (`herdr`/`panes`/`tabs`/`workspaces`/`repoSession`/`sessionPanes`), `src/next.ts` (`observeBusy`, `dispatchLeaf`, `allocate`, `dispatchSlot`, `ensureWorktree`, `reconcileRepos`, `closeMergedTab` call sites), `src/config.ts` (`commonDirectory`, `currentRepo`), `src/preflight.ts` (`ensureRemote`, `checkBase`, `remoteBase`), `src/pull.ts` (`originSource`), `src/self-update.ts` (`gitStage`), `tests/fake-proc.ts`, `tests/fake-busctl.ts`, `tests/helpers.ts` (`fakeHerdr`), `tests/isolation.ts` (`fakeHerdrBin` build), `tests/seat-containment.test.ts`, `tests/next.test.ts`, `tests/config.test.ts`.

## Decisions

- D1 (criterion 1): `src/scope.ts` splits the herdr read from the /proc check. `Shell = { pid, start }` is exported with `paneShell(paneId, session): Promise<Shell>` (today's `shell()`). `inOwnScope(slice, paneId, session, prior?: Shell)` resolves `prior ?? await paneShell(...)`, then reads only `/proc`: `startTime(pid)` and the cgroup file. When `prior` is given and the /proc start differs it throws `Pane <paneId> shell start changed: expected <prior.start>, reads <current>` — a recycled pid is never adopted or accepted. `adoptShell(slice, paneId, session, shell: Shell)` takes the identity and drops its own `pane process-info`. Callers in `src/next.ts` read `paneShell` once per scope check and pass it: the recorded-pane sweep reads it once; `box` reads it once and reuses it for the first place check, `adoptShell`, and every adoption-poll iteration (poll reads /proc only). `box` keeps its `unreadable`/`inside` handling and the post-adoption error text.
- D2 (criterion 2): `src/next.ts` passes pane reads down inside one step.
  - `observeBusy` returns `{ state, notified }` (`notified` = it sent a `notification show` herdr write). `dispatchLeaf` forwards its `live` pane list to `allocate` only when no observation sent a notification; `allocate`'s parameter is optional and it lists panes itself otherwise.
  - `allocate` derives `members` from the list it already holds when `matches.length === 1` (`live.filter(pane.tab_id === tab.tab_id)`); the `panes()` re-list stays only in the `closed === true` or `matches.length === 0` paths, which follow a `pane close`/`tab create` write.
  - `allocate` tracks `wrote` (any `pane close`, `tab create`, `pane split`, `pane swap`) and returns `{ state, sight }` where `sight = wrote ? undefined : { panes: live, tabs: view }`. `dispatchLeaf` and `broadcastPass` forward `sight` to `dispatchSlot`, which uses it as its initial `live`/`view` instead of listing. A `sight` list is usable only because zero herdr mutations ran between the read and the tab-ownership check.
  - `reconcileRepos` keeps `panesForRepo` per repo (corrected, see Implementation notes): `reconcile()` on an earlier repo can write `tab close` before a later repo reads, so the union cannot supply a later repo's `live`.
  - Kept fresh by lock, each named: `panes()` after `closed === true` and before `members` in the create path; `currentPane` `pane get` before `agent start`; the `ready` re-read before `agent prompt`; `recordDelivery`'s `pane get` after the prompt result; every `inOwnScope` poll iteration (/proc reads only, no herdr); `secondSeat` foreign-session reads; `closeMergedTab`'s seated re-read after merges; `sessionPanes`' per-session `workspace list` liveness probe; `logMove`'s diagnostic lookup. `secondSeat`'s own-session reuse already exists.
- D3 (criterion 3): once-per-run root identity lives in `src/config.ts` beside `commonDirectory`/`currentRepo`.
  - `commonDirectory(cwd)` memoizes non-null successes only per process (corrected, see Implementation notes: a non-repo `null` is never cached and respawns on the next call), keyed by `realpathSync(cwd)` with the raw string as key when realpath fails. A thrown failure is deleted from the map so the next call respawns git.
  - New `remoteUrl(root, remote): Promise<string>` in `src/config.ts` memoizes `git remote get-url <remote>` per `${root}\n${remote}`, successes only, throwing `CommandError` with the result preserved.
  - `src/preflight.ts` `ensureRemote` calls `remoteUrl` and maps a nonzero result to `PreflightError C1` unchanged; `remoteBase` drops its inner `ensureRemote` (the one `checkBase`-level call covers it); `src/pull.ts` `originSource` calls `remoteUrl(repo.root, 'origin')`.
  - `src/next.ts` `ensureWorktree` replaces its two inline `rev-parse --git-common-dir` commands with `commonDirectory(repo.root)`/`commonDirectory(path)` (already realpathed; `null` throws `Unrelated worktree: <path>`).
  - Ref facts stay fresh: `branchSha`, `localBase`, `rev-parse HEAD` everywhere except D4, all `fetch` sites (`mergeTurn`, `reconcileBatch`, `self-update`, `finishPush`/`sync`).
- D4 (criterion 3): `src/self-update.ts` `gitStage` drops the dead `const local = await command(['git','rev-parse','HEAD'])` — one decision read HEAD twice with no write between; `preLocal` keeps the single read. Census found no other same-decision branch-tip duplicate.
- D5 (criterion 4): `tests/fake-proc.ts` `shellPid` and `expectedSlice` hash with `new Bun.CryptoHasher('sha256').update(text).digest('hex')`; the `node:crypto` import is removed (digest verified identical on `w1:p1`). `tests/isolation.ts` builds `fake-busctl.ts` with `bun build --target=bun --bytecode` next to `fakeHerdrBin` and exports `fakeBusctlBin`; `tests/helpers.ts` `fakeHerdr()` symlinks `busctl` to it. `src/scope.ts` `leafSlice` stays on `node:crypto`; fake-gh and fake-systemctl are unchanged.
- D6 (test support): `tests/fake-busctl.ts` honors a `busctl.restime` trigger in `$FAKE_BUSCTL_HOME`: after writing the placed cgroup it rewrites `/proc/<pid>/stat` field 22 to `99999` (≠ `SHELL_START`), simulating a recycled shell after the identity read.
- D7 (criterion 5/6 measurement, resolves the design's last open question):
  - Base commit: `a4fc68d3` (main = worktree HEAD before this leaf's commits).
  - Pair `<side>-<n>` = one `akrogon run-check --name pair-<side>-<n> -- sh -c 'uptime; (cd <wt-a> && sh -c <test>) >$OUT/a.log 2>&1 & (cd <wt-b> && sh -c <test>) >$OUT/b.log 2>&1 & wait; uptime'` where `<test>` is the configured `test` check body (`bun test --timeout=30000 --parallel=4 --no-isolate` after `bun install --frozen-lockfile` at setup once per checkout). 10 head pairs alternate with 10 base pairs in one session; each pair's start load comes from `uptime`.
  - Checkouts: `git worktree add` detached at the base / head commits under the worktree store, prepared once with the setup command under the install lock and reused across pairs.
  - The re-entering test's duration is read per copy from that copy's log line `(pass) a leaf re-entering merge queues behind the two leaves stamped earlier [<ms>]`; slowest head must be below slowest base.
  - Criterion 6: three alternating solo runs per side, each wrapped in `/usr/bin/time -f 'user=%U sys=%S' -o <file>`; head median user+sys below base median, spread recorded.
  - Criterion 4 timings: 20 timed single calls per side of `FAKE_HERDR=<db> <bin> pane list` (head = bundled fake-herdr; base = base bundled fake-herdr) and of the busctl fake under `FAKE_BUSCTL_HOME`+`AKROGON_PROC_ROOT` (head = bundled `fakeBusctlBin`; base = `bun tests/fake-busctl.ts`), same host, before/after recorded; plus a `bun -e` dump of `shellPid`/`expectedSlice` outputs on both commits compared byte-equal.
  - Restart boundaries: one `run-check` per pair is the checkpoint; each finished pair appends one record line to `implementation/proof-load.txt`, so a crashed pass resumes at the next unfinished pair.
- D8 (docs): `tests/AREA.md` `isolation.ts` line gains that the fake herdr and fake busctl run as per-worker bytecode bundles. No other doc is affected.

Removed reads named for the report (each removed re-read and the earlier read that now supplies it): `adoptShell`'s `pane process-info` (supplied by the box/sweep `paneShell`); adoption-poll `pane process-info` per iteration (supplied by the same identity; /proc start now carried in the scope name decision); `allocate`'s top-level `pane list` (supplied by `dispatchLeaf`'s observation list); the `members` `pane list` on tab reuse (supplied by `live`); `dispatchSlot`'s `pane list`+`tab list` on write-free allocations (supplied by `allocate`'s `live`/`view`); `remoteBase`'s `remote get-url` (supplied by `checkBase`'s `ensureRemote`); repeated root `common-dir`/`get-url` spawns (supplied by the per-run memo); `gitStage`'s first `rev-parse HEAD` (supplied by `preLocal`).

## Interfaces

- `src/scope.ts`: `export type Shell`, `export async function paneShell(paneId, session)`, `adoptShell(slice, paneId, session, shell: Shell)`, `inOwnScope(slice, paneId, session, prior?: Shell)` throwing on changed start.
- `src/next.ts`: `observeBusy → { state, notified }`; `allocate(global, repo, leaf, invocation, listed?: Pane[]) → { state: State | null; sight?: { panes: Pane[]; tabs: Tab[] } }`; `dispatchSlot(..., seen?: { panes: Pane[]; tabs: Tab[] })`.
- `src/config.ts`: memoized `commonDirectory`; `export async function remoteUrl(root, remote)`.
- `tests/isolation.ts`: `export const fakeBusctlBin`.

## Checklist (waves)

### Wave 1

- U1 `src/scope.ts`: D1 signature split and changed-start refusal. Prerequisite for U2.
- U3 `src/config.ts`, `src/preflight.ts`, `src/pull.ts`: D3 memoized `commonDirectory`, `remoteUrl`, `ensureRemote`/`remoteBase`/`originSource` rewiring. Prerequisite for U2's `ensureWorktree` change.
- U5 `tests/fake-proc.ts`, `tests/isolation.ts`, `tests/helpers.ts`: D5 hashing + busctl bundle. Shared test resource: the per-worker bundle build under the suite root (preload). No prerequisite.

### Wave 2

- U2 `src/next.ts`: D2 read passing + `ensureWorktree` `commonDirectory` swap. Depends on U1 (signatures) and U3 (`commonDirectory` memo).
- U4 `src/self-update.ts`: D4 dead HEAD read removal. No prerequisite; disjoint path.

Docs: `tests/AREA.md` one line (U5). Every changed `tests/` file carries a `Test-Change` trailer in the commit that changes it; changed existing test files name what was added and that no existing expectation changed.

## Criterion proofs

- C1 — boundary: real `akrogon next` against fake herdr/busctl/proc. Before: 3 `pane process-info` per boxed pane and ~100 per delayed adoption. After: 1 per scope check, 1 per boxing, 0 in the poll; changed start → error naming the pane. Test: `tests/seat-containment.test.ts` boxing test gains process-info counts (2 after the first `next`, 6 after the second) and the agent start → `pane get` → `agent prompt` ordering assertion; new test `a pane whose shell start changed after its identity read is refused naming the pane` uses `busctl.restime` + a corrupted cgroup; `busctl.misplace` keeps the post-adoption failure text. Command: `akrogon run-check --name crit1 -- bun test tests/seat-containment.test.ts --timeout=30000`. Size: seconds. Rerun: any change to src/scope.ts or src/next.ts boxing.
- C2 — boundary: same CLI + `.calls` log. Before: 6 `pane list` / 2 `tab list` in the no-write `next` slice. After: 3 / 1 (corrected 2026-10-26: reconcile keeps its per-repo `panesForRepo`; the three are dispatchLeaf's observation list, reconcile's per-repo list and the host union's per-session list). Test: `tests/next.test.ts` `recorded seats ... neither missing` slice asserts `pane list` == 2, `tab list` == 1, and `pane get` sits between `agent start` and `agent prompt`. Command: `akrogon run-check --name crit2 -- bun test tests/next.test.ts --timeout=30000 -t 'recorded seats'`. Size: seconds. Rerun: any change to dispatch/reconcile read flow.
- C3 — boundary: same CLI behind a git shim logging `cwd|argv`. Before (2 allocated leaves, `next --all`): 5 `rev-parse --git-common-dir`, 2 `remote get-url`, 2 `rev-parse HEAD`. After: 3 (1 root + 2 worktree), 1, 1. Test: new `tests/next.test.ts` case asserts those counts; `tests/config.test.ts` `commonDirectory` four-cwd test keeps spawning git once per call (unchanged). Command: `akrogon run-check --name crit3 -- bun test tests/next.test.ts --timeout=30000 -t 'registered root'` and `akrogon run-check --name crit3b -- bun test tests/config.test.ts --timeout=30000`. Size: seconds. Rerun: any change to config.ts/preflight.ts/pull.ts or dispatch git flow.
- C4 — boundary: the fakes as spawned by the suite. Before/after: identical pid/slice output compared on both commits; per-call wall lower on head. Proof: recorded commands in `implementation/report.md` per D7 (byte-compare dump; 20-call timing loops; `grep node:crypto tests/fake-proc.ts` empty). No suite test — measured on both commits as the criterion names. Size: minutes. Rerun: changes to fake-proc/fake-busctl/isolation.
- C5 — boundary: configured `test` check in two checkouts at once via `akrogon run-check` pairs, alternating head/base, 10 pairs each, start load recorded, all head copies green, slowest re-entering head below slowest base; plus three-at-once recorded counts (Proof 2a). No smaller test exists because the property is whole-suite time under a second suite. Size: hours. Rerun: the suite or its inputs change.
- C6 — boundary: `/usr/bin/time` around solo `test` runs, 3 alternating per side, median user+sys compared with spread. Size: ~30–60 min. Rerun: any src or fakes change before merge.

## Implementation notes

2026-10-26, chart door corrections before implementation:

- D3: `commonDirectory` caches only non-null successes. Criterion 3's "a failed lookup is retried on the next call" and the design's cached-non-repo-null pitfall both refuse a cached `null`; a null result respawns git on the next call.
- D2: `reconcileRepos` and `nextCommand` keep `panesForRepo(repo)` per repo and do not derive `live` from `hostPanesOnce`. `reconcile()` on an earlier repo can close tabs through `command(herdrArgv(['tab','close']))`, a herdr write between the union read and a later repo's use, which violates the no-write-between lock. The reconcile per-repo `pane list` is not removed; the 'neither' slice assertion is 3, not 2.

## Plan-pass runs (red-first)

- `check crit1: 1` — boxing test: `pane process-info` received 6 where 2 is asserted; restime test: base error is `Pane w1:p5 ... not in its own scope after adoption` instead of a changed-start refusal. Log: `implementation/check-crit1-1793001894997-3504230.log`.
- `check crit2: 1` — `neither` slice: `pane list` received 6 where 2 is asserted. Log: `implementation/check-crit2-1793001901096-3509918.log`.
- `check crit3: 1` — `rev-parse --git-common-dir` at root received 4 where 1 is asserted. Log: `implementation/check-crit3-1793001905120-3511917.log`.
- `check crit3b: 0` — `tests/config.test.ts` stays green (commonDirectory contract unchanged). Log: `implementation/check-crit3b-1793001911489-3512915.log`.

## Notes

- Brief vs design: none conflicting. Criterion 2's workspace-list clause is satisfied as stated — no `workspace list` read is removed where none qualifies (every removal found is `pane list`/`tab list`; session-liveness probes and foreign-session reads stay by lock).
- Limitation kept: C R2 standing dissent — caller-level removal deletes fewer repeats than a choke-point cache; criterion 5's bar is the arbiter. `sessionPanes`/`secondSeat` workspace probes stay.
- `tests/fake-busctl.ts` restime trigger and the test extensions in `seat-containment.test.ts`/`next.test.ts` are committed in this pass before product code, each with `Test-Change` trailers.
