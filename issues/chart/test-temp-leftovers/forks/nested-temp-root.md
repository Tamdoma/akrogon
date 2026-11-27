# Nested temp root

## Question

1. Where does the fix for the /var/tmp leak go? 1a: add AKROGON_LEAF_TEMP_ROOT and AKROGON_RETIRED_TEMP_ROOT to `copied` in `src/run-check.ts` `constructedEnv`. 1b: forward the full fixture seam set verify forwards, or one shared list for run-check, verify and land.
2. What does the leaf promise about the worktree store? 2a: narrow the chart outcome to the leaf temp root and record the store leak under Off route with its non-reproduction evidence. 2b: add a store-resolution boundary test.
3. How is the fix proven? 3a: one CLI boundary test, red on base. 3b: a host-scan guard.

### Carries

- Signposts, forks/signposts.md `## Taken`: fix the mechanism that fails, free tests at the real boundary, extend existing records, one leaf unless a part is useful alone, old records keep parsing.

## Findings

- Map, merged with attribution: slots/map-merged.md (A,B,C,D). Cause proven by A (O2), B (O4), C (Observation 1) and D (probe 2): `constructedEnv` drops both temp-root names, a nested akrogon call falls back to `/var/tmp/akr-<uid>`, creates `<hash4>/<hash8>` and removes only `run-*`. Leaking tests: `tests/state-home.test.ts` (1 per run), `tests/run-permit.test.ts` (3 per run) (C, confirmed by A and B).
- Research: better-than-training · `src/run-check.ts` `copied`/`constructedEnv`, `src/verify.ts` `passForwarded`, `src/land.ts` `launchLand`, read 2026-11-25 · verify and land forward both names, run-check does not · decided 1a over 1b.
- Research: better-than-training · `tests/isolation.test.ts` "suite isolation" test, read 2026-11-25 · already asserts `worktreeStore(repo)` resolves under the suite root and `homedir()` is not `/home/ivan` · a 2b test would duplicate it and pass on base.
- Research: better-than-training · commit dc426cd7 (2026-11-22) · `reconcileHost` stopped deleting unregistered store and temp dirs, which is why leaks became visible now (C).
- Store leak not reproduced: A (19 files + bisect), B (full suite, 17 files, git-shim trap), C (full suite), D. HOME forwarding in land (fd413e7e, 2026-10-19) and verify (a45c3e00, 2026-10-27) predates the pileup window (B rebuttal).
- Rebuttals: C none, D none, B one: the picks give clause 2 of the intake outcome (worktree store) no proof (slots/rebuttal-B.md). B withdrew its 1b and store-move advocacy.

## Taken

A's picks under full autopilot, not operator words (2026-11-25):

1. 1a. Two names close the proven failure at its mechanism, matching verify and land (signpost 1, operator value: removing over adding). Rejected 1b: forwards names no observed failure needs, and AKROGON_RUN_SLICE changes nested-run behavior. Rejected per-fixture crutches and a test-mode refusal (A,B,C,D).
2. 2a. The chart outcome is narrowed to the leaf temp root. The store clause goes to Off route with its evidence and a reopen trigger. Rejected 2b: a test that passes on base and duplicates `tests/isolation.test.ts` is a vanity test under standing design. Standing dissent: B (slots/rebuttal-B.md), who holds that the leaf otherwise ships no proof for the store clause; answered by narrowing the outcome at chart level rather than in the leaf.
3. 3a. One CLI boundary test, red on base, green after (signpost 2). Rejected 3b: the default root is shared with live seats, so a host scan fails falsely (A,B,C,D).

Binding decisions carried into the leaf:
- The two names are added to `copied` only, never to `repoSchema`'s reserved constructed-env names, so configs that already list them in `env`/`pass_env` keep parsing (C, signpost 6).
- The exact-allowlist expectation in `tests/run-check.test.ts` lists the two names as an expectation update.
- The proof test computes the default-root path for its own fixture repo in-process and never scans the shared `/var/tmp/akr-<uid>` root.
- The product host sweep (`src/reconcile.ts` `reconcileHost`) is not changed.

Leaf review (2026-11-25, slots/leaf-review-{B,C,D}.md): final shape, none from B, C or D. Drafts: B none, C none, D one: the proof did not show AKROGON_RETIRED_TEMP_ROOT arrives, since a nested run-check never reads it. Adopted: the nested command records both values and the test compares them to the caller's (brief criterion 1, design standing-design lines, tagged (A,D)). A proof restatement, no new mechanism, so no second check.
