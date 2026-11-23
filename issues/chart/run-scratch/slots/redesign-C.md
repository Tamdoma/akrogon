# Slot C — Run Roots in RAM Redesign (`run-scratch`)

## Pick: **O4 + `scratch` pointer in `runRoot/.owner`**

Keep `runRoot` (`<leafTempDir>/run-XXXXXX`), `.owner`, `refusal.json`, `out.log`, and `AKROGON_EVIDENCE` **on disk under `leafTempDir`**. When `run_root` is set in machine config, `run-check` allocates **only the command's `TMPDIR` scratch dir** under `run_root` (`<run_root>/r-<8 hex>`), and records its path in `runRoot/.owner` **before** creating it:

1. `runRoot = mkdtempSync(resolve(leafTempDir, 'run-'))` (unchanged, on disk).
2. If `run_root` is configured: validate `ensurePrivateDir(run_root)` (non-symlink dir owned by `getuid()`), compute `scratchDir = resolve(run_root, 'r-' + run.slice(0, 8))` (≤51 bytes total with the 40-byte `run_root` cap — well inside Chrome's 107-byte socket limit).
3. Write `runRoot/.owner` with `{ pid, boot_id, started, ...(scratchDir ? { scratch: scratchDir } : {}) }`, **then** `mkdirSync(scratchDir, { mode: 0o700 })`.
4. Call `constructedEnv(repo, scratchDir ?? runRoot)` — so both `TMPDIR` and `BUN_RUNTIME_TRANSPILER_CACHE_PATH` (`src/run-check.ts:68,77`) live in RAM.
5. In `finally` (`src/run-check.ts:472-474`): **always** `rmSync(scratchDir, { recursive: true, force: true })` (even when `refused === true`, because `refusal.json` and `out.log` live in `runRoot` on disk!), and `if (!refused) rmSync(runRoot, ...)`.
6. In `reconcile` (`src/reconcile.ts:1188`): when `ownerDead(owner)` is true on `runRoot`, if `owner.scratch` is set, remove `owner.scratch` first (guarding: non-symlink, `uid === getuid()`, basename matches `/^r-[0-9a-f]{8}$/`), and only remove `runRoot` if `scratch` is gone. **No second sweep loop at all.**

---

## Why O4 beats O1, O2, and O3

- **O1 (patch flat `run_root`):** Adds four independent mechanisms (second liveness marker in `leafTempDir`, realpath validation, vanish-tolerant flat sweep, persisted "last used `run_root`" state file) and still puts `refusal.json`/`out.log` on volatile tmpfs. Patches symptoms instead of deleting the second owner tree.
- **O2 (mirror `<run_root>/<repo>/<leaf>/run-*`):** Still splits ownership across two trees, so it still hits **F1** (disk `leafTempDir/evidence/` unprotected unless cross-checked against RAM tree), **F2/F4** (symlinked root/ancestor still swept), and **F5** (moving/removing `run_root` strands old trees), while adding 14 bytes (`/<4>/<8>`) to `TMPDIR` against Chrome's socket cap and putting refusals on tmpfs.
- **O3 (move whole `leafTempRoot` to tmpfs):** Pulls long-lived **seat `TMPDIR`** (`src/seat.ts:298`, hours/days of agent scratch — e.g. the 76 MB Nov 7 debug dir), **`AKROGON_EVIDENCE`** (`src/run-check.ts:343`, meant to survive until review), and **`refusal.json`/`out.log`** into RAM, directly undoing `src/config.ts:409` (*"Disk-backed on purpose: /tmp is tmpfs, so test files left there count as memory"*). Also still hits F5 if switched back.
- **Anything simpler?** Bare O4 without recording `scratch` in `.owner` leaks tmpfs dirs on `SIGKILL` until reboot; adding the single `scratch` field to `.owner` before `mkdirSync` closes the crash leak in ~15 lines with zero extra files or sweeps.

---

## What F1–F5 become under O4

| Finding | Outcome under O4 |
|---|---|
| **F1** (live check loses `AKROGON_EVIDENCE` when `checkout` temp is swept) | **Eliminated by class.** `runRoot/.owner` never leaves `leafTempDir`, so existing `kept.length !== keptBefore` (`src/reconcile.ts:1227-1235`) protects `leafTempDir` and `evidence/` automatically. |
| **F2** (host sweep follows symlink `run_root` and deletes unrelated files) | **Eliminated by class.** Reconcile never `readdir`s `run_root`; it only deletes the exact `r-<8 hex>` path recorded in a dead `.owner` (after `lstat` non-symlink + uid check), and `ensurePrivateDir` refuses symlink `run_root` at allocation. |
| **F3** (`ENOENT` race in flat sweep when a check exits mid-scan) | **Eliminated by class** (no flat sweep exists). Also worth a 1-line `throwIfNoEntry: false` guard on the existing `statSync(runRoot)` at `src/reconcile.ts:1176`. |
| **F4** (symlinked ancestor bypasses retired-root exclusion) | **Refusals immune by class** (`refusal.json`/`out.log` stay on disk). Still resolve existing ancestors with `realpathSync` (`canonicalPath`) in `src/config.ts:44-59` so a symlinked `run_root` resolving inside `retiredLeafTempRoot()` cannot have a live check's `TMPDIR` swept mid-run. |
| **F5** (disabling or moving `run_root` strands abandoned roots) | **Eliminated by class.** Each dead `runRoot/.owner` carries its own exact `scratch` path, so normal repo reconcile cleans abandoned tmpfs dirs even after `run_root` is moved or deleted from `config.yaml`. |

---

## Risks, rollback, and proof

- **Memory pressure / `ENOSPC` on tmpfs:** Host has 61.7 GiB `/tmp` (currently 3.9 GiB / 7% used) on 123 GiB RAM, and `akrogon.slice` `memory.events` is `high=0, oom=0`. Keep `run_root` opt-in in machine config so small-RAM hosts stay on `/var/tmp`; always deleting `scratchDir` in `finally` (even on publish refusal) bounds tmpfs usage to concurrent live checks only.
- **Reboot:** tmpfs is empty after reboot; `ownerDead` (`boot_id` changed) makes reconcile treat `rmSync(scratchDir, { force: true })` as a no-op and clean `runRoot`. Publish refusals (`refusal.json`, `out.log`) survive reboot on `/var/tmp`.
- **Crash leftovers (`SIGKILL`):** Zero orphan window because `.owner` is written **before** `mkdirSync(scratchDir)`. Next repo reconcile removes `owner.scratch`, then `runRoot`. Bonus: a test running `rm -rf "$TMPDIR"` (`tests/run-check.test.ts:376`) can no longer delete `runRoot/.owner`.
- **Tests asserting paths:** Existing `tests/run-check.test.ts` assertions (`ls -A "$TMPDIR"` sees `.owner` at `:389-405`, `cat "$TMPDIR/.owner"` at `:486-492`) run with `run_root` unset and pass unchanged. Add focused tests with `run_root` set verifying: `TMPDIR` + `BUN_RUNTIME_TRANSPILER_CACHE_PATH` live under `run_root`, `.owner` + `AKROGON_EVIDENCE` + `refusal.json` stay under `leafTempDir`, `scratchDir` is removed on green/red/refusal, and `reconcile` removes a dead `.owner`'s `scratchDir` even after `run_root` is removed from `config.yaml`.
- **Rollback:** `ownerSchema` (`src/reconcile.ts:286`) is **non-strict `z.object`** and landed `c4cf74a7` already accepts and ignores `run_root`, so rolling back to `c4cf74a7` needs **zero config edits** (only a pre-rollback crashed `scratchDir` would wait for manual `rm` or reboot). Rolling back past `c4cf74a7` requires removing `run_root` from `config.yaml` first.
- **Measurement that proves it:** **D4 (`memory.peak`) does not exist here** — it was cut in `forks/design.md` ("Taken") because `CollectMode=inactive-or-failed` drops the cgroup on scope exit and disk page cache pollutes it anyway. Prove with:
  1. Nested suite wall-clock under load (`timings.jsonl` / `verify-runs.jsonl`: 109 s disk baseline → ~42 s target, and timeout flakes drop).
  2. `/tmp/akr-run` empty (`0` bytes / `0` entries) after full verify (green & red) and after `SIGKILL` + `reconcile`.
  3. `akrogon.slice` `memory.events` (`high` and `oom` remain `0`) and `df -h /tmp` headroom during peak concurrent runs.
