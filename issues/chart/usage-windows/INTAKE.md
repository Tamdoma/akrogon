# Intake: usage-windows

## Scope
chart-usage.ts measures each chart's own work and reads pi seats, and the #100 leaf reports an approximate per-call savings comparison of base-red against this pass's charts. Sibling: fresh-consultants (#99), independent.

## Provenance
- GitHub: Tamdoma/akrogon#100
- Operator: 2026-10-17 restart choice (message before this pass)
- Operator: 2026-10-17 autopilot switch-on (2026-10-17T10:07:32Z)

## Source: Tamdoma/akrogon#100
# chart-usage.ts counts the same window for every chart in one door pass and reports pi seats as unmeasured

Source: Tamdoma/akrogon#100
URL: https://github.com/Tamdoma/akrogon/issues/100

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

One autopilot door pass charted three issues (base-red, loop-counts, failed-cause) on 2026-10-17. All three `seats.yaml` files record `opened: '2026-10-17T08:17:04Z'`, and each seat lists the same session for all three charts. So `chart-usage.ts` measures the same shared window for each chart. The three USAGE figures overlap and cannot be added up or compared per chart.

Seat C ran on pi. base-red's USAGE.md reads `C=unmeasured output`, so the one seat that ran on a different harness had no measured cost at all.

## Location

skills/chart-issues/scripts/chart-usage.ts; skills/chart-issues/SKILL.md:37 (seat record open time)

## Reproduction

1. Open a door on two or more charts with the same consultant sessions.
2. Run `bun skills/chart-issues/scripts/chart-usage.ts <chart>` for each chart.
3. Each output starts its window at the shared open time and counts every turn of the pass since then.

Add a pi consultant and its seat prints unmeasured.

## Expected behavior

Each chart's usage covers only the work done for that chart, and every harness that can be a seat (claude, codex, pi) is measured.

## Urgency

Cost tuning has no reliable per-chart sensor: the overlapping windows hide which chart or fork drove the cost, and pi cost is invisible. Workaround: read the transcripts by hand.

## Suspected cause

SKILL.md:37 sets one open time per chart, "the time the door began its first pass on this chart". In a multi-chart pass the door recorded the pass start for every chart instead. chart-usage.ts:347-361 counts from that open time up to `<until>` (default now), so later charts include earlier charts' turns. `locate` at chart-usage.ts:103-117 handles only `claude` and `codex` and returns `unknown harness` for anything else, so pi seats are never read. pi sessions are single JSONL files under `~/.pi/agent/sessions/<cwd-slug>/`, and `/clear` appends a `custom` entry to that file without starting a new one.
View: agent.
Files read: skills/chart-issues/scripts/chart-usage.ts, skills/chart-issues/SKILL.md:37, issues/chart/{base-red,loop-counts,failed-cause}/seats.yaml, issues/chart/base-red/USAGE.md.
Not inspected: whether the door or the script should own the per-chart window boundary, and pi's per-message usage fields.
Related reports: none found. Searched Tamdoma/akrogon, all states, author @me since 2026-10-15 (limit 30), and "chart-usage" (limit 10).

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
