# Review A: solo-turns

Base: e522c1865538294dc1f65a90c7bcb5309a667513
Reviewed head: 71d022710db27ca397bdd450e574a5144f5ac2c2

## Verification evidence

- `akrogon verify` on 71d02271 is green: format 0, typecheck 0, test 0 (1053 pass, 0 fail, `implementation/check-test-1792422572621-3857322.log`). The full suite includes every planned criterion test (`tests/solo-turns.test.ts` and the new and rewritten cases in `tests/batch-dispatch.test.ts`). Nothing changed after that run, so no rerun is needed.
- Every planned test still runs. No change since planning skips, filters or disables a test or the runner configuration.

## Diff against plan and brief

- F1 to F5 (D1 to D7): checked against `git diff e522c186..HEAD -- src`.
  - `pickMembers`, `redMemberHeads`, `BatchMember`, `batchMemberSchema` and `batchSchema.members` are gone.
  - `buildStack` takes the holder only and returns `{ok, top} | {ok:false}`.
  - `mergeTurn` builds once.
  - `mergeContext` has no `members=`.
  - `reconcileBatch` keeps holder ancestry recovery and loses only the member loop, the second lock block and `global`.
  - In `phase.ts`, `requireBatchTop` is always "descend from top". `batchCheck` keeps the holder range. `batchPush` loses its drift path. `restack` always reads `refs/heads/<slug>`. The `check.fix` stack-red branch is gone.
  - The history schemas keep optional `members` (`src/attempts.ts:35`, `src/timing.ts:55`).
  - A grep of `src` finds no other `batch.members` reader.
- Criterion 4, refusal: `readState` drops `batch.members` only when it is `[]`. Any other value throws a `z.ZodRealError` whose first issue is `Invalid state <abs>/state.yaml`. This keeps the `ZodError` and `Error` catches in `src/status.ts:104` and `next` discovery working. Plan Implementation notes record this refinement of D1, and the guarantee is unchanged.
- Design exclusions hold: B's seat flow, the solo path, `--attempt` checks, `requireGreenReceipt` and lost-push recovery are unchanged. The diff has no green-merge or 4a work and no upgrade code (5a).
- Deploy timing (design): read on 2026-10-19. `akrogon status` lists akrogon as the only repo with open leaves. Neither `merge-solo/solo-turns/state.yaml` nor `merge-solo/green-merge/state.yaml` holds a `batch`. Merge must repeat this read.

## Docs

- `skills/merge-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `src/AREA.md` and `docs/guide/{merge,next,state,files,phases}.md` now describe the holder alone. I read each changed paragraph against the code above and found no wrong claim. `docs/guide/next.md:95` "membership" refers to the queue and is unrelated.
- `src/AREA.md` is 40 lines with the four required sections. I listed the paths it names from the repo root. Every repo path exists. The only misses are `config.yaml`, `deploy.yaml`, `reconcile-host.json` and `stopped.yaml`, which are state-home runtime files, not repo paths, and were named the same way before this diff. No dead pointer.

## Tests

- The deleted batch-dispatch tests proved member stacking only, and the reason given is operator 1a, per the design. The kept holder test ("holder that cannot be rebased") still guards the solo path.
- The fixture edits in 1d1e652c remove `members: []` and carry one `Test-Change` trailer per file citing brief criterion 4 or 5. `tests/batch.test.ts` now expects `stateSchema.parse` to throw for `members: []`, which matches D1: only `readState` drops the empty list, and the schema has no key.
- C4a (history guards) passed on the old code. They were shown red by deliberate breaks, which plan.md records.

## Findings

### Fixes

None.

### Nits

- N1: `docs/guide/phases.md` fails `bunx prettier --check` at base and at head. It is outside the `format` check's paths (`src tests skills/chart-issues/scripts`). This is deferred because it predates the diff and blocks no check. It becomes a Fix if `docs/` joins the format check.
- N2: `readState`'s refusal message is a JSON list of zod issues, with the path in the first issue. It is readable but noisy. This is deferred because criterion 4 only requires that the path appears, and `tests/solo-turns.test.ts` proves that. It becomes a Fix if an operator report or a caller needs the path on one plain line.

## Verdict

nits
