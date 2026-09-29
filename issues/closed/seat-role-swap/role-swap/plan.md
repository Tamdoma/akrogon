# Plan: role-swap

Direct synthesis. `debate: no`, no positions or rebuttals. Design wins over brief on conflict; none found.

## Decisions

- D1: `src/routing.ts` swaps job slots only. `plan.synthesis`, `implement`, `check.fix` become `['A']`. `merge` becomes `['B']`. `requiredSlots('check.review', n)` returns `['B']` for `n > 0`, else `['A','B']`. `plan.positions`, `plan.rebuttal`, initial `check.review` stay `['A','B']`. `Slot` enum, state schema keys, `next` arrays unchanged.
- D2: `src/next.ts` changes one gate only. Merged-tab close checks `hookPane === state.pane.B` instead of `pane.A`. Pane allocation order, recovery split-right, `closeMergedTab` and cleanup unchanged. Concrete line is the `rediscovered.state.pane.A` comparison in the hook path.
- D3: `config.yaml` swaps six values only: `slots.a` to pi / meta/muse-spark-1.3-contributor / max, `slots.b` to codex / gpt-6.1-sol / high. No key reorder, no whitespace churn. `git diff <base> -- config.yaml` shows six lines.
- D4: Skill wording is a job swap, not a rewrite. Every statement assigning synthesis, implement, check.fix to B moves to A; merge, post-repair re-check, broadcast-after-merge to B. Paired phases, blind review, env-file invariant, footer shape stay. `broadcast-issue` keeps "merge slot" wording. `chart-issues` and `watch-issues/scripts/observe.ts` untouched.
- D5: Sweep regex in criterion 8 is necessary but not sufficient. It misses prose such as "B runs", "B follows", "authorship with B", "plan.synthesis B" in tables. Implement reads every owned skill and guide page fully and fixes all job prose, then runs the regex as the final gate.
- D6: Tests update in place plus targeted new cases. Existing `next` and `phase` fixtures keep working by swapping expected slot, pane, attempts, and model (`strong-a` vs `strong-b`). New cases prove first-pane delivery, wrong-slot refusals, and pane.A-idle non-close. No vanity wording tests.
- D7: No conversion code, no lazy panes, no herdr/gh call-shape change. Existing `state.yaml` files are left as is; operator keeps other leaves idle until this lands per design cutover. No `.env` credential exists for this leaf.
- D8: Doc scope is fixed. Agent docs: plan-issue, implement-issue (SKILL, brief-template, worker-protocol), check-issue, merge-issue, watch-issues SKILL, skills/AREA.md. Human docs: guide idea, phases, merge, cheat, install, parts if affected, README if affected. `src/AREA.md` currently states no seat jobs, so no change expected; verify and report.

## Read-first

- `docs/reference-index.md`
- `src/AREA.md`, `skills/AREA.md`, `tests/AREA.md`
- `src/routing.ts`, `src/next.ts` (allocate plus merged-tab hook gate), `src/phase.ts` (slot guard in `transition`), `src/config.ts` (`seats`)
- `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts`, `tests/phase.test.ts`
- `config.yaml`
- Owned skills and guide pages listed in D8
- `learnings/LESSONS.md` (history only on cited evidence)

## Needed interfaces

- `routing: Record<Phase, { skill, slots, next }>` in `src/routing.ts`.
- `requiredSlots(phase, rounds): readonly Slot[]`.
- `transition()` slot rule: `explicitSlot ?? single-required`, refuse when missing or not in required, refuse `done` repeat.
- `next` prompt string: `` `${routing[phase].skill} ${slug} slot=${slot} phase=${phase} leaf=${path}` ``, one attempt per pass.
- `allocate()`: first tab pane becomes A, split-right becomes B; stored in `state.pane`.
- Merged close: hook with `HERDR_PANE_ID` equal to merge-seat pane plus merged phase closes tab.
- Fake-herdr `Database { panes, tabs, prompts: {pane, text}[], starts: string[][] }`; `starts` carries model flag for seat proof.
- `seats(global, repo)`: global `slots.a/b` unless repo `issues/config.yaml` overrides.

