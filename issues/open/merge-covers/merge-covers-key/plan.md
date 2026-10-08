# Plan: merge-covers-key

## Decisions

- D1: Add `merge_covers: z.array(text).default([])` on `repoSchema` directly after `merge_checks` in `src/config.ts:48`. Keep `text` as is. Whitespace names fail as unknown names.
- D2: Validate with `superRefine` on `repoSchema`. One issue per unknown name in `merge_covers`, message naming that name. One issue when `merge_covers` is non-empty and `merge_checks` has no keys, message naming the `merge_covers` value. `readRepo` in `src/config.ts` and `initialize` in `src/init.ts` catch the parse error and rethrow with a `repo <name>:` prefix so the final message names repo and bad value. `initialize` computes root and repo name before parsing.
- D3: `withSetup` passes `merge_covers` through by spread without wrapping. It holds names, not commands. No mapping change. Covered by a regression test with `setup` set.
- D4: `merge_covers` appears in `akrogon config` output automatically through the existing spread in `effectiveConfig`, defaulting to `[]` for repos without the key and for `repo: none`. No extra output code.
- D5: Edit only the two merge run sentences in `skills/merge-issue/SKILL.md:41` (stack) and `:51` (solo) to run every `checks` command not named in `merge_covers`, then every `merge_checks` command. Add one clarifier that red in `:63` and `rerun` in `:47` reuse the same filtered set. No other merge wording changes.
- D6: `docs/guide/merge.md:3` states the same skip rule. `docs/guide/setup.md` adds a `merge_covers` bullet after the `merge_checks` bullet. `skills/init-akrogon/SKILL.md:22-32` proposal template adds `merge_covers: []` with a one-line comment that entries must be `checks` names covered by `merge_checks`.
- D7: Prove criteria 1 and 3 in `tests/config.test.ts` with a fail-first break each. Prove criteria 2 and 4 by fixture execution with marker files, not by asserting prose text. No automated merge integration test and no live push, because the skip lives in skill prose run by the merge seat.
- D8: No change to check-issue or implement-issue behavior, no new check ordering or parallel runs, no inference of coverage from command strings. Framework operator step adding `merge_covers` to framework `issues/config.yaml` stays outside this leaf.

No brief/design conflict. The design names `skills/init-akrogon/SKILL.md` in addition to the brief docs, which is consistent.

## Read-first

- `docs/reference-index.md`
- `src/AREA.md`, `skills/AREA.md`, `tests/AREA.md`
- `src/config.ts`, `src/init.ts`
- `tests/config.test.ts`, `tests/helpers.ts`
- `skills/merge-issue/SKILL.md`
- `docs/guide/merge.md`, `docs/guide/setup.md`
- `skills/init-akrogon/SKILL.md`
- `issues/chart/merge-covers/forks/merge-covers.md`
- `learnings/LESSONS.md`

## Interfaces

- `repoSchema`, `RepoConfig`, `readRepo`, `withSetup`, `effectiveConfig` in `src/config.ts`
- `initialize` in `src/init.ts`
- `akrogon config` output keys `checks`, `merge_checks`, `merge_covers`
- `fixture`, `cli`, `yaml` in `tests/helpers.ts`

## Acceptance criteria

- A1: A repo without `merge_covers` runs every `checks` command then every `merge_checks` command at merge.
- A2: With `merge_covers` set, merge runs only uncovered `checks` commands then every `merge_checks` command, on stack green/red/rerun and solo green/red/rerun.
- A3: Config load refuses an unknown `merge_covers` name and refuses non-empty `merge_covers` with empty `merge_checks`, naming repo and bad value in each error.
- A4: A mixed config runs uncovered checks at merge and all checks in check and implement passes.
- A5: `merge_covers` appears in `akrogon config` output. `docs/guide/merge.md` and `docs/guide/setup.md` state which checks merge skips.

## Units

### Wave 1: U1, U2, U3 run together. Disjoint paths, no shared test resource, no ordering dependency.

- U1: Config schema, validation, output, unit tests
  - Owns: `src/config.ts`, `src/init.ts`, `tests/config.test.ts`
  - Uses: none. Tests use isolated fixtures from `tests/helpers.ts`.
  - After: none
  - Covers: A1, A3, A5 output part
  - Changes: add `merge_covers` field per D1, `superRefine` per D2, repo-name wrap in `readRepo` and `initialize`, keep `withSetup` passthrough per D3, add tests for default `[]`, output presence, unknown name refusal, empty `merge_checks` refusal, mixed config load, and `setup` leaving `merge_covers` unwrapped.

