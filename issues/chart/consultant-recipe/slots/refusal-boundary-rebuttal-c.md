# Rebuttal: refusal-boundary, slot C (chart consultant-recipe)

## Disagreement 1 — P1 pre-push N1 check (`akrogon config` vs worktree `bun src/akrogon.ts config`)

- **Point:** P1 says to re-check N1 "by `akrogon config` immediately before push".
- **Evidence:** The currently installed `akrogon` binary on `PATH` runs the pre-change `src/config.ts` `globalSchema` where `consultant: slotConfigSchema.optional()`. Running installed `akrogon config` against a `~/.akrogon/config.yaml` that still lacks `slots.consultant` exits `0` without error.
- **Consequence:** Using exit status of the installed `akrogon config` as the pre-push N1 gate gives a false pass on a keyless `~/.akrogon/config.yaml`, letting the push trigger auto-deploy (`src/self-update.ts` `deployStage`) and immediately breaking every installed verb including `akrogon rollback` (`src/rollback.ts` `rollback` calls `readGlobal()`).
- **Fix:** Run the new code's `bun src/akrogon.ts config` from the implementation worktree (with real `HOME` / unset `AKROGON_HOME`) as the pre-push N1 check — it parses `~/.akrogon/config.yaml` with the new required `globalSchema` and fails loudly if `slots.consultant` is absent or names a missing harness.
