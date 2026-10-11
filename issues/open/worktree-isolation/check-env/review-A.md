# Review A: check-env

Base: `354c80e14aca6483c430312c61ae5c1397bb548e`
Reviewed head: `d24a8d6` (4 commits: e85d49a, cb5c689, ddc0931, d24a8d6)
Worktree clean; HEAD ahead of base; all `Test-Change:` trailers present and judged.

## Verification evidence

- `bun test tests/run-check.test.ts` — 13 pass, 0 fail (rerun during review).
- Full suite at implement: 710 pass / 0 fail; typecheck and format clean at handoff.
- Live probe of printed commands: `akrogon run-check` in the lane worktree hid an undeclared var, set TMPDIR under `~/.akrogon/scratch/akrogon/<slug>-<hex>/run-*`, removed the run root on pass and fail, copied logs into `<leaf>/implementation/`, refused `NODE_PATH` naming it (exit 1, setup never ran), gave concurrent runs distinct roots, and `--holder` from the registered checkout wrote the log to the named dir.
- AREA.md trace: `src/AREA.md` names `src/akrogon.ts` (run-check verb present) and `src/run-check.ts` implied by the new command — both exist. `docs/guide/setup.md` and `files.md` claims match the diff (run-check refusal list, `tools` record shape).
- No doc behavior changed beyond what the leaf implemented; pointers verified live.

## Findings

### Fix

- **F1 — `withSetup` does not quote `--name`, and `run-check` does not validate `name`.**
  Source: an operator writes a schema-valid check name containing a space, e.g. `checks: {"two words": "echo hi"}` in `issues/config.yaml` — `z.record(text, text)` accepts it today.
  Consequence today: `withSetup` prints `akrogon run-check --name two words -- sh -c 'echo hi'`; `--name` consumes `two`, and `words` joins the spawned argv (`['words','sh','-c','echo hi']`), so the command fails with `spawn ENOENT` on `words` before the check runs (reproduced: printed command parsed via `Bun.YAML` and executed through `sh -c` in a fixture repo — non-zero, check never ran). A name containing `/` additionally lands in `check-<name>-<id>.log` and breaks `copyFileSync` with `ENOENT` on the missing subdirectory.
  Gap hit: done-criteria 1/6 — a printed check command must run under the constructed env; a valid config produces an un-runnable command. Fix: `quote(name)` on the `--name` arg in `withSetup` (shell-quote already imported in `config.ts`) and a `runCheck` guard refusing a `name` outside `^[A-Za-z0-9._-]+$` naming it, so filename safety is enforced at one boundary.

## Non-findings

- Buffered-then-echoed child output (no live streaming): permitted by the plan; no criterion requires interleaving.
- `resolveTools` `--version` probe without a deadline inside `mergeTurn`'s `withLock`: declared tools are PATH executables; a hanging `--version` is hypothetical.
- `XDG_CONFIG_HOME/.bunfig.toml` check: matches bun's documented global bunfig locations.
- `.owner` written before spawn; reconciler consumers are other leaves.
- `runCheckInner` wrapper stripping in exec-path tests: correct delegation until installed `akrogon` ships the verb.

## Verdict

`fix` — F1 is a reachable defect on a valid config.
