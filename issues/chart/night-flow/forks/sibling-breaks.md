# Sibling breaks

## Question
Q1 A sibling's merge changes main under a running leaf, and the leaf's change no longer fits (2026-10-11 framework: root-influence's new root-state check rejected check-scratch's test fixtures; a newly required `dispose` method broke formspark-build-wiring's typecheck). Today the leaf learns this only at its own merge, after B's review, and pays a whole check.fix → check.review → merge cycle per sibling merge. What single change finds this early and makes the way back to merge short, so parallel leaves keep moving without failing and without the operator?
Q2 Should charting prevent part of it: when one leaf's contract adds a rule or a required interface member that sibling leaves' code must meet, does the contract name those siblings, and what does that naming change for them?

Q3 A leaf's own check can skip cheap checks that only the merge check runs (framework: leaf `checks` run parity, contracts and selftest; `merge_checks` runs `framework:verify`, whose cheap stage holds typecheck and lint, `package.json:163`). formspark-build-wiring passed its own check and was ejected at merge for its own lint errors (F16/F17). How does every cheap check a merge runs also run in the leaf before review, in every registered repo, without making each pass slow?

### Carries
- Operator, 2026-10-11, verbatim: "This is a problem, probably a big one. Are we addressing that as well?" and "I approve that, but see if can chart these off as well, and put them in as systemic fixes. Talk to slot b and c. This is not good." (INTAKE.md, framework screenshots source).
- stop-rules Taken S2 (`forks/stop-rules.md`): the round cap no longer fails a leaf; the count still increments; a repeated problem goes back to A as a plan correction. That removes the `failed` ending tonight's three leaves hit; it does not shorten the cycle.
- stop-rules Taken S1: a merge red that is also red on main makes only that leaf wait; tonight's reds were green on main, so S1 does not apply.
- failed-exits Taken S4/S5, keep-running Taken W/R (`forks/failed-exits.md`, `forks/keep-running.md`).
- Operator lock (`issues/chart/seat-stall-detection/CHART.md:15-16`): no hidden watchdogs, clocks or polling.
- Chart rule (`skills/chart-issues/SKILL.md`, Drain): only an actual dependency orders work, never file overlap or presentation preference.
- framework chart merge-flow (`/home/ivan/Work/infra/tamdoma/framework/issues/chart/merge-flow/CHART.md`) owns framework-side test, sandbox and root-state-guard specifics; weakening the root-state guard is off route there.
- Operator-forwarded chart-framework notes F1–F7 (INTAKE.md): "the testing for these should come first, not wait till the end" (in substance); "If akrogon should enforce 'every merge check either runs in the leaf check or is declared slow', that belongs to your chart."
- A repo's `issues/config.yaml` change is an operator step on main, never a leaf (`skills/chart-issues/assets/shapes.md:284`).
- Stopgap, 2026-10-11: framework `issues/config.yaml` `fix_rounds` 3 → 8, pushed in framework `c45d6693f`.
- Operator decision via chart-framework, 2026-10-11 (INTAKE.md): "that should be akrogon rule too". Framework adds `framework:verify:cheap` to its own `checks` as its leaf L9; akrogon is to require for every repo that a merge check cheap enough for the leaf's own check runs there, before review. Q3's framework config part leaves this chart.

## Findings
Merged notes: slots/sibling-breaks-merged.md (B: slots/sibling-breaks-B.md, C: slots/sibling-breaks-C.md). Rebuttals: slots/sibling-breaks-rebuttal-B.md, slots/sibling-breaks-rebuttal-C.md. Q3 blind notes: slots/sibling-breaks-q3-B.md, slots/sibling-breaks-q3-C.md.

- better-than-training · `framework/issues/merge-attempts.jsonl:16-18`, `log.jsonl:2384,2404,2413,2416`, read 2026-10-11 · root-influence landed 07:25:36; check-scratch ejected 07:37:50, formspark-build-wiring 07:44:43. Both had waited in merge for hours (5h39m, 2h13m) behind recording-consumers' 8h57m base-red hold; the sibling changes landed during that wait, so a rebase at handoff would not have caught these two (B F7). S1 removes the repo-wide hold, not ordinary queueing (B F7).
- better-than-training · `src/next.ts:334`, `src/batch.ts:89-133`, `skills/implement-issue/SKILL.md:63,78` · a leaf meets current main only at merge, except a merge-origin `check.fix`, which already fetches, rebases and replays (A,B,C).
- Return cycle 15.8–32.6 min; A's repair is 9–15 min of it, B's re-check about 1 min (B,C). No A-versus-B repair comparison was measured (B F10).
- `dispose` entered main in `ecdc13a6d`, a recording-consumers repair commit named in no brief or design (C, B E8). The root-state rule was in `root-influence/brief.md:7`. formspark-build-wiring is blocked by formspark-integration (`state.yaml:6-7`), not by recording-consumers, the producer of `dispose` (B F6 correction).
- Causes: check-scratch sibling (partly its own scratch-root design, C LC); formspark-build-wiring mixed (F15 sibling, F16/F17 own lint); root-influence, copyfile-install own; akrogon leaf-env-file wrong rebase resolution plus inherited base defect (B,C).
- Q3: framework is the only registered repo with `merge_checks`; its `framework:verify:cheap` (`package.json:163`) holds four typechecks and lint and runs only at merge; `docs/guide/setup.md:54` and `skills/init-akrogon/SKILL.md:20` already say `merge_checks` holds slow commands (B,C). akrogon cannot classify opaque commands as cheap or slow without a clock (C) or a self-reported flag that still hides cheap children (B O11).
- Off route: `mdcny-ghl-data-pulls` and `lingua-relay` run no checks; clinique-la-roya copies framework's leaf checks without typecheck or lint (C Q3a, B audit). check-scratch's scratch-root design as a plan correction belongs to framework merge-flow (C Q2a).
- Dropped: stale-tip fallback on a failed fetch (C R5 withdrawn by A after B F9: no unrequested fallback); green no-commit replay straight to merge (A: one-minute saving, new routing exception); rebasing running worktrees on each landing, serializing by blocked-by, weakening guards, a separate counter (A,B,C).
- Peer positions before the answer: Q1 rebase at start and end of every A pass (A,C) vs end only (B F8); merge reds to A's check.fix as today (A,C) vs B's check.repair (B). Q2 no new naming rule (A,C) vs name known affected leaves with obligations (B F11). Q3 config fix (B,C), plus one placement sentence in init and setup guidance (B) vs no text change (C O5).

## Taken
Operator, 2026-10-11, verbatim: "1a, 2a, 3a".

The round as read: slots/sibling-breaks-final-shape.md:6-9. Final shape checked by B and C: slots/sibling-breaks-final-check-B.md (F12–F15), slots/sibling-breaks-final-check-C.md (F1–F7).

### Q1 pass-refresh (1a)
- A refreshes (fetch, rebase onto `<remote>/<default_branch>`, refresh `AKROGON_BASE`) at the start of `implement` and of every `check.fix`, and again before the final proof once every worker worktree is removed and its scoped work is committed, never stashed or discarded (A,B; B F12).
- Conflicts are resolved inside the rebase under the solo rule. A conflict needing a plan correction uses plan-not-cap's plan-correction rule while the rebase stays in progress, since `plan.md` lives in the registered checkout. It never ends the pass `failed` (A,B,C). The locked-decision stop (`skills/implement-issue/SKILL.md:34`) stays as it is and is not restated (C F4).
- A failed fetch or other terminal refresh error is recorded with its original error. A aborts only an active rebase and ends with no phase move. The next dispatch prompts A again (`src/next.ts:631-645`), and that pass resumes at the recorded refresh (A,B,C; B F14, C F1).
- A records the prior reviewed and handed-off base and head. B computes the range-diff itself and reviews as repair only the commits it shows added or changed, conflict resolutions included (A,B,C; B F13, C F3).
- Merge reds stay with A's `check.fix` (`src/phase.ts:1025`). Skill text only. Blocked by plan-not-cap (C F2).
- Reason: the start refresh makes a repair against current code. The end refresh proves the handed-off head on the main it meets (A,C). The cost of a return is A's repair, not the hop (C RB3).

### Q2 no sibling-naming rule (2a)
- Nothing is added to chart-issues or shapes. Reason: Q1 catches a sibling's change at A's next pass boundary, whether or not a contract predicted it. Tonight's `dispose` was in no brief or design (C, B E8).
- Declined: B F11, naming known affected siblings with obligations in the contract.

### Q3 cheap-check-placement (3a)
- One rule in `skills/init-akrogon/SKILL.md`, `docs/guide/setup.md` and `skills/check-issue/SKILL.md`: a cheap check runs in `checks`, before review, and never only at merge. A merge command may also rerun it on the integrated candidate (A,B; B F15).
- In review, a leaf diff leaving a cheap check reachable only at merge is a Fix when a script edit within the leaf can route it through `checks`. Otherwise it is an `Operator actions` item naming the config line, which gates no done-criterion (A,C; C F5, `check-issue/SKILL.md:29`).
- Agents follow it. No code, config key, timer or slow flag enforces it.
- Existing configs: B's audit of all ten registered repos (slots/sibling-breaks-q3-B.md, RC1–RC10, 2026-10-11) found `merge_checks` only in framework. framework fixes its own config as its leaf L9 (C F6).
- framework `fix_rounds: 8` (`c45d6693f`) needs no revert: framework has no `direct` setting, so after plan-not-cap the value bounds nothing there (C F7).

### Foreclosed
Merge reds to B's `check.repair` (1b); a refresh only before handoff (B F8); proceeding on the last fetched tip after a failed fetch; a green no-commit replay going straight to merge; rebasing running worktrees when a sibling lands; ordering leaves by file overlap; weakening guards; a separate bounce counter; aborting the rebase to correct the plan (B F14, `plan.md` is outside the worktree); running every `merge_checks` command in the leaf (3b); a timer, duration threshold, `slow` label or new config key; matching command strings between `checks` and `merge_checks`.
