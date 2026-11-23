# Slot D review of flake-zero, round 1

**Verdict `fix`** for `583909da` on `814a2387`.

## Findings

- **F1 · `issues/config.yaml:11`**. The repeat command can run the wrong files or report green when it could not list them. In a disposable repo, I added `tests/with space.test.ts` and `tests/nested/sample.test.ts`. The command ran both and the unchanged `tests/unrelated/space.test.ts` five times each because shell splitting gave Bun a separate `space.test.ts` filter. With `AKROGON_BASE=missing-object`, Git printed `fatal: bad revision` and the check exited 0. Preserve Git's exit status and pass each changed path intact as an explicit Bun file.
- **F2 · `issues/config.yaml:12`, `src/verify.ts:743–771`**. The final design requires repeat to run only after a green suite. The brief flags the mismatch. I ran the test at `tests/verify.test.ts:1619` and confirmed a second full check runs after the first exits 4. The supplied repeat proof took 633 s for this patch's four changed test files. Keep repeat on the full queue and gate it on the suite result before applying the config on main.
- **F3 · `tests/slow-merge.test.ts:180–182`**. The ledger lock makes the rewrite safe, but the release gate applies to just one case. I parked the backdating caller until verify B returned 0 in “a slow merge run is flagged, recorded, printed and notified once,” then resumed the original backdate wait with a shorter probe deadline. It threw `no open merge run to backdate`. The callers at lines 361–364 and 438–440 also start ungated checks. Hold each pass that needs backdating until its receipt has been rewritten.
- **F4 · `tests/run-units.test.ts:699–719, 1180–1188`**. Both proofs still depend on observing a short-lived state. In the killed-wrapper case, I parked the observer until the real scope drained. The first phase probe refused as expected and the test failed `never saw a live holder`. In the surviving-pass case, parking until the four-second payload completed left `waitActive` polling a scope that had already ended. A probe with a shorter wait produced the activation timeout. Gate the holder and payload so the tests control when the states change, then assert the real drain and pass completion.
- **F5 · `tests/watch-timer.test.ts:827–834`**. The pin-death case identified in the design still sleeps 2.5 s and checks that `hc get` returns 0. I delayed that timer's first poll by 4 s. Its screen showed the pinned PID was already gone at the first poll, and the test passed. Wait for the timer to accept the live pin before killing it. The transcript-flip case has the needed latch handshake.

## Verification

- All 267 tests in the four changed test files passed locally. Typecheck and `git diff --check 814a2387..583909da` passed. The supplied full verify log records 1,375 passing tests.
- Real-core seat probes confirmed a seat after a four-second systemd launch delay with a three-second start-proof window. A live harness outside the slice timed out and was removed before its start was recorded as confirmed. A seat finished before the first read returned `start failed t1`.
- The repeat probe found nested tests and skipped a valid empty diff. A test that failed on the first of five runs kept the check red. The supplied proofs cover the transcript-flip fix, the stale unit and concurrent run-units cleanup. The caller-scope wait and self-update environment alignment passed locally without an independent fail-first reproduction.
- The session-flake ledger rebase and post-landing three-suite trials are still pending.
