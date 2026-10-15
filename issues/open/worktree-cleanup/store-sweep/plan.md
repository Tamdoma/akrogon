# Plan: store-sweep

Direct synthesis (`debate: no`): built from brief.md and design.md only.

Note for review: the design consumes `akrogon leftovers` as landed by kept-status. During this leaf's implement refresh, `fb60ccd` merged the command (`src/leftovers.ts`, verb, docs, own tests); plain status no longer prints `Kept by last cleanup`. D9 therefore shrinks to extending the host block (`systemd units` → `host`) and adding retired filesystem paths.

## Decisions

- D1. Sweep scope inside `reconcile(repo, leaves, live)`: the store (`worktreeStore(repo)`) and the legacy root (`<repo>/issues/worktrees`) are swept for **every** entry, not only directories (fixes store-hygiene F2). Entries classify in order:
  1. Registered git worktrees: leaf worktrees keep today's leaf rules; `verify-*`, `batch-*`, `<slug>-u<N>` keep today's scratch owner-state rules; **every other registered worktree is kept** and listed (live-worktree-guard removal rule, which this leaf lands first). Reason `unmanaged worktree`. Registered entries are never touched outside `git worktree remove`; the single `--force` scratch contracts already carry cannot pass a lock (removal-rule P1), and nothing else forces.
  2. Unregistered entries `<slug>` or `<slug>-<anything>` (prefix match against `knownSlugs`, longest first): leaf-owned. A `merged` owner removes them when its tab is gone (with the pane/process vetoes of D5); a `failed` owner keeps them while its tab lives and removes them once it is gone — the failed-worktree guard (uncommitted/rebase checks) does not apply because there is no git worktree to inspect. Removed with `rmSync`, never `git worktree remove` (they are not worktrees). Kept while the owning leaf runs with reason `active leaf`.
  3. `batch-<id>.owner` files: a live owner keeps them (recorded, not silent); a dead or unparsable owner whose copy is gone drops the file — but only when the pane list is available (criterion 6's blanket).
  4. `<file>.<pid>.tmp` entries: deleted only when `<pid>` is dead (`pidAlive`), in both roots.
  5. Everything else (stray files, dangling symlinks, `.dcf*.node-gyp`, `.temp`, empty dirs, unknown dirs): deleted when no leaf of the repo is running (D3) and D5's vetoes pass; kept and recorded otherwise.

- D2. Leaf temp sweep extends today's `scratchRoot` (`<root>/<repoHash>`) block:
  - `run-*` inside any leaf dir: unchanged rules plus a `run-*` dir with **no** `.owner` younger than 60 s is kept as `run younger than 60s` (the mkdtemp→`.owner` write gap); an older ownerless `run-*` is an unowned entry deleted under D5 vetoes. Dead-owner `run-*` dirs are still deleted unconditionally, without consulting `live` (criteria 4, 5).
  - Stray entries inside a known leaf's temp dir belong to the leaf: kept silently while the leaf is active; removed with the temp when the leaf's temp rule fires.
  - Finished-leaf temp removal gains the slice check: `leafTemp` goes when the leaf is `merged`/`failed`, tab gone, no pane inside, **and its slice holds no running unit** — read as `loaded.has(leafSlice)` && `sliceHasProcess` from the slice-step inventory (D7). `kept.length === keptBefore` still gates the removal.

## Implementation notes

- 2026-10-16 (U1 worker, recorded by A): `loaded === null` (no user systemd manager reachable, the fixture reality) removes the finished temp rather than keeping it. Rationale: `null` conflates "manager missing" with "inventory unreadable", and keeping would regress the existing `a failed leaf temp stays while its tab lives` family whose fixture has no manager. Refines D2's "unavailable slice inventory keeps the temp" to "a loaded busy slice keeps the temp".
  - Stray entries directly under the repo-hash dir (stray files, `.tmp*` dirs, unknown dirs): unowned; deleted when the repo is idle under D5.
  - After children are swept, a repo-hash dir left empty is removed (covers the F1 empty-repo-dir junk). Repo dirs for repos no longer registered are host items (D6).
  - `checkout`/`self-update` leaf dirs are akrogon's own: kept while holding a live-owner `run-*`, a registered worktree or a live process; deleted as unowned when the repo is idle.

- D3. "No leaf of the repo is running" = no leaf (open and closed records) has a live tab (`live !== null` and `tabLive`) or a loaded slice with a process (`sliceHasProcess`). An `live === null` pass deletes nothing except dead-owner `run-*` dirs (criterion 6), so `repoRunning` is only consulted with a real pane list.

- D4. Repo-side retired locks, exact names only: `<repo>/.git/akrogon-base-runs.lock` (via `git rev-parse --git-path`, as `src/verify.ts:86` does) and `<repo>/issues/.lock`. Each is deleted when `pidsInside` finds no process with it open and `live !== null`; kept and recorded otherwise. Live locks (`<globalHome>/.lock`, `.git/akrogon-install.lock`, `.git/akrogon-verify-runs.lock`) are never candidates.

- D5. Universal vetoes for every new filesystem deletion: `live !== null` (pane list fetched), no live pane cwd inside, `pidsInside(targets(), path)` empty. Failed `rmSync`/`rmdirSync` is caught per item and recorded as `delete failed: <errno message>`; after every delete `existsSync` is re-checked and a survivor is recorded, never claimed removed (criterion 9). No rename-aside step: the vetoes are the guard and a rename window only widens the race (design open question, resolved).

- D6. `reconcileHost` gains the host filesystem sweep after the unit steps, sharing `livePanes()` so it fetches the pane list once and only when a candidate needs judging:
  - Retired leaf temp root `/tmp/akr-<uid>` — new `retiredLeafTempRoot()` in `src/config.ts` honoring `AKROGON_RETIRED_TEMP_ROOT` like `AKROGON_LEAF_TEMP_ROOT` (design retired-root override). Deleted whole under D5 vetoes.
  - `resolve(homedir(), '.akrogon/worktrees/<name>')` for `<name>` not a registered repo and not a registered `worktree_root`: deleted when it contains no worktree dir (no immediate child holding a `.git` file); kept and listed otherwise (criteria 2). Registered names are skipped — the repo pass owns them.
  - Leaf-temp repo dirs (`<leafTempRoot>/<hex4>`) matching no registered repo: deleted under D5.
  - Leaf-temp root stray entries (files, symlinks, unknown dirs): deleted under D5.
  - `<globalHome>/runs/last-start`: deleted under D5 (no writer exists since the spacing removal).
  - `<file>.<pid>.tmp` under `<globalHome>` top level, `runs/` and `reconcile/`: deleted when `<pid>` is dead.
  - `~/.akrogon/run.lock` and `~/.akrogon/framework-tests.lock`: deleted when no process holds them and panes are available; kept recorded otherwise.
  - `writeKept(hostReportPath(), kept)` already runs; kept entries gain `clears` (D8) and path entries are existence-pruned like repo reports.
  - `~/.config/akrogon/env`, `config.yaml`, `paused.yaml`, `stopped.yaml`, `issues/` records and the live `.lock` are never candidates.

- D7. `reconcileNeedsPanes` counts the new candidate kinds (criterion 10, F3): any unrecorded entry (not only directories) in the store or legacy root; a leaf-temp repo dir holding any non-`run-*` stray or any `run-*` dir; any retired lock file present. This makes a pass whose only candidate is a stray file fetch panes instead of judging with `[]`.

- D8. `writeKept` entries gain optional `clears: string` ("what clears it"). Schema: `z.strictObject({ path, reason, clears: z.string().optional() })` so old reports still parse. New keeps carry it; today's shared reasons keep their names (they feed `leftovers`' in-use set). `writeKeptReport`/host report prune `existsSync`-failing **path** entries (absolute paths only — unit names are not paths).

