# Chart: akrogon

## Destination
Proof for an added or changed test counts only when it ran after the latest change to that test or a helper it uses: the implementer records command, commit and result for each proof, and the reviewer rejects older proof. No run count, rerun or schedule change is added, so a fixed test that fails rarely can still land (operator-accepted cost).

Route: lifecycle (debate no)

## Findings
- The citation guards check that a `Test-Change:` trailer exists, not that the test runs or is stable (src/phase.ts:505-522, :547-585; called :385-387, :636-642). (A,B)
- The case had two admission gaps. (a) The probe-waits reviewer reused 20 green load runs taken before the new case existed (framework issues/closed/merge-flow/probe-waits/review-B.md:143); the case then failed in the merge gate (:162-173). (b) The rewrite passed the refreshed replay of the full rejected merge command (:221) and the merge gate on 349c15739 (:239), landed (:243-245), then failed in parallel-selftest's merge gate. Two full merge-check passes did not catch it. (B found, A corrected 2026-10-11)
- The test passed twice standalone and failed inside the full verify (seed #86 point 3), so plain reruns of the test file alone would likely have passed it. Shaker (ICSME 2020) found idle reruns miss most concurrency flakes. (A)
- Framework runs only `merge_checks.verify` at merge (all six `checks` in `merge_covers`); its `checks.test_changed` runs parity and contracts, not changed browser tests (framework issues/config.yaml:8-17). (A,B)
- Existing red handling stays: one retry for unattributed red, green retry recorded `inconsistent`, a leaf's own criterion never becomes known-red (skills/implement-issue/SKILL.md:38, skills/merge-issue/SKILL.md:75, docs/guide/merge.md:31). (B)
- Full maps: slots/map-A.md, slots/map-B.md, merged slots/map-merged.md, B rebuttal slots/map-rebuttal-B.md (all six rebuttal points accepted).

## Forks taken
- [Proof owner](forks/proof-owner.md): 1a, skill steps only; planner names the proof, implementer records command, test version and result, slot B rejects proof older than the test's latest change.

- [Proof rule](forks/proof-rule.md): 1a, the proof-owner rule alone; no rerun count, no load runs before review.

## Open forks
None.

## Fog
None. The framework-command question became proof-rule Q3.

## Off route
- Fixing the named framework test: done on framework main (58df9333c).
- Host capacity, heavy-run slot, lower max_active, PSI recording: merge-load-flakes and test-runs locks.
- Affected-test selection and the release suite: framework-test-scope.
- Citation syntax and test path rule: agent-test-rules 10a, 11a, 12a stay.
- Check scheduling: check-reruns lock stays (checks before review and after repair, merge_checks only at merge, rejected-command replay).
- Quarantine or retry-to-green: hides the failure on the leaf that caused it.
- Load runs for timing, browser and process tests before review: dropped as cost without proven benefit (proof-rule Taken).
- A rerun count after a merge failure: the flow already runs the merge check twice after a fix, and #86's fix passed both; a count that might catch it costs about 60-110 min (proof-rule Taken).
- A wall-clock wait rule alone: a deadline checked after a sleep still overruns when one throttled wakeup outlasts the outer budget (map-B R4).

Handed off 2026-10-11
