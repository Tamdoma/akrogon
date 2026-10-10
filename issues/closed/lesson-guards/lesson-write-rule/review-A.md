# Review A: lesson-write-rule

Base: `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`. Reviewed head: `135add67d57516ad69a19713a057768b44d00d81`. Diff: 9 files, +31/-7, docs/rules only. `debate: no`, so no debate artifacts expected.

## Verification evidence

- Criterion 1: `skills/lesson-rule.md` holds the three clauses once; five write sites carry `([lesson rule](../lesson-rule.md))` links and state no mechanics. Sweep `grep -rn "same failure cause|shared keywords|Checkable" skills/ docs/` finds only the rule file, `learn-issues/SKILL.md` (the referenced definition) and `seed-issue/SKILL.md:67` (a different, pre-existing mechanism-judgment rule for report dedupe, not a restated lesson rule). New `docs-links.test.ts` test asserts the four write sites.
- Criteria 2–5: fresh subagent decided all five recorded cases without posting; 5/5 matched expected (transcript `sa-3`, `2026-10-10T08-57-40` session). Broken variant (shared keywords count as a match) decided case 2 as `append-case`, failing exactly as required (`sa-4`, `2026-10-10T08-58-16` session).
- Criterion 6: `bun test tests/docs-links.test.ts` — 4 pass, 0 fail; `learn.md` links `../../skills/lesson-rule.md` and names its outcome; `cheat.md` triage row rescoped to the backlog.
- Checks: full `bun test` 647 pass / 0 fail, `bun run format` clean (only pre-existing `src/status.ts` drift, reverted), `bun run typecheck` clean.
- `skills/AREA.md`: 33 lines, exactly the four required sections, all listed paths verified on disk.
- `Test-Change:` trailer present on commit `e8ceb2a` for the `tests/docs-links.test.ts` edit; second commit touches no test files.
- Design exclusions hold: `learn-issues/SKILL.md`, `src/`, README, plan-issue read rule, and the applying half of `implement-issue:31` untouched; LESSONS.md line format unchanged.

## Doc pointers

The changed behavior is documented in the diff itself (`learn.md`, `cheat.md`, `skills/AREA.md`); every named path exists, and the `learn.md` link resolves to the new rule file. No documented behavior elsewhere is stale: `README.md:195` and `docs/guide/setup.md:31` describe `learn-issues`' triage role, which remains true.

## Verdict: ready

No Fixes, no Nits worth holding. One noted coverage gap (`lesson-rule.md`'s own outbound links unswept by the resolver) is already recorded as a limitation in `implementation/report.md`; manual verification shows both links resolve.
