# Review A: direct-setting

Base: f57bb356c149ed6b9d87a5e122a79d1b54de15ad. Reviewed head: 17f7a0e (8622ffe, 17f7a0e). Worktree clean.

## Verification
- Diff: src/config.ts +1 (`direct: z.boolean().default(false)` in `repoSchema`), tests/config.test.ts +23 (one new test), docs/guide/setup.md +1. All three are owned paths from design.md. No command reads `direct` (D6 holds).
- Live probe on the reviewed head. `bun src/akrogon.ts config` in this worktree (registered repo akrogon, no key) prints `direct: false` and `repo: akrogon`. The same command run from an empty temp dir prints `direct: false` and `repo: none`.
- Probe from planning: Bun.YAML parses `yes` as a string and `1` as a number, so both reach zod as non-booleans. An uncaught ZodError prints `"path": ["<key>"]` to stderr.
- report.md: format 0, typecheck 0, changed tests 427/0, full `bun test` 534/0. I did not rerun them because no code changed after those runs.
- Criteria: 1 (true is printed and `status` exits 0), 2 (default false inside and outside a repo) and 3 (yes and 1 rejected with `direct` in stderr) are all covered by `config prints direct, defaults it to false, and rejects non-boolean values` at the CLI boundary. Criterion 4: the setup.md bullet names default false and offer-only, operator chooses.
- Deliberate break: report.md records the worker's red run at `expect(direct.code).toBe(0)` with the schema line removed.
- Test-Change trailer on 8622ffe says a case was added and no existing expectation changed. The diff confirms it is add-only.
- Docs: docs/guide/setup.md is the page describing repo keys and is updated. No AREA.md is in the diff. No other documented behavior changed.

## Findings
- N1 (Nit). skills/init-akrogon/SKILL.md:24-36 proposes every repo key with defaults and does not mention `direct`. The design excludes that file, and the impact today is low. `akrogon init` writes the parsed config through `writeRepoConfig` (src/init.ts:6-8,46), so new repos still get `direct: false` written. It would become a Fix if a chart required init proposals to surface the key to the operator.
- N2 (Nit). The criterion 3 assertion `stderr toContain('direct')` passes with or without the schema line, because a strict-object unknown-key error also names `direct`. The rejection itself is still proved by the non-zero exit, and criteria 1-2 carry the break proof. It would become a Fix if a non-boolean value could be accepted while the test stays green. The current `z.boolean()` cannot do that.
- Observation (no finding): `akrogon init` now writes `direct: false` into a newly initialized `issues/config.yaml`, the same as every other default. This is consistent with existing behavior.

## Verdict
nits
