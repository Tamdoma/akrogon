# Fix shape

## Question

1. Where is the flake fixed: in the shared test setup's 3 s start window, or in the tests that count on it?
   - 1a (recommended) (A,B) Remove the 3 s start-proof window from the shared test setup (tests/hc-fixture.ts), so tests use the product's own window, and the four tests that need a seat that never proves its start set a short window themselves.
   - 1b Rewrite the four dependent-start tests to check the task the dependent received and its working state instead of the attempt count. The 3 s window stays for every other test.

### Carries

- Signposts (forks/signposts.md, Taken): 1a fewer parts first; 2c no review, check, approval, record or door step removed; 3a a recorded number; 5b no paid call here; 6a akrogon only; 7a earlier decisions bind.
- Split (issues/chart/factory-wins/forks/split.md, Taken): this chart finds the root cause before a fix shape is locked.
- issues/chart/suite-time/forks/load-sensitive-tests.md, Taken Q1: foreclosed per-test cap raises, `--retry`, `test.serial`.
- engine-on-hc design, operator decision 2026-11-06 (plan D9, D13): an unproven start keeps the seat running, is recorded, is not resent; a working seat is left alone.

## Findings

Full notes: slots/map-A.md, slots/map-B.md, slots/map-merged.md, slots/map-rebuttal-B.md.

- Root cause (A,B), observed in code and in forced-delay runs on 2026-11-10: the attempt count rises only when a seat start is proven inside the start-proof window (src/seat.ts `startSeat`, `firstTask`). The product window is 60 s; tests/hc-fixture.ts sets 3 s for every hc-fixture test. A start that takes longer is recorded `not_confirmed`, not counted, the command exits 0, and the held working seat is left alone by later passes (src/next.ts `dispatchSlot`), so the test's `attempts.A` stays 0.
- Reproduction: A delayed the dependent's stand-in 3.5 s (`case "$PWD" in */second) sleep 3.5 ;; esac` at the top of tests/stand-in.sh, scratch clone at 63526537, `bun test ./tests/next.test.ts -t "merged phase closes tab on typed next" --timeout=30000`): 1 run, 1 red at the count with `started, not confirmed t2` and `delivery_error.A.code not_confirmed`, 3.64 s against 0.87 s unmodified. B delayed the `hc events` subscriber 3.2 s: 3 runs, 3 reds. Without a forced delay: A 360 runs, 0 reds; B 20 runs, 0 reds.
- Inferred, not seen: that the red of 2026-11-09 took this route. Its log holds no command output; an observation error after the window cannot be ruled out (B M2).
- Recorded cost, estimate (A): in the 25 red `test` logs since 2026-11-07, 16 failed tests in 7 logs failed on a `next`/`phase` exit code or an attempt count after 3.4 to 6.0 s. Heuristic class; most fall in the 2026-11-08 systemd unit-leak episode.
- Cost of 1a, observed (A, 2026-11-10, scratch clone, `bun test --timeout=30000 --parallel=4 --no-isolate`): unmodified 1,149 pass, 2 fail, 57.29 s; override line removed 1,146 pass, 5 fail, 82.66 s. Four tests newly ran to the 30 s cap and need their own short window: `a seat that never works stays running, is reported started not confirmed, and is not resent`, `a working seat gets no send; a send that never starts is recorded, not resent, and resettled once the turn moves`, `a manual next ignores an inherited HC_TERMINAL_ID`, `the busy notice lands in the session holding the repo space`. Listener outcomes varied between the two runs (two failed unmodified, one with the override removed), so the pair is not an identical red/green comparison (B M3).
- 1b scratch proof (B): 3 greens under the 3.2 s delay with product code unchanged and `attempts` still 0.
- Research: practitioner, Fowler, "Eradicating Non-Determinism in Tests" (2011-04-14, https://martinfowler.com/articles/nonDeterminism.html, read 2026-11-10): wait by callback or polling, never a bare sleep; the callback's timeout "pretty high"; limits never literal, set in bulk through constants or the runtime environment. It changed the question: the start proof is already an event wait, so the short limit, not the wait, is the false-failure source. better-than-training: the source, logs and runs above.
- Slots: A picked 1a, B first picked 1b and moved to 1a in its rebuttal (M1). No remaining disagreement.
- Scratch cleanup: A's clone and run logs under the session scratchpad are removed at the end of this pass; B removed its scratch copy and seven experiment terminals (map-B.md E5).
- Charting observations for the contract's pre-existing key parts, all by A on 2026-11-10 as the local user, bun 1.4.4, in a scratch clone of 63526537 under the session scratchpad, removed and checked absent after the runs; no outside system, no paid call:
  - K1, the forced delay reddens the base. Command: `bun test ./tests/next.test.ts -t "merged phase closes tab on typed next" --timeout=30000` with `case "$PWD" in */second) sleep 3.5 ;; esac` added before `mode=work` in tests/stand-in.sh. Result: 1 fail at the dependent's count, 0 received, `phase first merged` exit 0 with `started, not confirmed t2`, 3.64 s. Limits: one run; does not show the 2026-11-09 trigger.
  - K2, the product honors a set window. Same run as K1: the unproven outcome arrived after the fixture's 3,000 ms. Limits: shows the value 3000 only.
  - K3, an unset window is the product's long one, and only four tests lean on the short one. Command: `bun test --timeout=30000 --parallel=4 --no-isolate` with the `AKROGON_START_PROOF_MS: '3000',` line deleted from tests/hc-fixture.ts. Result: the four tests named above ran to the 30 s cap; 1,146 pass, 5 fail, 82.66 s, against 1,149 pass, 2 fail, 57.29 s unmodified in the same clone. Limits: one run each; listener outcomes varied between the runs; does not show the four tests passing with their own window, which is the leaf's proof.
  - K4, the blocking check exists. Command: `akrogon config` at the registered root. Result: `checks.test` runs `bun test --timeout=30000 --parallel=4 --no-isolate` behind the install and guard steps. Limits: config read only.
- Listed, not charted (A): a resettled unproven start is never counted, so that seat gets one more silent turn than the three the rule states (src/next.ts `dispatchSlot`). No recorded cost.

## Taken

Operator, 2026-11-10, door t126, verbatim: `1a` (after "elid").

- 1a: remove the 3 s start-proof window from the shared test setup (tests/hc-fixture.ts) so hc-fixture tests use the product's window, and the four tests that need a seat that never proves its start set a short window themselves. Reason: it removes the failure for every test on the setup with one setting gone, both slots agree, and a full-suite run found only four tests that need their own window.
- Binding avoidance steps: the bun per-test limits stay as they are, so a start that never proves still fails; the leaf proves the fix with a forced start delay longer than 3 s, red before and green after; no retry, serial run, fixed sleep or counter poll is added; product code under src/ does not change.
- Foreclosed: 1b (rewrite the four dependent-start tests and keep the window), a larger fixed window, applying the proof test to the last snapshot in `firstTask`, counting an unproven start as an attempt.
