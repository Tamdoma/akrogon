# Implementation report: dead-fields

Commit: `093ee084d4652925f3acc723379ba9e05d117723`.
Base: `2a759dd9daf3c8f917b5723eabfd50bbca5f670e`.

## Changes

Removed top-level priority and slot from canonical state, dispatch writes, normal test fixtures and chart creation guidance. The YAML reader discards exactly those legacy keys before strict parsing. Reading remains read-only, and a normal save writes canonical state. No status implementation change was needed because detail already serializes the reader's result.

Eight changed files: src/state.ts, src/next.ts, tests/helpers.ts, tests/state.test.ts, tests/next.test.ts, tests/status.test.ts, skills/chart-issues/SKILL.md and skills/chart-issues/assets/shapes.md. No branch changes under issues/ or unrelated formatting changes.

## Verification

- **V1 — Fail first.** Configured changed tests before implementation: exit 1, 58 passed and 14 failed. `/tmp/akrogon-dead-fields-evidence/worker-red.txt`.
- **V2 — Changed tests.** `export AKROGON_BASE=2a759dd9daf3c8f917b5723eabfd50bbca5f670e` followed by `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"`: exit 0, 155 passed, 0 failed, 1478 assertions. `/tmp/akrogon-dead-fields-evidence/worker-green.txt`. This artifact includes real next/status CLI subprocess scenarios in isolated repositories with fake Herdr. It supplies the fixture CLI evidence without an unnecessary repeat run.
- **V3 — Full suite.** `bun test`: exit 0, 160 passed, 0 failed, 1506 assertions across 11 files. `/tmp/akrogon-dead-fields-evidence/full-suite.txt`.
- **V4 — Other gates.** `bun run format` and `bun run typecheck`: both exit 0. `/tmp/akrogon-dead-fields-evidence/format.txt` and `/tmp/akrogon-dead-fields-evidence/typecheck.txt`. Final `git diff --check` passed.
- **V5 — Registered repository CLI.** From the worktree, `bun src/akrogon.ts status` and `bun src/akrogon.ts status dead-fields`: both exit 0. `/tmp/akrogon-dead-fields-evidence/status.txt` and `/tmp/akrogon-dead-fields-evidence/detail.txt`. The detail state omits both fields and history retains its log slot. `/tmp/akrogon-dead-fields-evidence/detail-before.txt` records both state fields before implementation.
- **V6 — Scope and acceptance.** C1–C6 verified. Tests cover canonical states, direct schema rejection, either/both legacy fields with arbitrary values, open/closed/parked fixture paths, read-only reads, stable saves, per-seat preservation, unknown keys, invalid values, duplicate done slots and non-object YAML. Raw saved YAML proves dispatch cannot reintroduce the keys. Remaining priority references in owned code are migration code and tests. Remaining slot references serve lifecycle CLI/prompts, seat configuration/maps, logs/verdicts or migration tests. Worktree was clean after commit.

## Known limitations

- **R1 — Deferred disk cleanup.** Untouched state files retain retired keys until normal writes. No bulk migration was performed.
- **R2 — Documentation outside ownership.** docs/state.html and docs/create.html retain old example fields, and docs/next.html retains priority metadata wording. These explicitly excluded pages remain unchanged.

Unverified criteria: none within the accepted scope. The plan's D5 records the conflict between literal zero-hit grep and required migration references, and between the older bulk-rewrite resolution and the explicit lazy-migration architecture.
