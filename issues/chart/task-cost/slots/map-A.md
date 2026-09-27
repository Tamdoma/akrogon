# Map A: akrogon cost per completed task

## Measured baseline
Source: `~/.pi/agent/sessions/*issues-worktrees*` usage records (254 leaves, 91,615 model turns) and `issues/log.jsonl` in 6 registered repos (255 leaves), read 2026-09-27.

- Success: 251 of 255 leaves merged. Fix rounds are capped at 3 (`src/phase.ts:236`); about 1 leaf per repo ever hit the cap. There is no endless retry loop.
- Cache: cacheRead / (input + cacheRead) = 95.1%. There is one pi session per seat per leaf (framework log: B 1 session for 166 of 171 leaves), so every phase reuses the seat's cache. The article's 96% target is already met.
- Dollars: swe-2-max bills $0 (Devin subscription), and muse is about $9 in total. The real cost is turns, context tokens and wall clock, not dollars.
- Turns per pass (model · phase): swe-2-max plan.synthesis 106 turns at 84k context with 39k output. That is the most expensive seat pass, larger than implement (43). muse (current B since 09-21): synthesis 20, implement 45 at 108k, check.review 16, check.fix 19 at **194k average context**.
- Subagent workers (sessions with no phase prompt): about 705 passes against 196 implements, so roughly 3.6 workers per leaf at 46 turns and 60k context each. That is about 165 worker turns per leaf, the largest single turn share.
- Effort eras (`git log -p config.yaml`): before 09-12 the seats were fable-5-1 and gpt-6-astra at **medium**; after that, swe-2-max or muse at **max**. Review→fix per leaf: 0.31 at medium, then 0.42 and 0.40 at max. Share of leaves with any fix: 33% at medium, 31% and 38% at max. The models differ between eras, so this is not proof, but max shows no loop reduction.

## Principle map
1. Cost per completed task: nothing records it. Usage lives only in harness session files. `akrogon status` and the log carry turns neither per leaf nor per phase. (Violation: we cannot tell whether a change helps.)
2. Fewer retry loops: capped (`phase.ts:236`, `fix_rounds: 3`). merge→check.fix fell from 0.36 to 0.02 per leaf after the "A resolves conflicts" change. The remaining loop is review→fix at 0.4 per leaf. (Mostly satisfied.)
3. Cache reuse: one session per seat per leaf, and the prompt is a fixed one-line string (`next.ts:470`). Skills say "a file already read is not read again". (Satisfied.)
4. Medium default effort: violated. `config.yaml` sets `effort: max` on both seats for every phase, including merge (21 turns, mechanical rebase and checks). Effort is per seat at launch (`next.ts:236-245`) and cannot change per phase without a new session.
5. Compaction: pi auto-compacts at window minus 68k reserve (`~/.pi/agent/settings.json`). B carries plan + implement + fix in one session, so check.fix runs at 194k average context. (Partly violated: context grows across phases with no reset point.)
6. Escalation after repeated failure: `fix_rounds` exhausted → `failed` → operator. No stronger model is tried. `implement-issue/SKILL.md:53` already escalates within the seat, from worker to B, on the final round. (Gap, but rare: about 1 leaf per repo.)
7. Early tests: plan.synthesis writes acceptance criteria before tests (`plan-issue/SKILL.md` plan.synthesis). Workers run `test_changed` as work lands, and B runs the full suite once. (Satisfied.)
8. Subagents only with clear benefit: `implement: subagents` in all 6 repos, with no inline data to compare. Workers run at 60k context against B's 108k, so they may be cheaper per turn despite re-reading. (Unproven either way.)
9. Chart door (this skill): B does a blind map, a blind round per fork and a rebuttal per round, which roughly triples research per fork. The prior review F13 (`process-review-claude.md`) found the map rebuttal changed 3 of 10 recommendations. (Justified by evidence.)

## Material forks
- Q1 scope: the whole lifecycle (seats, effort, escalation, workers) or only the chart door? Recommend the whole lifecycle, because every principle except 9 applies to dispatched seats.
- Q2 default effort: set both seats to `medium` (trial, then measure review→fix) or keep `max`? Recommend medium, because max shows no loop reduction and the article says to start at medium.
- Q3 escalation: keep failed→operator, or have the command relaunch B at a stronger configured seat for the last fix round? Recommend keeping it. It happens about once per repo, and escalation adds a config key, a relaunch path and a cache reset for about 1% of leaves.
- Q4 measurement: add per-leaf turn and token totals to `status` or the log, or keep ad-hoc analysis? Recommend a small read-only script (the watch-issues `observe.ts` precedent) or nothing. Cost is not a lifecycle state.
- Q5 B's context growth: fresh B session at check.fix, or leave it to harness compaction? Recommend leaving it. A fresh session loses cache and re-reads the plan and diff. Fix passes are 19 turns.
- Q6 workers vs inline: flip one repo to `inline` for about 20 leaves and compare turns per leaf, or keep subagents? Recommend the measurement, since the data cannot decide it.

## Pitfalls
- An effort change mid-session can invalidate cache on some providers (article). Set it per seat at launch and keep it for the session. Do not switch per phase.
- The dollar view misleads here because swe-2-max bills $0. Judge by turns, context and wall clock.
- Era comparisons are confounded by model changes, so judge an effort trial on the same models.

## Ranked changes (simplest first)
1. `config.yaml` seats `effort: max` → `medium`, as a one-line change for each seat. Watch review→fix per leaf for about 30 leaves and raise one seat to `high` if loops rise. Expected effect: fewer reasoning tokens per pass with no loop increase (medium era: 0.31).
2. Document the rule once in the guide: medium default, raise effort per seat when loops cost more than reasoning, and never switch effort mid-session.
3. Optional measurement: a scratch script over the pi session usage, not machinery.
4. Keep the fix cap, cache design, early tests and chart peer exchange as they are.
