# Q4 check (slot C): home-scoped host names

## Verdict on Q4 mechanism

Directionally right and minimal (`os.userInfo().homedir` fixes the `$HOME`-override blind spot in `8b97c7d8` `src/scope.ts:10`), **but incomplete** — two concrete failure/leak scenarios remain in Q4 itself, and one same-class live-home sweep bug sits right next to it in `reconcileHost`.

## Concrete failure & leak scenarios

1. **Test-home temp leak into `/var/tmp/akr-<uid>-<key>` (Q4 + no forwarding):**
   - `tests/helpers.ts` sets `AKROGON_LEAF_TEMP_ROOT` inside its fixture dir so `f.clean()` removes it. Because Q4 does not forward `AKROGON_LEAF_TEMP_ROOT` in `launchLand` (`src/land.ts:39-44`) or `constructedEnv` (`src/run-check.ts:41-50`), any nested `land` or `run-check` inside a test drops the override and writes to `/var/tmp/akr-<uid>-<key>`.
   - That no longer deletes the live home's `/var/tmp/akr-<uid>`, **but nothing ever removes `/var/tmp/akr-<uid>-<key>`**: `f.clean()` only deletes the fixture dir, and the live home sweeps only `/var/tmp/akr-<uid>`. Every verify run leaks new `/var/tmp/akr-<uid>-<key>` dirs until reboot/manual cleanup.
   - Fix: keep Q4's `homeKey()` derivation *and* forward `AKROGON_LEAF_TEMP_ROOT` in `launchLand` (1 line, matching `src/verify.ts:909`) so fixture-overridden tests stay inside their fixture dir while un-overridden second homes stay isolated.

2. **`homeKey()` edge cases (symlinks, 4-hex birthday collisions, retired root):**
   - `homePath()` (`src/config.ts:231`) uses `resolve()`, not `canonicalPath()` (`src/config.ts:355`): if `$HOME`, `/tmp`, or `AKROGON_HOME` traverses a symlink, two processes for the same home derive different keys (mismatching `leafSlice` and `leafTempRoot`). Canonicalize before comparing/hashing.
   - 4 hex chars = 65,536 buckets (~10% birthday collision at 120 test fixtures, ~50% at 300). Use 6 hex chars (+2 bytes; still well inside Chrome's 107-byte socket path budget).
   - Non-default homes never had the pre-`/var/tmp` retired root `/tmp/akr-<uid>`: only sweep `retiredLeafTempRoot()` when `homeKey() === ''` (or `AKROGON_RETIRED_TEMP_ROOT` is explicitly set), avoiding unnecessary `/tmp/akr-<uid>-<key>` sweeps that could collide with Chart 2's tmpfs root.

## Other shared host names audited (same gap?)

- **SAME GAP — `worktreeStore` & `reconcileHost` worktree/lock sweeps (`src/config.ts:372`, `src/reconcile.ts:1382,1451`):**
  - All three hardcode `resolve(homedir(), '.akrogon/...')` instead of `globalHome()`.
  - Concrete scenario: a second/test home sets `AKROGON_HOME=/tmp/other` while keeping real `$HOME=/home/ivan`. Its `worktreeStore()` writes into the **live** `/home/ivan/.akrogon/worktrees/<repo>`, and its `reconcileHost` (`:1382-1397`) sweeps `/home/ivan/.akrogon/worktrees/*` (deleting any live repo dir currently without a `.git` child or stray files) and `:1451-1458` sweeps live `/home/ivan/.akrogon/{run.lock,framework-tests.lock}`.
  - Fix: `worktreeStore` and `reconcile.ts:1382` should use `resolve(globalHome(), 'worktrees')` (same path for default home; isolated for any `AKROGON_HOME`), and `reconcile.ts:1451` should run only when `homeKey() === ''`.
- **Safe (already per-home under `globalHome()`):** `.lock`, `admission.lock`, `budget.lock`, `runs/`, `runs/locks/`, `verify-passes/`, `reconcile/`, `releases/`, `paused.yaml`, `stopped.yaml`.
- **Safe (already per-repo under git common dir):** `akrogon-worktree.lock`, `akrogon-install.lock`, `akrogon-verify-runs.lock`.
- **Safe (UUID-unique systemd units, no global sweep after `8b97c7d8`):** `akrogon-run-<uuid>.scope` + `-guard.service` (`src/scope.ts:15`), `akrogon-verify-<uuid>.service` (`src/verify-pass.ts:57`), `akrogon-land-<uuid>.service` (`src/land.ts:23`).
- **Singleton per user by design (safe unless a second home calls `install`):** `akrogon-listener.service`, `akrogon.slice` (`src/install.ts:19,40`), and `noticeFolder` (`src/hc.ts:525-526`, isolated per hc session).