- D9. `akrogon leftovers` already exists (upstream `fb60ccd`): per-repo blocks plus a `systemd units` host block filtered by `unitInUse`. This leaf changes two things in `src/leftovers.ts`: (1) retitle the host block `systemd units` → `host` — the design calls it "the retired leftover block" and filesystem paths now join units, so the unit name no longer fits; (2) host entries carrying a filesystem path (absolute or containing `/`) are skipped when the path no longer exists, matching the per-repo existence rule — units have no path to check. `unitInUse` (`own slice`, `live run record`, `live tab`) stays; `pane list unavailable`, `process inside`, `live process inside`, `retired`, `delete failed`, `run younger than 60s` all print. No `akrogon.ts` change (verb exists); `docs/guide/next.md` and README wording retitle the block and cover retired paths; `src/AREA.md` host-report clause updated.

- D10. Slice-with-running-unit reading: reuse the slice step's `loadedLeafSlices()` result; `sliceHasProcess` (`systemctl show` → cgroupfs `cgroup.procs` walk) is the "running unit" test. No `list-units`-on-slice-members needed; a loaded slice with any process in its subtree is running. (Design open question, resolved — same evidence finished-leaf-processes uses.)

- D11. Changed existing expectations (test plan, cited to the brief):
  - `targeted next sweeps unused registered variants` → variant now kept `unmanaged worktree` (brief 3, 7).
  - `store variants survive live or unavailable pane inventories` → kept in every pane state with `unmanaged worktree`; the remove assertion becomes a keep (brief 3, 7).
  - `an unknown directory inside the store is reported, never removed` → now kept `active leaf` while the repo runs and removed once idle (brief 1, 3).
  - `plain status lists kept-by-last-cleanup entries …` (status.test.ts) → becomes the leftovers test (design Corrections).

