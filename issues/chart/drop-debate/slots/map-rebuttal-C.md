# Rebuttal C: drop-debate opening map

Read 2026-10-25: map-merged.md, `src/state.ts` (`failureSchema`, `batchSchema`), `src/phase.ts` (`transition`), `tests/phase.test.ts` race case, `tests/next.test.ts` fixtures.

## Agreed

No disagreement. One confirmation on the test port: the only surviving two-slot move is check.review to merge. It requires `--verdict` (`src/phase.ts` `transition`, "Review requires --verdict") and skips the receipt and non-empty guards when the fixture has no worktree, so the race case and the busy/exited/seat fixtures port to `check.review` with `fix_rounds: 0`; asserted prompt text changes from `plan-issue ... phase=plan.positions` to `check-issue ... phase=check.review`. Practitioner, 2026-10-25.

## Differ

1. Pick: declare `debate` and `rebuttal` as `.optional()` ignored fields with a one-line comment, permanent for the 1,058 state records, and clean only the 11 `issues/config.yaml` lines in a follow-up before dropping that schema line. Reason: the schema is the documented record contract (`docs/reference/state-and-phases.md` field table), and this file already retires fields this way (`src/state.ts` `batchSchema` `owner`, "Absent means seat: records written before ..."). D's strip mutates raw YAML before `stateSchema.parse`, so the retired key is visible neither in the type nor in the contract. A's and B's cross-repo rewrites of state files buy no behavior for 1,058 edits. Practitioner, 2026-10-25.

2. Pick: no mapping; recheck zero at cutover; a stray record fails loudly at `routing[state.phase]`. Reason: only the old door template can write `debate: 'yes'`, and that template flips with the binary through `~/.akrogon/current` (`docs/reference/releases-and-updates.md` "Release and checkout"), so the case cannot arise after deploy. D's map-on-read is a permanent code path for a measured-zero case, and clearing `done` silently discards a seat's recorded pass. Practitioner, 2026-10-25.

3. Disagree with D's optional sentence. The Fix evidence in all four maps names implementation and proof defects, none an alternative-selection defect, so a mandatory "simplest alternative" sentence in every plan has no failure it prevents. It also widens a removal chart into a plan-issue rule change. Practitioner, closed-leaf reviews cited in map-C part 4, 2026-10-25.

4. Accept. Record it as a known limitation in the leaf design; no mitigation is worth a release of double-writing `debate: 'no'`.

## Open questions

- D Q9: no. Fix lines mentioning the brief or design are about 7% in both repos (map-C part 4), which does not justify recommending peers for large leaves; out of this chart's scope either way.
- Route: lifecycle. Five source files plus a wide docs sweep and a records-compatibility criterion exceed the direct route's one-small-settled-item fit (`skills/chart-issues/SKILL.md` `## Direct route`).
