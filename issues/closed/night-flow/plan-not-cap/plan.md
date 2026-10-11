# Plan: plan-not-cap

Remove the fix-round-cap failed path in `src/phase.ts`; repeated repair problems route back to the plan inside the leaf instead of failing it.

## Decisions

- D1 `src/phase.ts` `transition()`: delete the `capped` ternary and commit `destination` as is. The `commitMove` failure argument becomes `undefined` on this path; `fix rounds exhausted` is produced nowhere. The `fix_rounds` increment in `commitMove` (`to === 'check.fix'` from `check.repair` or `merge`), the state counter, `requiredSlots`, and `src/status.ts` display stay unchanged. The `cause: 'attempts'` schema variant stays: `src/next.ts` still produces it for seat-fault exits.
- D2 `fix_rounds` stays in the strict repo schema (`src/config.ts`) and in `issues/config.yaml`; it now bounds only the chart-issues direct route (`skills/chart-issues/SKILL.md` Repair bound, unchanged). `src/watch-issues` and `shapes.md` round displays are unaffected.
- D3 `skills/check-issue/SKILL.md` check.repair: replace `the command counts that handoff and answers 'moved failed' at the repair cap` with `the command counts that handoff`, and add the plan-correction rule: a Fix repeating an earlier round's problem, contradicting a plan decision, or needing a step the plan lacks goes to `Handed to A` through check.fix naming the repeated problem, the contradicted decision or the missing step.
- D4 `skills/implement-issue/SKILL.md`: in check.fix, A corrects `plan.md` for each named plan correction before changing code and adds an executable check A runs for the corrected rule; brief, locked design and test-change protections unchanged. Remove every cap-conditioned clause: `and the repair cap` (:27), `and never on the final allowed repair round` + `Inline mode and the final allowed repair round wait` (:42), `use worker waves before the last allowed repair round` + `on the final allowed round` (:76).
- D5 `skills/implement-issue/worker-protocol.md` (:31): remove the last-allowed-round clause; leaf repairs delegate the same at any round.
- D6 `docs/guide/phases.md`: :18 drop `against the configured repair-round limit` -> the handoff count is still recorded; :76 drop `a leaf failed at the cap` sentence -> recovery keeps `fix_rounds`; :108 replace the cap paragraph with: handoffs and merge bounces count toward `fix_rounds`, the count stays visible in status, no cap fails the leaf.
- D7 `docs/guide/setup.md` (:60): `fix_rounds` bounds the chart door's direct-route repair rounds; the recorded leaf count stays visible in status.
- D8 `skills/init-akrogon/SKILL.md` (:26): keep `fix_rounds: 3` in the proposal template and annotate the line that it bounds direct-route repair rounds.
- D9 Tests: rewrite cap assertions into movement assertions in `tests/phase.test.ts` and `tests/culprit.test.ts`; synthetic `fix rounds exhausted` failure fixtures at `phase.test.ts:1123` and `:1564` are restart/seat-refusal setups, not cap claims, and stay.

## Read-first

- `docs/reference-index.md` (index), `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`
- `src/phase.ts` `transition()` cap block and `commitMove` counter; `src/routing.ts` `requiredSlots`; `src/state.ts` `failureSchema`
- `tests/helpers.ts` (`fixture`, `leaf`, `cli`, `fakeHerdr`, `yaml`); `tests/phase.test.ts:101-160`, `:1193-1211`; `tests/culprit.test.ts` `batchFixture`, cap test `:174-203`
- `skills/check-issue/SKILL.md` check.repair end; `skills/implement-issue/SKILL.md` shared context, overlap rule, check.fix; `skills/implement-issue/worker-protocol.md`; `skills/init-akrogon/SKILL.md` proposal template; `skills/chart-issues/SKILL.md:117` (unchanged bound)
- `docs/guide/phases.md`, `docs/guide/setup.md`

## Interfaces

- `transition(repo, leaf, requested, ...)` signature unchanged; `commitMove` unchanged.
- `akrogon phase <slug> check.fix --slot B` from `check.repair`, and `--culprit` merge eject, reach `check.fix` at any `fix_rounds` value; `state.fix_rounds` increments.
- Plan-correction handoff shape: `Handed to A` lines name the repeated problem, the contradicted decision or the missing step.

## Waves

Wave 1 (disjoint paths, no shared resources, no dependencies):

- U1 `src/phase.ts` cap removal (D1). Owns: `src/phase.ts`.
- U2 Test rewrites (D9). Owns: `tests/phase.test.ts`, `tests/culprit.test.ts`. Lands first among product+test commits: tests are committed before product code per the leaf rule.
- U3 Skill texts (D3, D4, D5, D8). Owns: `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/init-akrogon/SKILL.md`.
- U4 Guide texts (D6, D7). Owns: `docs/guide/phases.md`, `docs/guide/setup.md`.

(U2 precedes U1 in commit order; they may be authored in parallel and committed tests-first. U3/U4 independent.)

## Verification (criterion -> proof)

- C1 CLI moves past the count: `bun test tests/phase.test.ts tests/culprit.test.ts`. Edited assertions: `check.fix` at `fix_rounds=1` under `fix_rounds: 1` config moves to `check.fix` with count 2 (from `check.repair`, and from `merge`); `--culprit` eject of a member with `fix_rounds=1` lands in `check.fix` with count 2, holder back at merge, batch cleared, ejected attempt recorded. Intended red on `c53f619`: `review fix routes...` expected `moved check.fix`, received `moved failed`; `check.fix request at the configured round count moves and increments` same; `a culprit at the configured round count ejects to check.fix and the count rises` same. 68 pass / 3 fail. Size: seconds. Rerun: on any change to `src/phase.ts`, `src/routing.ts`, `src/batch.ts`.
- C2 Schema parses, direct bound unchanged: `bun test tests/config.test.ts` (existing `fix_rounds` parse cases) plus diff review showing `src/config.ts`, `issues/config.yaml` and `skills/chart-issues/SKILL.md` untouched. Size: seconds. Rerun: config changes.
- C3 Skill rules present: grep assertions in the report for the new check-issue plan-correction rule and the implement-issue plan-correction + executable-check rule; absence of `final allowed`, `last allowed`, `repair cap` in `skills/`. Size: seconds. Rerun: skill edits.
- C4 Sweep: `grep -rn "fix rounds exhausted\|repair cap\|final allowed\|last allowed" skills/ docs/` returns nothing; broader `fix_rounds|cap` hits reviewed and listed in the report (`watch-issues` seat table, `chart-issues` shapes/bound, `setup.md` key, `init-akrogon` template). Size: seconds. Rerun: doc edits.
- Leaf checks at synthesis: `bun run format` clean, `bun run typecheck` clean, `bun test --timeout=30000` and `--changed` red only in the 3 planned C1 cases (789/68 pass).

Docs affected: `docs/guide/phases.md`, `docs/guide/setup.md` (owned); `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md` reviewed for staleness, expected unchanged; README has no cap text.
