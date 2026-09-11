# Review A: discord-chunk-report

Base: 131b02de1c3352f35371ca391c59beca5f8dcd95
Reviewed head: 549f70f034772e6a0e5a866db2b2017a6a5cad46 (Report chunk progress for failed Discord targets)
Debate: no, so no positions/rebuttal artifacts were expected or used.

## Verdict: ready

## Diff against plan and brief

- D1/D4: `sendWithRetry` counts completed chunks after each success (including a recovered retry) and rethrows the exhausted target's final `DeliveryError` enriched with `delivered`, `failed: 1`, `unattempted: contents.length - delivered - 1`. Non-`DeliveryError` causes propagate unchanged at both catch layers.
- D2: Sequential delivery, one immediate retry with the existing warning, stop after the retry fails, continue with other targets, no resend of successful targets. `main` aggregation and message are untouched.
- D3: `Failure` renamed to `ChunkFailure`; `Failure extends ChunkFailure` with required readonly numeric counters. `DeliveryError` accepts `ChunkFailure` and serializes the whole object, so counters appear in the aggregate member messages.
- D5: Only the two authorized sender files changed. No skill prose, docs, chunking, retry policy or dependency changes. Docs (`skills/broadcast-issue/SKILL.md` line 43, `docs/merge.html`) remain accurate.

## Tests against acceptance criteria

Tests invoke the real sender in a subprocess through the existing controlled fetch boundary. The boundary catches only `AggregateError`, prints member messages, and rethrows, so the failing exit is preserved. Failures are parsed with a strict schema, so assertions are structural.

- AC1: middle-chunk failure with two targets asserts PRIMARY requests chunk1, chunk2, chunk2, SECONDARY chunk1..3, counts 1/1/1.
- AC2: final status 429, redacted body, target and request content asserted on the parsed failure; retry warning asserted via its event name.
- AC3: parameterized first/last exhaustion asserts 0/1/2 and 2/1/0; independent-targets test asserts a recovered retry on PRIMARY chunk 1 counts once (1/1/1) and SECONDARY reports 2/1/0.
- AC4: existing HTTP, response-body and new network-error exhaustion cases assert 0/1/0 with context and redaction.
- AC5: existing success, recovery, validation and redaction tests unchanged and passing; no files written beyond the harness's own.
- No mocks of the unit under test. No assertions on prose wording beyond fixed event names and numbers.

## Verification evidence (rerun by A on 2026-09-11)

- `bun test ./skills/broadcast-issue/scripts/discord-send.test.ts`: 14 pass, 0 fail, 78 assertions.
- `bun run --cwd skills/broadcast-issue typecheck`: pass.
- `bun run format`: pass, unchanged.
- `bun run typecheck`: pass.
- `bun test`: 137 pass, 0 fail, 1305 assertions.
- `git diff --check 131b02d..HEAD`: clean.
- `/tmp/discord-chunk-report-sender-red.log` shows 7 fail / 7 pass before production changes; `/tmp/discord-chunk-report-sender-verification.log` shows the green run.

## Findings

Fix: none.

Nit N1: `discord-send.test.ts` has two consecutive blank lines before the partial-delivery test. Root formatting excludes the skill folder, so nothing catches it. Cosmetic only.

No reusable lesson beyond what `learnings/LESSONS.md` already records.

## Merge attempt 1 (2026-09-11): red checks after rebase

Rebase target: `origin/main` = `eed65fb70e72215d300d40c5187b77ec01d01bdc` ("sync issues"). Rebase completed cleanly with no conflicts. Rebased head: `8be77cd4fe63e229567c3a2909ae7d2fe5d8051e`. AKROGON_BASE refreshed to `eed65fb70e72215d300d40c5187b77ec01d01bdc`.

Check results in the worktree after rebase:

- `bun run format`: pass.
- `bun run typecheck`: FAIL.
  ```
  src/next.ts(511,28): error TS2554: Expected 2 arguments, but got 1.
  ```
- `bun test`: FAIL, 136 pass / 1 fail.
  ```
  tests/next.test.ts:251:25  expect(closed.code).toBe(0)  Expected: 0  Received: 1
  (fail) a closed tab hook from a merged leaf sweeps and starts the next leaf
  ```
- `test_changed` (`bun test --changed=eed65fb...`): pass, 0 tests discovered.
- Sender suite: 14 pass, 78 assertions. Skill-local typecheck: pass.

Diagnosis: this leaf changes only the two sender files and does not touch `src` or `tests`. The failures come from the default branch itself. Commit `eed65fb` added a `tab_closed` hook branch in `src/next.ts` that calls `sweepAll(global)` at line 511, but `sweepAll` (line 461) requires `(global, invocation)`. The sibling `pane_closed` branch just above passes `sweepAll(global, invocation)`. The failing test is the one that commit rewrote for the new hook, so main is red at both typecheck and test.

Repair criteria for B (fix forward on this leaf, per merge contract): pass `invocation` to `sweepAll` in the `tab_closed` branch of `src/next.ts` so that `bun run typecheck` and the test "a closed tab hook from a merged leaf sweeps and starts the next leaf" pass, with no other changes. Rebase is complete, so no rebase context needs preserving.

## Re-check after check.fix round 1 (2026-09-11)

Repair baseline: `8be77cd4fe63e229567c3a2909ae7d2fe5d8051e` (rebased head). Repair head: `a6b53fd` ("Update closed-tab hook to current dispatch contracts"). Repair diff touches only the `tab_closed` branch in `src/next.ts`. Sender files are byte-identical to the reviewed implementation.

Scope note: my repair criterion named only the missing `sweepAll` argument. B correctly found that the incoming handler also used an unimported `allLeaves`, an untyped leaf filter, the old four-argument `dispatchLeaf` shape and a boolean outcome. The repaired branch now mirrors the adjacent `HERDR_PANE_ID` hook branch exactly: `registeredRepos`/`discover` with the invocation, `dispatchLeaf(global, repo, leaf, false, invocation)`, and `sweepAll(global, invocation)` on a `'completed'` outcome. That is the shared contract, so the wider correction is the right fix and introduces no new behavior.

Checks rerun by A on the repair head:

- `bun run format`: pass, unchanged.
- `bun run typecheck`: pass.
- `bun test`: 137 pass, 0 fail, 1306 assertions, including "a closed tab hook from a merged leaf sweeps and starts the next leaf".
- `bun test --changed=eed65fb...`: pass, 0 tests discovered.
- `git diff --check 8be77cd..HEAD`: clean.

Earlier findings stand: no Fix, Nit N1 unchanged. No defect introduced by the repair.

Verdict: ready.

## Merge attempt 2 (2026-09-11): pushed

Head `a6b53fdceca8e54b7618f59cffd0beb53c2d882b` was already on top of `origin/main` (`eed65fb`) with a clean worktree, so the green check run from the re-check on this exact head and base was reused. `git push origin HEAD:main` fast-forwarded `eed65fb..a6b53fd`. Post-push fetch confirms `a6b53fd` is `origin/main`.
