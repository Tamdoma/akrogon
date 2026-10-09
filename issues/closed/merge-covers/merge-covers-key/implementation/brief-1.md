# Brief U1: config schema, validation, output, tests

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/merge-covers-key-u1`

## 1. Goal

Add optional `merge_covers` to repo config so merge can skip covered checks. Implements plan D1, D2, D3, D4 and the U1 part of D7. Covers acceptance A1, A3, A5 output part.

Binding facts: `merge_covers` is a list of `checks` names, default `[]`. Config load refuses an unknown name and refuses non-empty covers with empty `merge_checks`, naming repo and bad value. `withSetup` passes covers through unwrapped. The key appears in `akrogon config` output.

## 2. Numbered acceptance criteria

1. A repo config without `merge_covers` loads with covers `[]` and `akrogon config` prints `merge_covers: []`.
2. A repo config with `merge_covers: [known-check]` and non-empty `merge_checks` loads and the key appears in `akrogon config` output with that value.
3. A `merge_covers` name that is not a `checks` key fails config load. Stderr names the repo and the bad name.
4. Non-empty `merge_covers` with empty or missing `merge_checks` fails config load. Stderr names the repo and the covers value.
5. With `setup` set, printed `checks` and `merge_checks` are wrapped but printed `merge_covers` is unchanged.

Test rules: extend `tests/config.test.ts`, add no new test file. New tests need no cited source. Change no existing expectation. Show one deliberate break per new behavior: break the default and the refine separately, show red, restore, show green.

## 3. Read-first list

- `src/config.ts` lines 38-70 and 165-180 and 231-280
- `src/init.ts`
- `tests/config.test.ts` the `merge_checks separately` test as the pattern to copy
- `tests/helpers.ts` `fixture`, `cli`, `yaml`
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

Open the index only for a gap in this list.

## 4. Change list and needed interfaces

Owns: `src/config.ts`, `src/init.ts`, `tests/config.test.ts`. Must land first: none. Shared test resource: none. Uses isolated fixtures.

Changes:

- `src/config.ts`: add `merge_covers: z.array(text).default([])` after `merge_checks`. Add `superRefine` on `repoSchema`: one issue per unknown cover name, message naming that name with path `merge_covers`; one issue when covers non-empty and `merge_checks` has zero keys, message naming the covers value. In `readRepo`, catch the parse error and rethrow with prefix `repo <name>:` keeping the bad value and the original error as cause.
- `src/init.ts`: compute root and repo name before parsing the proposal. Catch the parse error and rethrow with prefix `repo <name>:` the same way.
- `tests/config.test.ts`: add cases proving criteria 1-5 above through the `cli` `config` command and `Bun.YAML.parse` of stdout.

Interfaces: `repoSchema` is `z.strictObject`, `text` is `z.string().min(1)`. `readRepo(name, path)` returns `{name, root, config}`. `withSetup(config)` spreads config and maps only `checks`, `merge_checks`, `advisory`. `effectiveConfig` spreads `withSetup(repoConfig)` into YAML output.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/merge-issue/SKILL.md`, `docs/guide/*`, or `skills/init-akrogon/SKILL.md`. Reason: owned by U2 and U3, and shared edits break the cherry-pick. Exception: none.
- Do not wrap `merge_covers` in `withSetup`. Reason: it holds names, not commands, and wrapping would corrupt them. Exception: none.
- Do not change check ordering, parallel runs, or check-issue and implement-issue behavior. Reason: locked exclusion. Exception: none.
- Do not change scope or an interface on a conflict. Return a mismatch with evidence instead. Exception: a revised brief from A authorizing that change.

Reasons restated: disjoint ownership keeps the wave clean, names must stay unwrapped to stay valid, locked exclusions stay locked, and scope changes need a revised brief.

## 6. Ordered steps

1. In `tests/config.test.ts`, add failing tests for criteria 1-5. Run the changed-test command, show red.
2. In `src/config.ts`, add the field and refine and the `readRepo` wrap. Run the changed-test command, show green for criteria 1-4.
3. In `src/init.ts`, reorder root and repo name before parse and add the wrap. Run the changed-test command, show green.
4. Deliberate breaks: set the default to `["test"]`, show the default test red, restore and show green. Disable the refine, show criteria 3-4 tests red, restore and show green. Paste both red and green outputs.
5. Commit only the three owned files.

Advisory size: 3 files, under 12 turns.

## 7. Commands

Run only this changed-test command. Install deps first with `bun install` in the worktree. A runs criterion proof and every `checks` command separately.

```sh
export AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

Done when criteria 1-5 pass, both deliberate breaks showed red then green, and only the three owned files changed.

The commit message ends with a `Test-Change:` trailer for the changed test file in the final trailer block, one line naming what was added and that no existing expectation changed, citing no source.

Return the commit ID, pasted red and green outputs, and the four lines below.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
