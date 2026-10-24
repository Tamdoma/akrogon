# Intake: verify-waste

## Scope

Cut the CPU and wall time akrogon spends on test runs whose answer is already known (receipts, base reruns, unrecorded hand runs, runs that continue after their verdict), across every registered repo, with framework as the measured case. Framework's own heavy and flaky tests are owned by framework issues/open/verify-revisit (already handed off) and are out of this chart except where a framework leaf is needed to use an akrogon change.

## Provenance

Operator words in the door pane w8:pNP, 2026-10-24. Agent findings from consultant D's pre-chart notes (slots/precharter-D.md) and A's (slots/precharter-A.md).

## Source: operator 2026-10-24 w8:pNP

"So there's no way to reduce the cpu load during framework testing? Its burning the cpu."

"Those were the ideas I had rejected before already. Come up with something original. Create a new consultant D Claude Fable 5.1 with high effort to help you devise a better, more elegant solution with least amount of tradeoffs."

"ok, let's do everything. Chart everything out in both repos. Use autopilot mode. Consult with slot B and D about all solutions. Use the most elegant solution that will bring the best results. My goal is to improve the testing so that it's not this slow, and it doesn't spend so much CPU."

Rejected by the operator this session: host run caps or a one-at-a-time line, a CPU quota on the test slice, fewer workers, seconds ceilings.

## Agent findings

- From the systemd journal ("akrogon-run-<uuid>.scope: Consumed X CPU time"), 2026-10-14..24: 484 CPU-h in akrogon run scopes; one framework full suite median 1,735 CPU-s over 364 s wall; full suites 56% of CPU (D F1).
- Half of framework merge runs are red (ledger 235/475); first merge attempt red for 131 of 232 leaves; 2.05 full suites per landed leaf (D F2; A: 214/400 over 10-17..24).
- Every surviving red log (36) fails in hooks:selftest on 120 s timeouts (D F3); framework fixture-flakes owns those tests.
- Red runs continue after the verdict: core and rest lanes use --no-exit-on-error; median 34% of a red run's wall after the first red (D F4).
- --known-red runs the base fresh (src/verify.ts, runOnce for baseSha); 13 of 19 base runs had a green receipt already; ~20 CPU-h (D F5). Carry: base-red chart Taken says "akrogon verify runs the exact base fresh, never reusing a receipt on the base side" (issues/chart/base-red/forks/red-base-policy.md:27).
- 105 run-check scopes over 600 CPU-s ran the full suite outside akrogon verify, ~50 CPU-h, no receipt (D F6).
- Merge runs rarely overlap (471 of 475 alone); other repos are ~20% of CPU (D F7).
