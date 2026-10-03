# Merged map (A, B)

Window 2026-09-25..2026-10-02 (snapshot ~21:00Z 10-02). Tags show which slot found or agrees.

## Count
- C1 (A,B) Seat letters swapped 2026-09-29 22:41 +0200 (bde1032). Before: A = pi reviewer/merger, B = pi worker. After: B = codex reviewer/repairer/merger. "Slot B reviewer in pi" did not exist.
- C2 (A,B) Codex B changed tests during review or repair in **7 leaves**: readiness-contract, env-link, failure-log, log-tail (A only; B missed it, git da14fd8 and b15247b in check.repair), emdash-health-run, capture-asset-bytes, emdash-launch (operator ordered "Just do those fixes yourself").
  - Changed an existing assertion or fixture: 5 (readiness-contract, env-link, emdash-health-run, capture-asset-bytes, emdash-launch).
  - Only added a new failing test, as check-issue:75 requires: 2 (failure-log, log-tail).
- C3 (A,B) Changes that weakened a correct test to accept a wrong finding: **0 proven**. readiness-contract enforced plan.md:82. env-link enforced criterion 4. capture-asset-bytes removed an implementer guard that hid criterion 7. emdash-health-run replaced a fake R2 reply with the real Wrangler JSON shape (B). emdash-launch was operator-ordered.
- C4 (A,B) Pi reviewer in check.review: 0 retained test edits.
- C5 (A,B) Pi merger (A, pre-swap) made substantive test/fixture/golden changes in **10 framework leaves** (B count; A's 12 included 2 conflict-only and 1 README-only). 119 edit calls in total (A). Includes bulk re-recording of frozen renderer expectations (contact-page, site-nav, operator-photos) and fixture narrowing in editorial-identity (B flags as suspicious, not proven).
- C6 (A,B) Discarded probes and conflict-only edits excluded (info-gathering-business-writes, offer-join-deploy merge, others).

## What blocked leaves (B, A agrees)
- 39 failed transitions, 14 leaves. One confirmed low-value assertion blocked two akrogon leaves (TMPDIR forbidden-prefix assertion, proof-order and wave-table; removed in 2dd1106 on operator order). One source-free review demand prolonged offer-join-deploy (F17, later downgraded to Nit under realistic-fix-bar).
- The rest: browser capture race, live route defects, env/index gates, pre-existing red baselines, Bun timeout config, operator prerequisites. Several early failures have no recorded reason.
- So "everything blocking us is AI-crafted unit tests" is not what the logs show. Bad tests are one cause among several.

## Rules today (A,B)
- implement-issue:57 smallest set proving criteria and real bugs. :75 check.fix may not weaken criteria or failing tests.
- check-issue:51 tests block only for uncaught criteria, untested realistic Fix or mocked unit. :75 check.repair adds a failing test before each fix. No rule on changing an existing assertion in check.repair.
- merge-issue:43 red checks go to check.fix. merge-issue:45 a broken default branch is fixed forward. Disagreement: A reads the pi merge re-recordings as outside both (red after rebase should go to check.fix). B reads them as the fix-forward route. The rule does not say which applies to a red caused by rebase.
- realistic-fix-bar (handed off 09-30) already locks "tests prove criteria and real bugs only". Its 20-leaf measurement is deferred to a later door.

## Research (A,B)
- ImpossibleBench (ICLR 2026, arXiv 2510.20270) (A): read-only tests stop test edits without hurting legit work; do not stop special-casing.
- Hora & Robbes, MSR 2026 (A,B): agents touch tests in 23% of commits vs 13%, add more mocks.
- Chen et al. 2026, arXiv 2602.07900 (B): more or fewer agent-written tests did not change task outcomes.
- Anthropic CI team, 2026-09-14 (B): tests grew 10x; they run tests selected by relevance, with stale-selection risks.
- TestManagement.com, 2026-08-11 (B): suite size did not predict bug detection; no test weakening when intent was immutable and a red verdict was allowed.
- Handshake DeepSWE audit 2026-09-18 (A): agents reason about imagined graders, 10-25% drift.
- Kent Beck (A): agents delete failing tests; he forbids it.
- dwlz thread (A,B): author narrowed to "keep regression tests, drop eager ones". Firsthand reports of agents rewriting failing tests to pass (Fijolek, namestartswithp, blink64). Hook proposal (Olivier_Lambert). Counterpoint: slow E2E needs fast lower tests (Kai Meyer, Will Simmonds, Daniel Kennedy).

## Forks
- K1 (A,B) Authority over existing test expectations: who may change an assertion, fixture or golden, on what cited source, across worker, repair and merge. Shapes K2 and K4.
- K2 (A,B) Fixtures and goldens: may a seat re-record expected output after rebase or code change, and what independent check it needs. Includes the merge-issue:43 vs :45 gap.
- K3 (A,B) Which tests run per leaf and who owns full-suite red. Owned by framework-test-scope (open) and akrogon-slow-phases. B adds: pi-extensions test_changed repeats the full test commands.
- K4 (A,B) Prune existing low-value tests and criteria: who removes them, through which owner. Realistic-fix-bar measurement could size it first.

## Pitfalls (A,B)
- A ban on B touching tests would have shipped readiness-contract and capture-asset-bytes with criteria violated.
- Filename-only guards miss fixtures, recorders, helpers and shell writes.
- E2E-only conflicts with slow browser suites.
- A bad criterion can mandate a bad test; removing it means revising the criterion.
