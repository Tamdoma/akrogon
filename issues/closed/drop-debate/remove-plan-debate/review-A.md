# Review A: remove-plan-debate (check.review)

Base `6939013807f1ec1f32c664520426157dbc99e525`. Reviewed head `1deb1fb0d750e3f21154697743aa797ff15dd79d`.

Verdict: `ready`

## Scope reviewed

I reviewed the whole diff `6939013807f1..1deb1fb0` (42 files) against the brief's done-criteria 1-6, the design's binding decisions and exclusions, plan D1-D9 and `implementation/report.md`.

## Criteria

1. **Legacy keys load.** `readState` strips `debate` and `parseRepoConfig` strips `rebuttal` before the strict parse (`src/state.ts:144`, `src/config.ts:227`). `readRepo` and `initialize` both use `parseRepoConfig`. No other `stateSchema`/`repoSchema` parse reads a file. The other `repoSchema.parse` call (`src/config.ts:382`) parses a literal. Neither key exists in either schema. Unknown keys are still refused (`tests/retired-debate.test.ts` cases 1-3).
   - Real integration: `bun src/akrogon.ts config` against akrogon's own `issues/config.yaml`, which still has `rebuttal: true`, exits 0 and prints no `rebuttal`. Evidence: `check review-a-config: 0 .../check-review-a-config-1792913582907-1880060.log`. This also covers the design's "`effectiveConfig` stops printing it" (plan D4).
2. **Saves drop `debate`.** Covered by `tests/retired-debate.test.ts` case 1.
3. **History parses.** The historical enum is used only in `logSchema`, `timingEventSchema` and `failureSchema.phase`. `historicalSlots` takes retired phases from a separate table and never indexes live `routing`.
   - Real integration: akrogon's own `issues/log.jsonl` has 11 retired-phase lines. `bun src/akrogon.ts timing pull-close` exits 0 (`check review-a-timing-real: 0 .../check-review-a-timing-real-1792913594358-1880765.log`). `bun src/akrogon.ts status` exits 0 with no unreadable leaf (`check review-a-status-real: 0 .../check-review-a-status-real-1792913594533-1880863.log`).
4. **No retired route.** Retired phases are absent from `phaseSchema`, `routing` and `failed.next`, and both guards are deleted. Covered by case 6 plus the ported `phase`/`next` tests.
5. **Skills.** All six skill files match the criterion. The charting exchange (`skills/chart-issues/SKILL.md:55`, `assets/questions.md`) is unchanged. A repo-wide `git grep` outside `issues/`, `learnings/`, `tests/` and `src/` finds only the excluded charting surfaces, the recorded session fixture and the rollback note.
6. **Docs.** All 13 listed docs are updated, and the rollback note is in `docs/use/roll-back-a-release.md`.
   - `phases.svg` passes `xmllint --noout`. I rendered it with `rsvg-convert` and compared it to the base render. The two debate boxes and their labels are gone, the chart starts at `plan.synthesis` ("a leaf starts here"), and the lower graph is unchanged.
   - `chart-door.svg` and `quick-fix-story.md` are untouched.

## Docs

I opened the doc pages for the changed behavior: `state-and-phases.md`, `config.md`, `skills.md`, `files.md`, `write-issues-by-hand.md`, `quick-fix.md` and `plan-work.md`. Each describes the new behavior. No `AREA.md` is in the diff.

## Tests

- Every changed old test file carries a `Test-Change` trailer in `a170a2ad` citing the design's port rule.
- The race, busy, exited and seat-resolution tests still guard their behavior on two-slot `check.review`.
- The stray-artifact refusal still runs on a planning move (`plan.synthesis` → `implement`).
- The one deleted test (the dispatch refusal for a debate leaf without positions files) guarded removed behavior.
- No planned test is skipped or filtered.

## Verification

`akrogon verify` on `1deb1fb0` is green: 1167 tests passed, plus typecheck and format (report). The criterion proofs ran on `1deb1fb0`, after the last test change (report). I reran nothing else, because the head is unchanged since those runs.

## Nits

None.