## Read first

- `src/reconcile.ts` — pass structure: candidate loop, `reconcileNeedsPanes`, `sliceKeepReason`, `loadedLeafSlices`, `sliceHasProcess`, `procTargets`/`pidsInside`/`processesInside`, `readOwner`/`ownerDead`, `writeKept`, `reconcileHost`.
- `src/config.ts` — `worktreeStore`, `leafTemp` (env override pattern for `retiredLeafTempRoot`), `globalHome`, `within`.
- `src/next.ts` (1322–1338, 1360–1370, 1445–1465) — `reconcileRepos`, `panesOnce`, `tab_closed` host call.
- `src/scope.ts` — `leafSlice`, `procRoot`, `cgroupRoot`, `ownSlices`.
- `src/verify.ts` (`verifyRunsLockPath` ~:86) — `git rev-parse --git-path` pattern for the retired base-runs lock.
- `src/status.ts` (405–415) — the kept lines this leaf removes.
- `git show ae5ce87` — leftovers command shape (never merged; only on local `leftovers-command`).
- `tests/reconcile.test.ts`, `tests/leaf-slices.test.ts`, `tests/status.test.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts` (`paneListStdout`), `tests/fake-systemctl.ts` — fixtures and seams.
- `learnings/LESSONS.md` — chrome-escapes-cgroup (process outside the slice still counts inside a path); the fd-churn history (`9800d9e`).

## Interfaces

- `src/reconcile.ts`: sweep rewritten per D1–D8; `kept` entries `{ path, reason, clears? }` (exported `readKept`/`readHostKept` return the optional field); slice `loaded` inventory shared with the temp rule.
- `src/config.ts`: `export function retiredLeafTempRoot(): string` — `AKROGON_RETIRED_TEMP_ROOT` or `/tmp/akr-<uid>`.
- `src/leftovers.ts` (new): `export async function leftoversCommand(cwd: string): Promise<void>`.
- `src/akrogon.ts`: `leftovers` verb + usage string.
- `src/next.ts`: unchanged (panes/host wiring already in place).

## Waves

One wave, two units with disjoint owned paths and no shared test resource:

- U1 sweep core: `src/reconcile.ts`, `src/config.ts`, `tests/reconcile.test.ts`, `tests/leaf-slices.test.ts`. No prerequisite.
- U2 leftovers host extension + docs: `src/leftovers.ts`, `README.md`, `docs/guide/next.md`, `src/AREA.md`. No prerequisite on U1 — host path existence filtering and the `host` title stand alone; the `clears` report field is optional and reader-compatible.

## File/criterion checklist

- `src/reconcile.ts` — D1–D8 (criteria 1–7, 9, 10 and the report side of 8)
- `src/config.ts` — `retiredLeafTempRoot` (criterion 2)
- `src/leftovers.ts` — D9 (criterion 8 host block)
- `tests/reconcile.test.ts` — criteria 1, 3–7, 9, 10
- `tests/leaf-slices.test.ts` — criterion 2 and the slice-holds-temp case
- `tests/status.test.ts` — criterion 8
- `tests/command-reference.test.ts` — `leftovers` contract line
- `README.md`, `docs/guide/next.md`, `src/AREA.md` — host block retitle and retired-path listing; sweep scope named
- `tests/AREA.md` — already names the touched test files; add one clause only if the new cases change its descriptions