## Acceptance criteria

Derived from brief done-criteria, clarified where fuzzy.

- C1: Routing table matches D1 exactly.
- C2: Close gate uses `pane.B`; allocation order unchanged; A is first pane, B right split.
- C3: Fake-herdr test: fresh `debate: no` leaf at `plan.synthesis` gets one prompt `plan-issue <slug> slot=A phase=plan.synthesis leaf=<folder>` on the tab-first pane (`prompts[0].pane == panes[0].pane_id == state.pane.A`, start args contain `strong-a`); merge prompt goes to B pane with `slot=B`; post-repair `check.review` (`fix_rounds > 0`) prompts B only.
- C4: Wrong-slot refusals: `phase` with `--slot B` fails for plan.synthesis, implement, check.fix; `--slot A` fails for merge and for check.review when `fix_rounds > 0`; merged tab stays open when only `pane.A` idles. Each refusal leaves state and log unchanged.
- C5: `config.yaml` holds D3 values; diff shows six value lines only.
- C6: Owned skills state new jobs per D4, including footers and `review-B.md` evidence paths.
- C7: Guide pages idea, phases, merge, cheat, install match new jobs; parts and README listed as changed or verified-unchanged; install no longer contradicts live seat values.
- C8: Sweep command from brief criterion 8 returns no old-job hit outside `skills/chart-issues/` and chart-door section of `docs/guide/chart.md`; report pastes output with one-line reason per remaining hit.
- C9: Scratch `AKROGON_HOME` transcript runs plan.synthesis `--slot A` to merged with one refused wrong-slot call, saved as artifact.
- C10: `bun run format`, `bun run typecheck`, `bun test` pass.

Fuzzy terms resolved: "main worker" means synthesis plus implement plus check.fix seat. "Merge seat" means B after swap. "No longer contradicts" means install states the live harness/model/effort per seat or states seats are roles without naming stale values. "Old jobs" means any prose assigning synthesis/implement/check.fix to B or merge/post-repair review to A.

Concrete scenario: fresh leaf `demo`, `debate: no`, phase `plan.synthesis`. `akrogon next demo` creates tab, A first pane, B split right, one prompt to A. `phase demo implement --slot A`, `phase demo check.review --slot A --verdict fix` plus `--slot B --verdict fix` to `check.fix`, `phase demo check.fix --slot B` refused, `--slot A` moves, re-review only B, `phase demo merge --slot A` refused, `--slot B` moves, `phase demo merged --slot B`, tab closes on B idle, stays open on A idle alone.

Live surface checked: current `routing.ts` has synthesis/implement/check.fix on B, merge on A, re-review on A; `next.ts` gates on `pane.A`; `config.yaml` has a=codex/gpt-6.1-sol/high, b=pi/muse-spark/max; fixture `tests/helpers.ts` uses `strong-a`/`strong-b` fakes; `skills/AREA.md` line "B runs the final full suite" and `watch-issues` seat table are outside the sweep regex and must still change.

## Ordered checklist

