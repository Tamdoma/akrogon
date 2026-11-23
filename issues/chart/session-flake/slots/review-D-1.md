# Slot D review of session-flake, round 1

**Verdict `fix`**

Base `814a2387`  
Head `71378d1586860f372d4e6ec30e18bba03c864aec`

## Findings

- **F1 · `tests/hc-fixture.ts:57–67, :360–376`.** Cleanup still leaks slices for removed seats and abandoned workers. I started a real seat, killed and removed its terminal, then ran fixture stop. The terminal list was empty and the slice stayed active. In a second probe I killed a worker after its real seat started. The next worker removed the abandoned core runtime and left its slice active. Cleanup needs a record of the slices the fixture actually launched that survives both terminal removal and worker death.
- **F2 · `tests/hc-fixture.ts:360–375`, `src/scope.ts:8–12`.** A labelled terminal can cause teardown to stop a sibling core's live seat in the same fixture home. I started a real seat in one core, then started a decoy terminal with the same repo and leaf labels outside the seat's cgroup. Stopping the decoy core stopped the real seat. Use actual slice ownership when choosing teardown targets. In a separate-home replay, the same labels selected a different slice and the original seat stayed live. Default production slice keys are separate from the temporary fixture home keys.
- **F3 · `tests/session-reads.test.ts:217–234`, `tests/stand-in.sh:35–39`.** The inherited-terminal test can sample `before` before the stand-in logs its initial argv task, even after entry into the right scope. I gated only the initial write after the idle status. The first `next` returned zero, `before` was zero, and the final count was one after I opened the gate. The sole recorded task was the initial task. Wait for that task to be recorded before taking the comparison count.
- **F4 · `tests/hc-fixture.ts:30–34, :360–378`.** A transient terminal-list failure can leave a live core with no cleanup retry. I refused just the first teardown list request on a private core. The first stop threw before server shutdown. A second stop returned without doing any work, and the socket, seat and slice were still live. Keep the core eligible for cleanup until teardown completes.

## Verification

Delaying real scope entry past the three-second proof window reproduced `seat outside its leaf scope` with the seat PID still in `hc-hold`. The helper's before-and-after measurements support the manager slowdown diagnosis. The controlled delay verified the failure mechanism without recreating the host's historical unit count. F3 showed a separate race in the task count.

All 30 tests across `session-reads`, `session-routing` and `hc-delivery` passed, including the three named cases. Typecheck and `git diff --check` passed. The supplied full Verify log records 1,375 passing tests. The probes used private cores, disposable worktrees and fixture-owned slices.
