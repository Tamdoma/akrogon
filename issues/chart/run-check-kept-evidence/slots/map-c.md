# Territory map: run-check-kept-evidence (slot C)

## Material forks

1. **How does a kept failed `run-*` tell `reconcile` to spare it while the leaf lives?**
   - (a) Write `.kept` in `runRoot`, then remove `.owner`; `reconcile` (`src/reconcile.ts` `reconcile`) skips `.kept` `run-*` silently (no `drop`, no `keep`), and `ownerKeeps` (`src/reconcile.ts` `ownerKeeps`) returns `[]` for `.kept` `run-*`.
   - (b) Store `kept: true` inside `.owner` (`ownerSchema` in `src/reconcile.ts`).
   - (c) Delete `.owner` with no marker (rely on existing ownerless `run-*` rules).
   - Risks: (a) touches both `reconcile` and `ownerKeeps` (omitting `ownerKeeps` triggers `'run younger than 60s'` on tab close within 60s); old akrogon sees ownerless `run-*` (idle-swept after 60s, never stuck). (b) mixes liveness with retention and risks PID-recycling vetoes in `ownerKeeps` unless `kept` short-circuits `ownerDead`. (c) fails 2a: emits `'run younger than 60s'` then `'unowned entry'` in `leftovers` and wipes on idle.
   - **Pick: (a)** — mirrors `refusePublish` (`src/run-check.ts` `checkedRun`), zero PID-recycling risk, silent while leaf runs, swept automatically with `leafTemp`.

2. **Which red runs keep `runRoot`?**
   - (a) Normal non-zero exit when `runRoot` is non-empty (has any entry other than `.owner`).
   - (b) Every normal non-zero exit, even if nothing was written to `$TMPDIR`.
   - (c) Also keep killed/crashed wrappers (dead `.owner`).
   - Risks: (a) adds one `readdirSync`, avoids empty `run-*` clutter from red typecheck/lint runs, keeps empty-failure tests green. (b) accumulates empty `run-*` dirs on every red check. (c) breaks dead-owner crash cleanup pinned in `tests/reconcile.test.ts` and violates 1a.
   - **Pick: (a)** — preserves evidence with zero noise when a failing command wrote nothing to `$TMPDIR`.

3. **Caller scope: `run-check` only, or `verify` (`checkedRun`) too?**
   - (a) Parameter on `checkedRun` (`src/run-check.ts` `checkedRun`): `true` from `runCheck`, `false` from `verify` (`src/verify.ts` `runOnce`).
   - (b) Apply to all `checkedRun` callers, including `verify`.
   - Risks: (a) adds one boolean flag, preserves `verify`'s cleanup test and stops `--known-red` / full-suite `verify` runs from piling up large browser/build temps in `leafTemp`. (b) needs no flag (1a), but breaks `tests/verify.test.ts` and retains heavy `verify` temps whose detached checkout is already gone.
   - **Pick: (a)** — one boolean protects `verify`'s temp contract and disk budget while covering every `run-check` command.

4. **How are `--holder` (`slug: 'checkout'`) runs handled (`ownTemps` in `src/reconcile.ts` `reconcile`)?**
   - (a) Leave `ownTemps` unchanged: `reconcile` calls `dropUnowned(dir)` whenever `kept.length === keptBefore`.
   - (b) In `reconcile`'s `ownTemps` branch, silently skip `dropUnowned(dir)` while any `.kept` `run-*` inside is younger than a bounded window (e.g. 60m, matching `verify-passes` in `src/reconcile.ts` `reconcileHost`), then sweep normally.
   - (c) Retain only for leaf targets (`slug !== 'checkout'`).
   - Risks: (a) fails both ways for chart `--holder` runs: wipes immediately when repo is idle and flags `checkout` as `'unowned entry'` in `leftovers` when a leaf runs (violates 2a). (b) adds one age check to `reconcile` (second half of the same rule), letting `--holder` evidence survive idle passes and self-sweep silently. (c) leaves chart `--holder` captures dropping evidence (violates 3a).
   - **Pick: (b)** — keeps `--holder` runs working without `leftovers` pollution and guarantees automatic cleanup without manual action.

5. **Visibility in `run-check` stderr, `status` and `leftovers`?**
   - (a) Keep `runCheck` stderr (`check <name>: <code> <log>`) unchanged and emit no `kept` entry in `reconcile`.
   - (b) Add a stderr kept-path line and/or record a `kept` entry whitelisted in `inUse` (`src/leftovers.ts`).
   - Risks: (a) zero parser/test breakage, stays invisible in `status`/`leftovers` per 2a; the child's printed path stays valid per 4a. (b) couples `src/leftovers.ts` `inUse` and risks breaking stderr assertions.
   - **Pick: (a)** — smallest surface and matches 2a/4a directly.

