# Report: check-env

Base `354c80e14aca6483c430312c61ae5c1397bb548e` → head `d24a8d6` on branch `check-env`.

## Changed files and reasons

| Commit | Files | Why |
|---|---|---|
| `e85d49a` | `src/config.ts`, `tests/config.test.ts`, `tests/next.test.ts`, `tests/batch-merge.test.ts`, `docs/guide/setup.md` | `repoSchema` `env:`/`tools:` fields + reserved-name refinement; `leafTemp` default root → `~/.akrogon/scratch/<repo>`; `withSetup` wraps every printed check/merge_check/advisory command in `akrogon run-check --name <n> -- sh -c <inner>` (no-setup repos too). Exec-path tests strip the wrapper until the verb existed; stale `/tmp/akrogon-<uid>` root assertion updated. (D4, D5, D8, D9) |
| `cb5c689` | `src/run-check.ts` (new), `src/akrogon.ts`, `tests/run-check.test.ts` (new), `tests/helpers.ts` (`fakeAkrogon`), `README.md`, `tests/command-reference.test.ts`, `src/AREA.md` | The verb: refuse six forbidden caller env names and global bunfig (`$HOME`/`$XDG_CONFIG_HOME` `.bunfig.toml`) before mkdtemp; `mkdtemp` run root under `leafTemp`; `.owner` `{pid, boot_id, started}`; allowlist env (`HOME`, `PATH`, `XDG_CACHE_HOME`, `NODE_DISABLE_COMPILE_CACHE`, `TMPDIR`, computed `AKROGON_BASE`, declared `env:` names); tee output to `out.log`, copy to `<leaf>/implementation/check-<name>-<id>.log` (or `--holder` dir), remove run root in `finally`; exit = child code. (D1, D2, D3, D6, D7) |
| `ddc0931` | `src/state.ts`, `src/attempts.ts`, `src/next.ts` (mergeWake only), `tests/merge-attempts.test.ts`, `docs/guide/files.md` | `tools` optional on `batchSchema` and `attemptRecordSchema`; `resolveTools` (`which` + first `--version` line, `'unknown'` on failure) runs inside `mergeWake`'s `withLock` before the batch record; `appendAttempt` copies `batch.tools`. (D8) |
| `d24a8d6` | `src/next.ts` (allocate only), `tests/next.test.ts` | `ensurePrivateDir` recursive mkdir so `~/.akrogon/scratch` ancestors are created; all refusals unchanged. (D5, DC4) |

## Commands run with results

All `checks` commands (run via `sh -c` on the printed strings; the wrapper's `akrogon` was a `bin/akrogon` symlink to the worktree `src/akrogon.ts` since installed akrogon is the pre-leaf copy — expected self-reference, see limitations):

- `bun run typecheck` — clean.
- `bun run format` — reformatted only pre-existing drift in `skills/chart-issues/scripts/peer-wait.ts` and `src/status.ts` (known lesson 2026-10-08); both reverted, diff clean.
- `bun test --timeout=30000` — **710 pass, 0 fail, 35 files, 83.46 s** (log `/tmp/check-env-full-suite.log`).
- `test_changed` — run after each cherry-pick: 563 → 678 → 681 pass, 0 fail.

Done-criterion evidence (live end-to-end, run in the lane worktree with `bin/akrogon` on PATH):

- DC1: `SECRET_LEAK=visible akrogon run-check -- sh -c 'echo $SECRET_LEAK'` printed empty inside the command; `TMPDIR=/home/ivan/.akrogon/scratch/akrogon/check-env-c5b0ad06f37f/run-nliAoB`; run root absent after exit (scratch dir empty). `env:` copying proven in `tests/run-check.test.ts`.
- DC2: `NODE_PATH=/tmp akrogon run-check -- sh -c 'touch /tmp/refuse-ran'` → exit 1, `Refusing to run: NODE_PATH is set`, marker never created. Per-var + bunfig refusals in `tests/run-check.test.ts`.
- DC3: two concurrent runs got distinct roots `run-X3qY7p` / `run-1mRX67`.
- DC4: `TMPDIR` under `~/.akrogon/scratch/akrogon/` in the probe above; seat `TMPDIR=` herdr arg proven in `tests/next.test.ts`; no `/tmp` literals in leaf scratch handling.
- DC5: `tests/merge-attempts.test.ts` — real `cli next` dispatch with a fake `tool-a` records `{name, path, version}` on `batch.tools` and the JSONL attempt line; missing tool fails dispatch before any batch.
- DC6: the akrogon repo config has no `setup`; the probe above ran wrapped, constructed-env, refusal-capable commands on it.
- DC7: `run-check` copied `check-probe-*.log` into `<leaf>/implementation/` on success and `check-fail-*.log` on `exit 3`; run root removed both times; `--holder /tmp/holder-probe` from the registered checkout wrote `check-h-*.log` there. Probe logs removed after verification.

## Known limitations

- `BUN_OPTIONS` set to a value bun itself cannot parse kills the wrapper process before our refusal (bun behavior; test uses a survivable value). Bun auto-loads a leaf `.env` before the verb runs, so a forbidden name stored there also trips the refusal (plan D3).
- Child output is buffered then echoed after exit, not streamed live.
- Old `merge-attempts.jsonl` lines lack `tools` (schema optional). Failed or empty version probes now fail dispatch with full command context.
- `run-check` mkdir of the scratch root uses mode 0700 only for the final dir; intermediate ancestors get umask modes — production paths go through `allocate`'s validated `ensurePrivateDir`.
- Wrapped commands resolve `akrogon` through caller PATH: this repo's own printed checks run the *installed* copy, which gains `run-check` only after this leaf merges and installs.

## Unverified criteria

None.


## Review repairs 2026-10-10

Repair head: `91967bb`. B repaired both seats' findings. FFmpeg uses `-version`, failed/empty probes preserve command error context, and resolved executables are used for probing. Printed check names are shell-quoted and encoded in log basenames, preserving accepted spaces/slashes. Printed-command execution tests now run the real wrapper through the source shim, with functional refusal-before-setup and environment proof.

Fail-before/pass-after evidence, deliberate wrapper-removal proof, per-finding commits and logs are recorded in `../review-B.md` under `check.repair`. No plan/design changes or handoff to A were required.

Final repaired-source checks: format and typecheck exit 0, full suite 714 pass / 0 fail, changed suite 686 pass / 0 fail. All DC1–DC7 proofs reran in the full suite. Logs and exact check commands are recorded in ../review-B.md. Worktree clean at 91967bb; no remaining run roots.
