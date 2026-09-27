# Merged territory map: akrogon cost per completed task

Attribution: (A) this chart seat, (B) slot-b codex, (C) slot-c fable-5-1 medium, (all) = all three.

## Baseline
- The lifecycle does not loop (all). 251 of 255 leaves across 6 repos merged (A). The fix cap is 3 (`src/phase.ts:235-246`), and about 1 leaf per repo ever hit it (A, C). Both akrogon failures were stalled seats in plan phases, not reasoning failures (C).
- Cache: one pi session per seat per leaf (framework log: B 1 session for 166 of 171 leaves) and 95.1% cacheRead share over 91,615 turns (A). The prompt is one short fixed line (`src/next.ts:422`) (all).
- Dollars mislead here. swe-2-max bills $0 and muse cost about $9 in total, so judge by turns, context and wall clock (A). The article's Claude prices do not transfer to the pi models, but its shape does (B, C).
- Turns per pass (A, from pi usage): subagent workers are about 3.6 per leaf × 46 turns at 60k context, the largest turn share. muse B: implement 45 turns at 108k, check.fix 19 turns at 194k context. Worker sub-briefs per closed akrogon leaf: 15 leaves had 1 unit, 12 had 2, and 11 had 3 or more (C).
- Effort eras (A): medium (fable/astra, before 09-12) gave review→fix 0.31 per leaf. max (swe/muse, after) gave 0.42 and 0.40. The models differ, so this is not proof, but max shows no loop reduction.

## Principle map
1. Medium default effort: **violated** (all). `config.yaml` has `effort: max` on both seats for every phase, including merge, and `src/next.ts:220-224` substitutes it at launch. `docs/guide/cheat.md:35` documents `effort: high` (C). Per-seat repo overrides already exist (`src/config.ts:45,56-59`) (B).
2. Subagents only with clear benefit: **violated in the common case** (B, C), and the measured context benefit is unproven (A). `implement: subagents` in all 6 repos requires a sub-brief and a worker even for one unit (`implement-issue/SKILL.md:37`). Workers are sequential, so there is no parallelism (`worker-protocol.md:11`). Returns can be bounced back to the worker without limit (`worker-protocol.md:13-15`) (B). Inline mode already exists with the same test discipline (`SKILL.md:39-45`) (B, C).
3. Chart peer exchange: B is required for the map, a blind answer and a rebuttal per fork, and the final contract review (`chart-issues/SKILL.md:35,47,57`, `questions.md:40-50`) (all). Evidence from `process-review-claude.md` F13: the map rebuttal changed 3 of 10 recommendations and B's leaf review caught real defects, but per-round rebuttals produced one file across 18 charts (C).
4. Prompt audit (article item 5): the four phase skills repeat the grounding, env-file, no-questions and footer paragraphs (C). design.md copies binding decisions verbatim (78 to 92% copied share, `shapes.md:148`), and only plan-issue reads it (C, from prior review F6). The question shape is fixed even for small rounds (`questions.md:27`) (B).
5. Escalation after repeated failure: no model escalation exists (all). Observed failures are delivery stalls, which a stronger model cannot fix (B, C). Worker bounce loops are the only uncapped reasoning retry (B).
6. Compaction: left to the harness. pi auto-compacts at window minus 68k (A). Each phase boundary is a natural break, and chart resume from CHART.md exists (C). No change proposed (all).
7. Early tests: **satisfied** (all). `test_changed` runs as work lands, then the full suite, then checks after rebase. Do not touch it.
8. Measurement: the log has turns neither per leaf nor per phase (`src/log.ts:18-30`) (B). Use harness records ad hoc, not new machinery (all).

## Forks, in the order they will be taken
- F-scope: whole lifecycle or chart door only? (A, C: lifecycle for effort, workers and prose. B: chart first, lifecycle changes approved separately.)
- F-effort: seats `max` → `medium` (A, B) or `high` (C)? One value per seat, set at launch, never per phase (all).
- F-workers: default `implement` to `inline` (C), trial inline in one repo (B), or measure first (A)?
- F-peer: chart B keeps map + final contract review only (C), keeps per-round exchange only for consequential forks (B), or stays as is (A, citing F13)?
- F-escalation: operator stays the escalation, with no machinery (C), a skill rule after two evidenced repeated attempts with an operator-chosen model (B), or no change (A)?
- F-prose: shared seat-rules file (C), design.md links instead of copies (C), shorter question contract (B). Each is a candidate for the prompt audit.

## Off route (all agree)
Per-phase effort tables, a compaction controller, automatic model routing, a single-reviewer mode, cost dashboards, and any change to the fix cap, verdict aggregation or test discipline.
