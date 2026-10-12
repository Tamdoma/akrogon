# Proof owner

## Question
Q1. Who makes an added or changed test prove itself before merge: the AI workers through their skill steps, those steps plus a command check that a proof record exists, the command running the reruns itself, or only the consumer repo's own config?

### Carries
- Locks: agent-test-rules 10a/11a/12a; check-reruns scheduling; test-runs and merge-load-flakes (no heavy-run slot, no capacity change).
- Related forks: proof-trigger.md, proof-evidence.md, failure-ending.md.

## Findings
- Tier better-than-training, repo records read 2026-10-11: both gaps in the case were evidence judgments. The reviewer reused load runs taken before the new case (framework probe-waits review-B.md:143), and one green replay admitted the rewrite (:243-245). (A,B)
- Tier better-than-training: the test passed twice standalone and failed only inside the full verify (seed #86). A command that reruns the changed test file alone would likely have passed it. (A)
- Tier practitioner: Mozilla test-verify runs each modified test about 30 times including chaos mode, up to 1 hour, and treats a failure as "backout should be considered (but is not mandatory)" (firefox-source-docs.mozilla.org/testing/test-verification, read 2026-10-11). Chromium CQ blocks on new-test flake detection by default (chromium docs/infra/cq.md, rerun count not found, LOW). Shaker (Silva, Teixeira, d'Amorim, ICSME 2020): stress-injected runs found far more concurrency flakes than idle reruns. (A)
- Options with slots: skill obligation, pick (A,B). Skill obligation plus phase record check, stronger omission catch once a record contract is settled (B, D4 rebuttal). Command runs the reruns (A fallback only; B did not propose it). Consumer config only (A, rejected by both: nothing in akrogon changes).
- Pitfalls: stale proof reuse (proof bound to the last change of test, helper, runner conditions; B review checks it); one green replay (repair proof rule, settled in proof-evidence); `--retry` never counts as proof.

## Taken
Operator 2026-10-11, verbatim: `1a |`

Q1 -> 1a: skill steps only. The planner names how an added or changed test is proven stable, the implementer runs that proof and records the command, the test's version and the result, and slot B rejects proof taken before the latest change to that test or its helper. No new command code.

Reason: both gaps in the #86 case were evidence judgments (stale load runs reused for a new case; one green replay admitting a rewrite), and a command that reruns the test file alone would likely have passed this test.

Foreclosed: 1b phase record check (record format, parser and runnable-test rule not built); 1c command-run reruns; 1d framework config only.
