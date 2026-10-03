# Design: base-red-complete

## Binding decisions, verbatim

### Base red rule (issues/chart/test-runs/forks/base-red-rule.md), Taken
Operator 2026-10-02, verbatim: "1a | 2a | 3a |"
- Q1 1a: red on base stops a leaf only when both runs completed (the checked command's own exit status and terminal result), with the same command, args, scope, install and material conditions, and the seat records why the base failure explains the leaf failure. Test names need not match. Otherwise the leaf failure takes the existing repair path. Reason: #53's killed run was called red, and later completed runs failed on different fixtures from one cause. Foreclosed: 1b matching names, 1c any red base.
- Q2 2a: a killed, interrupted or crashed run is incomplete: stop with `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>"`, keep logs, no automatic rerun, no base-defect claim. Foreclosed: 2b one corrected rerun, 2c leaf repair.
- Q3 3a: one line: a base run uses the harness's longest run mode, and a run killed before its terminal result is still incomplete under Q2. Mitigation, not a guarantee (B rebuttal). Foreclosed: 3b.
- No question (A,B): preserve the checked command's own exit status before any reporting pipeline.
- Scope (A,B): the base-run paragraphs at skills/implement-issue/SKILL.md:38 and skills/check-issue/SKILL.md:59 only. No merge-issue change, no new state, slot, clock or retry.

### Timeout cause (forks/timeout-cause.md), Taken, context only
Operator 2026-10-02, verbatim: "1a | 2a |"
- Q1 1a: #53's timeouts were the capture request-lifecycle race fixed by framework 2cb00d537, recorded with high confidence and the limit that the noon runs were not traced. Foreclosed: 1b, holding for a 15-20 min measurement.
- Q2 2a: the heavy-run slot is not built and moves to Off route, to be reopened only by a traced load failure. Foreclosed: 2b (B), slot with a measured count.

Exclusions for this leaf: no heavy-run slot, `akrogon heavy` command, slot count or leftover-process cleanup (forks/heavy-run-slot.md, ruled out); no framework test selection or release gate (chart framework-test-scope); no merge-issue change; no TypeScript change.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md, as it applies here: this leaf changes skill prose only. No auth, secrets, backend state, browser flow, chain or outside call is involved, so no end-to-end artifact, real call or chain spine applies. "No vanity tests": no test that greps skill text is added. The cheapest sufficient proof is the reviewer reading the two paragraphs against criteria 1-2 and the recorded #53 walk-through in criterion 3. Leaf work is agent-owned with no human prerequisite.

## Leaf architecture
Owned surfaces: the base-run paragraph of `skills/implement-issue/SKILL.md` (starts "During implement end and check.fix, a red test or check with no cause in the leaf's diff") and of `skills/check-issue/SKILL.md` (starts "During check.review, a red test or check with no cause in the leaf's diff"). Both paragraphs keep their current trigger, judgment gate, worktree commands and artifact destinations.

Literal interfaces kept: `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>`. Added: `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>" --slot <A|B>`, an existing command with a new free-text reason, no new phase or state field.

Each paragraph keeps one copy of the rules because each skill runs the base run on its own path. Write the rules in the paragraph's existing style, stated once each, with no new heading.

Dependencies: none.