## Done-criteria → observation mapping

All proofs run through `akrogon run-check --name <label> -- <cmd>`; commands use the existing `bun test` runner and fixtures.

| # | Criterion | Proof (boundary, before→after, failure caught) | Command | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 | Repo pass deletes unregistered+stray junk | `next --all` on a zero-leaf fixture; store+legacy junk, merged-leaf temp, dead `run-*`, leaf-temp stray/`.tmp*`/unknown, empty repo-hash dir present → absent; a wrong-delete would eat a seeded leaf temp | `akrogon run-check --name sweep-c1 -- bun test tests/reconcile.test.ts -t 'unregistered and stray'` | seconds | `src/reconcile.ts` |
| 2 | Host step deletes retired items | `next --all`; retired root, empty/non-worktree/genuine-worktree `worktrees/<name>`, unregistered leaf-temp repo dir, `runs/last-start`, dead/live-pid `*.tmp`, `run.lock`+`framework-tests.lock`, `.git/akrogon-base-runs.lock`, `issues/.lock`, stale report entries; live locks seeded → still exist | `akrogon run-check --name sweep-c2 -- bun test tests/leaf-slices.test.ts -t 'host step'` | seconds | `src/reconcile.ts`, `src/config.ts` |
| 3 | Running leaf protects its entries | Active leaf: `<slug>-x` dir, unregistered `<slug>` dir, stray file, leaf-temp stray kept `active leaf`/silent; merged+tab gone → leaf-owned removed | `akrogon run-check --name sweep-c3 -- bun test tests/reconcile.test.ts -t 'running leaf'` | seconds | `src/reconcile.ts` |
| 4 | Live owner records survive | Merged leaf, tab gone: `run-*` live-owner keeps its temp; orphan `batch-x.owner` live-pid kept+recorded; young ownerless `run-*` kept `run younger than 60s` | `akrogon run-check --name sweep-c4 -- bun test tests/reconcile.test.ts -t 'live owners'` | seconds | `src/reconcile.ts` |
| 5 | Dead-owner `run-*` goes under any pass | Active leaf, `paneListStdout: 'unavailable'`: dead `run-*` removed, live kept, stray kept (blanket), live `batch-*.owner` orphan kept | `akrogon run-check --name sweep-c5 -- bun test tests/reconcile.test.ts -t 'dead-owner run'` | seconds | `src/reconcile.ts` |
| 6 | Pane/process vetoes | Repo idle (merged leaf, tab gone): unowned stray dir deleted; same with pane cwd inside → `live pane inside`; same with fake-proc fd inside → `process <pid> inside` | `akrogon run-check --name sweep-c6 -- bun test tests/reconcile.test.ts -t 'vetoes'` | seconds | `src/reconcile.ts` |
| 7 | Protected + unknown registered worktrees | Registered `mystery` worktree in store → kept `unmanaged worktree`, listed; locked registered worktree → still present (remove never reached) | `akrogon run-check --name sweep-c7 -- bun test tests/reconcile.test.ts -t 'unmanaged worktree'` | seconds | `src/reconcile.ts` |
| 8 | Kept items recorded + `leftovers` lists host too | Pass produces repo+host kept entries; `reconcile/repo.json`+`reconcile-host.json` carry reason+clears; `akrogon leftovers` shows both under a `host` block including `retired` paths (also with `repos: {}`); plain `status` shows no `Kept by last cleanup` | `akrogon run-check --name sweep-c8 -- bun test tests/status.test.ts -t 'leftovers'` | seconds | `src/reconcile.ts`, `src/leftovers.ts` |
| 9 | Failed delete reported, not claimed | Unowned store dir under a non-writable parent → pass exits 0, dir remains, report holds `delete failed: <err>` | `akrogon run-check --name sweep-c9 -- bun test tests/reconcile.test.ts -t 'failed delete'` | seconds | `src/reconcile.ts` |
| 10 | New-kind-only pass fetches panes | Zero-leaf repo, store holds only `stray.txt`: fake-herdr call log contains a pane-list call; file deleted | `akrogon run-check --name sweep-c10 -- bun test tests/reconcile.test.ts -t 'fetches the pane list'` | seconds | `src/reconcile.ts`, `src/next.ts` |
| 1/6 (slice) | Finished temp kept while slice busy | `merged` leaf temp + fake-systemctl loaded slice with `cgroup.procs` populated → kept; emptied → next pass removes | folded into sweep-c2 test file: `akrogon run-check --name sweep-c2b -- bun test tests/leaf-slices.test.ts -t 'slice holds a running unit'` | seconds | `src/reconcile.ts` |

