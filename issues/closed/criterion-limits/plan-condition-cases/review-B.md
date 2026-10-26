# Review B: plan-condition-cases

Date: 2026-10-26. Initial blind review, slot B.

Base: `a4fc68d3f4ebd5f43f1d99063bd8268e368fb6aa`.
Reviewed head: `abf1909958c01438cc78e662180e8e2eddb115af`.

Verdict: **ready**. No Fixes, Nits or operator actions.

## Scope and criteria

The entire diff is one paragraph in `skills/plan-issue/SKILL.md` under `plan.synthesis`, immediately before the criterion-test paragraph. It matches plan D1. No other skill, section, test, configuration or lesson changed. The worktree is clean.

Criterion 1 passes by reading the rule: it requires checking every decision against its criterion's stated conditions before writing tests, tracing values through later calls, helpers and earlier loop or batch iterations, and providing a violation-catching case at the state-owning process, invocation or step, or a traced reason the condition cannot break. It records the condition, decision and case or reason beside the observation in `plan.md`. Each case requires a temporary edit that causes the violation, red output beside the condition, and discarding the edit before the test commit. Counts from cases where the condition holds and tests proving only the main result cannot substitute. The existing test paragraph's deliberately-broken-behavior rule and implement's test lock remain consistent with this planning requirement.

Criterion 2 passes by independently applying that trace to design `Case`:

- The failed `commonDirectory(path)` result survives in a process memo until another call for that same path. A four-distinct-path proof cannot observe retry. The rule requires two calls for the same path in one process, with the first lookup failing and the second running the lookup again. Temporarily memoizing the failure makes that case red.
- The host-wide pane list is made before the repo loop and consumed after an earlier iteration can close a tab. The rule therefore requires two repos, the first repo's herdr write between the shared read and the second repo's use, and a second-repo list reflecting the write. A single-repo count with no write cannot observe this. Temporarily sharing the pre-write list makes that case red.

These are judgments against the actual text, as the locked design requires. No new executable prose test or paid planning replay is required.

## Docs and trailers

Read `docs/reference-index.md`, `skills/AREA.md`, `docs/reference/skills.md`, `docs/reference/files.md`, `docs/start/one-change.md` and the relevant planning/check references. The human docs describe planning at a level that remains accurate. Checked the plan's cited stale-doc lesson against `learnings/history/2026-09-11-stale-rule-in-docs.md`; its mechanism warrants checking these unchanged consumer pages, and no stale claim about the changed rule was found. No `AREA.md` is changed.

`Test-Change:` trailers in `a4fc68d3f4ebd5f43f1d99063bd8268e368fb6aa..HEAD`: **none**. The sole changed path does not match `src/test-files.ts`, and no existing assertion, fixture or recording changed. No proof-command correction, skipped test or runner change exists in the diff.

## Verification

Read the implementation logs back with `akrogon log`. The completed receipt `c5fef071-0dbd-405d-81b0-741eaf1e8d7a` records the reviewed head and all configured commands green, with setup exit 0. The planned targeted command ran after the skill edit. No code change, missing proof or specific concern justifies rerunning the completed checks.

| Evidence | Kept result |
| --- | --- |
| Planned `bun test tests/docs-links.test.ts tests/run-units.test.ts --timeout=30000` | `check skill-text: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-skill-text-1793004636893-2674711.log` — 21 pass, 0 fail |
| Configured format | `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-format-1793004640596-2676471.log` |
| Configured test | `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-test-1793004697459-2676471.log` — 1175 pass, 0 fail, 56.80s |
| Configured typecheck | `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-typecheck-1793004699878-2676471.log` |

Inspection evidence, also read back with `akrogon log`:

- `check review-B-inputs: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-review-B-inputs-1793004739809-2986403.log`
- `check review-B-diff-context: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-review-B-diff-context-1793004746681-2986914.log`
- `check review-B-contracts: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-review-B-contracts-1793004783657-2988190.log`
- `check review-B-docs: 0 /home/ivan/Work/infra/akrogon/issues/open/criterion-limits/plan-condition-cases/implementation/check-review-B-docs-1793004807217-2989313.log`

The configured formatter targets `src`, `tests` and `skills/chart-issues/scripts`. The plan's claim that it covers the edited Markdown is inaccurate, but this does not invalidate its green result or either review-judged criterion. The edited paragraph matches the planned text and introduces no formatting concern.
