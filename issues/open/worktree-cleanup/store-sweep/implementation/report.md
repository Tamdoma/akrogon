# Implementation report: store-sweep

Delegated run, one wave, two workers. Base `fb60ccd` (refreshed from `9800d9e` during this pass — see Refresh); head `0ab2552`.

## Refresh

- `git fetch origin` + rebase onto `origin/main` moved the base `9800d9e` → `fb60ccd`. Conflicts in `tests/reconcile.test.ts` and `tests/status.test.ts` resolved keeping both true sides (upstream's stronger `leftovers` assertions plus this leaf's `host`-block and retired-path expectations). `plan.synthesis`→`implement` state preimages recorded for the two touched files. `AKROGON_BASE` now `fb60ccd`.
- Consequence: kept-status's `leftovers` command landed on the base (`fb60ccd`), so D9 shrank to the `systemd units` → `host` retitle plus existence-pruning of host path entries. plan.md updated.

## Changes

| Commit | What |
|---|---|
| `189f1dc` | Planned tests (planning pass) |
| `aa2a072` | A's test corrections for worker mismatch M1 |
| `cdd582a` | U1 `e1fee15`: reconcile sweep (D1–D8, D10, D11) — `src/reconcile.ts`, `src/config.ts` |
| `b60a30e` | U2 `145361f`: leftovers `host` block + path-existence skip — `src/leftovers.ts`, `README.md`, `docs/guide/next.md`, `src/AREA.md` |
| `869e2a5` | A's test correction: `run.lock` guard exemption for `src/reconcile.ts` |
| `0ab2552` | prettier format `tests/reconcile.test.ts` |

- `src/reconcile.ts`: all-entry store/legacy sweep (registered→leaf/scratch/`unmanaged worktree`; unregistered `<slug>`/`<slug>-*` leaf-owned; `batch-*.owner` orphans kept under `live===null`; `*.<pid>.tmp` dead-pid deletes; unowned entries behind no-running-leaf + pane/process vetoes); leaf-temp young `run-*` (60 s birthtime), leaf-owned strays, busy-slice temp keep, emptied repo-hash dir removal; `clears` optional field + absolute-path existence pruning on kept reports; `reconcileNeedsPanes` widened to the new candidate set; `reconcileHost` filesystem sweep (retired root via `retiredLeafTempRoot`, unregistered `worktrees/<name>` without `.git`, temp-root strays, `runs/last-start`, dead-pid tmp files, retired locks `run.lock`/`framework-tests.lock`/`akrogon-base-runs.lock`/`issues/.lock` held-open check).
- `src/config.ts`: `leafTempRoot()`/`retiredLeafTempRoot()` (`AKROGON_RETIRED_TEMP_ROOT` → `/tmp/akr-<uid>`).
- `src/leftovers.ts`: host block `systemd units` → `host`; host entries whose path contains `/` are skipped when gone.
- Docs: `README.md`, `docs/guide/next.md`, `src/AREA.md` updated for the `host` block and retired paths.

## Commands and proof

| Proof | Command | Commit | Result |
|---|---|---|---|
| Criteria 1–10 + leftovers surface | `akrogon run-check --name sweep-tests -- bun test tests/reconcile.test.ts tests/leaf-slices.test.ts tests/status.test.ts tests/command-reference.test.ts` | `b60a30e` | green, 92 pass / 0 fail; `check sweep-tests: 0 implementation/check-sweep-tests-1792104219284-1571990.log` |
| Full suite | `akrogon verify` | `0ab2552` | green; `check-test 0 implementation/check-test-1792104739702-2857863.log`, `check-typecheck 0 …4741739-2857863.log`, format+setup green (wall time ~2 min per run ×3) |

Earlier runs on `b60a30e`: `akrogon verify` red on (a) `run-permit` src guard (`run.lock` string, fixed by `869e2a5`) and (b) prettier on `tests/reconcile.test.ts` (fixed by `0ab2552`).

## Mismatches and test corrections

- **M1 (U1)**: three planned tests used the suite's `AKROGON_LEAF_TEMP_ROOT` instead of `leafTempRoot(f)`, and `lost-leaf` tripped the `src/next.ts:786` recovery guard (verified at base). Corrected by A in `aa2a072` with `Test-Change:` trailers; expectations unchanged.
- **`run.lock` guard** (found by verify): the run-permit test banned `run.lock` in all of `src/`; the design retires that file by exact name. Corrected by A in `869e2a5` — exemption scoped to `reconcile.ts`, citing the design line.

## Plan note recorded

`loaded === null` (no user manager) removes a finished temp rather than keeping it — recorded in plan.md Implementation notes; keeping it would regress the no-manager fixture tests.

## Known limitations

- U1 reported its test runs deleted the real `/tmp/akr-1000` (default retired root; held only empty retired dirs) — expected consequence of the new host sweep.
- `clears` field is written for new keeps; its per-reason wording follows plan D8.

## Unverified criteria

None — all ten criteria proofs green under `sweep-tests`, full suite green under `akrogon verify`.
