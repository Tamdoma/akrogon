# Unit 1 — store-sweep core: reconcile sweep + host sweep

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/store-sweep-u1` (detached at `189f1dc`, the leaf test commit). Bun+TypeScript repo; `bun test` runs fixture-based integration tests.

## 1. Goal

Implement the store-sweep reconcile extension of plan.md decisions D1–D8, D10, D11 (leaf `store-sweep`): every reconcile pass deletes akrogon junk that ownership proves safe, keeps and records the rest. You own `src/reconcile.ts`, `src/next.ts`, `src/config.ts`. Planned tests already exist and are red — implement until they pass; never edit tests.

## 2. Acceptance criteria (from plan.md / brief)

1. Repo pass sweeps every entry (files too, not only directories) in the worktree store and legacy `<repo>/issues/worktrees`: unregistered `<slug>`/`<slug>-<anything>` entries of a merged leaf with tab gone are removed; unowned entries removed only when no leaf of the repo runs; unknown registered worktrees kept with reason `unmanaged worktree`.
2. Leaf temp root (`dirname(leafTemp(repo,'x'))` = repo-hash dir): `run-*` rules gain "ownerless `run-*` younger than 60 s kept as `run younger than 60s`, older ownerless `run-*` is an unowned entry"; strays inside a known leaf's temp are leaf-owned; strays directly under the repo-hash dir are unowned; finished-leaf temp removal gains the slice check (slice loaded AND `sliceHasProcess` ⇒ temp stays, silent while leaf unfinished, reported when finished); an emptied repo-hash dir is removed.
3. Host step (`reconcileHost` in src/reconcile.ts) additionally sweeps: the retired temp root (`AKROGON_RETIRED_TEMP_ROOT` or `/tmp/akr-<uid>`; new `retiredLeafTempRoot()` in src/config.ts mirroring `leafTemp`'s override validation, returning the root path itself — not a leaf dir), unregistered `~/.akrogon/worktrees/<name>` dirs (deleted only when no `.git` file inside; a dir containing one is kept `unregistered repo`), stray entries directly under the leaf temp root itself, `runs/last-start` under globalHome, dead-pid `*.<pid>.tmp` files under globalHome (and the leaf temp root), and retired locks by exact name: `~/.akrogon/run.lock`, `~/.akrogon/framework-tests.lock`, `<repo>/.git/akrogon-base-runs.lock`, `<repo>/issues/.lock` — each deleted only when no live process holds it open (fd/cwd target equals or sits under the path). Live locks `.lock`, `.git/akrogon-install.lock`, `.git/akrogon-verify-runs.lock` are never touched.
4. Vetoes (D5): `live === null` (unavailable pane list) keeps everything except dead-pid deletions (dead-owner `run-*`, `*.<pid>.tmp` files, stale report pruning); a pane cwd or process fd/cwd inside a candidate keeps it (`live pane inside` / `process <pids> inside`).
5. Failed deletions are recorded: `keep(path, 'delete failed: <error>')`, item remains, pass still exits 0.
6. Reports: `kept` entries gain optional `clears` (D8 — a short "what clears it" note per reason); `writeKept`/`writeKeptReport` prune kept entries whose absolute path no longer exists (unit names are not paths — match by `/^\\//`); `reconcile/repo.json` and `reconcile-host.json` both prune.
7. `reconcileNeedsPanes` returns true whenever the new sweep could need panes: any entry (file or dir) in store/legacy roots not a plainly-active leaf's own worktree, any leaf-temp entry that can end up a candidate, any dead-pid-independent host candidates — mirror it to the new candidate set (D6). The host step already gets `panesOnce`; a host candidate needing panes triggers the lazy fetch there (it already does for tabs; extend for pane-cwd checks on dirs).
8. Changed expectations already in tests: `an unowned directory inside the store`/`unregistered and stray entries`/`unknown registered worktrees`/`a stray-file-only pass`/`a failed delete`/`live owners keep run dirs`/`a dead-owner run dir`/`unowned entries stay`/`a running leaf keeps`/`targeted next`/`registered store variants` in tests/reconcile.test.ts; `the host step removes retired leftovers`/`a finished leaf temp stays while its slice holds a running unit` in tests/leaf-slices.test.ts. All must pass unmodified.

## 3. Read-first list

- `src/reconcile.ts` whole file (lines 295–800 hold the pass: `reconcileNeedsPanes`, `reconcile`, `reconcileHost`; helpers `procTargets`, `pidsInside`, `sliceHasProcess`, `loadedUnits`, `sliceKeepReason`, `removeWorktree`, `readOwner`, `ownerDead`, `tabLive`, `livePaneInside`, `foreignPaneInside`, `worktreeRemovable`).
- `src/config.ts` `leafTemp`/`worktreeStore`/`globalHome` (add `retiredLeafTempRoot` next to `leafTemp`).
- `src/next.ts` lines 1322–1465 (`reconcileRepos`, `tab_closed` path — `reconcileHost` already runs on both paths; verify, no new call sites needed).
- `tests/reconcile.test.ts` tests named in §2.8 and helpers `repoTempDir`, `keptReport`, `ownerRecord`; `tests/leaf-slices.test.ts` the two new tests + `hostKept`.
- `plan.md` decisions D1–D8, D10, D11 at `/home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/plan.md` — binding.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

Existing pattern to copy: the candidate loop in `reconcile()` already classifies store/legacy entries; extend the same `kept`/`keep()`/`removed` machinery rather than new plumbing. `processesInside(paths)` exists for a set-membership variant; `procTargets()` is the one-scan helper — call it lazily only when a removal is judged.

## 4. Change list and owned paths

