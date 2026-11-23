# Slot D review of lane-first, round 13

**Verdict `fix`** for `445b7a71`, rebased as `7bb0245f` on `dd61e865`.

**F25. The blank runtime still reaches user-systemd calls outside the shared stop helper.** I reproduced the following with a cut bus and `XDG_RUNTIME_DIR=""` against real units. The matching calls worked with the normal runtime directory.

- `src/stop-run.ts:27–30,44–47` still pins only the bus. An authorized `stop-run` exited 1 while its check scope remained active. The pass-stop branch builds the same environment.
- `src/verify.ts:925–953` failed before the verify service started. `src/run-check.ts:439–448` ran with default forwarding, but a repo that forwards `XDG_RUNTIME_DIR` failed before its scope payload started.
- `src/land.ts:65–69` reported a live land as dead. Its launch path also writes an empty runtime into the transient service when the caller's variable is unset or blank (`:42,60`).
- `src/status.ts:725–729` showed `Listener: down` for the active listener. `src/reconcile.ts:127–141` silently skipped a finished leaf's slice and left its service active.

Use the normalized bus and runtime for caller-side systemd operations and for the land and verify services that make their own systemd calls. Keep run-check's constructed payload environment and cut bus intact.

**F23 and F24 pass their original replays.** The guard-first sweep kept the record until it drained the newly launched scope, then admitted the queued check. The leaf-slice stop ended a real service with the cut bus and empty runtime. Both new regression tests failed with the previous helpers restored.

The rebased tree matched the local merge tree. Typecheck, `git diff --check`, and 178 focused tests across eight files passed. The supplied Verify log `direct/check-test-1795453408975-599100.log` reports 1,413 suite passes and 815 repeat passes.
