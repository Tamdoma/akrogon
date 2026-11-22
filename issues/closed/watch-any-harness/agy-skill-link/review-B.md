# Slot B review

- Phase `check.review`, 2026-11-20.
- Base `4defba1e7d8ef20df3b2ce6b039fd598b33ea0fc`.
- Reviewed head `7c6ab78339102109625966100b2c0454bc6ae6cf`.
- Verdict `nits`. No blocking findings.

## Findings

- Nit: `tests/install.test.ts:96` still says “all four absent harness roots” in the test title. The test now loops over five and explicitly verifies agy's path. This only mislabels the test in runner output. It would block if a required root were missing from the assertions or skipped by the runner.

## Behavior and evidence

- C1: `install()` sends the new root through the shared planner, which enumerates the current source's skill directories. `applySkillLinks()` creates parents and keeps existing matching links. The checkout case checks every skill and compares link targets after a repeat install. The release case checks the link through `current` and resolves it into the installed release.
- C2: The same root list feeds stale scanning, ownership checks and destination planning. Install tests cover the old-release and dangling-owned links, retained real and foreign entries, repointing and both conflict kinds at the literal agy root. They verify that a conflict leaves the other roots and command link untouched. Deploy calls the same planner with the new release as its skill list and refuses conflicts before applying the plan. Deploy and rollback tests include the agy root.
- Checked the live agy global skills folder read-only. It contains eight existing links from other tools. Chart proof P3 records agy loading a symlinked skill from that folder. This review ran no live agy session, used no credentials, and made no paid or live launches.

| Evidence read with `akrogon log` | Result |
| --- | --- |
| `check c1-install: 0 implementation/check-c1-install-1795182884550-3409261.log` | 33 passed on reviewed head. The planned C2 install proof invokes the same `bun test tests/install.test.ts`. Its different `--name` changes the log label only. Both proof sets ran. |
| `check c2-deploy: 0 implementation/check-c2-deploy-1795182894785-3412309.log` | 23 passed on reviewed head. |
| `check c1-install: 1 implementation/check-c1-install-1795182729571-3230820.log` and `check c2-deploy: 1 implementation/check-c2-deploy-1795182753982-3248137.log` | The deliberate removal of the agy root caused eight install and six deploy/rollback failures. |
| Leaf verify receipt `634e195d-214a-4542-97c1-4a5543698f78` in `issues/verify-runs.jsonl` | Receipt head and tree match. Format, typecheck and test exited 0. The test log `implementation/check-test-1795183252230-168530.log` shows 1,233 passed, zero failed. |

The focused green logs postdate the test and fixture commit and include the planned cases without filters. The earlier configured test failure and the later full-test failures had differing names outside the changed install and deploy surfaces. The same full test command subsequently passed, followed by a complete green `akrogon verify` on the unchanged head. The rejected known-red attempt supplies no coverage for this verdict. Reused the current green evidence without rerunning checks. `git diff --check` passed.

## Documentation

`docs/start/install.md:72` lists the five roots and is linked from `docs/README.md` and `docs/start/why-it-works.md`. The release reference still describes the shared `current` links and deploy conflict ordering accurately. No AREA or lesson files changed.

## Test-Change trailers

Both trailers are in `8a0d6692`. Both paths match the `tests` segment rule in `src/test-files.ts`.

- `Test-Change: tests/install.test.ts leaf agy-skill-link criterion 1+2: assert the agy destination and extend every per-root case to it` matches the brief's two criteria. The file keeps the original cases and adds coverage for the new destination and old-release pruning.
- `Test-Change: tests/deploy-fixture.ts leaf agy-skill-link: shared roots constant gains .gemini/config/skills so deploy/rollback cases assert it` matches the brief's deploy requirement and plan D3. It extends the fixture to the new destination while retaining the previous roots.
