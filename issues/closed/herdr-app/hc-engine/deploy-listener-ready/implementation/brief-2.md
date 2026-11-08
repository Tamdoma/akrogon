# Brief 2: config accepts `prefixes:` (U2)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/deploy-listener-ready-u2` (detached at 6d6af827). Install dependencies there first: `bun install --frozen-lockfile --backend=copyfile`.

## 1. Goal

`~/.akrogon/config.yaml` accepts an optional top-level `prefixes:` map (repo name → two lowercase letters). It is parsed and otherwise unused by this release. Plan decisions D7 and D8.

## 2. Acceptance criteria

1. A machine config with `prefixes: {repo: rp}` parses. `akrogon config` prints the same output as without it, plus the `prefixes` key. `akrogon init` rewrites the file and keeps the map. A config without the key stays without it.
2. A value that is not two lowercase letters (`RP`, `r`, `rpx`, `r1`) is refused, with stderr naming `prefixes` and the key.

The planned test is committed already. Do not write or edit it: `tests/config.test.ts`, the case "machine config accepts a prefixes map without changing commands and refuses a bad prefix naming its key". It is red now.

## 3. Read first

- `src/config.ts:9-36` (`text`, `globalSchema`), `src/config.ts:212-221` (`readGlobal`), `src/init.ts:86-90` (the init rewrite spreads the parsed global).
- Pattern: the existing optional fields in `globalSchema` and `repoSchema` (`worktree_root: text.optional()`).
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- `src/config.ts` `globalSchema`: add `prefixes: z.record(text, z.string().regex(/^[a-z]{2}$/, 'prefix must be two lowercase letters')).optional(),` after `repos`. Use `.optional()`, not `.default({})`, so init does not add `prefixes: {}` to every file (`Bun.YAML.stringify` drops `undefined` keys). Do not check the keys against `repos` and do not check uniqueness: the engine leaf owns both.
- `docs/reference/config.md` machine table (`:25-31`): add a `prefixes` row saying it maps a registered repo name to its two-lowercase-letter prefix, is optional, and is read by no command yet. Add `prefixes:` with `<repo-name>: <two letters>` to the example block below the table.

Owned paths: `src/config.ts`, `docs/reference/config.md`. Prerequisites: none. Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not edit any test. The test is the locked proof. A red or wrong test is a mismatch you return with output.
- Do not touch `src/install.ts`, `src/self-update.ts` or other docs. Another worker owns them in parallel.
- Do not make `prefixes` required, and do not use it anywhere. The engine leaf does that.

Reasons and exceptions: scope is locked by the design's identity exclusion, and the test is the plan's proof. The only exception is a revised brief from A.

## 6. Ordered steps

1. `src/config.ts` (criteria 1-2).
2. Run section 7 until green.
3. `docs/reference/config.md`.
4. `bunx prettier --check src` and `bun run typecheck` must pass.
5. Commit with message `config: accept optional prefixes map`. No co-author line and no `Test-Change` trailer.

Advisory size: 2 files, under 10 turns.

## 7. Commands

- `akrogon run-check --name u2-config -- bun test --timeout=30000 tests/config.test.ts tests/init.test.ts`
- `akrogon run-check --name u2-typecheck -- bun run typecheck`

## 8. Done-when, evidence and report

Both commands exit 0, and the commit exists. Cite each `check <label>: <exit> <path>` line. Return the commit ID and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
