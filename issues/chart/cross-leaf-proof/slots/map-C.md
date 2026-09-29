# Map C: Tamdoma/akrogon#41, cross-leaf defects found serially at the last leaf

Slot C, independent. Checkout: akrogon main is even with origin/main (fetched 2026-09-29).

## Key finding

The spine that proposal A1 asks for already existed. The framework's `fixture-network` leaf built a typed step list meant for exactly that: "each later leaf swaps its phase in by replacing one step's recorded run with its real script" (framework `issues/open/satellite-network-simplify/satellite-foundation/fixture-network/brief.md:4`). At HEAD the steps that produced most of the 17 defects are still recorded or missing:
- `per-site-content-weave` is `recorded` (`.claude/workspaces/seo/satellite-network/test/run-fixture-network.ts:648`).
- `recorded-build` is `recorded` (`:653`), so the new renderer never ran in the spine.
- content-prep, batch, finalize and content-verify do not appear in the step list at all (`:604-693`).

No later leaf's brief was required to swap its step in. So the failure was not a missing spine. Nothing forced the spine to grow. That makes A1 a charting rule ("each leaf's done-criteria include flipping its step to real in the shared spine"), not a new leaf shape.

The second multiplier was the proof leaf's own design, not the testing technique. The chart wrote these into live-replay:
- "Fixing any defect the run finds. The run fails, and the owning leaf reopens." (`live-replay/design.md:48`)
- "The run happens once at that revision with no source edit after." (`brief.md:36`, `design.md:119`)

Each defect therefore cost one full plan/implement/review/merge leaf plus a multi-hour rerun from scratch. The run history has 18 labelled runs and 9 rehearsals (`implementation/report.md:691-722`). The rehearsals resumed on an existing tree with stand-ins, and R1-R3 and R7-R9 found several defects per pass (`report.md:707-722`). Speed came back only after the operator overrode both rules on 2026-09-29 (`design.md:41-42`).

## 1. Destinations

- D1: Charts that split a staged pipeline keep one real end-to-end run growing from the first leaf. Every later leaf must extend it and keep it green to merge. Result: cross-leaf shape defects show up in the leaf that causes them.
- D2: A proof or replay leaf is designed to finish fast. It resumes from the failed stage, collects every failure in one pass, fixes small cross-leaf defects in its own branch, and gives a costly from-scratch run only once at the end (or drops it by design).
- D3: Review (check-issue) catches the two defect classes that fixtures cannot: a rule implemented twice by writer and checker (A4), and a check the generator cannot satisfy (A5).

D1 and D2 both land in `skills/chart-issues/assets/standing-design.md` and `shapes.md`. D3 lands in `skills/check-issue/SKILL.md` or `ponytail.md`. No `src/` change is required by any proposal (see F7).

## 2. Material forks

### F1: Where does A1 (a real spine that every leaf keeps passing) live, and what does it require?
Evidence: `chart-issues/SKILL.md:41` and `shapes.md:118` order leaves only by actual dependency. Nothing mentions a shared integration run. `standing-design.md:9` requires one end-to-end command per user-visible leaf, but only for that leaf's own flow. The framework spine existed but was never extended (Key finding).
Options:
- 1a (recommended): Add a standing-design line. When a chart splits a pipeline across leaves, the first leaf owns one runnable spine command. Each later leaf's done-criteria (i) replace its stage's recorded step with the real one and (ii) keep the spine command in `checks`. chart-issues copies this into each design, and the handoff audit (`shapes.md:170`) confirms every pipeline leaf names its spine step. Reason: it fixes the gap that actually happened, uses the existing `checks` merge gate (`merge-issue/SKILL.md:33`), and adds no code.
- 1b: A new leaf type or a `spine:` field in state.yaml enforced by the command. Cost: code plus a schema change for something `checks` already gates.
Pitfall: "real" must stay affordable. The framework spine replays model steps (`fixture-network brief.md:4`), which is right. A1 should require real *script* stages and recorded-from-real *model* outputs, never live model sessions per merge.

### F2: How does A2 (collect all failures in one pass) apply, and who owns it?
Evidence: live-replay halts at the first failure ("HALT NETWORK_BUILD_FAILED", `report.md:315,425,460`). Rehearsals that continued past failures with stand-ins found 2-3 defects per pass (`report.md:707-722`).
Options:
- 2a (recommended): Standing design, scoped to proof/replay runs. The run reports every failing check per stage and continues to the next stage when its inputs exist. It halts only when a stage cannot produce inputs for the next. Reason: gates that must halt in production (the content gate) keep halting there. Only the proof harness collects.
- 2b: A global "never fail fast" rule. Cost: it conflicts with real gates, which must stop the pipeline.
Pitfall: continuing after a failed stage produces follow-on noise. The report must mark follow-on failures as derived, or the fix list inflates.

