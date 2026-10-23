# Map A: gh-shim-hang

## Is anything in akrogon still wrong
None found.
- Keyring 404: cut bus is deliberate (src/run-check.ts:67, src/scope.ts:43); docs remedy shipped in bd996a7a (docs/guide/setup.md pass_env bullet).
- Hang: the stall is inside the host's `~/.local/bin/gh` shim (`mise use -g` then `mise x`). Not reproduced here: mise 2026.10.15 under the same env -i, `mise x gh -- gh --version` 0.04 s exit 0; scratch-config `mise use -g --quiet gh` fast exit 0 (2026-10-23, tier: own probe).
- Cleanup when the caller kills run-check: startRunGuard (src/scope.ts:65) stops the run scope when the wrapper pid dies; finally at src/run-check.ts:241 stops units on normal exit. No leaked process.
- "No log kept" follows from killing the wrapper before copyFileSync (src/run-check.ts:255); the run root's out.log is swept as leaf temp. Expected.

## Forks
F1. What closes #110's remainder?
- O1 no code: close #110 by bd996a7a, recording the shim hang as host-side. Pick. Cost: nothing. Later: a shim that stalls stays the host's to fix; the seat's own tool limit already bounds it.
- O2 run-check deadline (flag or config). Rejected: adds a knob with no agreed limit; checks legitimately run long (bun test --timeout=30000 per test, whole suites minutes); every caller already has its own limit; a second limit invites tuning churn and false kills.
- O3 docs line "put the real binary on PATH, not a self-installing shim". Rejected: names one host tool's quirk; a shim that runs `mise use -g` on every call is a host config defect, not an akrogon contract.

## Pitfalls
- Leaving #110 open forever as a partial match: removed by closing with what delivered it.
- Treating an unreproduced host stall as an akrogon bug: removed by the local repro attempt above.

## Question
- Does the reporter's machine still have the self-installing shim? Not ours to answer; the close note names the fix (real binary or plain `mise x` shim).
