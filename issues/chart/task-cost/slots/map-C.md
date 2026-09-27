# Map C: cost per completed task, akrogon vs "What a task costs on Opus 5.5"

Peer C, blind. Read: the article, `config.yaml`, `akrogon config`, `src/{next,phase,routing,config,shell,log}.ts`, all `skills/*/SKILL.md` and chart/implement assets, `learnings/LESSONS.md`, `process-review-claude.md` section F, and every row of `issues/log.jsonl` (295 moves, 59 leaves, all repo akrogon).

## Measured baseline (log.jsonl, 2026-09-11 to 2026-09-27)

| Metric | Value |
|---|---|
| Leaves merged | 60 moves to `merged`, 59 distinct slugs |
| Leaves with 0 / 1 / 2 review fix rounds | 52 / 6 / 1 |
| Review fix routings (`check.review -> check.fix`) | 8 |
| Merge fix routings (`merge -> check.fix`) | 11 |
| Initial two-slot verdicts (A,B) | ready/ready 36, nits/ready 12, ready/nits 4, nits/nits 2, any fix 0 on first pass in the counted window |
| Debate leaves (`plan.positions` moves) | 3 of 59 |
| Failures | 2, both stalled seats in plan phases, none from the fix cap |
| Median phase time | implement 8.2 min, check.review 2.2, check.fix 4.6, merge 1.6 |
| Prompt attempts | 243 moves at attempts 1, 4 at attempts 3, 0 retries succeeded past 1 |
| Charts with a peer B slots folder | 19 of 36 |
| Worker sub-briefs per leaf | 1 unit: 15 leaves, 2: 12, 3: 5, 4: 3, 5: 2, 8: 1 |

Reading: the lifecycle does not loop. Retries are rare and short. The cost is in what each pass reads and in how many seats read it.

## 1. Article principles mapped to akrogon

**P1. Effort: medium by default, raise on a stall, "high pays for itself when it saves one retry".**
Violated. `config.yaml:6` and `:10` set `effort: max` on both seats for every phase, and `src/next.ts:222-224` substitutes that one value into every launch. There is no per-phase effort. The log shows 52 of 59 leaves with zero retries and 8 review-fix routings in total, so max effort is bought on every pass to prevent a retry that happens once in seven leaves. `docs/guide/cheat.md:35` already documents `effort: high` as the example, so the shipped default and the documented default disagree.

**P2. Turns, not tokens: each turn resends the full context; cache reads are 5% of input.**
Partly satisfied. `src/next.ts:422` sends one short prompt per pass and every phase skill line 6 says "a file already read in this thread and not edited since is not read again", which keeps the prefix stable within one seat session. Violated at the phase boundary: every phase skill's Shared context re-reads `akrogon config`, the grounding index, linked areas and `learnings/LESSONS.md` (`plan-issue/SKILL.md:14,25`, `implement-issue/SKILL.md:21`, `check-issue/SKILL.md:14`, `merge-issue/SKILL.md:14`). Four phases, up to six seat passes, each opening the same index (`docs/reference-index.md` plus `docs/guide/*`, 2077 lines) into a fresh or diverged context.

**P3. Cache invalidation: model switch, effort change, compaction, long pauses clear the prefix.**
Mostly satisfied by structure: seats keep one harness process per pane (`next.ts:431-455` starts the agent once, later passes prompt the same session). Pitfall: the two seats run different models (`config.yaml:5,9`), so nothing A reads is ever a cache hit for B; that is a design choice (blind review), not a leak. The chart door re-reads 3651 words of skill plus assets after compaction (`chart-issues/SKILL.md:6`), which is correct per the article (compact at a break, then reload once).

**P4. Verification early beats reasoning later.**
Satisfied. `implement-issue/SKILL.md:39-41` runs `test_changed` as work lands and demands red then green; `brief-template.md:37` gives workers only the changed-test command; B runs the full suite once (`worker-protocol.md:21`). `merge-issue/SKILL.md:33` reruns every check after rebase. This is the part of the system that already matches the article and explains the 52/59 zero-retry figure. Do not touch it.

