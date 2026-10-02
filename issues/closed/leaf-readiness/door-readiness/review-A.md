# Review A: door-readiness

Base: `7c1567dbed492608e8cc104999c401b85d6db408`
Reviewed head: `c34f0354d5203c99f2366a184c7943aabebcf925` (commits `578e4fb`, `d338c7f`, `c34f035`)

## Verification evidence

- `git status --porcelain` clean; reviewed head is ahead of base by the three listed commits only; diff touches exactly `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `tests/chart-shapes.test.ts` — the plan's owned surfaces, nothing else.
- Full suite on lane before handoff: `bun test --timeout=30000` → 385 pass / 0 fail (11.6s); `bun run typecheck` clean; `bun run format` clean.
- Live probe of the documented presence check (verbatim command from SKILL.md, run at the akrogon root): scratch draft folder with `readiness.yaml` declaring env `REVIEW_MISSING_TOKEN`, `holder: akrogon` → `[{"kind":"env","name":"REVIEW_MISSING_TOKEN","holder":"akrogon","steps":"get it"}]`. Names only, no values. Confirms the Handoff command works as written against real config.
- `grep -n 'keys, logins\|handoff batch\|every brief lists' skills/chart-issues/SKILL.md` → no matches (old credential list replaced, not kept).
- New test: `bun test tests/chart-shapes.test.ts --timeout=30000` → 2 pass; extraction is fail-on-missing, `gaps` result asserted with `toEqual` against parsed fields.
- Report's criterion-4 sweep hits verified spot-checked: `docs/guide/chart.md:199`, `docs/guide/limits.md:42`, `skills/AREA.md:24` all read and correctly classified out of scope.

## Criteria check

1. **Met.** `### readiness.yaml` example parses `readinessSchema` (verified live and by the test); all five top-level arrays non-empty; `inputs` covers `env`+`file`; `grants[0].fixtures` non-empty; test proves draft-folder `gaps(readGlobal(), readReadiness(<draft>))` with no `state.yaml` → `[]`, then exactly `EXAMPLE_API_TOKEN` after removal.
2. **Met.** Preflight paragraph states `readiness.yaml` is written with brief.md and design.md before `state.yaml`, and `akrogon status` parses it / fails validation otherwise.
3. **Met.** Five Taken rules present once each in occurrence order (key-sheet → key-creation → live-change-grant → proof-fixtures → save-route), credential list replaced; Handoff gains grant confirmation + verbatim presence check. Live-verified the command.
4. **Met.** Report maps each changed sentence to its binding decision and lists every sweep hit with verdict.

## Doc inspection

`docs/guide/chart.md` describes handoff at behavior level; the new contract mechanics are door-internal, no claim on the page is now wrong. No documented behavior changed outside the two edited files. No `AREA.md` in the diff, so no path listing needed.

## Findings

No Fixes.

One judgment note, not a Nit worth recording against the leaf: the literal `bun -e` presence check lives in Handoff while the Take key-sheet paragraph references "checks presence on each draft `readiness.yaml`" without naming the command — a reader finds the command one section later; content is present and correctly placed where it executes, so no defect.

## Verdict

ready
