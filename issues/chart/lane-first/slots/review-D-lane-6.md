# Slot D review of lane-first, round 6

**Verdict `fix`**

Base `814a2387`  
Head `5debd8b9617ce70d09949956743992db305202b6`

## Findings

- **F12 · `src/stop.ts:92–105, :140–143`, `src/land.ts:212–214`, `src/phase.ts:929–934`.** A refused slice stop can leave land suspended while it holds the global state lock. The initial stop releases `.lock` after marking the leaf stopped. Land can then acquire it before SIGSTOP, for example during a claim or a push. I gated a real land at its claim, paused it while it held `.lock`, and made the first slice stop return `Access denied`. The CLI printed the retry command, but the ordinary retry and a separate lock probe could not acquire `.lock`. The retry completed only after I killed the fixture service. Prevent suspension while land owns the global lock so a refused stop leaves state commands and its own retry usable.
- **F13 · `src/admission.ts:231–235`, `src/stop.ts:92–105`.** If land exits after classification and before SIGSTOP, a missing-unit error aborts the rest of the leaf stop. I held the real pause command until a land service exited on a stale claim and systemd unloaded it. The first stop exited nonzero with `not loaded` and another real service in its leaf slice stayed active. A second stop ended that service. Confirm the land unit has ended after a failed pause and continue teardown when it has. Keep the error when land is still active or its state cannot be confirmed.

## Re-check

- **F11 closed for the original admission-lock deadlock.** The live-write gate held the repo line lock. Stop waited with the land PID running. Opening the gate let the real stop complete and release the line. Under the same lock, records still waiting go to `cancelled` without invoking the pause callback.
- **F10 and the retry diagnostic.** The real pass-stop replay held the queued check while the land PID was suspended. I refused the pass stop, saw the exact suspended-holder retry message and a nonzero exit, then reran the command. It stopped the pass and land before the queued check completed. F12 covers a separate case where the advertised retry cannot run.

All 122 focused tests passed across `install`, `green-merge`, `pause-next`, `run-units`, `command-reference` and `rollback` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. The real-systemd probes used private units, disposable worktrees and test-only timing gates.
