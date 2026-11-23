# Final-shape check (slot C): land-own-reds

1. **Q3 two-commit rollback fails if pushed together.**
   - Fact: `deployStage` (`src/self-update.ts:241-243`) deploys only `origin/main` tip as one release, and `rollback` (`src/rollback.ts:24-32`) flips to `deploy.yaml`'s `previous`. Both `verifyRunSchema` (`src/verify.ts:69`) and `repoSchema` (`src/config.ts:59`) are `z.strictObject`.
   - Consequence: pushing (a) schema and (b) writer/config together makes `previous` the pre-chart release, which refuses both `verify-runs.jsonl` and any `issues/config.yaml` with `rerun:`. Commit (a) (optional `rerun` in both `verifyRunSchema` and `repoSchema`) must be pushed and deployed as its own release *before* pushing (b).

2. **Q3 `akrogon flaky` miscounts persistent bugs if it reads `rerun.failures` unconditionally.**
   - Fact: on a partial rerun (`[A, B]` fail run 1 → rerun passes `A`, fails `B` with final `exit: 1`, `failures: [B]`), `rerun.failures` still holds `[A, B]` (`design.md:27`).
   - Consequence: reading `rerun.failures` directly reports deterministic bug `B` as a flaky save. `flaky.ts:151-171` must count only units in `rerun.failures` absent from final `failures` (i.e. saved by rerun, or all of `rerun.failures` only when final `exit === 0`).

3. **Q2 `AKROGON_RERUN_NAMES` is stripped by `constructedEnv` and must not live in the verify worktree.**
   - Fact: `constructedEnv` (`src/run-check.ts:63-77`) drops every env var outside `copied` (`:41-50`) and repo `env`/`pass_env`; reserved env names live in `src/config.ts:88-101`.
   - Consequence: setting `AKROGON_RERUN_NAMES` in caller env silently strips it before the rerun runs, and putting the names file inside the verify worktree dirties `git status`. Inject `AKROGON_RERUN_NAMES` in `checkedRun` (like `AKROGON_BASE`, `run-check.ts:337`), reserve it in `config.ts:88`, and place the file in the pass dir (`passesRoot()/<id>/`) or outside the worktree.

4. **Q2 `verify.ts` & `config.ts` side effects of reruns.**
   - Fact: `slowEligible` (`src/verify.ts:218-224`) excludes only `reused`/`blocked`, not `rerun`; `resolvedOnMain` (`src/verify.ts:323-334`) treats any `hit.exit === 0` as resolving a main red; `repoSchema.superRefine` (`src/config.ts:114-132`) validates `full`/`merge_covers` keys.
   - Consequence: rerun wall time inflates `merge-slow` normals unless `slowEligible` excludes `item.rerun !== undefined`; a flaky unit `X` saved by rerun on landed main clears `mainRedCover` unless `resolvedOnMain` ignores `rerun.failures` containing `X`; a typoed `rerun` key silently never triggers unless `superRefine` rejects unknown check names.

5. **Q1 `leafSlice` default-home check vs test harness callers.**
   - Fact: `tests/leaf-slices.test.ts:29,58,345,371` calls `leafSlice(...)` in the test runner (unset `AKROGON_HOME` → default `~/.akrogon`) while spawning `cli(f, ...)` with `AKROGON_HOME: f.home` (non-default).
   - Consequence: if `leafSlice` reads `globalHome()` implicitly, test assertions compute the default hash while the CLI computes the `f.home` hash. Accept an optional `home` parameter on `leafSlice` (defaulting to `globalHome()`).
