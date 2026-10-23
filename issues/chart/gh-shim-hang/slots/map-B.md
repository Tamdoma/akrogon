# Slot B opening map

Position, 2026-10-23: no confirmed remaining akrogon defect. Pick no code: close #110 as credential guidance delivered by bd996a7a, residual hang outside akrogon ownership. Do not describe the original host's hang as repaired.

## Concrete mechanism

- F1: The hang reproduces outside akrogon in the reporter's `~/.local/bin/gh --version` under a minimal env (INTAKE.md, observation dated 2026-10-21). That implicates the host launcher/toolchain, without identifying which mise step hangs. The observed live process was already `mise x`; blaming only `mise use -g` overstates the evidence.
- F2: No deadline exists: `src/run-check.ts:79` supplies no timeout to `spawnCaptured`; `src/shell.ts:56` awaits exit. This permits a live hung command indefinitely, but no run duration contract was supplied. The seat's 120 s tool limit is not a test duration requirement.
- F3: Cancellation already exists. `src/admission.ts:168` prints the run id; `src/stop-run.ts:9-29` stops the owned run and guard. `src/scope.ts:65-80` stops a scope when its wrapper dies. That guard is cleanup, not a watchdog while the wrapper remains alive. `TimeoutStopSec=5` at `src/scope.ts:53` limits stopping, not running.
- F4: Environment restriction is intentional and declared inputs remain supported (`src/run-check.ts:56-69`). `docs/guide/setup.md:63` now explains gh credentials. Restoring D-Bus would reopen browser escape and contradict the earlier contract.

## Material forks and options

- O1 (pick): no code: close #110. Reason: the code follows its existing contract and the residual failure is independently reproducible in a host launcher. Cost: closure explanation and explicit acknowledgement that the host root cause remains unknown. Future cost: that host may still hang until its launcher is repaired. No arbitrary limit or tool-specific behavior enters akrogon.
- O2: Repair the reporter's host launcher outside this repository, then close on a passing reproduction. Prefer preinstalled gh through the normal mise shim or resolved tool PATH, removing installation/global configuration from each invocation. Cost: access to /home/rudi and before/after probes, unavailable here. Reject as this repo's implementation task. Risk: replacing the launcher can change selected versions or miss project settings. A hardcoded version path breaks on upgrade. `mise exec` can still auto-install missing tools, so it is not proof against every stall.
- O3: Add a general run-check deadline. Reject for this report: it limits damage without fixing the launcher, and no valid duration has been agreed. Cost: duration interface, cancellation, exit/log semantics and tests covering ordinary and nested runs (`src/run-check.ts:230-244`). Risk: valid long checks get killed, or a scope-only implementation leaves nested calls unbounded. If bounded runtime becomes an explicit product requirement, chart it separately.
- O4: Special-case gh/mise, rewrite PATH, or bypass shims in akrogon. Reject: extra tool detection and version-resolution rules for an external failure. Risk: wrong version, lost project environment, different behavior between checks and normal shells.

## Evidence and limits

- E1: operator tier, INTAKE.md read 2026-10-23, original observation 2026-10-21. Strongest incident evidence, but unverified and no captured run log or mise trace.
- E2: better-than-training tier, live repository source and docs cited above, inspected 2026-10-23. Establishes existing behavior, not whether a particular host's shim is broken today.
- E3: operator tier, opening brief's A measurements dated 2026-10-23: mise 2026.10.15 / gh 2.102.1, minimal-env `mise x gh -- gh --version` exits 0 in 0.04 s; scratch-global `mise use` exits quickly. Supplied evidence, not independently repeated by B. Different machine and no matching ~/.local/bin/gh launcher, so cannot disprove E1.
- E4: better-than-training tier, [mise shims](https://mise.jdx.dev/dev-tools/shims.html), read 2026-10-23: normal Unix shims link to mise and resolve the selected tool. The reported shell wrapper adds a separate global setup operation.
- E5: better-than-training tier, [mise use](https://mise.jdx.dev/cli/use.html), read 2026-10-23: installs missing versions and writes configuration, with `-g` targeting global config. [mise exec](https://mise.jdx.dev/cli/exec.html), same date: runs a command with resolved tools/environment and may auto-install missing tools. These distinguish setup from execution, without diagnosing the recorded stall.

## Pitfalls and questions

- R1: Treating a successful other-host probe as a fix. Removed by stating the ownership decision and the unproven original-host status in closure, rather than claiming repair.
- R2: Killing only the shell or using process-name matching can leave descendants or affect other leaves. Existing owned run scope cancellation removes this need. Wrapper-death cleanup does not guarantee a tool timeout actually killed the wrapper.
- R3: Diagnosing by rerunning `mise use -g` against real global state changes the evidence and user setup. Any follow-up uses scratch config, with installed-tool availability and exact launcher/cwd recorded.
- Q1: If closing as external is unacceptable, can the original host provide the exact launcher, mise version, and separate traced `mise use` / `mise x` minimal-env probes? Without that, a claimed root-cause repair is guesswork.
- Q2: Is bounded runtime itself required for all checks, independently of gh? If yes, what actual longest valid check determines the contract? That answer changes O3 from unrelated policy to an explicit feature.