1. `src/routing.ts` per D1. Covers C1.
2. `src/next.ts` close gate per D2, nothing else. Covers C2.
3. `config.yaml` six values per D3. Covers C5.
4. `skills/plan-issue/SKILL.md`: synthesis as A, `--slot A`, footer routes. Covers C6.
5. `skills/implement-issue/SKILL.md`: worker seat A, standalone as A, `--slot A` handoffs, `review-B.md` repair start. Covers C6.
6. `skills/implement-issue/brief-template.md`: "when A writes", wave records used by A. Covers C6.
7. `skills/implement-issue/worker-protocol.md`: A delegates, cherry-picks, runs full suite, self-repairs. Covers C6.
8. `skills/check-issue/SKILL.md`: description re-check as B, B reads `positions-B.md`/`rebuttal-B.md`, append to `review-B.md`, authorship with A, footer routes to implement A and merge B. Covers C6.
9. `skills/merge-issue/SKILL.md`: `slot=B`, B merges, evidence in `review-B.md`, repair to `implement-issue slot=A`, `merged --slot B`. Covers C6.
10. `skills/watch-issues/SKILL.md` required-seat table: synthesis A, implement A, check.fix A, merge B, re-review B. Covers C6.
11. `skills/AREA.md`: worker/full-suite seat A. Covers C6.
12. `docs/guide/idea.md`: seat-job prose plus pass table. Covers C7.
13. `docs/guide/phases.md`: phase table, example `--slot` commands, synthesis/implement/check prose. Covers C7.
14. `docs/guide/merge.md`: merge seat B, `merged --slot B`. Covers C7.
15. `docs/guide/cheat.md`: example `--slot` commands for implement/review/merge/failed. Covers C7.
16. `docs/guide/install.md`: seat-value paragraph matches D3 or drops stale values. Covers C7.
17. `docs/guide/parts.md` and `README.md`: verify; change only if a role statement exists. Covers C7.
18. `src/AREA.md`: verify no seat jobs; no edit expected. Covers C6/C7 evidence.
19. `tests/next.test.ts`: swap expected slots/panes/attempts/models; add first-pane delivery, B merge prompt, B post-repair review prompt, pane.A-idle non-close. Covers C2, C3, C4.
20. `tests/phase.test.ts`: swap wrong-slot cases per C4; update review-aggregate, handoff, stop, cap fixtures that hardcode A/B jobs. Covers C4.
21. Other tests asserting jobs (grep `slot=A|slot=B|strong-a|strong-b|pane.A|pane.B|review-A|review-B` under `tests/`): update job assertions, leave slot-identity tests alone. Covers C3, C4.
22. Run sweep from C8, fix stragglers outside exclusions. Covers C8.
23. Scratch e2e transcript per C9, save artifact. Covers C9.
24. `bun run format`, `bun run typecheck`, `bun test`. Covers C10.

## Docs affected

- Agent `skills/plan-issue/SKILL.md`: synthesis seat moves B to A.
- Agent `skills/implement-issue/SKILL.md`: worker and repair seat moves B to A.
- Agent `skills/implement-issue/brief-template.md`: brief author moves B to A.
- Agent `skills/implement-issue/worker-protocol.md`: delegating seat moves B to A.
- Agent `skills/check-issue/SKILL.md`: post-repair reviewer moves A to B.
- Agent `skills/merge-issue/SKILL.md`: merge seat moves A to B.
- Agent `skills/watch-issues/SKILL.md`: required-seat table swaps jobs.
- Agent `skills/AREA.md`: full-suite seat moves B to A.
- Agent `src/AREA.md`: verified, no seat jobs, no change expected.
- Human `docs/guide/idea.md`: seat jobs and pass table swap.
- Human `docs/guide/phases.md`: phase table and examples swap.
- Human `docs/guide/merge.md`: merge seat A to B.
- Human `docs/guide/cheat.md`: example slots swap.
- Human `docs/guide/install.md`: seat values match live config.
- Human `docs/guide/parts.md`: verify only, change if a role line exists.
- Human `README.md`: verify only, change if a role line exists.

## Verification

Not a slow-run leaf. No restart boundaries. Full suite runs in one pass.

