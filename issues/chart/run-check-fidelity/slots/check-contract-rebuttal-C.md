# Rebuttal C — check-contract (run-check-fidelity)

Agree with the merged picks for Q1a, Q2a, Q3a and one-leaf (Q4a). Disagreements only:

1. **Q4 Differences misattributes the split to C.** My map (slots/map-C.md, Consolidation) proposed chart C-A = G1+G2 as *one* fork ("run-check contract"); I never proposed separating argv from env. The row records a leaf-granularity disagreement between A and B; C held no position on sub-chart splits. Change: drop "C groups argv separately" or mark C as abstaining. A's pick reason stands on its own.

2. **Q2a override needs a stated precondition.** "a repo can still override by listing LANG/LC_ALL in env or pass_env" is true only if LANG/LC_ALL stay out of the `constructedEnv` reserved set in src/config.ts:64-76. The merged text never states this. Change: plan must either leave `constructedEnv` untouched (default: LANG overridable via env/pass_env, LC_ALL listable by a repo) or explicitly decide to reserve LANG. Silent reservation would make the override claim false.

3. **Q1 pitfall: real-run proof should also cover the nested path.** tests/run-units.test.ts's first serial test already spawns a nested run-check inside a real unit (run-check.ts:233, `admission.kind === 'nested'` bypasses `runUnitArgv`). The merged note only says the proof runs through real systemd-run. Change: assert literal argv survives in *both* the scope path and the nested path — nested is the easy-to-miss regression surface since it never consults the flag.

Non-disagreements worth recording: systemd floor is 254 per installed man page, not my ~v233; docs floor at install.md:14 is correct. Guard reaps hung shims on wrapper death (src/scope.ts:63-80), so mise hang is a host issue, off route.
