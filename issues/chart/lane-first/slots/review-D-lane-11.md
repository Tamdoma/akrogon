# Slot D review of lane-first, round 11

**Verdict `fix`** for `c47991fd` on `9f2cfc05`.

## Findings

- **F20 · `src/scope.ts:18–23, 126–145`, `src/admission.ts:95–100, 304–311`**. The cgroup path is wrong for the accepted override `AKROGON_RUN_SLICE=-.slice`. I started a real full check there, froze its guard and killed the wrapper. Systemd put the scope directly under the user manager, where `cgroup.events` showed `populated 1`. The helper looked under `.slice/-.slice` and returned false. The next full check started while the old scope was still active. Resolve the root slice to the user manager's cgroup.
- **F21 · `src/stop.ts:64–68`**. The new leaf-slice stop loses the user-bus address recovery. I ran `akrogon stop` against a real populated leaf slice with the check's cut bus and no `XDG_RUNTIME_DIR`. It exited 1 with a bus connection error and left the service active. The same command with the real bus pinned stopped it. Pin the bus for the leaf-slice stop while keeping genuine stop refusals loud.
- **F22 · `src/admission.ts:304–311`, `src/run-check.ts:436–448`**. A dead wrapper can still have a pending scope launch. I held its real scope client before it called systemd, froze its active guard and killed the wrapper. With the scope still unloaded, the next full check's sweep deleted the old record and started the new check. I released the old client while the guard was still active, and both scopes ran together. Fence a pending launch before deleting an empty-scope record whose writer has died.

## Re-check

- **F16 and F17 pass for the original draining-scope case.** I replayed real scope-stop refusals after normal wrapper exit and SIGKILL. The record stayed live, the worker kept its hold, and the queued check started after the refusal was lifted and a sweep drained the scope.
- **F18 and F19 pass.** The two-sweep regression passed and the sweep has no record write. With the fixture on PATH and an empty runtime directory, a real manager connection failure against an active unit surfaced as an error once the synthetic shim was removed.
- **Early `stop-run`.** I gated a real wrapper between guard startup and scope launch. The current combined stop exited 1 with the scope unloaded and left the guard active. When I stopped that guard directly and released the gate, systemd rejected the pending launch and the payload never ran. `Requisite=` closes the reported case once the guard has been stopped. F22 covers the separate case where the wrapper dies and the guard stays active.

All 166 focused tests passed across eight files. Typecheck and `git diff --check 9f2cfc05..c47991fd` passed. The supplied full Verify log records 1,401 passes. Probes used disposable worktrees and private units.
