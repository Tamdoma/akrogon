# Plan: test-proof-rules

Debate `no`: synthesized directly from brief/design. All edits are rule-text edits in the leaf worktree; pass artifacts (this file, `implementation/report.md`) write to the `leaf=` folder in the registered checkout only, since `akrogon phase` refuses `issues/` files on the branch.

## Decisions

- D1: One machinery definition, by function, stated once in `skills/chart-issues/assets/standing-design.md` (covering "runs proof rather than is the product": runner, dispatcher, session or port pool, fixture factory; explicitly excluding the repo's existing test runner, fixture and cleanup helpers, and temporary repo/directory setup inside a test). Every other surface references it, never restates it (A,B).
- D2: The planner-tests step sits in `plan.synthesis` only, after `plan.md` and before the `implement` finish line, in `skills/plan-issue/SKILL.md`. `plan.positions` and `plan.rebuttal` write no tests. Content per done-criterion 1-2: one test per criterion not already proven by an existing test or `checks` command, from brief and plan only, smallest real boundary, one test may prove several criteria, a case may extend an existing test file; run `checks` so every remaining failure is a planned test's intended red; paste each new test's red output beside its criterion in `plan.md`; commit on the leaf branch with no product code; a commit adding a case to an existing test file carries the existing `Test-Change` trailer. `plan.md` names the test and command per criterion.
- D3: Proof-command rule at planning: each criterion's proof command uses a runner or script present at `AKROGON_BASE`, or is one direct invocation of the product; the test files and inputs it runs may be new in the planner's commit. A criterion needing new proof machinery ends `plan.synthesis` with `akrogon phase <slug> failed --reason` naming the criterion and the missing machinery, instead of finishing with `implement`.
- D4: After planning, workers, implement A and repair seats write and edit no test, except exactly two cited exceptions: A's one-expectation correction (Q2 2a, own commit, `Test-Change` trailer citing the brief line or real output, judged by B) and the red-first bug reproduction (Q4 1a). A worker who finds a planned test wrong returns a mismatch and waits (reuses `worker-protocol.md` mismatch return); a wrong criterion ends the pass `failed --reason` naming the decision (the existing locked-decision stop).
- D5: Test count rule in `standing-design.md` (rewriting line :8), `implement-issue/SKILL.md` and `brief-template.md`: a test exists only as proof of a done-criterion or as the red-first reproduction of a proven bug. Extra edge/negative cases are no longer addable after planning on a named consequence alone; a consequential edge case is a done-criterion written at charting.
- D6: `check-issue/SKILL.md`: delete :55 (missing-test Fix for a case outside done-criteria); such a case without a realistic source is a Nit getting no test and no new issue. The Fix bar (:51) and the criterion-test check including recorded red output (:53) stay. Beside :53, B checks the report ran the planned tests through the commands `plan.md` names and that no change since planning skips, filters or disables a planned test or the runner configuration it depends on. Keep :53's "A new test needs no cited source" — B reviews diffs, does not author tests there; the planner's new test files legitimately carry no source citation. Keep :47 and :83 unchanged (frozen-test-guard's lines).
- D7: Proven-bug reproduction (Q4 1a): `check-issue/SKILL.md:79` and the check.fix rule in `implement-issue/SKILL.md` require the fixing seat to first commit one reproduction test shown red on the head before the fix, `Test-Change` trailer citing the finding's realistic source; replace the "a new test needs no cited source" sentences at `implement-issue/SKILL.md:76`, `check-issue/SKILL.md:79` and `merge-issue/SKILL.md:55` (a repair-seat added test now always needs the trailer). Keep the wrong-test fix and fix-forward sentences at `merge-issue/SKILL.md:55`.
- D8: Unsuitable machinery/environment: during implement or check.fix, a proof that cannot run because its machinery or environment is unsuitable ends the pass `failed --reason "<criterion> red: <cause>"` — stated in `implement-issue/SKILL.md` (red-criterion exit, :36) and `check-issue/SKILL.md` (:75). A review finding that evidence machinery is missing is that stop's cause, not a repair handed to A; a proven product defect needing a live rerun is still handed to A. Human-only blockers keep their exits; `standing-design.md:15` in-branch fixes, Playwright dev dependency (:9) and authentic-recording replay (:14) stay.
- D9: Charting: `shapes.md:286` audit refuses a product leaf whose done-criterion depends on machinery absent on the destination's default branch, unless a prerequisite leaf in the same handoff delivers it and the product leaf lists that leaf in `blocked-by` (it must exist at the product leaf's `AKROGON_BASE`; `src/next.ts` releases on completion). Missing machinery that can be proven alone is proposed as that prerequisite leaf with done-criterion "one known-good case passing and one deliberate break failing"; otherwise the door narrows the criterion with the operator at handoff review. The `chart-issues/SKILL.md` handoff live-run line (:69) also names the existing machinery each live criterion uses.
- D10: Mode split: inline mode follows criteria 1-3 with A as the only seat under the same guard (it has state, worktree and phase calls). Direct and standalone modes have no state or guard (`src/next.ts:300-301` creates no leaf state); they get the order rule only: tests from the brief first, committed, then code — stated in the Standalone/Direct sections of `implement-issue/SKILL.md` and in `brief-template.md` section 2's standalone branch.
- D11: Exclusions honored: no restatement of freeze-guard mechanics (`implement-issue/SKILL.md:64`, `merge-issue/SKILL.md:51`, `check-issue/SKILL.md:47,83`, `shapes.md:276`, `docs/guide/merge.md`); text may say tests are locked after planning and point to the trailer rule. No change to reuse/rerun rules (`implement-issue/SKILL.md:63,84`). No test-count limits, assertion gates, timers or held-out suites.
- D12: This leaf adds no test files: it changes prose rules, and tests may not assert prose wording (`check-issue/SKILL.md:53`, standing-design "no vanity tests"). Verification is criterion-10 sweep greps and criterion-11 fresh-agent classification, recorded in the implementation report.

## Read-first paths

- `issues/open/pre-written-tests/test-proof-rules/{brief.md,design.md}` — contract
- `issues/open/pre-written-tests/frozen-test-guard/design.md` — sibling leaf boundary (guard mechanics; do not restate)
- `docs/reference-index.md`, `skills/AREA.md` — grounding
- `skills/plan-issue/SKILL.md:57-69` — plan.synthesis, insertion point
- `skills/implement-issue/SKILL.md:34,36,53-57,63-64,76,84,86-96` — implement, check.fix, standalone/direct
- `skills/implement-issue/brief-template.md:13,31,45` — template sections 2, 6, 8
- `skills/implement-issue/worker-protocol.md:11-29` — waves, mismatch, failure ownership
- `skills/check-issue/SKILL.md:47-55,73-89` — review rules, check.repair
- `skills/merge-issue/SKILL.md:51,55` — solo rebase, wrong-test fix
- `skills/chart-issues/assets/standing-design.md:8-15` — count rule, machinery, kept lines
- `skills/chart-issues/assets/shapes.md:284-288` — audit
- `skills/chart-issues/SKILL.md:69` — handoff review live-run line
- `docs/guide/phases.md:80-108`, `docs/guide/idea.md:37-46`, `docs/guide/chart.md:209`, `README.md:134`, `docs/guide/merge.md:11` — operator docs
- `src/test-files.ts`, `src/phase.ts:282` — trailer path rule and where the guard runs (context only, owned by frozen-test-guard)
- `tests/phase.test.ts:13-23` — allowed fixture pattern (existing `fixture` helper)
- `learnings/history/2026-09-11-stale-rule-in-docs.md`, `learnings/history/2026-09-14-ambiguous-prose-after-rename.md` — sweep lessons

## Interfaces needed

- `testFile(path)` in `src/test-files.ts` — which paths trigger the trailer rule (citation only).
- `akrogon phase <slug> failed --reason` / `implement --slot A` — stop and finish (existing).
- Subagent spawn — criterion-11 fresh classifier (existing harness capability).
- `AKROGON_BASE` from `akrogon config` — planning proof-command check (rule text).

## Checklist

### Wave 1 (3 units, disjoint owned paths, no shared resources, no dependencies)

| Unit | Owns | Work |
| --- | --- | --- |
| U1 plan+chart rules | `skills/plan-issue/SKILL.md`; `skills/chart-issues/SKILL.md`; `skills/chart-issues/assets/shapes.md`; `skills/chart-issues/assets/standing-design.md` | D2, D3 planner-tests step; D8 charting half; D9 audit refusal + blocked-by + prerequisite-leaf rule + live-run machinery naming; D1 machinery definition and D5 count rule in standing-design; keep :12-14, Playwright :9, recordings :14, in-branch fixes :15 (remove any reading letting a leaf build or grow a runner) |
| U2 implement rules | `skills/implement-issue/SKILL.md`; `skills/implement-issue/brief-template.md`; `skills/implement-issue/worker-protocol.md` | D4 no-worker-tests + mismatch-and-wait; A-only Q2 correction; D5 count rule; D7 check.fix reproduction rule replacing "no cited source" at :76; D8 machinery stop at :36 red-criterion exit and :84; D10 inline/delegated/standalone/direct split; :57 rewritten to "run the planned tests" keeping smallest-boundary/delete-false-expectation guidance for the planner; :64 kept, may point to locked-after-planning; worker trailer sentence `brief-template.md:45` removed |
| U3 review+merge+docs | `skills/check-issue/SKILL.md`; `skills/merge-issue/SKILL.md`; `docs/guide/phases.md`; `docs/guide/idea.md` | D6 review edits; D7 :79 narrowed reproduction rule, `merge-issue/SKILL.md:55` sentence replacement; D8 :75 missing-machinery = stop cause not A handoff; docs mirror updates (phases.md :80, :92-104; idea.md :41 implement row) |

### A-only verification (not a worker unit; runs after Wave 1 lands)

- V1: Criterion-10 sweep greps over `skills/`, `docs/`, `README.md`; list out-of-scope hits (`frozen-test-guard` lines) in the report.
- V2: Criterion-11 fresh-agent classification of the seven cases; record verdicts, reasons, command/subagent used in the report.
- V3: `checks` commands (`format`, `typecheck`, `test`, `test_changed`); revert format drift on untouched files (lesson 2026-10-08).

## Proof table

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1 | Read `skills/plan-issue/SKILL.md` plan.synthesis: contains test-per-criterion write, smallest boundary, red output recorded in plan.md, leaf-branch commit no product code, existing-file trailer, before `Finish with ... implement` | Planner writes no tests or writes them off-phase | seconds | U1 diff |
| 2 | Read same file: runner/script at `AKROGON_BASE` or single product invocation required; new-machinery criterion ends with `failed --reason` naming criterion and machinery | Plan could demand new proof machinery | seconds | U1 diff |
| 3 | Read `implement-issue/SKILL.md`, `brief-template.md`, `worker-protocol.md`: workers/A/check.fix A write and edit no test; sub-briefs hand planned tests and their command; wrong planned test = mismatch/wait; A-only one-expectation correction with cited trailer; wrong criterion = `failed --reason` naming the decision | Executing seat authors tests | seconds | U2 diff |
| 4 | Read `implement-issue/SKILL.md` modes: inline under same phase guard; standalone + direct state "tests from the brief first, committed, then code" | Unguarded modes get no order rule or overclaimed guard | seconds | U2 diff |
| 5 | Read `standing-design.md`, `implement-issue/SKILL.md`, `brief-template.md`: count rule present; no edge/negative add-on after planning; charting owns consequential edge cases | Post-planning test creep stays allowed | seconds | U1/U2 diff |
| 6 | Read `check-issue/SKILL.md`: :55 gone; Nit-without-source gets no test and no new issue; :51 and :53 keep; new check beside :53 for planned commands and no skip/filter/disable | Review still grows tests; planned tests silently bypassed | seconds | U3 diff |
| 7 | Read `check-issue/SKILL.md:79`, `implement-issue/SKILL.md:76`, `merge-issue/SKILL.md:55`: red-first reproduction with source-citing trailer; "new test needs no cited source" gone from those lines | Repair seats add uncited tests | seconds | U3 diff |
| 8 | Read `standing-design.md` machinery definition + `shapes.md:286` audit refusal + `blocked-by` + prerequisite-leaf proof rule + `chart-issues/SKILL.md` live-run machinery line | Product leaf builds a rig | seconds | U1 diff |
| 9 | Read `implement-issue/SKILL.md` (:36 area) + `check-issue/SKILL.md:75`: unsuitable machinery/environment = `failed --reason "<criterion> red: <cause>"`, not repair, not machinery-writing; live-rerun product defect still handed to A | Missing machinery silently repaired or worked around | seconds | U2/U3 diff |
| 10 | `grep -rn '<old-rule terms>' skills/ docs/ README.md` after edits; every hit either new-rule-correct or listed as out of scope | Stale authorship/proof lines survive | seconds | V1 |
| 11 | Fresh agent (never read this leaf's diff) given new `skills/` text + the 7 case descriptions classifies each; report records verdicts, reasons, command/subagent | Rules unclear to a fresh reader | minutes | V2 |
| Repo health | `bun run format`, `bun run typecheck`, `bun test --timeout=30000`, `test_changed` with `AKROGON_BASE` | Format/type/test regression | minutes | every head change |

## Notes for review

- Brief/design agreement: none observed; design wins where it refines (machinery definition, trailer mechanics exclusions).
- Open limitation: runner/skip configuration the planner did not change is not mechanically recorded; B's judgment check (criterion 6) is the control — held disagreement carried from `frozen-test-guard` review F2.
- `check-issue/SKILL.md:53` "A new test needs no cited source" kept deliberately: it governs review of diffs, where the planner's new files correctly carry no source citation.
- No credential variables named by the design; `akrogon status` shows no `Missing:` lines — no human-only blocker.
