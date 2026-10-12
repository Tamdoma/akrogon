# Review A: main-step-rules

Base: 013f7c3. Reviewed head: d637cf4. Diff: 4 files, +11/-8, prose only.

## Evidence

- `git diff 013f7c3...HEAD`: only `docs/guide/chart.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `skills/init-akrogon/SKILL.md`. Criterion 7 satisfied: no command code, tests, issue-kind, state/readiness fields, seed-issue text, or scheduling changes.
- `checks.format`, `checks.typecheck`, `checks.test` all green at implement end (843 pass / 0 fail on d637cf4); no code changed since — report evidence stands.
- Mechanism checks: `src/phase.ts:206-224` closes `privateSources`/`remaining` unions at completion, so withholding an identity from `sources` genuinely prevents auto-close; `closeSources` is `src/pull.ts:180`; `readRepo` reads `issues/config.yaml` at the registered root (src/config.ts:~215), so "verified through `akrogon config` at the registered root" is the right verification surface. All claims in the new prose trace to real code.
- Stale-surface grep: no unedited doc or skill contradicts the new rules; `shapes.md` :92 ("Ruling work out...") covers excluded work only and does not collide with the waiting-step record; setup guide carries no competing `test_changed` definition.

## Per-criterion judgment

1. shapes.md `## Off route` comment states never-recorded + door makes and verifies during the pass; SKILL.md `## Handoff` repeats the door duty. Satisfied.
2. shapes.md completion-owner paragraph carries the stated exception: withheld from `sources` of every leaf whose completion could close it, stays open under `akrogon pull`, door makes/verifies then `akrogon close <id> --by <text>` naming what delivered it; SKILL.md :35 names the same exception from the close path. Satisfied.
3. CHART.md template gained `## Pending steps` with exact edit, owner, prerequisite leaf, check; covered for unsourced charts by the "waiting main step" record. Satisfied.
4. init-akrogon proposal paragraph states repo-owned entry point first, runner command otherwise, no migration of stored entries, wrapping stays. Satisfied.
5. init-akrogon :82 defines verified `test_changed` as a real run seeing a changed test selected and run, or the full suite; clean exit does not count. Satisfied.
6. chart.md :128 covers criteria 1-3 in guide language without disturbing the delivered/duplicate close rule or the undelivered-full-match exception. Satisfied.
7. Diff scope as listed above. Satisfied.

## Findings

None at Fix level. No Nits worth deferring: the prose is single-home, cites live interfaces (`akrogon close`, `akrogon pull`, `akrogon config`), and the `## Pending steps` template section adds no code or parsing burden.

Doc-behavior check: the changed docs describe existing behavior only (`akrogon close`, sources-union closing, `akrogon config`); no documented behavior changed beyond the intended rules.

## Verdict

ready
