# Intake: base-red

## Scope
When main turns red with no commit (clock, environment), one detection and one repair owner instead of every leaf rediscovering it and stopping `failed`, and stopped leaves resume without a manual `akrogon phase` per leaf. Sibling seeds #96 (failed-cause) and #97 (loop-counts) are separate charts; #96 waits on this chart's failure policy.

## Provenance
- GitHub: Tamdoma/akrogon#98
- Operator: 2026-10-17 chart-issues invocation
- Operator: 2026-10-17 autopilot switch-on (2026-10-17T08:36:16Z)

## Source: Tamdoma/akrogon#98
# Base turns red without a commit and every leaf rediscovers it: seat skills assume main stays green because each commit once passed verify

Source: Tamdoma/akrogon#98
URL: https://github.com/Tamdoma/akrogon/issues/98

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

On 2026-10-17 `tests/timing-report.test.ts:534` went red on main (`f7baddc`, then `23bce8b`) with no commit touching it. The test bounded a backlog age computed from fixed fixture dates (2026-10-11) against the real clock (`src/timing-report.ts:464`, `Date.now()`), and the 3..5 day bound expired on 2026-10-17.

Three leaves stopped on it within about 15 minutes, each after its own full `verify`:
- `any-consultants` `blocked@implement` (`issues/log.jsonl:1032`)
- `autopilot-mode` `blocked@implement` (`issues/log.jsonl:1033`)
- `checkout` (chart `status-age`) merge-scope verify red on the same unit (`issues/verify-runs.jsonl`, last record)

None could repair it, since `tests/timing-report.test.ts` is outside each leaf's owned diff (`issues/open/autopilot/any-consultants/implementation/report.md:31`). The operator fixed it by hand in `0dfae20` and moved both leaves back with `akrogon phase`.

The same pattern is in `issues/log.jsonl` 3 times in 10 days: 2026-10-08 (3 leaves, harness-template test, L581, L590, L591), 2026-10-10 (merge-clean-worktree twice, L675, L685), 2026-10-17 (above).

## Location

Seat skills and `akrogon verify` receipt reuse:
- `skills/implement-issue/SKILL.md:40` and `skills/check-issue/SKILL.md:69`: "Every commit on the default branch passed `akrogon verify`, so a red with no cause in the diff is never handed off as a base defect"
- `skills/merge-issue/SKILL.md:77`: a persistent red goes to `check.fix` for the leaf
- `src/verify.ts:63-76` (`greenRun`): reuses any historical green run for the same tree

## Reproduction

1. Land a test whose expected value depends on the current date or environment.
2. Let time pass, or change the environment, until it fails on main with no commit.
3. Run any leaf to implement end or check.review.

Each leaf runs the full suite, finds the red, and stops `failed`. Seen 3 times between 2026-10-08 and 2026-10-17.

## Expected behavior

Not provided by the reporter. The earlier report #76 expected one signal that main is red, leaves not failing one by one, and resume without manual `phase` moves.

## Urgency

High under parallel load. Each incident costs one full verify per affected leaf (the suite is 993 tests, about 134 s locally and much more under seat load), a `failed` stop, and an operator diagnosis plus a manual fix and a manual move per leaf. The workaround is that the operator fixes main by hand and runs `akrogon phase <slug> <phase>` for each leaf.

## Suspected cause

Agent view, supported by the inspected files. Base health is a stock that decays without commits: through the clock (this incident), the environment (#76: root `node_modules`), and direct operator commits to main (`23bce8b` "add issues", `f7baddc`). The skills' sensor for base health is a past verify receipt for some commit, not an observation of main now. A balancing loop with the wrong sensor therefore cannot detect decay, and each leaf rediscovers it independently, with no shared record and no repair owner.

Contributing:
- The known-red comparison flow that #76 led to (`issues/closed/red-base-wait/known-red-leaf/brief.md`: `--compare` records, `akrogon base-run`, a shared red record, one operator notice, never `failed` on a base red) was replaced on 2026-10-14 by `ac50164` "Run akrogon verify in the seat skills in place of compare and base-run". `src/compare.ts`, `src/red-record.ts` and `src/base-run.ts` no longer exist. That restored the per-leaf failure #76 reported.
- No clock seam: `src/timing-report.ts` reads `Date.now()` directly, and `tests/` has 96 real-clock uses across 16 files with no injected `now`. Red-first proof (`skills/plan-issue/SKILL.md:69`) shows a test is sensitive to the change, not that it is stable over time.
- The local `bun test` (`package.json:6`, default 5 s timeout) and the gate (`issues/config.yaml:9`, `--timeout=30000`) measure different contracts: 14 tests in `tests/peer-wait.test.ts` and `tests/next.test.ts` fail locally on main and pass in the gate. `learnings/LESSONS.md:22` says bunfig has no timeout key in bun 1.4.2.
- The whole suite runs in every leaf's checks (`issues/config.yaml:7`, `skills/implement-issue/SKILL.md:67`), so one shared red is paid for once per leaf.

Whose view: agent, with an independent consultant review (codex slot B) that reached the same root, "historical receipt treated as current base health".

Files read: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/plan-issue/SKILL.md` (cited lines), `src/verify.ts`, `src/run-check.ts`, `src/phase.ts:260-293`, `src/timing-report.ts:455-530`, `tests/timing-report.test.ts`, `issues/config.yaml`, `package.json`, `bunfig.toml`, `learnings/LESSONS.md`, `issues/log.jsonl` (filtered), `issues/closed/red-base-wait/known-red-leaf/brief.md`, `git show --stat ac50164`.

Not inspected: why `ac50164` dropped the comparison flow (the commit body is empty) and whether that was a deliberate operator decision. Whether direct operator commits to main skip `akrogon verify`. Full `src/next.ts`, `src/admission.ts`, `src/guard.ts` (grep only, no base-health gate found). Would disprove: a base-health check that runs before dispatch and was bypassed today.

Related reports, from a search of Tamdoma/akrogon in all states ("base red verify", "base defect", own reports since 2026-10-15, limit 10-30):
- #76 (closed): red main fails leaves one by one. Same symptom. Its fix was later replaced, so this is a regression with a new trigger (the clock).
- #67 (closed): red main stalls the merge queue. The merge-turn counterpart.
- #50 (closed): seats cannot tell new failures from base failures.
- #53 (closed): concurrent load times out the whole-repo checks. Related to the timeout contract.

## Source: operator 2026-10-17
I've pulled the new issues in. Please let's chart them out. You can only use slot B which is active in the pane next to you.

## Source: operator 2026-10-17 autopilot switch-on
run autopilot on base-red (#98), loop-counts (#97) and failed-cause (#96), consultants B and C (active in this pane)

## Agent findings
See slots/map-merged.md (A,B with rebuttal corrections). Key points:
- The 10-17 clock red is already fixed on main in 0dfae20; no leaf repeats it.
- dc2e2b0 (2026-10-14) deliberately deleted the compare, red-record and base-run machinery (3242 lines) and added receipt gates.
- `akrogon verify` reuses any green receipt with the same tree and commands, with no age or environment key (src/verify.ts:63-76, :119), so re-verifying main returns the old green.
- No test-health gate before dispatch; `checkBase` checks Git refs only (src/preflight.ts:62).
- The seed's claim that operator direct commits cause decay is not shown (23bce8b touched only issues/).