**P5. Subagents multiply tokens; use them for lookups, not for writing code, unless the task-level benefit is clear.**
Violated in the common case. `implement: subagents` (`akrogon config`, default at `src/config.ts:32`) makes B write one eight-section sub-brief per unit (`brief-template.md`, under 1500 words each) and delegate it. 15 of 38 closed leaves have exactly one brief: B wrote a full brief, spawned one worker that re-read the plan and the read-first list, then B re-read the worker's return. That is the plan read three times for one unit of work with no parallelism gained (workers are sequential, `worker-protocol.md:11`). The chart door's peer B is a second full-context agent on 19 of 36 charts; F13 in `process-review-claude.md:59` measured "one rebuttal file across 18 charts" but "changed 3 of 10 recommendations", so its benefit is real at the map but thin per round.

**P6. Two reviewers.**
Kept, with evidence: `process-review-claude.md:9` measured 17 of 23 framework fix routings caught by only one slot. In this window every initial verdict was ready or nits, so the second reviewer did not open a repair once in 59 leaves. The framework figure justifies keeping it; the akrogon figure says its cost is pure insurance here. Not a chart-door question.

**P7. Escalate model only after repeated failure at high effort.**
Not applicable as machinery. Failures reach `failed` after 3 undelivered prompts (`next.ts:388`) or `fix_rounds` cap (`phase.ts:235-238`, cap 3), and the operator restarts by hand. Both observed failures were stalled seats, not reasoning failures. No automatic escalation is warranted; the operator already changes `slots` per repo (`config.ts:45`).

**P8. Prompt audit: remove ritual instructions that cause verbosity and repeated tool calls.**
Violated in prose volume. Skills plus assets total 14170 words. Every phase skill repeats the same four-line grounding block, the same env-file paragraph, the same no-questions paragraph and a printed footer that "is neither saved nor parsed" (`plan-issue/SKILL.md:72`, `check-issue/SKILL.md:64`). Each repeated paragraph is a turn's worth of reread per pass. `design.md` copies binding decisions verbatim into every leaf (`shapes.md:148`), 17 of 38 closed designs carry a "Current interpretation" paragraph, and `process-review-claude.md:36` measured the copied share at 78 to 92%. Only `plan-issue/SKILL.md:14` reads design.md.

**P9. Compaction pays back in about ten turns; compact at natural breaks.**
Satisfied for the lifecycle: a seat's phase boundary is a natural break and skills already say "re-read only after compaction". The chart door is the long-running context; `chart-issues/SKILL.md:6` and `shapes.md:15` (resume from CHART.md) handle it. No change.

## 2. Material forks for the operator

