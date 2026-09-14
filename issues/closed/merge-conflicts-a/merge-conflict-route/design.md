# Design: merge-conflict-route

## Binding decisions, verbatim

### Who resolves a rebase conflict at merge?
Operator answer (2026-09-14): `12a`. A resolves every rebase conflict in the merge phase, reruns every `checks` command, pushes. Foreclosed: a mechanical-versus-semantic rule; routing conflicts to check.fix.

### What does A record after resolving?
Operator answer (2026-09-14): `13a`. A records the rebase target, the prior reviewed head, the resolved head and a `git range-diff` in review-A.md before the push; green checks are the gate, no second reviewer. Foreclosed: B re-checking the resolution.

### What bounds repeated merge → check.fix?
Operator answer (2026-09-14): `14a`. `fix_rounds` rises only on check.review → check.fix; no merge-side counter or cap. Measured basis: one red-check trip in 137 merges, never repeated. Foreclosed: a `merge_rounds` field.

### Red checks after a clean rebase
Operator answer (2026-09-14): `15a`. Red checks after a clean rebase route to check.fix as today; B repairs, A re-checks the repair diff, A merges. Foreclosed: A fixing forward in merge.

### Who re-reviews a merge-origin repair?
Operator answer (2026-09-14): `16a`. A merge-origin repair with no earlier review fix is re-reviewed by A and B like an initial review; with an earlier review fix, by A alone. No routing change. Foreclosed: a new state signal for A-only. This reading governs the words "A re-checks" in 15a.

### Operator goals, verbatim from the intake
keeping simplicity, not increasing complexity unless it REALLY benefits the process, but even then only minimal. Then cost, then speed. On Q14: "We need a measured decision, not guessing."

### Standing design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any leaf touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first leaf needing it. Non-browser flows use a real request or invocation. The blocking `checks` commands judge the exit code and the implementation report records the artifact path as evidence.
- Leaf work is agent-owned. A step physically requiring the operator is a human-only prerequisite completed before the leaf opens. Credential access alone never qualifies. An unforeseen physical blocker ends the attempt and informs the operator.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

Current interpretation: no auth, browser or secret surface. The user-visible flow is `akrogon phase <slug> check.fix` from merge, exercised by the real CLI subprocess in tests/phase.test.ts, which is the existing test style; the artifact is done-criterion 8. The negative case is the cap case in criterion 1. No env values are needed. Skills go live at merge through the symlinked skill folders.

## Leaf architecture

Owned surfaces: `src/phase.ts` lines 35-40 and 137-138, `tests/phase.test.ts` lines 91-93 plus one added case, `skills/merge-issue/SKILL.md` lines 33 and 35, `skills/implement-issue/SKILL.md` line 49, `skills/check-issue/SKILL.md` line 43, `docs/guide/phases.html` lines 63-64, `docs/guide/problems.html` line 64, `docs/guide/in-practice.html` line 129, `docs/guide/merge.html` line 63.

Literal interfaces. Code and file names literal; skill and guide wording by content.
- phase.ts:35-40 today: `fix_rounds: to === 'check.fix' ? recorded.fix_rounds + 1 : recorded.phase === 'failed' && to === 'implement' ? 0 : recorded.fix_rounds`. After: the increment branch also requires `recorded.phase === 'check.review'`.
- routing.ts:39 `requiredSlots` is unchanged: a merge-origin repair is re-reviewed by A and B when `fix_rounds` is 0 and by A alone otherwise. Skill and guide sentences say "re-reviewed" without naming the slot.
- phase.ts:137-138 today: `destination === 'check.fix' && state.fix_rounds >= repo.config.fix_rounds ? 'failed' : destination`. After: the condition also requires `state.phase === 'check.review'`.
- tests/phase.test.ts:91-93 today asserts `readState(mergePath).fix_rounds` is 1 after `phase conflict check.fix`; after it asserts 0, and a sibling leaf fixture in merge with `fix_rounds` set to the configured cap (1 in that test) moves with stdout `moved check.fix`.
- merge-issue:33 after, two lines: "On a rebase conflict, resolve it in the worktree keeping both true sides, complete the rebase, and record in `review-A.md` the rebase target, the prior reviewed head, the resolved head and `git range-diff <old-base>..<prior-head> <target>..<resolved-head>` before running the checks, where old-base is the `AKROGON_BASE` value before the post-rebase refresh." Then, on its own line: "On red checks, append the failing output, the rebase target commit and the rebased head to `review-A.md`, call `akrogon phase <slug> check.fix --slot A`, and finish with the actual result and repair footer."
- merge-issue:35 after: "Same-line index conflicts retain both true entries and recheck pointers; a broken default branch discovered by this leaf is fixed forward with failing tests as criteria."
- implement-issue:49 after: "A repair requested from merge starts at the rebased head recorded in `review-A.md` and treats the failing output as the finding."
- check-issue:43 after: "inspect only the repair diff from the prior reviewed head (or the rebased head A recorded at merge)".
- phases.html:63 after: "Each review → fix loop adds one to `fix_rounds`." phases.html:64 after: "A rebase conflict is resolved by A and recorded in review-A.md. A red check → check.fix instead." (the word check.fix on this line refers to red checks, which criterion 5 allows)
- problems.html:64 row after: "Nothing. A resolves it in the merge, records the resolution in review-A.md and reruns the checks." in-practice.html:129 and merge.html:63 last sentence: the same content, and "A re-checks" becomes "the repair is re-reviewed".

Tests: tests/phase.test.ts only, real CLI subprocess as the file already does.

Exclusions: everything under Off route in the chart; merge-issue:37 failed-diagnosis paragraph (dead after this leaf, L4 owns it) and :56 footer (L4), `src/routing.ts`, `src/state.ts`, `src/log.ts`, `src/status.ts`, setup.html:67, state.html:85, problems.html:68 (akrogon sync row), L1 and L3 lines, closed leaves and log history.

Dependencies: none. `command-deletions-batch` edits phases.html:74 and problems.html other rows; `plan-is-contract-skills` edits phases.html:61 and other skill lines. Overlapping files do not order work. Credentials: none.
