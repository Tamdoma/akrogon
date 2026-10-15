# Merged map: system flow (A merges A, B, D, E)

Tags name the seats whose own file says the line. Door checks marked "checked" were run by A on 2026-10-15.

## Agreed picture

1. The leaf factory got much faster. Clean after-fix cohort: 18 framework leaves started after 10-14 15:50Z, first lifecycle event to merged median 1.86 h (p90 4.55 h) vs W0 5.77 h (n=101). (E; A recomputed: E's W0 4.81 uses another start point, A's 5.77 uses the same one as the 1.86.)
2. W1 was a drain, not a rate: 31 merged, 0 framework handoffs, 0 open leaves now, 57 seeds waiting. (A,B,D,E)
3. Binding constraint now: supply of charted, approved work (the chart door). Every leaf-side gain since yesterday improves a step that is now idle. (A,B,D,E)
4. Next constraint once supply resumes: the rework loop (24/31 W1 leaves repaired, 2.2 reviews per leaf). (A,B,D,E) Then real prerequisite chains. (A,B,D)
5. Traps: wrong goal (merged/day instead of seed-to-merged) (A,B,D,E); shifting the burden to the operator/door (A,B,D,E); rule growth from incidents (A,D,E); judging fixes before their cohort exists (A,B).

## Data corrections

- C1. W1 dwell includes pre-W1 history. Clipped to the window: check.fix 37.0 h (not 60.9), implement 33.8 h (not 100.7). (B,E)
- C2. The 15 `prerequisite` waits share one timestamp, 10-13 12:12:30, right after `repo_pause off`. The 299-316 h is time from that moment to next touch (median 18 h, max 35 h), a snapshot, not 15 recorded waits. (D) A's "64% of lead time" share is withdrawn; the chain waits are real but measured once.
- C3. W1 is mostly not "after the fixes". G1/G2 landed 14 min before the cutoff; stacked-turn is still open. (B) The 18-leaf after-split cohort is the only clean sample. (E)
- C4. `scope=merge` timing rows are empty by construction; merge verify is in verify-runs.jsonl (25 framework runs, 7 red, median 5.65 min). (B,D,E)
- C5. 10-14 08:52Z to 14:58Z: four leaves logged `check_start` with no `check_end` and sat idle about 6 h (29.7 leaf-hours). (E) 57 check_start without check_end overall; exit codes 143/137/127 on 4 runs. (D) Cause not established.
- C6. Akrogon direct landings are not in log.jsonl; akrogon W1 throughput is undercounted. (A,B,D)

## Rework: what the findings are (two independent classifications)

- Haiku over 31 W1 leaves, 102 change-requesting findings: real defect 46 (45%), missing test or proof 24 (24%), evidence format or bookkeeping 15 (15%), design gap 6, docs 5, environment 2, scope 1, other 3. 22 findings appeared only at merge. 5 real defects were introduced by repairs. In 6 leaves A said ready and B said fix. About 42 items low confidence.
- D over the same leaves, 101 Fix findings: product defect 33, test/proof machinery 25, merge red 19 (several from main moving under a long leaf), criterion missed or misread 15, style/report rules 9. (D)
- Reading: about half the rework is real product defects that review should catch. About 15-25% is bookkeeping or proof format. Rework hours concentrate: three leaves hold 49% (technical-pack-selection, flaky-test-fixes, page-speed-ranking). (D)

## Candidate interventions (merged)

