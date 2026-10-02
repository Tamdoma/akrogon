# Brief 3: chart-shapes.test.ts

## 1. Goal

Implement plan decision D7: new test file `tests/chart-shapes.test.ts` proving the `readiness.yaml` example in `shapes.md` parses with `readinessSchema`, and proving `gaps`/`readReadiness` work on a draft leaf folder with no `state.yaml`.

## 2. Acceptance criteria (from done-criterion 1)

1. The test extracts the ` ```yaml ` block under the `### readiness.yaml` heading in `skills/chart-issues/assets/shapes.md` and parses it with `readinessSchema` from `src/readiness.ts`; it fails when the block is missing or does not parse.
2. The same test writes the example into a temp draft folder with no `state.yaml`, removes one declared env name from a scratch holder, and gets exactly that name back from `gaps(readGlobal(), readReadiness(<draft folder>))`.

## 3. Read-first list

- `tests/readiness.test.ts` — copy its imports, `fixture`/`yaml` usage and `global(f)` pattern.
- `src/readiness.ts` — `readinessSchema`, `readReadiness`, `gaps`; `gaps` resolves `holder` via `holderRoot` (registered `repos` key or absolute path).
- `src/config.ts` — `globalHome()` returns `resolve(process.env.AKROGON_HOME ?? toolRoot)`; `readGlobal()` parses `<globalHome>/config.yaml`.
- `tests/helpers.ts` — `fixture()` returns `{home, root, clean}` and writes `home/config.yaml` with `repos: {repo: root}`.
- `skills/chart-issues/assets/shapes.md` — the landed `### readiness.yaml` section has exactly one ` ```yaml ` block; env input name is `EXAMPLE_API_TOKEN`, file input `ca-chain.pem`, holders `repo`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

Owned: `tests/chart-shapes.test.ts` (new). Prerequisites landed: shapes.md example (commit `578e4fb`). No shared test resource.

Suggested shape (follow `tests/readiness.test.ts` style, strict types, no `any`):

```ts
import { test, expect } from 'bun:test';
// node:fs readFileSync/writeFileSync/mkdirSync, node:path resolve
// import { readGlobal } from '../src/config';
// import { gaps, readReadiness, readinessSchema, type Gap, type Readiness } from '../src/readiness';
// import { fixture, type Fixture } from './helpers';

function readinessBlock(): string {
  const md: string = readFileSync(resolve(import.meta.dir, '../skills/chart-issues/assets/shapes.md'), 'utf8');
  // locate '### readiness.yaml', then the next ```yaml ... ``` fence; fail if absent
}
```

Test 1 (`shapes.md readiness.yaml example parses against readinessSchema`): extract the block, `readinessSchema.parse(Bun.YAML.parse(block))`, expect the parse to succeed and each top-level array (`inputs`, `produces`, `grants`, `retained`, `proofs`) to be non-empty, with `inputs` covering both `env` and `file` kinds and `grants[0].fixtures` non-empty. A missing fence fails the test.

Test 2 (`draft readiness.yaml gaps without state.yaml`): inside `fixture()`, `mkdirSync` a draft folder under `f.root` (e.g. `resolve(f.root, 'issues/open/draft')` or any temp dir — but no `state.yaml`); write the extracted example verbatim as `readiness.yaml` there. In `f.root` (the `repo` holder) write `.env` containing `EXAMPLE_API_TOKEN=x` and write `ca-chain.pem` with content. Set `process.env.AKROGON_HOME = f.home` before `readGlobal()` and restore the previous value in a `finally` (capture `const prev = process.env.AKROGON_HOME`). `readReadiness(<draft>)` must return non-null (no `state.yaml` needed). `gaps(readGlobal(), readiness)` returns `[]`. Rewrite `.env` without `EXAMPLE_API_TOKEN`; result is `toEqual([{kind:'env', name:'EXAMPLE_API_TOKEN', holder:'repo', steps:<the example's steps value>}])` — compare with `toEqual` against the parsed readiness' own `inputs[0].steps` rather than a literal string. Always `f.clean()` in `finally`.

## 5. Do-not, reasons and exceptions

- Do not edit `shapes.md`, `src/`, `helpers.ts` or any other file — owned elsewhere.
- Do not hardcode placeholder values beyond the declared names; use the parsed readiness object for `steps`/`holder` so the test tracks the example.
- Do not read real `$HOME` config or a real `.env`; the test must be hermetic via `AKROGON_HOME` and the fixture — leaking real config makes the test flaky.
- Do not add more tests than criteria need — one agreement test plus the draft-gap test is the whole contract (standing design: cheapest sufficient).
- If extraction or the fixture pattern cannot satisfy a criterion, return a mismatch with evidence; the exception is a revised brief from A.

## 6. Ordered steps

1. Write the file per section 4.
2. `bun test tests/chart-shapes.test.ts --timeout=30000` → green.
3. Mutation check: delete or corrupt the ` ```yaml ` block's required field in a scratch copy (or temporarily point the test at bad content) to see it fail — or simpler, prove the negative path by a one-off `bun -e` showing parse throws on a truncated block. (Evidence of the test catching failure, not a committed extra test.)
4. Run the changed-test command from section 7.

Advisory size: 1 file, under ~8 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`

with `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408` exported. This must pick up and run the new test file.

## 8. Done-when, evidence and report

- `bun test tests/chart-shapes.test.ts` green, `--changed` run executes it, negative-path evidence shown.
- Commit the file (conventional message like `test: agree shapes.md readiness example with readiness schema`), report commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
