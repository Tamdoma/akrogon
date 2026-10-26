# Debate C — ranked improvement list

Concession first: A's run-check ruling is right and mine was wrong. `requireRepo` returns raw `repo.config`, so `merge_checks` values at refusal time are raw commands; `bun test --timeout=30000` in `merge_checks` makes run-check refuse that exact argv in all three forms. O3 removes boxed suite runs at leaf scope, leaving seats bare `bun test` or narrowed commands.

Baselines: timings.jsonl 2026-10-12→25, verify-runs.jsonl (251 runs), merge-attempts.jsonl (91), log.jsonl (219 leaves).

## Options

### O1 — keep (rank 2)
- Change (post-B-correction): shrink the '11' test-supplied budgets in tests/peer-wait.test.ts (~22.8s file → ~3s), the two 10.2s DISCOVERY_DEADLINE_MS waits in tests/session-routing.test.ts (~10s → ~2.6s), split the serial 9-case loop at next.test.ts:5594 (49.2s file → ~24s floor).
- Gain vs baseline: ~45s off every suite run (~190-235s recent greens under load) = ~17-21% speed on every leaf and merge suite invocation; baseline: JUnit per-file times + check_end durations. Marginal on the 20% bar for speed; does not touch cost of retries.
- Size: 3 test files + one env/arg knob for the discovery deadline, ~40-80 lines.
- Risk: shortened waits race the asserted-outcome tests; env knob reachable from production. Removed by: keep boundary cases at a deliberate lower bound, name the knob `AKROGON_TEST_*` and read it only under preload.
- Depends on: nothing; orthogonal to O3 (saves on whichever runs remain).

### O2 — drop
- A+B measured 1.87-1.9% of merge verify time (one eligible pair, 200.6s of 10,746s). Rejected by evidence; cross-scope cases too rare.

### O3 — keep (rank 1)
- Move `test` from `checks:` to `merge_checks:` in issues/config.yaml.
- Gain vs baseline: leaf-scope suite compute ~1,295 min/11d (914.7 leaf check_end + ~380 leaf-scope verify) → ~0; merge scope keeps ~180-300 min. ≈75% of check compute, ≥40% on cost+speed. Meets 20% clearly.
- Size: 1 config key + ≤3 skill lines, <10 lines.
- Risk 1 (new, from A's ruling): leaf stages lose the boxed suite; bare `bun test` escapes run units/stop-run containment. Removed by: skills already steer seats to targeted proofs — add no new permission, the gate just stops demanding suite-green; red merges reproduce by narrowest failing command per the recorded refusal text.
- Risk 2: defect deferral — leaf verify test reds 39/190 (20%) move to the serialized merge turn; baseline merge red 5.5% (5/91). Removed by: merge verify still runs everything on the rebased tree; guardrail metric: revert if merge red >30%.
- Risk 3: policy reversal — operator chose whole-suite on 2026-10-14 (7ad17efc). Removed by: operator approval is a named gate; that commit rejected `--changed` scoping, not merge-stage placement.
- Depends on: none. Stacks with O1 (O1 then saves on merge-scope runs too).

### O4 — keep, below the 20% bar (rank 5)
- Fix the status clock-skew test (one captured epoch): sole failure in 8 runs, ~15% of one leaf's reds. Size: 1 file, <20 lines. Risk: none real. Value: removes a recurring flake red that costs a seat look each time; cheap enough to ride along.

### O5 — keep, borderline (rank 4)
- Bump explicit 15-30s per-test timeouts in tests/batch-dispatch.test.ts (16 sites) and similar fixture files.
- Gain vs baseline: 18/132 leaf test reds were timeout-only; flaky reds also drive rerun loops — 72/156 visits ran the suite >1x (241 extra suite runs). Cutting even a third of timeout reds saves ~100-300 min/11d and some repair rounds (fix_rounds ≥1 on 218 leaves). ~15-20% of leaf test reds — just under the bar alone, near-zero risk.
- Size: 1-3 test files, ~20 lines. Risk: masks real slowdowns; removed by bumping only subprocess-heavy fixture tests, not asserting on duration.
- Depends on: nothing; pairs with O1 (same files, different mechanism).

## New candidates (outside suite time)

### N1 — Drop as a leaf: verify same-tree reuse landed but unverified in production data
- 36 sequential full reruns on identical leaf+tree = 128 min wasted; 0/753 reused before 2026-10-25, when the reuse fixes shipped. Too fresh to prove saving; the check is a read, not a leaf. Flag: if `reused:` stays 0 next week, it becomes a leaf-sized bug.

### N2 — Rejected: prerequisite waits
- 2,316 min of `wait prerequisite` (vs 164 merge_turn) over the window, but blocking is deliberate dependency ordering (leaf-stop waited on seat-containment). No measured inefficiency to attack inside one leaf.

## Final ranking

1. **O3** — biggest measured saving (~75% of check compute), smallest diff; gated on operator accepting merge-stage-first suite signal.
2. **O1** — ~17-21% per suite run, applies to every remaining run either way O3 lands; corrected per B to fixture budgets + serial-loop split.
3. **O5** — flake-red reduction (~15-20% of leaf test reds) at near-zero cost; quality+speed.
4. **O4** — small quality fix, rides along.
5. **N1** — verify-only followup, not a leaf.

Dropped: O2 (1.9%), N2 (by-design waits).