### F3: Should a proof leaf fix small cross-leaf defects in its own branch and resume instead of restarting? (Operator goal: the fastest simple test that still proves the work.)
Evidence: `design.md:48` (reopen owner leaf), `design.md:119` (no source edit after the run), and the overrides at `design.md:41-42`. Seven fix leaves were opened for the epic (`satellite-content/ISSUE.md`, `satellite-render/ISSUE.md` lines tagged "unblocking live-replay").
Options:
- 3a (recommended): Standing design. A proof leaf fixes a defect in-branch with a fail-first test when the fix fits the proof leaf's reviewers (no locked-decision change). It opens a new leaf only for a design change. Debug runs resume from the failed stage. One final run proves the whole route, and it may be a resumed run if the design names which invariants that weakens (as `design.md:42` did). Reason: this is what finally moved the leaf, and review still sees each fix.
- 3b: Keep the "reopen owner leaf" rule. Cost: a full lifecycle per defect, which is what took days.
Pitfall: in-branch fixes widen the proof leaf's diff and review. Cap it, for example at "no locked decision changed". Past that cap, a new leaf.

### F4: Where does A3 (fixtures recorded from real upstream output) live?
Evidence: defects #1-#3, #9 and #10 were shape mismatches (seed). The fixture network recorded outputs by hand for model steps (`fixture-network brief.md:4`). `check-issue/ponytail.md:30` says "no frameworks, no fixtures" for the one check that lazy code leaves behind. That is a different scope, but it could be misread as forbidding fixtures.
Options:
- 4a (recommended): Standing design line plus a design-template field. Each fixture that stands in for another leaf's output names its producer. Once the producer lands, the fixture is re-recorded from the producer's real output, or the test calls the producer. The fixture-network already did this for persona→sitemap ("A test passes unmodified real generate-persona output", `fixture-network brief.md` crit 6). Reason: it generalizes a pattern that worked in the same epic.
- 4b: Leave it to plan-issue. Cost: the plan cannot re-record fixtures for a producer that has not landed yet. This must be a chart-level contract.
Practitioner basis: consumer-driven contracts (see §3).