- M1. Feed the constraint (level 5, rules of the door; no code). (A,B,D) The door works the seed stock continuously: delivered or duplicate seeds get closed; settled charts are handed off now (B names `shared-contracts` as a candidate: forks taken, no fog); open forks across charts go to the operator in one batched round. (A) Peer consult rounds only for a fork the door's own research leaves open. (D) Estimate: settled seeds go from about 5-8 days waiting to 1-2 days. Quality: handoff audit, probes and review unchanged.
- M2. One seed-to-main view in the existing timing report (level 6; one derived table, no new state). (A,B,D) Seed age, chart wait, handoff to merged, review loops per leaf, blocked leaves with their prerequisite. Gain 0 h directly; it keeps the next change aimed at the real constraint. (B,D)
- M3. Fix the live-repair owner contradiction in `skills/check-issue/SKILL.md:79` (level 5; one clause, rule count unchanged). (B) Checked: the paragraph says a defect whose repair needs a planned live replay "stays with B", then ends "a proven product defect whose repair needs a live rerun is still handed to A". Estimate 0.2 h per affected leaf; backlink-audit-spine's 6.9 h fix visit went through this path. (B)
- M4. Let B make mechanical golden and debt-list syncs that the leaf's own schema change forces (level 5; tighten an existing clause). (E) Example: prior-disavow-lookup `legacy-golden/manifest.json`, prior-pack-diff `KNOWN_OBJECT_INPUT_DEFECTS`, each a ~45 min bounce to A. Risk: blurs "any correction of a test expectation" stays with A.
- M5. Framework cheap verify: move the domain suites out of `framework:verify:cheap` (`test:sb-offer-forms`, `test:backlink-*`) into `rest-b`, and run the fast static checks (`skills:scan`, `sections:scan`, handoff-schema) there instead, so they fail at the leaf, not at merge. (E) Checked: `framework/package.json:168` holds those suites. Estimate 0.2 h per leaf. (E)
- M6. Delete dead structure (level 10, remove code). (D) `red-records.jsonl` (no writer or reader since dc2e2b0), `scope: base` (no producer). Attempt outcomes held/reuse/ejected/split have no writer since 6640ab5, but stacked-turn may revive some, so they wait for that leaf.
- M7. Dependency chains. Disagreement:
  - (A) Charting keeps a chain of single-consumer stages in one leaf (reverses the default of `shapes.md:289` for parts only one leaf consumes).
  - (D) Measure only; a chain wait is the prerequisite's own lead time, which M3-M5 shorten.
  - (B) Keep real dependencies; do not mechanize.
  - (E) The opposite gap: 5 W1 `failed` visits were siblings consuming an unmerged sibling's output without a `blocked-by` edge; require the edge.

## Dropped after door checks

- E I4 (collapse `plan.solo` into implement): there is no `plan.solo` phase. Checked: `src/routing.ts:28-30`, framework log.jsonl and timings.jsonl have 0 `plan.solo` rows; a debate-no leaf starts at `plan.synthesis`.
- E I1(a) (narrow vs full replay contradiction): the "narrowed paths or skipped stages" text is not in current skills (grep 0 hits); `skills/implement-issue/SKILL.md:80` now defines the narrowest reproducing command. The W1 rejections it cites ran under older text.
- E I1(b) (A's full verify in check.fix not reused at merge): real only when the reproducing command is the whole command and main did not move; small and rare. Held as fog.
- D's unbounded fix loop: the operator ruled out caps; folded into M2 as a printed loop count.
- E timing-report attribution bug: a sensor fix, folded into M2.

## Practitioner research (door, Haiku research pass, read 2026-10-15)

- Goldratt: a non-constraint hour saved is a mirage; subordinate other steps to the constraint (secondary sources; low confidence on exact quote).
- David J. Anderson, Upstream Kanban: the intake stage's job is the commit decision (djaa.com).
- Spotify Honk part 3 (2025-12-09) and Stripe Minions (2026-02-09): deterministic checks before review; Stripe caps CI rounds at two for cost (a cap the operator ruled out).
- Anthropic harness design (2026-03-24): a separate judging agent is a strong lever; Anthropic infra-noise (2026-02-05): resource config moves results, so wall-clock gates are fragile on shared hosts.
- Stacked diffs (Pragmatic Engineer 2023, Graphite): dependents can start before the prerequisite merges; cost is rework when the base changes. No measured rework data found.
