# Implementation report: remove-plan-debate

Base `6939013807f1ec1f32c664520426157dbc99e525`. Committed head `1deb1fb0d750e3f21154697743aa797ff15dd79d`. The refresh (`git fetch origin`, `git rebase origin/main`) left the branch unchanged. `origin/main` is still the base, so no refresh moved the branch.

Mode: delegated, one wave of three units (U1 `src/`, U2 skills, U3 docs). Workers ran in `remove-plan-debate-u1..u3`. Their commits were cherry-picked serially and the worktrees were removed.

## Commits

| Commit | What |
| --- | --- |
| `55d3ee1d` | Criterion tests `tests/retired-debate.test.ts` (plan.synthesis) |
| `a170a2ad` | D7 test ports by A, 13 `Test-Change` trailers (see plan.md Implementation notes) |
| `d28340f0` | U1: command code (worker `c18602d7`) |
| `37445655` | U2: skills (worker `c3f386ae`) |
| `68e5d2ea` | U3: docs (worker `cea3a497`) |
| `1deb1fb0` | A: chart-issues direct-refusal line still said "asks the lifecycle questions as today", which meant the debate question. It now says the handoff goes to the lifecycle. |

## Changed files and reasons

- `src/routing.ts` (D1): retired phases leave `phaseSchema`, `routing` and `failed.next`. Added `retiredPhaseSchema`, `historicalPhaseSchema`, `HistoricalPhase` and `historicalSlots` (retired phases count as A+B).
- `src/log.ts`, `src/timing.ts`, and `src/state.ts` `failureSchema.phase` (D2): history schemas accept retired phases.
- `src/config.ts`, `src/init.ts` (D3): `withoutKey` and `parseRepoConfig` strip a legacy `rebuttal` key before the strict parse. `repoSchema` has no `rebuttal`.
- `src/state.ts` (D3): `stateSchema` has no `debate`. `readState` strips a legacy `debate` key before the strict parse.
- `src/timing-report.ts` (D6): `Visit.phase` is `HistoricalPhase` and gaps use `historicalSlots`.
- `src/phase.ts`, `src/next.ts` (D5): the rebuttal-config and skipped-debate guards are deleted.
- Skills (D8): `plan-issue`, `check-issue`, `chart-issues` (`SKILL.md` and `assets/shapes.md`), `init-akrogon`, `watch-issues`.
- Docs (D9): `docs/reference/{state-and-phases,config,skills,files,limits}.md`, `docs/use/{plan-work,quick-fix,write-issues-by-hand,a-working-day,roll-back-a-release}.md`, `docs/start/one-change.md`, `docs/examples/autopilot-story.md` and `docs/pictures/phases.svg`. U3 checked `phases.svg` with `xmllint --noout` and rendered it with `rsvg-convert`.
- Tests (D7, A): `debate: 'no'` was removed from fixtures. Cases that relied on retired phases moved to live phases, and the debate-dispatch refusal test was deleted because its behavior is removed.

## Proofs (all on `1deb1fb0` unless noted)

| Criterion | Command | Result |
| --- | --- | --- |
| 1-4 legacy loads, history, refusals | `bun test tests/retired-debate.test.ts` | `check proof-criteria: 0 .../check-proof-criteria-1792913196896-999514.log` (6 pass) |
| 1-4 ported behavior | `bun test tests/phase.test.ts tests/next.test.ts tests/state.test.ts tests/state-inventory.test.ts tests/timing-report.test.ts tests/batch.test.ts tests/leaf-stop.test.ts tests/pause-next.test.ts tests/release-any-phase.test.ts tests/session-routing.test.ts tests/init.test.ts tests/config.test.ts tests/watch-issues-scripts.test.ts` | `check proof-ports: 0 .../check-proof-ports-1792913272684-999977.log` (504 pass) |
| Dispatch concurrency kept | `bun test tests/next.test.ts -t "next creates one worktree/tab under concurrent hooks"` | `check proof-concurrent: 0 .../check-proof-concurrent-1792913273927-1273742.log` |
| Frozen-test record kept | `bun test tests/phase.test.ts -t frozen` | `check proof-frozen: 0 .../check-proof-frozen-1792913275126-1274753.log` (6 pass) |
| 5-6 skills and docs tests | `bun test tests/docs-links.test.ts tests/chart-shapes.test.ts tests/command-reference.test.ts tests/hold-retired.test.ts tests/run-units.test.ts tests/log-reader.test.ts` | `check proof-docs: 0 .../check-proof-docs-1792913283554-1277073.log` (37 pass) |
| Types | `bun run typecheck` | `check proof-typecheck: 0 .../check-proof-typecheck-1792913285695-1279396.log` |
| All checks | `akrogon verify` | `verify leaf 1deb1fb0...: green`, test 1167 pass (`check-test-1792913487203-1279718.log`), typecheck (`check-typecheck-1792913489423-1279718.log`), format (`check-format-1792913294543-1279718.log`). Wall time 3m17s. |

Landing runs after each cherry-pick:

- `check land-u1: 0 .../check-land-u1-1792913165857-710749.log` (517 pass)
- `check land-u2: 0 .../check-land-u2-1792913178754-995000.log` (27 pass)
- `check land-u3: 0 .../check-land-u3-1792913179266-997722.log` (18 pass)

Worker returns: U1 had typecheck, format, criteria (6 pass) and ports (511 pass) green on `c18602d7`. U2 and U3 test runs were red only because `src` still required `debate`. They are green after U1 landed (land-u2, land-u3 above).

Residual grep on head (`debate|plan\.positions|plan\.rebuttal|positions-|rebuttal`):

- docs: only the charting rebuttal (`docs/examples/quick-fix-story.md:26`, `docs/pictures/chart-door.svg:51,58`) and the new rollback note.
- skills: only the charting peer exchange (`skills/chart-issues/SKILL.md:55`).
- src: only the legacy strip calls and the retired-phase history enum.

Red evidence for the criterion tests is in plan.md.

## Known limitations

- Rollback: older releases require `debate` in `state.yaml`. Records saved by this release need `debate: 'no'` restored before a rollback (documented in `docs/use/roll-back-a-release.md`).
- A stray leaf record still at `plan.positions` or `plan.rebuttal` fails as unreadable. There is no read-time mapping (design Q2 2a).
- akrogon's own `issues/config.yaml` keeps `rebuttal: true`. It loads because of the strip (D4). `issues/` is not edited on the branch.

## Unverified criteria

- Criteria 5 and 6 (skill and doc wording) are covered by the tests above and the residual grep. Whether the prose is right is judged by review.