### F5: Does A4 (writer and checker share one implementation) belong in check-issue, or earlier?
Evidence: defects #10/#11, #12 and #14 (seed). `check-issue/SKILL.md:43` lists "concrete maintainability defect" as a Fix but names no duplicated-rule check.
Options:
- 5a (recommended): Both, cheaply. A standing-design line: "a rule enforced by a checker and followed by a writer lives in one function both import, or the design names why not." Plus one check-issue line: a new or changed check whose rule the writer re-implements is a Fix. Reason: the chart assigns ownership up front (as `fixture-network` crit 6 did for vocabulary), and review catches drift.
- 5b: check-issue only. Cost: review sees one leaf, but writer and checker are often split across leaves (prep vs verify). The earliest point that sees both is the chart.
Pitfall: prose rules for model workers (#14, chrome uniqueness vs worker instructions) cannot import a function. For model writers the shared source is the instruction text generated from the checker's definition, or the check is narrowed.

### F6: Where does A5 (a check proves the generator can satisfy it) live?
Evidence: #16 pigeonhole, with 2 hero modules and 4 sites (`report.md:194-219`). #14 needed pairwise-unique labels.
Options:
- 6a (recommended): check-issue line plus standing design. A new check ships with one positive test on real generator output at the target scale (pool size vs site count). A check with no passing real input is a Fix. Reason: this is a single test per check, the cheapest proof that the check is satisfiable.
- 6b: plan-issue only. Cost: plans are written before code exists, so they can name the test but not run it.

### F7: Is any command (src/) change needed?
Evidence: `src/routing.ts:26-40` has phases and slots only. No proposal needs a new phase. `checks` already block at implement and merge (`implement-issue/SKILL.md:47`, `merge-issue/SKILL.md:33`).
Recommendation: no code. Lock "skills guide agents, the command owns phase changes" (existing lock). Every proposal fits skill text or standing design.

## 3. Practitioner questions

- Q1: What is the thinnest real slice that proves every stage connects, and is it built first? Steve Freeman and Nat Pryce, *Growing Object-Oriented Software, Guided by Tests*: "A Walking Skeleton is an implementation of the thinnest possible slice of real functionality that we can automatically build, deploy, and test end-to-end" (quoted via https://marabesi.com/reviews/growing-object-oriented-software-guided-by-tests.html). This supports A1. Alistair Cockburn coined the term (Crystal Clear). No primary URL was fetched.
- Q2: How do consumers pin what they read from a producer without running everything? Ian Robinson (Thoughtworks), "Consumer-Driven Contracts: A Service Evolution Pattern", https://www.martinfowler.com/articles/consumerDrivenContracts.html. Pact's model is that the consumer records its expectations and the provider replays them against its real code on every build. This supports A3 and cuts the need for multi-hour full runs.
- Q3: How much should rest on end-to-end runs at all? Mike Wacker, Google Testing Blog, "Just Say No to More End-to-End Tests" (2015-04-22), https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html. Slow E2E runs make failures slow to find and isolate. Push checks down to integration tests of real pairs. Adrian Sutton (LMAX) disagrees, https://www.symphonious.net/2015/04/30/making-end-to-end-tests-work/. E2E works when it is fast and run continuously. They agree the fix is fast feedback. Where they disagree, E2E stays on in our case because rendered defects (#13, #15, #17) need a real browser.
- Q4: What time budget should a proof stage have? Dave Farley, *Continuous Delivery Pipelines* (https://leanpub.com/cd-pipelines): commit stage under 5 minutes, acceptance stage under 1 hour. The live-replay run was multi-hour per attempt. A practitioner would ask for a budget per stage and a resumable one.
- Q5: Which checks can run on a spine with recorded model output, and which truly need a live session? Every rendered check (contrast, 360px, anchors) ran only in rendered review of the last leaf. The framework's own learning 4 says the renderer's tests should run them (`learnings/history/2026-09-29-last-leaf-integration-serial-defects.md`). A practitioner would ask why a live model session was needed to find a CSS bug.
- Q6: When a proof run fails, does it fail the whole run or report per stage? This is A2. No named source beyond Farley's fast-feedback rule. The search for "collect all failures pipeline acceptance test" was not run separately.

## 4. Pitfalls grounded in inspected surfaces

- P1: A standing-design line is reinterpreted per leaf (`standing-design.md:13`, "writes its own interpretation"). A spine rule can be interpreted away, just as the swap-in intent was. The handoff audit (`shapes.md:170`) must check it, not just copy it.
- P2: `chart-issues/SKILL.md:41` and `shapes.md:118` say "only an actual dependency orders work". A spine-first rule makes the spine leaf a real dependency of every pipeline leaf. That is consistent, but the wording must make the dependency explicit or peers will call it ordering by preference.
- P3: The locked E2E line (`standing-design.md:9`) requires a Playwright artifact per user-visible leaf. A spine rule must not also force a live model run per leaf, or every merge becomes multi-hour. Keep model steps recorded-from-real.
- P4: `ponytail.md:30` ("no frameworks, no fixtures") in both implement-issue and check-issue could be read against A3. Only clarify it if it conflicts. Otherwise leave it alone (scope).
- P5: The "same revision, no edit after" invariant (`design.md:119`) was chosen for proof strength. Relaxing it for speed must keep a named list of weakened invariants, as `design.md:42` did. Otherwise speed silently weakens the proof (the report's own urgency concern).
- P6: Fix leaves labelled "unblocking live-replay" each ran debate-free but still went through plan/implement/review/merge (7 leaves in two issues). Any rule that sends fixes to new leaves reproduces this cost.
- P7: Lesson `learnings/LESSONS.md:7`: review found defects only by running code. A4 and A5 checks must be run by review, not read.

## 5. Fog

- G1: What counts as a "pipeline" chart that triggers the spine rule? Candidates: leaves whose outputs feed other leaves' inputs, or any epic with a final proof leaf. Not sharp yet.
- G2: The budget for a spine command inside `checks` (minutes). Farley suggests under 5 min for commit and under 1 h for acceptance. The operator has not set a number, and the framework's `framework:verify:core` is already long (`package.json:86`).
- G3: How in-branch fix scope is bounded for a proof leaf ("no locked decision changed" vs a diff size). This needs an operator call.
- G4: Whether chart-issues should include a retro step that reads `learnings/history` on epic-scale charts. It may already be covered by `SKILL.md:29`.

## 6. Off route

- Fixing live-replay, #16 or #17 in the framework (lock: the destination is akrogon).
- Any new lifecycle phase or `src/routing.ts` change (F7, and the lock that the command owns phases).
- Writing under `issues/` from a leaf (lock).
- Rewriting `ponytail.md` beyond a conflict found in F4.
- A general "reduce E2E" policy. The locked E2E line stays, and this chart only adds where and when it runs.

## 7. Proposed split

One issue in akrogon, `cross-leaf-proof`, with parallel leaves. None blocks another, since each edits different text and is independently checkable:
- L1 `pipeline-spine` (F1, F4, P1-P3): standing-design lines for the spine and fixture provenance, plus the handoff-audit line in `shapes.md`. Fast, and it is the core value. Take F1 first because it reshapes F4.
- L2 `proof-leaf-speed` (F2, F3, P5): standing-design lines for proof/replay leaves (resume, collect-all, in-branch small fixes, a named final-run policy). Fast once G3 is answered. This is the operator's direct ask.
- L3 `review-rule-checks` (F5, F6, P7): check-issue lines for duplicated writer/checker rules and generator-satisfiable checks, plus a matching standing-design line. Fast.

Round order: F3 (the operator's speed goal, and it reshapes F2), then F1 (reshapes F4 and G1), then F5 and F6 together. F7 needs no round unless a peer disagrees.
