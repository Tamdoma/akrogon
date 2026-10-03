# Map A

Window 2026-09-25..2026-10-02. Repos with activity: akrogon, framework, pi-extensions, Himne, blepsis.

## Seat history (config.yaml revisions)
- Until 2026-09-29 22:41 (+0200): A = pi devin/swe-2-max = reviewer and merger. B = pi muse-spark = worker.
- From bde1032 (role swap): B = codex gpt-6.1-sol = reviewer, repairer (check.repair from 10-02), merger. A = worker (pi muse, then claude, then pi devin).
- So "slot B reviewer in pi" never existed. Reviewer was pi (A) before the swap and codex (B) after.

## Method
1. Git: per leaf, diff heads between consecutive issues/log.jsonl rows; attribute commits to the phase in `from`. Merge phase filtered by author time.
2. Codex sessions (~/.codex/sessions): per-turn apply_patch edits to test paths, including subagents.
3. Pi sessions (~/.pi/agent/sessions): edit/write tool calls to test paths per turn prompt (role, slot, phase).

## Count: reviewer seat B (codex) changed tests during review or repair
7 leaves. 5 changed an existing test, 2 only added a new failing test (which check-issue:75 requires).

Changed an existing test:
1. akrogon readiness-contract, check.repair, 820ed82: flipped "merged leaves produce no Missing lines in detail" to require them. Backed by plan.md:82 ("status <slug> on a closed/merged leaf still prints its Missing: lines"). The implementer's test encoded the plan violation.
2. akrogon env-link, check.repair, fc74745: tightened one assertion to require the worktree path. Backed by plan D4 / criterion 4 (review-B.md:15).
3. framework capture-asset-bytes, check.repair, 03b1ff9d2: removed an implementer-added `innerWidth >= 1000` guard that hid criterion 7's first-viewport case (review-B.md:17-21), added assertions.
4. framework emdash-health-run, check.repair, 5794bdfb2: replaced a fake runner reply ("bucket: ... objects: 12") with JSON shape and asserted R2 usage values (F2 "R2 usage is fetched but discarded"). Criterion backing not verified.
5. framework emdash-launch, check.review, operator-ordered ("Just do those fixes yourself, don't return them back.", codex session 01a0f7d7, 2026-10-02T05:35Z): flipped first-boot.test.ts "draft probe does not poison the published URL" (ok=true) to "draft publication fails" (ok=false), plus edits in crawl-compare, go-live-checks, daemon-ownership tests via subagents.

New test only: akrogon log-tail (da14fd8, b15247b), akrogon failure-log (f376eca).

Not counted: info-gathering-business-writes (framework, 10-01) created 4 throwaway probe files in .claude/hooks/tests and deleted each, never committed. offer-join-deploy merge (09-30) touched deploy-core.test.ts during merge.

## Pi
- Pi reviewer (A, pre-swap) edited 0 test files during check-issue turns.
- Pi merger (A, pre-swap) made 119 test-file edits in merge-issue turns across 12 framework leaves (research-pools, content-batch, satellite-review, page-records, readable-outbound-links, editorial-identity, operator-photos, one-client-link, variant-geometry, chrome-copy, contact-page, site-nav). Commit subjects: "merge fix-forward: re-record expectations", "re-record every frozen expectation row contaminated by m2 recording". merge-issue SKILL.md at dbd5e45 (line 39) already said red checks go to check.fix, not fix-forward.
- Pi workers (implement, check.fix): 124 test edits. Git shows 192 worker-phase intervals with test changes across repos.

## Main reading
The operator's premise (B bends tests to fit its own findings) is not what the logs show. Every B change to an existing test points at a plan criterion the implementer's test missed or hid, except one unverified and one the operator ordered. The volume of test churn comes from workers writing tests and the pre-swap merger re-recording expectations after rebase.

## Rules today
- check-issue:51 a missing or bad test blocks only for an uncaught done-criterion, an untested realistic Fix, or a mocked unit; extra cases are Nits.
- check-issue:75 check.repair must add a failing reproducing test before each fix.
- implement-issue:57 smallest test set proving done-criteria; extra cases need a named realistic consequence.
- implement-issue:75 check.fix may not weaken criteria or failing tests. No equivalent rule for check.repair or merge.
- realistic-fix-bar (handed off 2026-09-30) already set "tests prove criteria and real bugs only"; its success-measure fork deferred measurement of the next 20 leaves per repo to a later door.

## Forks
- K1 Existing-test guard: who may change or delete an existing assertion, and on what evidence (cited criterion line in the review/report), and whether a command check enforces it (diff of pre-existing test files at phase move) or only skill text. Practitioner: ImpossibleBench (ICLR 2026) read-only tests stopped test modification without hurting legit work; hidden tests cut cheating to near zero but hurt performance. Thread: @Olivier_Lambert "hook to prevent editing old tests without approval"; @teyc uses LLM test changes as a signal to challenge.
- K2 Merge re-recording: whether merge may re-record expectations after rebase or must route to check.fix (rule already exists, was not followed pre-swap).
- K3 Test volume and which tests run: overlaps test-time-and-temp (handed off, no whole suite) and framework-test-scope (open). Whether to prune existing low-value suites, and who decides "most important".
- K4 Measurement first: realistic-fix-bar rules landed 09-30. Whether to measure their effect before adding rules.

## Pitfalls
- Banning B from touching tests would remove the fixes that caught implementer tests hiding criteria (capture-asset-bytes, readiness-contract).
- Read-only tests do not stop special-casing or fake fixtures (ImpossibleBench).
- E2E-only is slow (thread @KaiMeyer week-long E2E). Framework browser tests are already the slow part.
- Generated expectations (recorded fixtures) are tests too. A rule on `*.test.*` misses `test/fixtures/**` and `record-expectations.ts`.

## Research
- Hora & Robbes, "Are Coding Agents Generating Over-Mocked Tests?", MSR 2026, arXiv 2602.00409: 1.2M commits, agents touch tests in 23% of commits vs 13%, add mocks 36% vs 26%. Recommends mocking guidance in agent config.
- ImpossibleBench, arXiv 2510.20270 (ICLR 2026): models modify tests, overload __eq__, special-case. Read-only tests block modification, not special-casing.
- Handshake DeepSWE-1.1 audit, 2026-09-18: >80% of rollouts reason about an imagined grader; 10-25% drift from spec ("scope collapse", "coverage insurance").
- Kent Beck (Augmented Coding, 2025): agents delete or comment out failing tests; he forbids it and runs strict TDD.
- dwlz thread 2026-09-25: author (Opendoor eng, ex-CTO) narrowed to "add tests for regressions; no hundreds of eager implementation tests". Repeated reports of agents rewriting failing tests to pass (@JakubFijolek, @namestartswithp, @blink64). @corp_book: tests should encode real invariants, smallest proof that holds.
