# Intake: authoritative-leaf-artifacts

## Scope
Pass artifacts (positions, rebuttals, plan, implementation briefs, reviews) land in the registered checkout's `issues/open/<leaf>/`, never in the worktree copy on the leaf branch, and a transition that would carry `issues/` files on the branch fails at that transition with a message naming the authoritative path. Recovery of the boulevard-automation leaf is operator-owned.

## Provenance
- GitHub: Tamdoma/akrogon#18
- Operator: chart-issues door 2026-09-18, "pull recent 3 issues, use slot B"

## Source: Tamdoma/akrogon#18
# next refuses debate synthesis when positions files were committed in the leaf worktree instead of the authoritative issues/open path

Source: Tamdoma/akrogon#18
URL: https://github.com/Tamdoma/akrogon/issues/18

Unverified intake.

## Observation
A debate leaf (`debate: 'yes'`) reached `plan.synthesis` after both positions and rebuttal passes, but `akrogon next` then refused it every time with:

```
{"repo":"boulevard-automation","slug":"worker-scaffold","error":"Debate leaf skipped its debate: worker-scaffold; set phase: plan.positions"}
```

Both slots had written `positions-A.md`, `positions-B.md`, `rebuttal-A.md`, `rebuttal-B.md`, but into the worktree's copy of the leaf folder and committed them on the leaf branch (commits `10aa033 plan.positions B`, `bc82e28 plan.positions slot A`, `f067a1c plan.rebuttal slot A`, `2da051f plan.rebuttal B`). The authoritative leaf folder under the repo root `issues/open/...` holds only brief.md, design.md, state.yaml. `src/next.ts:482-487` checks `existsSync(resolve(leaf.path, 'positions-A.md'))` against the authoritative path, so the leaf is stuck: both panes idle, no busy_since, no dispatch. `akrogon phase` accepted the transitions from `plan.positions` to `plan.rebuttal` to `plan.synthesis` with `issues/` diffs on the branch (history shows `diff: 2 files changed`, `4 files changed`), so nothing failed at write time. The plan-issue skill text says to locate the slug under the authoritative `issues/open/` and use the worktree for live code, but agents whose cwd is the worktree wrote the pass artifacts relative to that cwd.

## Location
akrogon `next` (src/next.ts, debate eligibility check) and `phase` (src/phase.ts, `requireCodeOnly` only enforced at `check.review`), with the plan-issue skill (`plan.positions` and `plan.rebuttal` sections). Consumer repo boulevard-automation, leaf `issues/open/boulevard-ghl-sync/worker-foundation/worker-scaffold`, harness pi, herdr workspace w4 tab w4:t4.

## Reproduction
Hand off a leaf with `debate: 'yes'`, dispatch with `akrogon next`, let both pi slots complete positions and rebuttal from the worktree cwd, then run `akrogon next <slug>`. Observed once, 2026-09-18, first debate leaf in this repo.

## Expected behavior
Either `akrogon phase` refuses a transition whose branch diff touches `issues/` at every phase, with a message naming the authoritative leaf path, so the mistake fails at write time, or the dispatch prompt gives the absolute authoritative leaf folder so the pass artifact cannot land in the worktree copy. A leaf that completed its debate should not be reported as having skipped it.

## Urgency
Blocks every debate leaf on this harness at synthesis. Workaround: copy the four debate files from the worktree leaf folder into the authoritative leaf folder on main, then `akrogon next <slug>`.

## Agent findings
- (both) The incident was bypassed by hand: the authoritative boulevard leaf now holds all four debate files and `state.yaml` reads `implement`. (B) Branch `worker-scaffold` still carries the debate files, `plan.md` (commit 9ac9d01) and implementation briefs under `issues/`, so it will be refused at `check.review` by `requireCodeOnly` and needs operator repair of the branch.
- (both) Causes on the live surface: seat panes are created with `--cwd <worktree>` (`src/next.ts:298-299`); the dispatch prompt is `<skill> <slug> slot=<S> phase=<P>` with no path (`src/next.ts:411`); `transition()` calls `requireClean` on every move but `requireCodeOnly` only when entering `check.review` (`src/phase.ts:117-118`); the debate gate checks only the authoritative path (`src/next.ts:482-487`).
- (both) `skills/plan-issue/SKILL.md:14` names the authoritative read location; the write instructions at `:33,41,49` give filenames without a destination. `skills/implement-issue/SKILL.md:39` already claims phase "refuses any file under issues/ on the branch", which the code does not do before review.
- (both) `requireCodeOnly` (`src/phase.ts:150-157`) also refuses an empty branch. Reusing it unchanged on planning moves would refuse every planning transition before code exists; the no-issues-diff condition must be separated from the nonempty condition.
- (both) Existing coverage: `tests/phase.test.ts:127-155` (issue files refused at review only), `tests/next.test.ts:1729` (debate gate), fixtures in `tests/helpers.ts:11-31`.
