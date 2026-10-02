# Review A: watch-scripts-check

Base: 9fe5e822df9bd2764d4248928f8a81ea03e3162f
Reviewed head: f0f4c2f (commits d1a37f1, f0f4c2f)
Diff: `tests/watch-issues-scripts.test.ts` new (22 lines), `skills/watch-issues/package.json` test script, `tests/AREA.md` one line.

## Verification evidence (rerun at head f0f4c2f)

- `bun test --timeout=30000` — 356 pass, 0 fail, 16 files, 11.00 s. Criterion 1 proven at head.
- `bun run format` — unchanged. `bun run typecheck` — clean.
- `grep '"test": "bun test scripts"' skills/watch-issues/package.json` — match. Criterion 3.
- Criterion 2 fail-first: report.md pastes the recorded run; I reproduced it during implement (typecheck code 2, `TS2322` in failure detail, edit reverted). The failure message shape was observed live, not asserted from code reading.
- AREA.md path listing: `skills/watch-issues`, `skills/watch-issues/scripts`, `skills/watch-issues/package.json`, `skills/watch-issues/tsconfig.json` all exist; the new doc line's named file is the diff itself.
- Doc check: `skills/watch-issues/SKILL.md`, `skills/AREA.md`, README, `docs/` make no claim about the subpackage test command or suite coverage; no documented behavior contradicted.

## Findings

Nit 1: the spawned commands carry no deadline (`run(argv, cwd)` without deadlineMs). If a subpackage command hung, the outer test would still fail at the 30 s suite timeout, but the child process could outlive it. Deferred: a hang requires a new pathology in `bun test`/`tsc`, both measured ~0.5 s; the consequence today is an orphaned quick process, not a red suite. Promotion evidence: a real hang where the child survives the suite failure.

No Fix. All three done-criteria proven; diff matches plan D1-D6 and design exclusions; report complete.

## Verdict

nits