| Criterion | Proof command | Failure caught | Size | Rerun when |
|---|---|---|---|---|
| C1 | `bun test tests/phase.test.ts` plus `rg -n "plan.synthesis|implement|check.fix|merge|requiredSlots" src/routing.ts` | wrong slot list or re-review branch | seconds | `src/routing.ts` changes |
| C2 | `bun test tests/next.test.ts` including pane.A-idle non-close and B-idle close cases | close on wrong pane or allocation change | seconds | `src/next.ts` changes |
| C3 | `bun test tests/next.test.ts` new delivery tests asserting prompt text, first-pane id, `strong-a` start, B merge and B re-review prompts | dispatch to wrong seat or pane | seconds | routing, next, or test helper changes |
| C4 | `bun test tests/phase.test.ts tests/next.test.ts` wrong-slot refusal cases | missing slot guard or silent accept | seconds | `src/routing.ts`, `src/phase.ts`, `src/next.ts` changes |
| C5 | `git diff 3704d86a92d6369be36bf600ca413be79cf81c22 -- config.yaml` and `akrogon config` | extra config churn or wrong seat values | seconds | `config.yaml` changes |
| C6 | `rg -n "slot=[AB]|--slot [AB]|review-[AB]\.md" skills/plan-issue skills/implement-issue skills/check-issue skills/merge-issue skills/watch-issues skills/AREA.md` plus full read of owned skills | stale skill job prose including lines outside sweep regex | seconds | any owned skill changes |
| C7 | `rg -n "Seat [AB]|slot|Slot|--slot" docs/guide/idea.md docs/guide/phases.md docs/guide/merge.md docs/guide/cheat.md docs/guide/install.md docs/guide/parts.md README.md` plus `bun test tests/docs-links.test.ts` | stale guide or broken link/anchor | seconds | any guide or README change |
| C8 | `rg -n "slot=[AB]|--slot [AB]|review-[AB]\.md|[Ss]eat [AB]|[Ss]lot [AB]|\bAs [AB]\b|\b[AB] (merges|implements|reviews|re-?checks|synthesi)" src skills docs README.md` | leftover old-job assignment | seconds | before report write |
| C9 | scratch run: `AKROGON_HOME=<scratch> bun src/akrogon.ts phase <slug> <phase> --slot <seat>` sequence synthesis A, implement A, review A+B, fix A, re-review B, merge B, merged, plus one refused call; save transcript path in report | lifecycle refuses a legal new-slot move or accepts an old-slot move end to end | minutes | routing or phase-guard changes |
| C10 | `bun run format`, `bun run typecheck`, `bun test` | format, type, or suite break | minutes | any code or test change |

E2E detail: create scratch `AKROGON_HOME` with scratch registered repo per `tests/helpers.ts` pattern, open one leaf, run the C9 phase sequence with real CLI, keep worktree clean and branch non-empty at review handoff, record transcript file under the leaf folder.

## Open limitation

No conversion for leaves already mid-flight. A leaf mid-synthesis/implement/merge during cutover keeps old `done`/prompted bookkeeping; recovery is operator restart at the fitting active phase after this lands. Historical letters in `learnings/`, `issues/closed`, `issues/log.jsonl` stay.

## Credentials

Design names no variable. No `.env` check runs. No human-only blocker.

## Dependencies

None. `blocked-by` is empty. Internal order only: routing plus next plus config first, then skills and docs, then tests, then sweep plus e2e plus checks.

## Implementation notes

Dated 2026-09-29. Refines D6 without changing locked scope.

- Units: U1 owns `src/routing.ts`, `src/next.ts` (one gate line), `config.yaml`, `tests/next.test.ts`, `tests/phase.test.ts` plus any other job-asserting test. U2 owns the eight skill paths in D8. U3 owns the guide pages, README verify, and `src/AREA.md` verify. One wave of three; file sets are disjoint so edits and verification are independent.
- Changed-test base for all workers: `AKROGON_BASE=3704d86a92d6369be36bf600ca413be79cf81c22`. Workers run only the resolved `test_changed` command; B runs the full suite after all picks.
- `bun run format` covers `src` and `tests` only. Skills and docs edits need no format run; link safety is proven by `tests/docs-links.test.ts` in B's final suite.
- `skills/AREA.md` must stay at most 40 lines with exactly Commands, Key files, Non-obvious patterns, See also as H2 sections.
- First-pane proof uses fake-herdr order: tab-create root pane is `panes[0]` and becomes `state.pane.A`; assert prompt pane equals both plus start args contain `strong-a`.
- E2E transcript is B-owned after all picks, saved under `<leaf>/implementation/e2e-transcript.md`.
