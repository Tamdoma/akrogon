# Test authorship: merged A, B, C

Sources: slots/tests-A.md, tests-B.md, tests-C.md, all written 2026-10-10. Tags name the slots whose own lines say the point.

## Research that decides the design

- R1 Fixed tests written before code from the brief beat tests written after seeing the code: 25% vs 14% of injected faults caught (Konstantinou et al., arXiv 2607.05139, 2026-07) (A). Tool makers say the same: one session writes tests, another implements; commit tests, then implement without changing them (Claude Code best practices, undated current; Cursor 2026-01-09; Stride 2026-09-27) (B,C).
- R2 Read-only pre-written tests remove direct test edits: Claude Code edited contradicting tests in 2 of 6 runs, 0 of 6 with tests locked (Busel, dev.to, 2026-10-10) (C).
- R3 Locked tests do not stop special-casing in product code: 40-94% circumvention with test files locked (CircumEval, 2026-06-24, older) (C). Frozen visible tests can still be overfit; the gap grows with code size (SpecBench, arXiv 2605.21384 rev 2026-09-09) (A,B,C).
- R4 A "stop and report" path is the one control that held when tests were locked: escalation channel cut hacking 23.6% → 5.3% (Gomez, arXiv 2608.29460, 2026-08-29) (A,C); CircumEval same finding (C).
- R5 More agent-written tests move cost, not success: changing test count does not change SWE-bench success (Chen et al., arXiv 2602.07900, 2026-02, older) (C); TDD instruction gave more tests and worse hard-case results (Dan Luu, 2026-09) (B,C); banning sonnet 5.5 from writing tests gave slightly higher success with less time and tokens (Kun Chen on X, 2026-10-08, snippet only) (A); suite size did not predict quality (Echlin, 2026-08-11) (B); 80.2% of agent test patches have weak or no oracle (Banik et al., arXiv 2606.18168, 2026-06) (A).
- R6 Counterevidence: agent test-first reasoning improved benchmark results (TDD-Agent, arXiv 2608.16742, 2026-08-17) (B). It does not let the executing seat redefine accepted conditions (B).
- R7 Count and kind: "Write tests. Not too many. Mostly integration." (Dodds, 2019) (A,B,C); test value is caught faults, not count (Google, 2018) (C); write one test per bug found (Vocke/Fowler) (C).
- R8 Not found by any slot: a controlled study proving the same executing agent always rigs tests, or a lab requiring hidden tests in production (B,C). X fetches returned 402/403 (A,B,C).

## Current flow facts

- F1 The executing seat writes the tests. Delegated workers derive tests before code (`skills/implement-issue/brief-template.md:31`), inline A writes product and tests (`implement-issue/SKILL.md:57`) (B,C).
- F2 The guard sees only modified, deleted or type-changed test files. Added files pass free (`src/phase.ts:351`) (C). It checks trailer presence, not the cited source (`src/phase.ts:355-367`) (B,C).
- F3 Proof scripts outside the path rule are never guarded. The formspark runner `.claude/workflow/scripts/run-formspark-build-wiring-proof.ts` (+1346 lines) matches no segment in `src/test-files.ts:1-17` (B,C).
- F4 Test count has no ceiling: review can raise a missing-test Fix (`skills/check-issue/SKILL.md:55`). Removal exists only for false, outdated or duplicate expectations (`implement-issue/SKILL.md:57`, `check-issue/SKILL.md:53`, standing design `:12`) (B rebuttal F1, C).
- F5 plan.synthesis is A-only (`src/routing.ts:30`), so a B test-writing step does not exist today (B).
- F6 No rule names who builds a proof rig or requires one to exist before the leaf (`standing-design.md:9`) (C).
- F7 Seats: A runs `pi devin/swe-2-max` at effort high, B runs `codex gpt-6.1-sol` at effort medium (`akrogon config` slots, read 2026-10-10) (C rebuttal 3).
- F8 Framework watcher on formspark-build-wiring, 2026-10-10 (operator screenshots): unit tests and checks are green (selftest 3491/3491, typecheck, contracts). Every red item is a live proof run. One case is a whole chain (`claude -p` build session, validation, browser submit to Formspark), 15+ minutes. Cases run one after another (one port 8143, shared consumer pool, grant of 3 creates and 3 submissions). Reruns are not clean (untracked consumer state, pending-log refusal). The submit bug sits at the end of the chain, so each rig bug costs a full chain. The watcher's own fix: chart and review a leaf's proof rig separately from the feature.

## Loops