**Q1. Scope: chart door only, or the whole lifecycle?**
Recommend whole lifecycle for effort and skill prose, chart door only for peer-B rules. Reason: the chart door has no `effort` of its own (the operator's own session runs it) and no sub-agents except the named B pane, so the article's biggest lever, effort, only exists in `config.yaml` slots which serve the lifecycle. A chart-only audit would fix the smallest cost centre.

**Q2. Effort: one global value, or per-phase?**
Recommend keep one value per seat and lower it to `high`, not add a per-phase table. `next.ts:220` would need a phase argument and `config.ts:9` a nested schema to do per-phase; the log shows no phase that retries often enough to justify max anywhere. Per the article, raise back to max only after measuring a retry increase in `issues/log.jsonl`.

**Q3. `implement` default: keep `subagents` or move to `inline`?**
Recommend flip the default to `inline` (`config.ts:32`) and keep `subagents` as the opt-in for large leaves. 27 of 38 closed leaves had one or two units; the brief, worker launch and return validation are overhead with no parallelism and the median implement is 8 minutes. Reliability is unchanged: inline still runs `test_changed` per unit and the full suite at the end (`implement-issue/SKILL.md:39,45`).

**Q4. Chart peer B: keep the per-round blind exchange, or map-only?**
Recommend map-only plus the final leaf-writing review, dropping the per-round blind answer and rebuttal (`questions.md:48-50`, `chart-issues/SKILL.md:47`). Evidence: F13 measured the map rebuttal changing 3 of 10 recommendations and B's leaf review catching real defects, while per-round rebuttals produced one file across 18 charts. This halves B's sessions per chart and keeps the two points where B measurably changed the outcome.

**Q5. design.md: keep verbatim copies of binding decisions, or link to fork files?**
Recommend link (`shapes.md:148` copy rule and `standing-design.md:13` carry rule become one line each pointing at `issues/chart/<chart>/forks/` and the installed standing-design path). This is the largest prose reduction per leaf and only plan-issue reads it. Pitfall: a fork edited after handoff would change the contract seen by a later plan; `shapes.md:36` already says a later change is new intake, so the rule exists.

## 3. Practitioner questions and pitfalls

- **Q2 effort drop**: pi passes `--thinking {effort}` (`config.yaml:14`) and the models are not Opus 5.5 (`devin/swe-2-max`, `meta/muse-spark-1.3-contributor`), so the article's dollar figures do not transfer; the shape does. Pitfall: the 2 stalled-seat failures were at attempts 1 in plan phases and are unrelated to effort, so a drop cannot be blamed for them. Measure retries per leaf before and after in the log; the fields already exist (`log.ts:20-24`).
- **Q3 inline default**: `check.fix` on the last allowed round already repairs inline (`worker-protocol.md:27`), so inline is exercised code. Pitfall: the `implement-issue/SKILL.md:37` sentence "when config says inline" stays, only the default flips and one line of `docs/guide/setup.md` changes. A large leaf loses nothing because the operator can set `implement: subagents` per repo.
- **Q4 map-only B**: `chart-issues/SKILL.md:35` keeps A and B mapping independently, `SKILL.md:57` keeps the leaf-writing exchange. Pitfall: `questions.md:40` says "When B is named, both slots research independently" for every round; that sentence goes, otherwise the rule contradicts itself. Cache: B's map session is discarded either way, so no cache effect.
- **Q5 linked design**: `check-issue/SKILL.md:34` judges against "the design's exclusions", so a reviewer opens the fork files instead of design.md; that is one more path per leaf but fewer bytes. Pitfall: leaves handed off before the change keep verbatim copies; do not migrate them.
- **P8 shared prose**: moving the repeated grounding, env-file and no-questions paragraphs into one file read once per session is a real saving only if the harness keeps the session across phases, which it does (`next.ts:431` starts an agent once per pane). Pitfall: after compaction the skills say re-read, so the shared file must be in each skill's reference list, or the rule is lost. Do not extract it into a fourth asset per skill; one repo-level file that every phase skill names on line 6 is enough.
- **P2 grounding index reread**: the index read is cheap when the seat session persists, expensive after compaction. No change proposed; the fix is the same shared-prefix discipline as above.
- **Reliability lock**: none of the changes above touches `phase.ts` guards, `requiredSlots`, the fix cap, verdict aggregation, prompt-attempt limits or the test discipline in implement. Those are where the zero-retry record comes from.

## 4. Ranked changes, simplest first

1. **Lower both seats from `effort: max` to `high`** (`config.yaml:6,10`). Removes nothing, changes two values, aligns with `docs/guide/cheat.md:35`. Expected effect: every pass of every phase thinks less; with 52 of 59 leaves retry-free, the article's "one retry" break-even is not reached, so cost per completed task drops with no measured reliability trade. Revisit from the log after 20 leaves.
2. **Default `implement` to `inline`** (`config.ts:32`, one line in `docs/guide/setup.md`). Removes the sub-brief, worker launch and return validation from the 71% of leaves with one or two units. Expected effect: the plan is read once instead of three times per unit; implement median should fall below 8 minutes; test discipline unchanged.
3. **Chart peer B: map and leaf-writing only** (`chart-issues/SKILL.md:47`, `questions.md:40,48-50`). Removes the per-round blind answer and rebuttal. Expected effect: B sessions per chart drop from one per fork plus two to two; keeps the two exchanges measured to change outcomes.
4. **design.md links instead of copies** (`shapes.md:148`, `standing-design.md:13`). Removes the copy rule, the carry rule and the interpretation paragraph. Expected effect: design.md shrinks by the 78 to 92% copied share on every future leaf, read by plan-issue and check-issue on every pass.
5. **One shared seat-rules file** replacing the four repeated paragraphs (grounding block, env-file rule, no-questions rule, footer disclaimer) in `plan-issue`, `implement-issue`, `check-issue`, `merge-issue`. Removes roughly 600 duplicated words per phase read. Expected effect: smaller per-pass reread after compaction and one place to edit; this is the article's prompt-audit item and the least measurable of the five, so it ranks last.

Not proposed: automatic model escalation, per-phase effort tables, a compaction hook, or a single-reviewer mode. Each adds machinery to `next.ts` or `phase.ts` without a measured failure it would remove.
