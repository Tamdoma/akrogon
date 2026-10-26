# Merged opening map (A, B, C)

Common ground (A,B,C): the full `test` check is the dominant cost. timings.jsonl 2026-10-13..25: 403 runs, 133 red, median 137s, recent greens 190-235s, ~16h total (A); leaf scope 397 runs (C). Same-scope receipt reuse already shipped 2026-10-25 and is not new work (B,C). Run concurrency changes rejected (B C3 ceiling 1.95%, C C5 re-implements dropped run-permit). A measured: `bun test --max-concurrency=64` on next.test.ts gave 43.9s vs 49.2s and 1 new failure, so concurrency raising is out.

## Options

O1 (A) Remove sleeping and serial time from the suite itself. Every full-suite run gets faster, no gate changes.
- A measured 2026-10-25 19:30, host load ~2, bun 1.4.4, JUnit per-file times: suite 191.9s across 69 files run one file at a time, tests concurrent within a file (max 20).
- tests/peer-wait.test.ts 22.8s: 16 tests at ~11.1s each wait out the real IDLE_GRACE_MS = 10000 in skills/chart-issues/scripts/peer-wait.ts:89 (spawned as a subprocess, so the wait is real); one test 22.3s (two waits).
- tests/session-routing.test.ts 10.2s: two tests at 10.2s wait out DISCOVERY_DEADLINE_MS = 10_000 (src/shell.ts:199) against a fake `sleep 12`.
- tests/next.test.ts 49.2s: one test 29.3s, "named target equivalence", loops 9 cases serially inside one test (next.test.ts:5594); file floor is ~24s (486.6s summed / 20).
- Estimate: peer-wait to ~3s, session-routing to ~2.6s, next to ~30s, so 192s -> ~147s, about 23% off every full-suite run. Cost: a lower grace and deadline injectable for tests (env or argument), and splitting one test into nine. Estimate, not measured.
- Risk: a test-only timing knob that production could pick up; shortening waits can make the unproven-path tests race. Removed by: knob read only from a test-set env name, production default unchanged, and the tests keep asserting the same outcome words.

O2 (B) Cross-scope reuse: a green leaf-scope command supplies the merge-scope entry on the same tree.
- Measured pair 2026-10-25: 397.9s for leaf+merge on one tree, ~50% of that cycle.
- A check of verify-runs.jsonl: of 51 trees with a merge verify, only 2 also had a leaf verify. The merge tree is usually a rebased tree, so fleet-wide saving is ~2-4% of merge verifies. (A)
- Risk R1-R3 per B: weakening merge receipt scope, skipping merge-only checks, context-dependent commands.

O3 (C) Move `test` from `checks` to `merge_checks` in issues/config.yaml.
- Biggest raw saving: leaf-scope suite runs ~0, about 75% of check compute (C estimate). One key, under 10 lines.
- Aligns with skills/init-akrogon/SKILL.md (slow full-suite commands in merge_checks) (C, A confirmed line 20).
- Against it (A): the operator chose the opposite on 2026-10-14 (commit 7ad17efc "test runs the whole suite"), and the check-reruns lock says every `checks` command runs after implement and after every repair. Reviewer and implementer lose the whole-suite signal; run-check refuses a merge_checks argv, so seats would either lose suite runs or run bare `bun test` outside the boxed run units. Leaf verify test reds 39/190 (C) would move to the serialized merge turn as check.fix rounds.

O4 (B) Fix the status overview clock-skew test (tests/status.test.ts, one captured epoch). Sole failure in 8 runs, 1,502s, ~15% of red test receipts. Quality fix, one file, below 20% fleet-wide.

O5 (C) Raise per-test timeouts in load-sensitive files. Masks slowdown, est. 15-20% of leaf test reds.

## Where slots differ
- B picks O2, C picks O3, A picks O1.
- A's frequency check makes O2 rare. A's history check makes O3 a reversal of an operator decision and a quality trade.
- O1's 23% is an estimate built from measured per-file times; it needs a before/after JUnit run to prove.

## Open questions
- Is the 20% measured per full-suite run (O1), per leaf (O3), or per leaf+merge cycle (O2)?
