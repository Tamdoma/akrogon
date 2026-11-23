# Intake: paid-budget

## Scope

Tamdoma/akrogon#152, under the 2026-11-23 signposts session (original in this chart).

## Provenance

- GitHub: Tamdoma/akrogon#152

## Source: Tamdoma/akrogon#152

# Paid test runs need a fixed machine-wide paid_budget ceiling instead of a per-test budget the seat picks and raises itself

Source: Tamdoma/akrogon#152
URL: https://github.com/Tamdoma/akrogon/issues/152

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Operator decision (Ivan Juras, 2026-11-23)

Operator's words: "So, I don't want to get all the way to the end of the subscription limit usage either. I just want the agent to smartly decide what it thinks the current test should have the budget limits for, and then if it fails, then expand it itself. This should be a smart feature, not something that is kept anywhere." Earlier the same day: "But I don't want these artificial caps or whatnot, this should be decided by the agent on a per case basis."

Decided points:

- No stored budget ceiling. Nothing in `~/.akrogon/config.yaml` or any other file holds a standing session or minute cap that paid runs reserve against.
- Per paid test, the seat chooses the budget (sessions, minutes) that it judges fits that test.
- When the run fails because of that budget, the seat raises the budget itself and reruns, with no operator approval.
- The seat's judgment keeps spend well short of the subscription's usage limit. Running until the subscription limit stops it is not acceptable.

## Observation

The ai-budgets chart (2026-11-22) made `paid_budget: {sessions_per_day, session_minutes, approved}` in `~/.akrogon/config.yaml` the only paid-session budget. `akrogon run-check --sessions <n>` refuses when the key is absent, and refuses when the rolling 24-hour total plus n passes `sessions_per_day`. Framework leaf `geo-pages-own-stem` stopped as `failed` on 2026-11-22 for missing reservations (its review-B.md F3), and recovering it needed the operator to write a `paid_budget` stanza (30 sessions per day, 20 minutes) by hand on 2026-11-23. The ceiling was A's pick under full autopilot. The chart's own record says "A's picks under full autopilot … never operator words" (issues/chart/ai-budgets/forks/signposts.md `## Taken`).

## Location

akrogon: `src/config.ts` `globalSchema` `paid_budget`; `src/run-check.ts` `--sessions` reservation (`reserve`, about line 323); `docs/reference/limits.md` "Set the paid-session budget"; `docs/reference/config.md` `paid_budget` row; `skills/lifecycle-rules.md` "Grant reuse and paid sessions"; `issues/chart/ai-budgets/forks/budget-shape.md` `## Taken` items 1, 2, 5, 6, 9.

## Reproduction

1. Remove `paid_budget` from `~/.akrogon/config.yaml`.
2. Run `akrogon run-check --name x --sessions 1 -- true`. It refuses naming `paid_budget` (budget-shape.md Taken item 5, session-ceiling brief criterion 3).
3. A leaf whose live test needs paid sessions stops `failed` until the operator writes the key.

## Expected behavior

Per the operator decision above.

## Urgency

It blocks any leaf with paid live proofs on a host with no `paid_budget` key, and each such leaf needs the operator to recover it. Workaround: the operator writes a `paid_budget` stanza by hand, which is the standing cap the operator does not want.

## Suspected cause

The ai-budgets chart replaced per-leaf operator approvals with one operator-set machine ceiling (signposts S4: "the ceiling is the single operator stop left"). That kept a stored cap and an operator write, where the operator wanted the seat to set and raise the budget for each test. Contributing factor: the chart ran under full autopilot, so the operator never answered the ceiling fork.
Whose view: agent.
Files read: akrogon docs/reference/limits.md, docs/reference/config.md, skills/lifecycle-rules.md, src/run-check.ts (grep), issues/chart/ai-budgets/forks/budget-shape.md, issues/chart/ai-budgets/forks/signposts.md, issues/closed/ai-budgets/session-ceiling/brief.md (development checkout /home/ivan/Work/infra/akrogon).
Not inspected: the budget-rules leaf's live-test guards (`AKROGON_SESSIONS` refusal in tests/e2e/*), and whether any watch surface reads the ledger.
Related reports: Tamdoma/akrogon#75 (closed; a live-session proof plan with no wall-time budget, a different defect). Searched Tamdoma/akrogon, all states: "paid_budget" (none) and "sessions budget ceiling" (limit 10), plus the filing account's reports since 2026-11-21.

## Agent findings

- The ai-budgets chart reads: paid runs reserve against paid_budget (src/run-check.ts reserve). The seed decision removes that stored cap.
