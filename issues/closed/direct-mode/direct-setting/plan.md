# Plan: direct-setting

Debate: no. This plan is synthesized directly from brief.md and design.md.

## Decisions

- D1. Add one entry to `repoSchema` in `src/config.ts`: `direct: z.boolean().default(false)`. Put it next to `rebuttal`, the other boolean. `effectiveConfig` already spreads the parsed repo config into its output (`src/config.ts` `...withSetup(repoConfig)`), and `repo: none` parses `{ grounding: 'none' }` through the same schema. So `akrogon config` prints `direct` in every case with no other code change.
- D2. Invalid values are rejected by the existing strict zod parse. A probe confirmed that an uncaught `ZodError` prints `"path": ["<key>"]` to stderr and exits non-zero. Criterion 3 asserts on exit code and `direct` in stderr, the same way the existing `max_active` check works.
- D3. Tests write raw YAML text to `issues/config.yaml` (`direct: yes`, `direct: 1`), not the `yaml()` helper. This tests what an operator actually types. A probe confirmed Bun.YAML (YAML 1.2) parses `yes` as the string `"yes"` and `1` as the number 1, so both reach zod as non-booleans.
- D4. All tests go in one new `test(...)` in `tests/config.test.ts`. It uses the `fixture()`/`cli()` helpers from `tests/helpers.ts` and covers true, absent, outside-repo (`repo: none` prints `direct: false`) and the two invalid values. "Every other command parses the config as before" is proved by running `akrogon status` (a second command that reads repo config) with `direct: true` and expecting exit 0.
- D5. Docs: one bullet in `docs/guide/setup.md` in the "Check these choices" list, after **rebuttal**. It names the default and says the setting is offer-only: when true, the chart door may offer the direct route at the handoff review, and the operator still chooses per chart.
- D6. Out of scope under the locked design: no command reads `direct`, nothing is added at machine level, this repo's `issues/config.yaml` is not changed, and `skills/init-akrogon/SKILL.md` is not changed (see Limitations).

## Read first

- docs/reference-index.md, src/AREA.md, tests/AREA.md
- learnings/LESSONS.md (line 21: assert refusal and side effect, not prose wording)
- src/config.ts:38-60 (`repoSchema`), src/config.ts `effectiveConfig`
- tests/config.test.ts:8-66 (default and invalid-key patterns), tests/helpers.ts (`fixture`, `cli`)
- docs/guide/setup.md:45-60

## Interface

Key `direct`, boolean, default `false`, under the repo's `issues/config.yaml`. The parsed config prints it as `direct: true|false`. Leaf direct-route reads this exact name.

## Checklist

### Wave 1

- U1 schema and test
  - Owns: src/config.ts, tests/config.test.ts
  - Shared test resource: none (isolated temp fixture per test)
  - Depends on: none
  - Steps: add D1 entry. Add the D4 test.
- U2 operator guide
  - Owns: docs/guide/setup.md
  - Shared test resource: none
  - Depends on: none
  - Steps: add the D5 bullet.

Docs affected: docs/guide/setup.md only (U2). No agent doc is changed.

## Done-criteria proofs

| # | Proof | Catches | Size | Rerun when |
|---|-------|---------|------|------------|
| 1 | New test in `bun test tests/config.test.ts`: `direct: true` in config. `akrogon config` exits 0 and parsed stdout has `direct: true`. `akrogon status` exits 0. | Schema rejects the key (strict object) or the value is not printed | seconds | src/config.ts or the test changes |
| 2 | Same test: config without `direct` prints `direct: false`, both inside the repo and from `f.home` (`repo: none`) | Missing default, or the key is absent from output | seconds | same |
| 3 | Same test: raw `direct: yes` and `direct: 1` each make `akrogon config` exit non-zero, with `direct` in stderr | Loose type (string/number accepted or coerced) | seconds | same |
| 4 | `grep -n 'direct' docs/guide/setup.md` shows one bullet naming default false and offer-only/operator-chooses. `bun test tests/docs-links.test.ts` passes. | Missing or broken doc entry | seconds | setup.md changes |
| break | Delete the `direct` line from `repoSchema` and rerun the test: criteria 1 and 2 go red. Restore it. Record the result in the implement report. | A test that passes without the feature | seconds | test changes |

Repo checks: `bun run format`, `bun run typecheck`, and `test_changed` against `AKROGON_BASE`. The brief names no whole-suite run, so none is added.

## Credentials

The design names none. `akrogon status direct-setting` shows no `Missing:` lines.

## Limitations

- `skills/init-akrogon/SKILL.md:24-36` lists every repo key with defaults for new repos, but design.md does not assign this file to the leaf. Without an edit, init proposals leave out `direct`. They still parse, because the default applies. Report it in the implement known-limitations for chart follow-up. Do not edit it here.
- YAML 1.2 parses `True`/`TRUE` as booleans, so those are accepted. Only `yes`, `1` and other non-booleans fail, which matches criterion 3.
