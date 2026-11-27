# Design: nested-temp-root

## Binding decisions, verbatim

### Signposts, from forks/signposts.md

A's picks under full autopilot (operator: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."), not operator words:

1. 1a. Removing the failure class beats guarding it (operator value: simplicity, removing over adding).
2. 2a. Free tests catch these mechanical bugs at lower cost (operator values: speed and price).
3. 3a. Fewest moving parts (operator value: simplicity).
4. 4a. Fewest leaves to dispatch and review (operator value: simplicity).
5. 5a. #157 stalls unattended runs and holds capacity; #153 is the widest change and gains from the others landing first.
6. 6a. No migration step to run or get wrong (operator value: simplicity).

Account: the session prioritizes fixing each mechanism in akrogon itself, proving it with free tests, and reusing existing records. It gives up per-repo config knobs, live-run evidence and new record kinds unless a chart shows no other way.

### Nested temp root, from forks/nested-temp-root.md

A's picks under full autopilot, not operator words (2026-11-25):

1. 1a. Two names close the proven failure at its mechanism, matching verify and land (signpost 1, operator value: removing over adding). Rejected 1b: forwards names no observed failure needs, and AKROGON_RUN_SLICE changes nested-run behavior. Rejected per-fixture crutches and a test-mode refusal (A,B,C,D).
2. 2a. The chart outcome is narrowed to the leaf temp root. The store clause goes to Off route with its evidence and a reopen trigger. Rejected 2b: a test that passes on base and duplicates `tests/isolation.test.ts` is a vanity test under standing design. Standing dissent: B (slots/rebuttal-B.md), who holds that the leaf otherwise ships no proof for the store clause; answered by narrowing the outcome at chart level rather than in the leaf.
3. 3a. One CLI boundary test, red on base, green after (signpost 2). Rejected 3b: the default root is shared with live seats, so a host scan fails falsely (A,B,C,D).

Binding decisions carried into the leaf:
- The two names are added to `copied` only, never to `repoSchema`'s reserved constructed-env names, so configs that already list them in `env`/`pass_env` keep parsing (C, signpost 6).
- The exact-allowlist expectation in `tests/run-check.test.ts` lists the two names as an expectation update.
- The proof test computes the default-root path for its own fixture repo in-process and never scans the shared `/var/tmp/akr-<uid>` root.
- The product host sweep (`src/reconcile.ts` `reconcileHost`) is not changed.

### Standing design

Installed path: /home/ivan/.akrogon/releases/ce0cbbd825cbed80742e58947a4aff39847145a4/skills/chart-issues/assets/standing-design.md

How it applies here:
- One new test, the red-first reproduction of the proven bug (criterion 1). It drives the real CLI (`tests/helpers.ts` `cli()` or the same env construction) with a fixture repo config that declares neither name, and an outer `run-check` whose checked command runs a nested `akrogon run-check`. The fake akrogon shim or the real entry may be used, whichever the existing nested tests use. The nested run's checked command records the `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` values it received, and the test asserts both equal the caller's. A nested run-check never reads the retired root, so the default-root assertion alone cannot prove that name arrives (D). It fails on the base, because the inner run lands under the default root and both names are missing, and passes after. (A,D)
- The default-root path is computed for the fixture's own repo root and slug. The test asserts only that this one path is absent. It never lists the shared root.
- Criterion 2 needs no new test: the existing tests that declare `AKROGON_LEAF_TEMP_ROOT` in repo `env`/`pass_env` already cover it.
- The exact-allowlist test in `tests/run-check.test.ts` gets the two names added. This keeps a policy expectation current. It is not a new test.
- No machinery, no live run, no outside call, no paid launch.

## Leaf architecture

- Owned surface: `src/run-check.ts` `copied` (the names `constructedEnv` copies from the caller), with a comment giving the reason, as the `AKROGON_HOME` entry has. Tests: one new test, plus the allowlist expectation in `tests/run-check.test.ts`.
- Consumers that rely on the changed state: every checked command `checkedRun` starts through `constructedEnv` (verify passes run their commands through run-check). A nested akrogon call reads `leafTempRoot()` and `retiredLeafTempRoot()` (`src/config.ts`). When the caller holds neither name, the copy loop skips them, so production env is unchanged.
- `repoSchema`'s reserved constructed-env names (`src/config.ts`) stay unchanged, so existing `env`/`pass_env` entries naming either variable stay valid.
- Exclusions, with the owner of each:
  - The worktree-store clause of the intake (`~/.akrogon/worktrees/akrogon-XXXXXX`) is Off route in the chart. No current path was reproduced.
  - `src/land.ts` empty-HOME flag, the preload's `AKROGON_HOME`, `tests/hc-fixture.ts` `cleanEnv` and in-process `process.env` mutations: none has a live leak on current code. Chart Off route.
  - The seven existing `env`/`pass_env` crutches in test fixtures stay as they are.
  - `src/reconcile.ts` `reconcileHost` stays unchanged.
  - Existing host leftovers are not this leaf's to delete.
- No dependencies.
