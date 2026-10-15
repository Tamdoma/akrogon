# Map A: whole-system flow (written blind, before reading B, D, E)

Scope: GitHub issue filed → seed → chart → leaf handoff → plan → implement → review/repair/fix loop → merge → issue closed. Framework is the volume; akrogon is the factory itself.

## 1. What the system does over time (behavior)

- Framework GitHub issues filed per day 10-06..10-14: 13, 10, 9, 5, 18, 0, 7, 11, 11 (about 10/day). Source: `gh issue list -R Tamdoma/tamdoma-framework --state all`, read 2026-10-15.
- Issues closed: W0 72 in 7 days (median 2.8 days old at close). W1 8 (median 4.4 days old). Open now 57, median age 4.9 days, p90 9.0 days.
- Leaves merged: W0 101 framework (14.4/day), W1 31 (31/day). Handoffs (leaf inflow): W0 80, W1 0. Open framework leaves now: 0.
- So the factory doubled its drain rate and emptied itself. The open-issue stock is growing (inflow about 10/day, close outflow 8 in W1). POSIWID: the system now reliably turns charted work into merges in under a day; it does not turn reports into charted work at the rate they arrive.

## 2. Stocks, inflows, outflows

| Stock | Now | Inflow | Outflow |
|---|---|---|---|
| Open seeds (GitHub issues not charted) | 57, median age 4.9 d | ~10/day filed | charting; W1 framework charts ended: 1 (10-15), W0 about 2/day |
| Charts not ended (framework) | 16 | door opens | handoff/close; attended by operator |
| Leaves waiting on a prerequisite | 0 now; W1 peak ~15 | handoff of chained charts | prerequisite merge |
| Leaves in flight | 0 framework, 1 akrogon | dispatch | merge |
| Rework (findings to repair) | 77% of W1 leaves, 2.2 reviews/leaf | review | repair/fix |

## 3. Loops

- B1 leaf quality loop. Goal: leaf meets brief. Sensor: B review + leaf checks. Correction: repair/fix. Sensor sees the real goal mostly; part of its gap is bookkeeping (see rework split, pending Haiku classification).
- B2 merge gate. Goal: main green. Sensor: full verify at merge. Correction: back to fix. W1 red merges 15 across 9 leaves; merge dwell is now small (21 min median).
- B3 door tuning loop (me + operator). Goal: faster factory. Sensor: timing logs read after 1 to 3 leaves. Correction: rule/skill edits. Delay: a rule change shows its effect only after a full leaf cycle (3 to 15 h) and many leaves; we changed rules several times a day. Manual module 06: correcting faster than feedback arrives causes oscillation.
- R1 learning loop (lessons, skill rules from incidents). Compounds quality, but each incident adds text; skill length grows (adherence cost, research in handoff-gaps chart).
- R2 chain amplification: the chart rule "propose the consumed part as a prerequisite leaf" (`skills/chart-issues/assets/shapes.md:289`, added 646fa45 2026-10-01) makes more, smaller prerequisite leaves; each link costs a full leaf cycle of serial wait.

## 4. Delays (W1, framework, 29 leaves with full timing)

Lead time from first plan visit to merged, split (sum over leaves, from `issues/timings.jsonl` + `issues/log.jsonl`):

| Part | Hours | Share | Mean per leaf |
|---|---|---|---|
| Waiting for a prerequisite to merge | 299 | 64% | 10.3 h |
| Implement | 57 | 12% | 2.0 h |
| Rework (review + repair + fix) | 57 | 12% | 2.0 h |
| Plan | 26 | 6% | 0.9 h |
| Merge | 9 | 2% | 0.3 h |
| Failed / stopped | 5 | 1% | 0.2 h |

Chain example: pass-two-review-notes → backlink-audit-spine → promotion-script → prior-pack-diff → competitor-brand-names (35 h wait). Before the leaf even exists: issue age at charting is days (median open age 4.9 d).

## 5. Binding constraint and what binds next

1. Now: intake. Charting turns about 2 framework charts a day into leaves when the operator is present, 0 to 1 otherwise; issues arrive at about 10/day. Seed-to-closed lead time is days; the leaf part is hours. Every leaf-side speedup since yesterday improved a non-constraint (Goldratt: an hour saved at a non-bottleneck is a mirage).
2. Inside a charted batch: dependency chains (64% of leaf lead time).
3. Next after that: rework loop (2.2 reviews per leaf), then implement time (model speed, fixed by operator choice).

## 6. Traps active or likely

- Seeking the wrong goal: we steer on merge time and leaf time; the operator's goal is issues delivered. Merge time fell 72 → 21 min while open issues grew.
- Shifting the burden to the intervenor: the door hand-drives akrogon leaves (no watcher), recovers stalls, lands akrogon work direct. The factory's own recovery for those paths does not grow.
- Fixes that fail: each incident adds a rule to a skill; rule text grows and adherence falls; failures recur in a new form (e.g. timing-cap criteria still failing under load in W1: "test:playback-probe is 44.1s vs 25s cap", "Arrange an idle host window (1-minute load below 4; current 31.40)").
- Limits to growth: max_active 24 and host CPU (load 31 on 32 cores in W1) cap parallel chains if inflow returns.

## 7. Interventions by leverage

I1 (goal, level 3). Make seed-to-closed lead time and open-seed stock the factory's headline measure, shown by `akrogon status`/timing report next to leaf times. Gain: none directly; it stops optimizing non-constraints. Risk: Goodhart (closing issues without delivering); guard: close only via the existing `akrogon close --by <leaf commit>`. Complexity: one report line from existing data (seeds mirror + gh closedAt), no rule.

I2 (information flow + rules, levels 6/5). Exploit and elevate the intake constraint. A seed triage pass the door runs unattended over all open seeds: (a) delivered or duplicate → offer close; (b) no open fork and no fog → draft chart and go straight to the handoff review (rule exists for direct single items, SKILL.md "A direct single item whose map finds no open fork"); (c) forks → one batched operator round across charts rather than one chart at a time. Operator time goes only to real decisions. Estimate: if half the seeds are (a) or (b), intake doubles; seed age falls from ~5 days toward 1 to 2. Risk: weaker charts; guard: unchanged handoff audit and B leaf review. Complexity: no new code; a door procedure change in chart-issues (replaces part of the one-chart-at-a-time drain text).

I3 (structure, level 10). Shorten chains. Dependents start when the prerequisite reaches merge-ready, based on its reviewed branch, and merge in order through the stacked merge turn already being built (stacked-turn). Saves per link the merge wait only (~0.3 h now) unless started at implement-done (~2.3 h per link, more restack risk). Alternative with no code: charting keeps a chain of small consecutive stages in one leaf unless another leaf also consumes the middle part (reverses the default of shapes.md:289 for single-consumer parts). Estimate for the 5-link backlink chain: 35 h → ~10 to 15 h. Risk: bigger leaves have more rework; guard: same review. Complexity: rule edit only (the no-code variant).

I4 (rules, level 5). Rework: remove gap categories that are bookkeeping rather than behavior, and give A the reviewer's checklist at implement time (pending Haiku classification of W1 findings before I rank this).

I5 (balancing loop with delay, level 9). Door changes to factory rules at most once per measured cycle: decide on rule edits only after N leaves have run under the last change, using this data pack as the sensor. Avoids oscillation from same-day stacked edits.

## Could not explain

- W1 framework had 19 failed visits across 15 leaves (half the leaves), but only 5 h total; reasons include gh auth expiry, idle-host windows and timing caps. Check whether these are one bad night or a standing class.
- Akrogon direct landings are not in log.jsonl, so akrogon W1 throughput is undercounted.
