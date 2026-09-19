# Brief 1: grounding schema and init refusal

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/docs-impact-rule

## 1. Goal

Make `grounding` explicit in persisted repo config and make `akrogon init` refuse a declared index that is not a readable non-empty file. Plan decisions D1, D2, D3, D4, D6.

## 2. Acceptance criteria

1. `repoSchema` has no `.default('none')` on `grounding`; a persisted `issues/config.yaml` without `grounding` fails to parse; explicit `grounding: none` parses.
2. `effectiveConfig` for an unregistered directory still prints, with `grounding: none` in the output.
3. `initialize` with a declared `grounding.index` reads `resolve(root, index)`; a missing path, a directory, an unreadable file or empty/whitespace-only contents each throw `Error('Grounding index is not a readable non-empty file: <resolved path>. Complete setup with the init-issues skill.')` before `writeRepoConfig`, any mkdir, `.gitignore` edit or global registration. Filesystem errors rethrow with the original error as `cause`.
4. `initialize` with no proposal and no existing config parses `{ grounding: 'none' }` so bare `akrogon init` still succeeds and persists `grounding: none` explicitly.
5. New tests: init refuses missing index, directory at index path, empty index; after each refusal `issues/config.yaml`, `issues/open`, `learnings`, `.gitignore` and the global `config.yaml` are byte-identical to before; init succeeds with a non-empty index; repeat init with a valid declared index and with explicit `none` succeeds and preserves choices; persisted config without grounding fails to parse; explicit `none` parses.
6. Every existing fixture/proposal write that must keep parsing gains `grounding: 'none'` (see change list); deliberate negatives stay grounding-less.

## 3. Read-first

- `src/init.ts`, `src/config.ts` (the files you change)
- `tests/helpers.ts` (`fixture`, `cli`, `yaml` helpers; line 22 writes the fixture repo config)
- `tests/init.test.ts`, `tests/config.test.ts` (patterns to copy)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `src/config.ts`: remove `.default('none')` from the `grounding` union (keep `z.literal('none')` and the object with optional `index`). In `effectiveConfig` (~line 123) change `repoSchema.parse({})` to `repoSchema.parse({ grounding: 'none' })`.
- `src/init.ts`: add `checkGrounding(root: string, config: RepoConfig): void` called after `repoSchema.parse` and before `writeRepoConfig`. When `config.grounding !== 'none' && config.grounding.index !== undefined`, `readFileSync(resolve(root, config.grounding.index), 'utf8')`; catch filesystem errors and rethrow the message above with `{ cause }`; `contents.trim() === ''` throws the same message without a cause. Change the no-proposal/no-existing-config branch's parse input from `{}` to `{ grounding: 'none' }`. `readFileSync` and `resolve` are already imported.
- `tests/helpers.ts:22`: `yaml(..., { checks: { test: 'bun test' }, grounding: 'none' })`.
- `tests/config.test.ts`: add `grounding: 'none'` to the writes at lines 10, 19, 50, 52; extend the unregistered-directory assertion (~line 35) with `grounding: 'none'`; add a case where a persisted config without `grounding` makes `akrogon config` fail and one where explicit `none` parses.
- `tests/init.test.ts`: add `grounding: 'none'` to the positive proposals (`{checks, implement}` at line 10, `{worktree_root}` at lines 44 and 76). The `{scripts_dir: 'retired'}` proposal at line 33 stays grounding-less (negative). Add the refusal/success tests from criterion 5.
- `tests/next.test.ts:667,1367`, `tests/phase.test.ts:83,230,241,886,895,1040`, `tests/pull.test.ts:171`, `tests/sync.test.ts:42`: add `grounding: 'none'` to each `issues/config.yaml` write.
- `tests/status.test.ts:247`: untouched; those writes are deliberately malformed.

## 5. Do-not, reasons and exceptions

- Do not create a new module for `checkGrounding`; the design requires one small function in `src/init.ts`.
- Do not add an unreadable-file (chmod) test; readability is proven by the read and chmod depends on runner privileges.
- Do not touch `grounding.docs`, `surfaces`, `indexed_scopes`; no consumer exists.
- Do not change `src/akrogon.ts`, routing, or any skill/doc file; prose is a separate unit.
- Do not weaken or delete existing tests; a conflict is a mismatch returned to B with evidence, not a scope change. Exception: a revised brief from B authorizing the change.

Reasons restated: the design locks module placement, test scope and exclusions; only B may revise them.

## 6. Ordered steps

1. Write the new tests in `tests/init.test.ts` and `tests/config.test.ts` plus the `grounding: 'none'` fixture edits (criteria 5, 6). Run the changed-tests command; the new init refusal tests and the config omission test must be red.
2. Edit `src/config.ts` (criterion 1, 2) and `src/init.ts` (criteria 3, 4). Rerun the changed-tests command; all green.

Advisory size: about 9 files, under 40 turns.

## 7. Commands

```sh
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

with `AKROGON_BASE=f537143aeb0b126fb5d71a89120cb7c52eade382`.

## 8. Done-when, evidence and report

All criteria green under the changed-tests command, with pasted output. Scenarios use the existing temp-repo fixtures; no real panes, install roots or network.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
