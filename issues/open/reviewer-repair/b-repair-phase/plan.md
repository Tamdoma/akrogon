# Plan: b-repair-phase

Debate: no. Synthesized directly from `brief.md` and `design.md`. Base `6ab5e82`. `HEAD..origin/main` is empty, so line citations are current. The dependency `operator-only-items` is merged, and its `Operator actions` rule is at `skills/check-issue/SKILL.md:29`.

## Decisions

- D1. Routing (`src/routing.ts`). `check.repair` is added to the phase enum right after `check.review`. `check.review` next becomes `merge, check.repair, failed`. New entry `'check.repair': { skill: 'check-issue', slots: ['B'], next: ['merge', 'check.fix', 'failed'] }`. `failed` next gains `check.repair`. `requiredSlots` is unchanged, so `check.review` stays B-only when `fix_rounds > 0`. `merge` routing is unchanged.
- D2. Aggregation and counting (`src/phase.ts`). When all required review verdicts are recorded and any is `fix`, the destination is `check.repair` (line 229). The `fix_rounds` increment in `commitMove` (line 107) moves from `check.review -> check.fix` to `check.repair -> check.fix`. The cap (lines 232-244) applies to a `check.fix` request from `check.repair`: at `fix_rounds >= config.fix_rounds` the leaf moves to `failed` with `{ cause: 'attempts', phase: 'check.repair', slot: 'B', reason: 'fix rounds exhausted' }`. Moves to `check.fix` from `merge` or from `failed` stay uncounted, as today. With the default cap of 3, A still gets at most 3 counted repair handoffs, the same number as today.
- D3. A B re-check `fix` also goes to `check.repair` (the brief's "or B's re-check verdict"), with no increment. B's repair work inside one pass has no count limit (round-budget Q3 3a).
- D4. The watch script enum (`skills/watch-issues/scripts/observe.ts:6-16`) gets the same `check.repair` entry. Without it, the script fails to parse any leaf in `check.repair`. The file is outside `tsconfig.json` `include`, so typecheck does not catch a mismatch.
- D5. `check-issue` gets a `## check.repair` section between `## check.review` and `## Printed footer`. It says:
  1. Input: every Fix in the review files for the latest reviewed head, meaning both initial reviews or B's latest re-check entry.
  2. B repairs every Fix except plan or design changes, missing planned units, required live runs, and work B judges too large for its pass. Those go under a `Handed to A` heading in `review-B.md`, one line each with the Fix and the reason. B never edits `plan.md` or `design.md`.
  3. Operator-only items follow the `Operator actions` rule in Shared context (pointer only, no restatement). They are never handed to A.
  4. Each behavior Fix gets its own commits, never shared with another Fix. First comes a commit with a test that reproduces the recorded source and is shown failing. Then comes the fix commit. The failing and passing output are recorded in `review-B.md`.
  5. Each docs or command Fix gets its own commit, with before and after evidence (quoted text or command output) in `review-B.md`.
  6. A red test or check with no cause in the leaf's diff takes the check.review base-run rule. The section points to it by name, because the brief's `:55` citation is now line 57.
  7. After the repairs, B runs proof for every done-criterion from `plan.md` and every `checks` command. It does not run `merge_checks`, because merge runs them.
  8. B appends a dated `check.repair` entry to `review-B.md` with each Fix, its commits and its evidence.
  9. There are two finishes. With nothing handed to A and no open operator action, B runs `akrogon phase <slug> merge --slot B`. Otherwise B runs `akrogon phase <slug> check.fix --slot B`, and the command may answer `moved failed` at the cap.
- D6. Mixed batch: Handed-to-A items plus open operator actions. B still moves to `check.fix`. A repairs the handed items, then makes the one `failed` stop under the existing check.fix operator-actions rule (`skills/implement-issue/SKILL.md:75`). That keeps "doable Fixes first, then one stop", because A's handed items are doable Fixes. When only operator actions remain, B makes the one stop itself.
- D7. Other `check-issue` edits:
  1. Description (line 3): review, repair most Fixes as B in check.repair, re-check.
  2. Prompt line (line 10): add `phase=check.repair`, slot B only.
  3. check.review finish (line 61): request `check.repair` for fix.
  4. Re-check (line 59): "after `check.fix`" stays, because A's repair is what B re-checks.
  5. Footer (line 72): `check.repair` routes to check-issue B, and `check.fix` to implement-issue A.
- D8. `implement-issue` check.fix gets one paragraph. The newest entry in `review-B.md` decides A's input. A `Handed to A` list means A repairs only those items. Red merge checks mean the failing output is the finding (existing line 73). Otherwise, for example a leaf already in `check.fix` before this lands, A repairs every recorded Fix, as today. The prompt line, description and footer are unchanged, because A's phase names are unchanged.
- D9. `merge-issue` is unaffected. Line 41 (`merge -> check.fix`) and line 62 (repair footer) stay true.
- D10. Doc changes:
  1. `docs/guide/phases.md`: table row, diagram (`check.review --fix--> check.repair --> merge`, `check.repair --handed to A--> check.fix --> check.review`), and the repair text at lines 101-105. Lines 17 and 73 name `check.repair` where they describe where a fix goes and what recovery keeps.
  2. `docs/guide/idea.md:42-44`: a `check.repair` row (B repairs) before `check.fix`, which becomes "handed repairs".
  3. `docs/guide/setup.md:58`: the cap counts handoffs to A.
  4. `docs/guide/cheat.md:122-123`: the check-issue row says it also repairs (B).
  5. `skills/watch-issues/SKILL.md:34`: add `check.repair B`.
- D11. Leaves in flight. A review seat that still requests `check.fix` with a verdict gets the existing "Illegal move ... legal moves are merge, check.repair, failed" refusal and can retry. A leaf already in `check.fix` keeps `check.fix -> check.review`.

Brief/design note for review: the brief cites `skills/check-issue/SKILL.md:55` for the base-run rule. The live paragraph is line 57. D5 points to it by name. The brief and the design do not conflict otherwise.

## Read first

- `brief.md` and `design.md` in this leaf folder.
- `src/routing.ts` (all), `src/phase.ts:87-131` (`commitMove`) and `:170-246` (`transition`).
- `skills/watch-issues/scripts/observe.ts:6-16`.
- `tests/phase.test.ts:93-130` (review aggregation test), `:825-840` (recovery keeps rounds), `:1098-1117` (cap test), `:1287-1305` (wrong-seat table). `tests/next.test.ts:1765-1810` (swapped-seat dispatch test). `tests/helpers.ts` for `fixture`, `leaf` and `fakeHerdr`.
- `skills/check-issue/SKILL.md` (lines 3, 10, 25-31, 57-63, 72).
- `skills/implement-issue/SKILL.md:67-77`.
- `docs/guide/phases.md`, `docs/guide/idea.md:30-48`, `docs/guide/setup.md:58`, `docs/guide/cheat.md:118-126`, `skills/watch-issues/SKILL.md:34`.
- Lessons: `learnings/history/2026-10-01-failed-stop-guard-wording.md` (assert state, refusal and side effects, never prose), and `learnings/history/2026-09-11-stale-rule-in-docs.md` (grep `docs/` for the changed rule).

## Interfaces

- Phase name `check.repair`. Prompt `check-issue <slug> slot=B phase=check.repair leaf=<folder>`. `src/next.ts:460` builds it generically from `routing`, so `next.ts` needs no change.
- B's finishes: `akrogon phase <slug> merge --slot B` and `akrogon phase <slug> check.fix --slot B`. `check.repair` takes no `--verdict` (the existing guard at `src/phase.ts:214` forbids it outside `check.review`).
- Review seat fix finish: `akrogon phase <slug> check.repair --slot <A|B> --verdict fix`.
- Failure record at the cap: `{ cause: 'attempts', phase: 'check.repair', slot: 'B', reason: 'fix rounds exhausted' }`.
- `review-B.md` heading `Handed to A`.
- No new state field. The enum only grows, so existing `state.yaml` files stay valid.

## Checklist

### Wave 1 (three units, disjoint paths, no shared test resource, no dependencies between them)

- U1 command and tests. Owns `src/routing.ts`, `src/phase.ts`, `skills/watch-issues/scripts/observe.ts`, `tests/phase.test.ts`, `tests/next.test.ts`. Shared test resource: none (local fixture repos only). Implements D1-D4 and D11. Tests:
  - Rewrite `tests/phase.test.ts:93` "review aggregates verdicts..." (config `fix_rounds: 1`):
    1. A `merge --verdict nits` is `recorded`. B `check.repair --verdict fix` is `moved check.repair` with `fix_rounds` 0. The log line shows `from: check.review, to: check.repair`.
    2. `merge --slot A` from `check.repair` is refused. B `check.fix` is `moved check.fix` with `fix_rounds` 1.
    3. A `check.review` is accepted. Then an A verdict is refused (B only). B `check.repair --verdict fix` is `moved check.repair` with `fix_rounds` still 1.
    4. B `check.fix` is `moved failed` with the D2 failure record.
    5. Recovery to `implement` keeps `fix_rounds`.
    6. The merge-origin `check.fix` assertions stay uncounted, as today.
  - Add a case: `check.repair` + B `merge` is `moved merge`. A `failed` leaf recovered to `check.repair` is `moved check.repair`.
  - Change `tests/phase.test.ts:1098` "fix cap records attempts failure" to a leaf in `check.repair` with `fix_rounds: 1`, then `check.fix --slot B`. Expect `failure.phase: 'check.repair'`.
  - Add `{ phase: 'check.repair', slot: 'A' }` to the wrong-seat table at `:1287`.
  - In `tests/next.test.ts:1765`, add a `check.repair` step expecting pane B and `check-issue post-repair slot=B phase=check.repair leaf=${path}`. Update the test title and the final pane-order assertion. Criteria 1 and 2.
- U2 check-issue skill. Owns `skills/check-issue/SKILL.md`. Implements D5-D7. Criterion 3.
- U3 implement-issue, watch-issues prose and guide. Owns `skills/implement-issue/SKILL.md`, `skills/watch-issues/SKILL.md`, `docs/guide/phases.md`, `docs/guide/idea.md`, `docs/guide/setup.md`, `docs/guide/cheat.md`. Implements D8 and D10. Criterion 3.

U2 and U3 depend only on the literal interfaces above, not on U1's code.

### Docs

- `skills/check-issue/SKILL.md`: new section and line edits (U2).
- `skills/implement-issue/SKILL.md`: check.fix input paragraph (U3).
- `skills/watch-issues/SKILL.md:34`: seat list (U3).
- `docs/guide/phases.md`, `idea.md`, `setup.md`, `cheat.md`: flow text (U3).
- `skills/merge-issue/SKILL.md`: unaffected (D9).
- `docs/guide/state.md`, `src/AREA.md`, `skills/AREA.md`: unaffected. They have no phase list (design).
- `README.md:185` "Review defects and verify repairs": unaffected. B's repair is still within "repairs". Changing it is outside the design's owned prose.
- `docs/guide/merge.md:9`, `docs/guide/learn.md:7`: unaffected. Merge red checks still return to repair, and repair still works Fixes only.

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun when |
|---|---|---|---|---|
| 1 | `bun test tests/phase.test.ts` | Fix aggregate still goes to `check.fix`. `fix_rounds` increments on entry to `check.repair`, or not on `check.repair -> check.fix`. Cap misses, or records the wrong phase or slot. `check.repair` accepts A. Re-check asks A after a trip. Recovery cannot target `check.repair`. | seconds (about 7s) | `src/routing.ts`, `src/phase.ts` or `tests/phase.test.ts` changed |
| 2 | `bun test tests/next.test.ts -t "swapped seats"` | `check.repair` dispatched to A, to the wrong skill, or not at all | seconds (about 1s) | `src/routing.ts`, `src/next.ts` or that test changed |
| 3 | `sed -n '/^## check.repair/,/^## Printed footer/p' skills/check-issue/SKILL.md`, judged in the report against the D5 list item by item | A missing element: scope, exceptions, fail-first commits, before/after evidence, base-run rule, `Handed to A`, operator-actions pointer, two finishes | seconds | check-issue edited |
| 3 | `rg -n "check\.repair\|Handed to A" skills docs/guide`, each hit judged by meaning | A listed doc missing the flow, or a second definition of the `Operator actions` rule | seconds | any skill or guide edited |
| 3 | `rg -n "check\.fix" skills docs/guide README.md`, each hit judged | A stale line still saying a review fix goes straight to `check.fix` (lesson 2026-09-11) | seconds | any skill or guide edited |
| D4 | `rg -n "'check.repair'" skills/watch-issues/scripts/observe.ts src/routing.ts` | Watch script enum drifts from the command enum | seconds | either file changed |
| checks | `bun run format`, `bun run typecheck`, `bun test`, and `test_changed` with `AKROGON_BASE` | Regressions elsewhere, for example a status or next test that assumed the old route | minutes | any commit |

No prose-wording tests (lesson 2026-10-01, check-issue line 49). No slow run, so the plan has no restart boundaries. No live seat run, per the design's interpretation (A,C).

Credentials: none named by the design, so no env check is needed.

## Open limitation

- Design Q3 accepts that B's repair has no second reader before merge. Only `checks`, criterion proof and merge checks stand behind it.
- D6: when the cap trips on a mixed batch, the failure reason is "fix rounds exhausted", and the open operator action is only in `review-B.md`.