Suite checks `format`, `test`, `typecheck` run through `akrogon verify` at implement end; no criterion names a whole run.

- 2026-10-16 (A, worker mismatch M1): two planned-test corrections landed in `aa2a072`: `repoTempDir()`/busy-temp `leafTemp()` resolved under the suite's env root while `cli()` children use `leafTempRoot(f)` — corrected to hash under `leafTempRoot(f)`; `lost-leaf` seeds a dead `tab` so the `src/next.ts:786` failed-leaf recovery guard lets `next --all` exit 0. Expectations unchanged.

## Red evidence (recorded at plan.synthesis via `akrogon run-check`)

`akrogon run-check --name sweep-tests -- bun test tests/reconcile.test.ts tests/leaf-slices.test.ts tests/status.test.ts tests/command-reference.test.ts` → exit 1, log `implementation/check-sweep-tests-1792102669567-2020108.log`: 75 pass, 16 fail — every failure a planned criterion assertion on missing behavior:

- C1 `unregistered and stray entries…`: `existsSync(root/junk)` true after pass — unowned entries are kept `unknown directory` today; `run-*` deletion works (dead owner already gone).
- C2 `the host step removes retired leftovers…`: `existsSync(retired)` true — no host filesystem sweep exists.
- C2b `a finished leaf temp stays while its slice holds a running unit`: temp removed while the slice still held a running unit — no slice check on the temp rule.
- C3 `a running leaf keeps…`: `guard-leaf-old` kept while running (pass), still present after merge — unregistered leaf-owned entries never removed.
- C4 `live owners keep…`: live-owner `batch-*.owner` orphan kept but unreported — `kept.some(orphan)` false.
- C5 `a dead-owner run dir…`: dead `run-*` removed (green today); orphan and stray kept asserts red — today the dead orphan file is deleted and strays are invisible.
- C6 `unowned entries stay…`: `existsSync(junkFree)` true — no unowned sweep; pane/proc reasons unasserted.
- C7 `unknown registered worktrees…`: `mystery` removed by today's candidate loop — unknown registered worktrees are deleted today.
- C8 `leftovers lists…`: `akrogon leftovers` exits 1 — command missing.
- C9 `a failed delete…`: `kept.some(delete failed)` false — no delete-failure recording.
- C10 `a stray-file-only pass…`: no `pane list` call and `stray.txt` still present — directory-only `reconcileNeedsPanes`.
- Changed expectations red: `dirty merged worktree…` (plain status still prints `Kept by last cleanup`), `targeted next keeps unused registered variants`, `registered store variants…`, `unowned directory… removed once idle`, `command-reference` rows (verb missing).

## Docs

- `README.md` — reconcile paragraph: `akrogon leftovers` replaces the plain-status kept claim; new sweep scope named.
- `docs/guide/next.md` — the slice/kept paragraph points at `akrogon leftovers` for kept slices and units.
- `src/AREA.md` — `src/reconcile.ts` line names the widened sweep; add `src/leftovers.ts` to key files.
- `tests/AREA.md` — no new files needed beyond existing entries; adjust only if descriptions go stale.

## Notes and limitations

- Brief↔design surface gap (kept-status's `leftovers` absent from the stack) is handled in-plan per the design's binding correction; flagged at top for review.
- Unregistered `<slug>-*` of a `failed` leaf is removed once its tab is gone — reading "keeps today's guard" as the failed-worktree pane/tab guard; there is no git state to guard in a plain directory.
- `git worktree remove` (plain or single `--force`) cannot pass a lock (removal-rule P1), so unknown registered worktrees need no explicit lock check — they are kept outright anyway.
- `~/.akrogon` paths are `homedir()`-based; `<globalHome>` is `AKROGON_HOME`-based — tests isolate both via `HOME`/`AKROGON_HOME`.
- No credentials or operator action needed: `env_names` is empty and `akrogon status` shows no `Missing:` lines.
- Planned tests committed on the leaf branch before product code; edits to existing test files carry `Test-Change` trailers citing the brief.