Owned: `src/reconcile.ts`, `src/config.ts`, `src/next.ts` (only if needsPanes/host wiring needs it). Do not touch tests, `src/leftovers.ts`, `src/status.ts`, `src/akrogon.ts`, docs (Unit 2 owns those).

- `src/config.ts`: `retiredLeafTempRoot()` — `/tmp/akr-<uid>` default, `AKROGON_RETIRED_TEMP_ROOT` override with the same non-blank-absolute validation as `leafTemp`. Also export the leaf temp root itself if not exported (tests build repo-hash dirs via `dirname(leafTemp(repo,'x'))`; host test needs the root — check `leafTempRoot` usage in tests/helpers.ts).
- `src/reconcile.ts`:
  - Candidate enumeration: switch store/legacy sweep to all entries (not `isDirectory()` only). Classification order per D1: registered worktree → scratch/leaf rules or `unmanaged worktree`; unregistered `<slug>`/`<slug>-*` prefix match → leaf-owned (merged+tab-gone ⇒ remove, failed+tab-gone ⇒ remove, else keep `active leaf`); `batch-*.owner` orphan files → live owner keeps (recorded), dead/unparsable owner with gone copy drops — only under an available pane list (criterion: `a dead-owner run dir…` asserts orphan file kept AND recorded under `live === null`); `*.<pid>.tmp` → delete when pid dead, regardless of panes; else unowned → delete only when no repo leaf is running (`leaves.some(l => !finished(l))` — check existing helper; the D3 gate), behind pane/process vetoes.
  - Leaf temp: `run-*` young rule (60 s by `statSync(dir).birthtime` or mtime — pick whichever mkdtemp sets, prefer `birthtime`/`ctime`; comment the choice). Strays inside a leaf temp: leaf-owned (silent while leaf unfinished). Strays under repo-hash dir: unowned → D5 gate. Finished temp: add `loaded.has(leafSlice(...)) && await sliceHasProcess(...)` keep — reuse the `loaded` inventory already fetched at the top of `reconcile()`; `loaded === null` keeps the temp (conservative).
  - Empty repo-hash dir: after children sweep, remove if `readdirSync` is empty.
  - `kept` entries gain `clears?: string`; extend `writeKept`/`readReport`/`readKept`/`readHostKept` schema (`z.strictObject` keep optional). Existence-prune absolute-path entries on write.
  - `reconcileNeedsPanes`: return true when any candidate exists whose judgement needs panes — i.e. any store/legacy entry that isn't a plainly-active leaf worktree, any non-`run-*` leaf-temp entry, any host candidates (the host step already fetches lazily via `panesOnce` inside `reconcileHost`; `reconcileNeedsPanes` must also cover "entry that is a file" — drop the `entry.isDirectory()` filter in its scan).
  - `reconcileHost`: after the unit steps, sweep retired root (`retiredLeafTempRoot()` — the whole dir is retired: remove its contents and the root itself? Check test: expects `existsSync(retired)` false — yes, remove the whole tree), `~/.akrogon/worktrees/<name>` for `<name>` not in `repos` (delete iff no `.git` entry inside; `.git`-bearing dirs kept `unregistered repo`), stray entries directly under leaf temp root, `runs/last-start` file, `*.<pid>.tmp` under globalHome and leaf-temp root when pid dead, retired locks (fd check via `procTargets` — call lazily once). Vetoes: pane cwd inside a dir candidate keeps it (`live pane inside`); process inside keeps (`process <pids> inside`). Failure ⇒ `keep(path, 'delete failed: …')`. Host report prunes nonexistent paths (test asserts `host-gone` absent from report AND repo report prunes `gone`).
- Keep `removed`/`kept` return shape `{ removed, kept }` — criterion 5's subprocess parses it.

## 5. Do-not

- Do not edit any test file — a red planned test with correct code is a mismatch returned to A, not a test fix.
- Do not touch `src/leftovers.ts`, `src/status.ts`, `src/akrogon.ts`, `docs/`, `README.md` (Unit 2).
- Do not add fallback behavior or catch-alls; keep specific error paths.
- Do not change `stopSlice`/`sliceKeepReason` signatures or herdr/systemctl boundaries.
- Do not use `pkill`/`killall`/pattern kills; runs stop via `akrogon stop-run <id>` only.
- Mismatch: if a planned test contradicts an interface or needs a different shape, return a mismatch naming the test, the conflict, and the smallest plan correction — don't silently deviate. Exception: a revised brief from A.

## 6. Ordered steps (advisory: ~3 files, <40 turns)

1. `src/config.ts`: add `retiredLeafTempRoot()` (criterion 2).
2. `src/reconcile.ts`: report schema + `clears` + existence prune (criteria 8 side, 9).
3. Store/legacy sweep rewrite (criteria 1, 3, 6, 7, 9) incl. `.owner` orphan rules and `<pid>.tmp` (4).
4. Leaf temp rules: young `run-*`, strays, slice check, empty repo-hash dir (criteria 1–5).
5. `reconcileNeedsPanes` widening (criterion 10).
6. `reconcileHost` retired/locks/worktrees/tmp sweep (criterion 2).
7. Run the targeted tests (§7); iterate until green.

## 7. Commands

Keep output via `akrogon run-check --name <label> -- <cmd>` from the worktree; cite the printed `check <label>: <exit> <path>` line in your report.

- `akrogon run-check --name u1-reconcile -- bun test tests/reconcile.test.ts`
- `akrogon run-check --name u1-slices -- bun test tests/leaf-slices.test.ts`
- `bun run typecheck` (or `bunx tsc --noEmit` if that script differs — check package.json first)

Do NOT run `akrogon verify` or the full suite — A owns those.

## 8. Done-when, evidence, report

All §2 tests green on your head plus no new failures in the two files vs. base; typecheck clean; one commit containing only your files.

Report these four lines plus commit id:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