## Consumers of `runRoot` touched

- `src/run-check.ts` (`checkedRun`, `runCheck`): creates `runRoot`, writes `.owner`, writes `.kept` + unlinks `.owner` on non-empty red exit, skips `rmSync(runRoot)`.
- `src/reconcile.ts` (`reconcile`): `runEntries` loop skips `.kept` `run-*` silently; `ownTemps` branch respects bounded `.kept` age (fork 4b).
- `src/reconcile.ts` (`ownerKeeps`): ignores `.kept` `run-*` so `dropChecked` (leaf temp release) and `dropPath` (`reconcileHost` unregistered-repo sweep) never veto with `'run younger than 60s'`.
- `src/verify.ts` (`runOnce`): passes `keepOnFailure: false` (fork 3a).
- Verified unchanged: `src/reconcile.ts` (`reconcileNeedsPanes`) already triggers on any `leafTemp` entry; `src/status.ts` (`statusCommand`, `jsonRepo`) and `src/leftovers.ts` (`leftover`) stay clean when `.kept` emits no `kept` row; `src/pack.ts` never scans `/var/tmp`.

## Existing tests pinning today's behavior

- `tests/run-check.test.ts`: `'run-check TMPDIR is a fresh run root under the leaf temp dir and is removed on success and failure'` (empty red `exit 7` — still passes under 2a; needs a non-empty red test); `'run-check gives the command a private run root as TMPDIR and captures output live in the holder'` (only `.owner` during run); `'run-check preserves failed executable errors and removes their capture directories'` (spawn error still deletes `runRoot`).
- `tests/verify.test.ts`: `'verify removes each command TMPDIR on success and failure'` (writes `$TMPDIR/command-temp` then `exit 7` — pins 3a, breaks under 3b).
- `tests/reconcile.test.ts`: `'run root with a dead owner pid is removed, live owner kept'`, `'live owners keep run dirs and build records; a young ownerless run dir stays'`, `'a dead-owner run dir is removed under an unavailable pane list, strays stay'`, `'a failed leaf temp stays while its tab lives, because its seats still use it as TMPDIR'`, `'an unfinished leaf temp is removed once its tab is gone and kept silently while its tab lives'`.

## Practitioner questions

- Should `--holder` (`checkout`) kept runs use the 60m drain window (4b), or is `--holder` out of scope for idle survival?
- Is leaf-tab close (already kept open for `failed` leaves until closed) the accepted expiry for failed-leaf evidence, with no post-tab-close retention?
- Does the stopping leaf also update `docs/reference/checks.md` / `src/AREA.md` and retire both `learnings/LESSONS.md` lines (including the uncommitted 2026-11-20 line once committed)?

## Lifetime pitfalls and removals

- **60s `ownerKeeps` veto on fast tab close** (`src/reconcile.ts` `ownerKeeps`): ownerless `run-*` under 60s triggers `'run younger than 60s'` + `'live owner inside'` -> **Removed by** returning `[]` in `ownerKeeps` when `.kept` exists.
- **Marker/owner ordering race** (`src/run-check.ts` `checkedRun`): deleting `.owner` before writing `.kept` exposes an ownerless window to concurrent `reconcile` -> **Removed by** writing `.kept` before unlinking `.owner`.
- **Child alters `$TMPDIR` permissions or deletes `.owner`**: `chmod 0500 "$TMPDIR"` or missing `.owner` would throw in `finally` and mask the child's exit code -> **Removed by** `chmodSync(runRoot, 0o700)` before writing `.kept` and `rmSync(.owner, { force: true })`.
- **Publish-refusal collision**: late `refusePublish` writes `refusal.json` and throws -> **Removed by** gating `.kept` strictly on `!refused && exitCode !== 0` (leaving `refusal.json` checked first in `reconcile`).
- **Disk accumulation across many red runs in one leaf**: repeated large failures stay until tab close -> **Removed by** skipping empty runs (2a), excluding `verify` (3a), and automatic `leafTemp` sweep on tab close.
- **Nested negative-test `run-check`**: an inner failing `run-check` inside a green outer test leaves a `.kept` `run-*` if it wrote to `$TMPDIR` -> **Removed by** leaf-temp sweep at tab close (and note in tests that inspect `scratchRuns`).
- **Mixed-version rollback**: older akrogon running `reconcile` on a `.kept` dir (no `.owner`) sweeps it after 60s when idle rather than pinning `'invalid .owner record'` -> **Removed by** using a separate `.kept` file instead of changing `.owner` schema.
