# Intake: fresh-consultants

## Scope
Consultants B and C start with an empty context at the right boundary, by restarting their panes (operator choice), so peer exchanges stop re-reading finished charts. Sibling: usage-windows (#100), independent.

## Provenance
- GitHub: Tamdoma/akrogon#99
- Operator: 2026-10-17 restart choice (message before this pass)
- Operator: 2026-10-17 autopilot switch-on (2026-10-17T10:07:32Z)

## Source: Tamdoma/akrogon#99
# chart-issues consultants keep one session across every chart in a door pass, so each peer exchange re-reads all earlier charts

Source: Tamdoma/akrogon#99
URL: https://github.com/Tamdoma/akrogon/issues/99

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

In one autopilot door pass over three charts (base-red #98, loop-counts #97, failed-cause #96, 2026-10-17), consultants B (codex) and C (pi) kept one session each for the whole pass. Each exchange re-read everything from earlier charts and forks. Recorded totals: B 7.4M input tokens for 19k output; C 63 calls averaging 84k context, 5.0M cache-read for 43k output. Most of that context was from finished charts the next brief did not need.

The operator chose to start consultants fresh at each door open by sending `/clear` to each consultant pane. A test on 2026-10-17 (`herdr agent prompt <pane> "/clear"`, then one short peer-ask exchange per pane):

- codex (w8:pNQ): context reset to 0%. `/clear` starts a new rollout file with a new session id (01a148d2… → 01a14943…), but `herdr agent list` kept reporting the old id until the next turn had run. The first peer-ask after `/clear` therefore seeded the stale id (outcome line `session 01a148d2…`).
- pi (w8:pPY): context reset to 0.0%. pi appends a `custom` entry and keeps writing the same session file, so the herdr session value does not change.

Both test exchanges returned `outcome done, signal proven` because the return file was written before any grace check.

## Location

skills/chart-issues (SKILL.md seat record, assets/questions.md blind peer exchange), skills/chart-issues/scripts/peer-ask.ts, skills/chart-issues/scripts/peer-wait.ts

## Reproduction

1. Run a chart pass with a codex consultant.
2. Send `/clear` to the codex pane.
3. Run peer-ask on that pane. The exchange carries the pre-clear session id, and `herdr agent list` reports the new id only after that turn.

## Expected behavior

Each door open gives every consultant a fresh context, and the first exchange after the reset binds the consultant's current session id.

## Urgency

Cost and speed: consultant input grows with every chart in a pass. Workaround: send `/clear` by hand, then a one-line exchange so herdr picks up the new codex id before the first real brief.

## Suspected cause

The skill has no step that resets consultant context between charts or doors, so the session grows for the whole pass. For codex after `/clear`, peer-ask.ts:48-76 seeds the exchange from `herdr agent list`, which still holds the old id. peer-wait.ts:142-153 (`checkIdentity`) throws `changed session` for codex when a later grace check sees a different non-null id. The success path (peer-wait.ts:291, return file non-empty) does not read the id, which is why the test passed. A slower first exchange after `/clear` that reaches a grace check would exit with that error.
View: agent, from the operator's choice and a live test.
Files read: skills/chart-issues/scripts/peer-ask.ts, peer-wait.ts (installed release 6f31ca94 copy, same content as the repo path), skills/chart-issues/SKILL.md:37, assets/questions.md:46.
Not inspected: whether herdr can refresh `agent_session` without a turn, and whether a herdr agent restart reports the new id at start.
Related reports: Tamdoma/akrogon#91 (peer-wait false failure for an antigravity peer; a different kind and mechanism). Searched Tamdoma/akrogon, all states, author @me since 2026-10-15 (limit 30), and "peer clear session" (limit 10).

## Source: operator 2026-10-17 restart choice
I would rather you restarted both panes so close them and then restart them in herder simply because I don't want to send these short messages because they are prone to getting buggy over time. let's continue

## Source: operator 2026-10-17 autopilot switch-on
/chart-issues Run autopilot on Tamdoma/akrogon #99 and #100, consultants B (w8:pRX, codex) and C (w8:pRY, pi). Pull first.
Context from the last session (2026-10-17):
- #99: operator chose restarting consultant panes (herdr pane close + split + agent start) over /clear plus warm-up messages. The restart test result is in the #99 comment.
- #100: per-chart usage windows plus pi support.
- Savings check (approximate is fine): add a done-criterion to the #100 leaf. Run the fixed chart-usage.ts on the base-red chart as the baseline (old: long-lived consultants) and on the #99/#100 charts as the new case (fresh consultants). Print, per seat, calls, average context per call, input/cache-read tokens, output and minutes side by side, plus the rough % change in average consultant context per call. Rough baseline from the 2026-10-17 pass: A 141 calls at ~146k average context, B ~7.4M input for ~19k output, C 63 calls at ~84k average. The charts differ in size, so compare per call, not totals. Report the numbers. The check informs and never blocks a merge.
- Deferred 1b: after #100 lands, if A's calls per chart are still high in that output, file a rule for A to batch independent tool calls.

## Agent findings
Opening map shared with the sibling chart: fresh-consultants/slots/map-A.md, map-B.md, map-C.md (blind), merged in fresh-consultants/slots/map-merged.md.
