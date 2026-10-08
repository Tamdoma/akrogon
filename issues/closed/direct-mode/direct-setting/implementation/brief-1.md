# Brief 1: direct schema key and test

## 1. Goal
Add repo setting `direct` (boolean, default false) to `repoSchema` and prove it at the CLI boundary. Plan decisions D1-D4.

## 2. Numbered acceptance criteria
1. Repo `issues/config.yaml` with `direct: true`: `akrogon config` exits 0 and parsed stdout has `direct: true`. `akrogon status` also exits 0.
2. Config without `direct`: `akrogon config` prints `direct: false`, both run in the repo (`f.root`) and outside it (`f.home`, `repo: none`).
3. Raw YAML `direct: yes` and, separately, `direct: 1`: `akrogon config` exits non-zero and stderr contains `direct`.
4. Deliberate break: with the schema line removed, the new test goes red (criteria 1 and 2). Restore the line after. Report the observed red output.
One new `test(...)` proves all of them. No existing assertion changes.

## 3. Read-first list
- src/config.ts:38-60 (`repoSchema`), `effectiveConfig` in src/config.ts
- tests/config.test.ts:8-66 (pattern to copy: fixture/cli/yaml, `badRepo.stderr` check), tests/config.test.ts:306-318
- tests/helpers.ts (`fixture`, `cli`, `yaml`)
- /home/ivan/.claude/skills/implement-issue/ponytail.md

## 4. Change list and needed interfaces
- src/config.ts: in `repoSchema`, after `rebuttal: z.boolean().default(true),` add `direct: z.boolean().default(false),`. Nothing else in src.
- tests/config.test.ts: add one test, e.g. `config prints direct, defaults it to false, and rejects non-boolean values`. Write invalid values as raw text with `writeFileSync(resolve(f.root, 'issues/config.yaml'), 'grounding: none\ndirect: yes\n')`, so the test matches what an operator types. Bun.YAML parses `yes` as a string and `1` as a number.
- Owns: src/config.ts, tests/config.test.ts. Prerequisites: none. Shared test resource: none.

## 5. Do-not, reasons and exceptions
- Do not read `direct` in any command. The design says only the chart-issues skill reads it.
- Do not edit docs, skills or `issues/`. Another unit owns the docs, and issue records stay on main.
- Do not change existing tests. The plan adds a case only.
- Scope or interface conflict: return a mismatch with evidence. Exception: a revised brief from A.
Reasons and exceptions restated: commands stay unchanged per the design, docs belong to unit 2, existing expectations have no contradicting source. The only exception is a revised brief from A.

## 6. Ordered steps
1. tests/config.test.ts: write the test (criteria 1-3). Run it and see it red.
2. src/config.ts: add the line. Run it and see it green.
3. Deliberate break: remove the line, run, see red, restore (criterion 4).
4. Commit both files in one commit. End the message with the trailer:
   `Test-Change: tests/config.test.ts added direct setting config test; no existing expectation changed`
Advisory size: 2 files, under 10 turns.

## 7. Commands
`AKROGON_BASE=f57bb356c149ed6b9d87a5e122a79d1b54de15ad bun test --changed="$AKROGON_BASE" --timeout=30000`
(Run `bun install --frozen-lockfile` first if node_modules is missing.)

## 8. Done-when, evidence and report
All criteria green, the break observed red, one commit made. Return the commit ID.
Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