- U2: Merge skill prose
  - Owns: `skills/merge-issue/SKILL.md`
  - Uses: none
  - After: none
  - Covers: A2, A4 merge side
  - Changes: update `:41` and `:51` per D5, add one red/rerun clarifier. Leave check-issue and implement-issue untouched.

- U3: Operator docs and init template
  - Owns: `docs/guide/merge.md`, `docs/guide/setup.md`, `skills/init-akrogon/SKILL.md`
  - Uses: none
  - After: none
  - Covers: A5 docs part
  - Changes: update merge guide lead, add setup bullet, add `merge_covers: []` to init proposal per D6.

## Docs affected

- Agent `skills/merge-issue/SKILL.md`: merge runs uncovered `checks` then all `merge_checks` on every path.
- Agent `skills/init-akrogon/SKILL.md`: proposal template includes `merge_covers` with coverage guidance.
- Human `docs/guide/merge.md`: states merge skips `checks` named in `merge_covers`.
- Human `docs/guide/setup.md`: documents `merge_covers` beside `merge_checks`.
- Implementer greps `docs/` and `skills/` for `every \`checks\`` and reports hits outside these four as unchanged with a reason, per the stale-rule lesson.

## Verification

- C1 maps to A1
  - Proof: `bun test tests/config.test.ts` including the new default test asserting `merge_covers` is `[]` and present in `akrogon config` output. Fail-first: set the default to `["test"]`, show the test fails, restore.
  - Catches: missing or wrong default that would skip checks for repos without the key.
  - Size: seconds
  - Rerun: `src/config.ts` or `tests/config.test.ts` change

- C2 maps to A2
  - Proof: throwaway fixture repo under `$TMPDIR` with `checks` writing `keep.marker` and `drop.marker`, `merge_checks` writing `merge.marker`, `merge_covers: [drop]`. Follow the merge prose for six runs: stack green, stack red with failing `keep`, stack rerun, solo green, solo red, solo rerun. Record which markers each run wrote in the report. No push.
  - Catches: covered check still run at merge, uncovered check skipped, red or rerun using the unfiltered set.
  - Size: minutes
  - Rerun: `skills/merge-issue/SKILL.md` or `src/config.ts` change

- C3 maps to A3
  - Proof: `bun test tests/config.test.ts` including new cases for unknown name and for non-empty covers with empty `merge_checks`, asserting non-zero exit and stderr containing repo name and bad value. Fail-first: disable the refine, show both tests fail, restore.
  - Catches: unknown names accepted, empty `merge_checks` with covers accepted, error missing repo or value.
  - Size: seconds
  - Rerun: `src/config.ts`, `src/init.ts`, or `tests/config.test.ts` change

- C4 maps to A4
  - Proof: same fixture as C2. Show the merge run writes only `keep.marker` and `merge.marker`, then a full `checks` run writes both check markers. `grep -n merge_covers skills/check-issue/SKILL.md skills/implement-issue/SKILL.md` returns nothing.
  - Catches: check or implement filtering when they must run all checks, merge not filtering.
  - Size: minutes
  - Rerun: `skills/merge-issue/SKILL.md`, `src/config.ts`, or check/implement skill change

- C5 maps to A5
  - Proof: `bun test tests/config.test.ts` asserting `merge_covers` in `akrogon config` output for set and default cases, plus `grep -n merge_covers docs/guide/merge.md docs/guide/setup.md`.
  - Catches: key missing from output, docs silent on the skip rule.
  - Size: seconds
  - Rerun: `src/config.ts`, `docs/guide/merge.md`, or `docs/guide/setup.md` change

Handoff still runs every `checks` command per the implement skill. That run is not criterion proof. No `merge_checks` run and no whole-suite proof is added. Not a slow-run leaf, so no restart boundaries.

## Limitations

- Coverage is declared, never inferred. A wrong `merge_covers` entry silently skips a check that `merge_checks` does not actually cover. No command detects that mismatch.
- Merge skip proof is manual fixture execution. No automated test reruns the six merge paths after this leaf.

## Credentials

- Checked `akrogon status merge-covers-key`. No `Missing:` lines.
- The design names no operator-supplied variable. `AKROGON_BASE` is derived by the command. No human-only blocker.