- Cut L1 Author grades self: executor writes the test, test agrees with code by construction, review finds the gap, repair edits both (A,B,C).
- Cut L2 Rig breeds findings: new proof machinery inside the leaf, review finds machinery defects, repair grows machinery (A,B,C).
- Cut L3 Test growth: missing-test Fix allowed with no ceiling, so rounds can add tests and runtime (A,C). B: a potential loop, not an addition every round (B rebuttal F1).
- Keep L7 Partial report: executed, failed and unrun outcomes reported separately, so a subset pass stays partial (B). Keep L8 Selective rerun: reuse unchanged evidence, rerun affected stages (B; existing at standing design `:15`, `implement-issue/SKILL.md:84`).
- Fix sensor L4 Change guard: blind to added files and proof scripts (C); fix with a freeze point and added-file coverage (A,B,C).
- Fix sensor L5 Wrong-test judge: today the party that wants green judges whether the old expectation is wrong (C). A wrong or unrunnable test needs a route that is not "edit until green" (A,B,C).
- Fix target L6 Proof cost: plan sizes proof before the machinery exists (C); missing machinery is charted first or the criterion is narrowed (A,B,C).

## Agreed design (A,B,C)

- D1 Tests are written before any product code, from the brief and plan, and committed as their own commit. The product executor (workers, implement A, repair seats) never writes or edits them (A,B,C). Each new test is shown to fail on the intended broken behavior when written (A,B; existing rule `check-issue/SKILL.md:53`). Existing tests that already prove a criterion are reused (B). B: later corrections and regression checks come from the independent owner as explicit baseline updates (B rebuttal F2).
- D2 Freeze: the `implement` move records `tests_head` in state.yaml; the guard (`src/phase.ts:342-371`) runs over `tests_head...HEAD` and counts added files beside M, D, T; the plan's proof directory joins `src/test-files.ts` (C). The judgment of each change already exists: B judges every `Test-Change` trailer against its cited source (`check-issue/SKILL.md:47`), no new gate (C rebuttal 1). B adds: the frozen set also covers expected fixtures, the runner entry point and config that can skip tests, and the accepted suite runs through the planned command, not a worker-chosen one (B rebuttal F3).
- D3 Count: a test exists only as the proof of a done-criterion, or as the fail-first reproduction of a real bug. No helper, coverage, mock-called or vanity tests (A,C). One test may prove several criteria (B). An edge case that matters becomes a done-criterion written by the door (C; not a B requirement, B rebuttal F7).
- D4 No self-built rigs. Proof uses an existing `checks` command, an existing script, or one direct run of the product with its artifact recorded (A,B,C). Missing machinery that is independently provable is its own prerequisite leaf, settled before the product leaf opens, with the criterion "one known-good case green, one deliberate break red" (C); otherwise the criterion is narrowed at charting (A,B,C). Required live evidence stays real; authentic recordings of unchanged outside or model stages stay usable (B; standing design `:14-15`). F8 shows this is where the time goes.
- D5 A proof that cannot run because the machinery or environment is unsuitable stops the pass with `failed --reason "<criterion> red: <cause>"` instead of growing machinery (A,C; B for unsuitable machinery, B rebuttal F4). Human-only blockers keep their own exits (`implement-issue/SKILL.md:33,59`) (B).
- Not recommended: hidden or held-out suites. Hiding tests cut cheating near zero but cut legitimate performance; read-only tests kept performance (ImpossibleBench, arXiv 2510.20270, 2025-10, older); a second suite adds upkeep, delayed feedback and leaks through failure output (SpecStory, 2026-09-29) (C). Also not: assertion-count gates, diff-ratio gates, wall-clock caps (B,C).
- R5's Kun Chen line is a search snippet and carries no weight (C rebuttal).

## Disagreements for the operator

- Q1 Who writes the tests.
  - 1a Seat A in plan.synthesis, as the first commit on the leaf branch (A,C). Matches operator's "main agent instead of sub-agents". Independence comes from timing and freeze, plus B judging any later change. Smallest change: plan-issue writes code, one guard edit.
  - 1b Seat B after planning, before implement; B then stops doing product repairs so B never grades its own code (B). Different author. Costs: new routing step (F5), B becomes a gate before every implement, all product repairs move to A, already the bottleneck seat (system-merged), and the medium-effort seat writes the tests (F7, C rebuttal 3). B: 1a separates timing, not authorship, while A still codes inline and repairs (B rebuttal F2).
- Q2 What happens when a frozen test is wrong (contradicts the brief or real output).
  - 2a A alone (never a worker) fixes that one expectation in its own commit with a trailer citing the brief line or real output; B judges it at review (C). Existing paths. A wrong criterion (locked decision) still stops with a reason (`implement-issue/SKILL.md:34`) (C rebuttal 4).
  - 2b The pass stops with a reason (A). Wrong interface guesses are common when tests precede code, so this stops many leaves (C rebuttal 4).
  - 2c The test returns to its independent author, who confirms a product bug or corrects it; unrelated valid work continues meanwhile (B). Exists only under 1b (C rebuttal 4).
- Q3 What happens when review spots a scenario outside the done-criteria with no observed failure. (A real wrong behavior already gets B's fail-first reproduction then the fix, `check-issue/SKILL.md:79`. A criterion whose test would not catch its failure is a wrong test, Q2.) (B rebuttal F7, C rebuttal 5)
  - 3a Filed as a new seed, not tested mid-leaf (C).
  - 3b An independent, purposeful check is added before A codes the repair (B).
