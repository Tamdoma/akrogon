# Brief-1: pause state plus CLI (U1, wave 1)

## 1. Goal

Add the pause state file plus `akrogon pause` and `akrogon unpause` clear wiring. Plan D1, D2, D9 for these entries, D10, D11. Unpause here clears and prints only; U2 adds the resume pass call.

## 2. Numbered acceptance criteria

1. From repo root, a subfolder and a leaf worktree, `akrogon pause` records that repo key in `<globalHome()>/paused.yaml`, prints the repo name and a `paused` substring, and exits 0. Repeat is idempotent with the same state.
2. From the same three spots, `akrogon unpause` removes the key, prints repo name and an `unpaused` substring, exits 0. Repeat is idempotent.
3. From a folder outside every registered repo, both commands fail non-zero.
4. Missing `paused.yaml` means none paused. A file that fails YAML parse or the zod schema makes both commands fail non-zero with stderr naming the full file path, never treated as unpaused.
5. `README.md` lists `pause` and `unpause` with no args, and `tests/command-reference.test.ts` accepts them.
6. One deliberate break turns a new test red, for example removing the `requireRepo` check or the invalid-file throw.

Write the smallest CLI-boundary test set proving 1-5. Assert state files, exit codes and the `paused` or `unpaused` substring only, never exact wording. New tests need no cited source.

## 3. Read-first list

- `src/park.ts` for the `requireRepo` plus `withLock` pattern to copy.
- `src/akrogon.ts`, `src/config.ts` for `globalHome` and `requireRepo`, `src/shell.ts` for `writeYaml`, `src/state.ts` for `withLock`.
- `tests/helpers.ts` for `fixture`, `cli` and `leaf`, `tests/park.test.ts` for CLI fixture style, `tests/command-reference.test.ts` for contracts.
- `README.md` command table, `.gitignore`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

Wave 1, must land first: none. Paths owned: `src/pause.ts`, `src/akrogon.ts`, `.gitignore`, `README.md`, `tests/command-reference.test.ts`, `tests/pause.test.ts`. Shared test resource: none, isolated fixtures only. Consumed output: none.

Files and changes:

- `src/pause.ts` new: `export class PauseStateError extends Error`, `pauseFile()` returns `resolve(globalHome(), 'paused.yaml')`, `readPaused()` returns `Set<string>` with missing file as empty set and invalid YAML or zod as `PauseStateError` naming the file, `isPaused(repoName)` as plain read for use inside a held lock, `setPaused(repoName, paused)` as `withLock` plus `writeYaml` plus return of the new set. Schema is top-level `z.record(z.string().min(1), z.literal(true))`.
- `src/akrogon.ts`: add `pause` and `unpause` cases with no positionals and strict parse, `requireRepo` resolution, `setPaused` under the lock, idempotent prints, updated usage string. Unpause here is clear plus print only.
- `.gitignore`: one `paused.yaml` entry.
- `README.md`: two command rows with no args.
- `tests/command-reference.test.ts`: two contracts with empty args.
- `tests/pause.test.ts` new: criteria 1-4 plus 6.

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts` or `src/status.ts`. U2 and U3 own them, and shared edits break the wave.
- Do not add args to `pause` or `unpause`. The design forbids the repo-key arg.
- Do not store pause in `config.yaml` or `issues/config.yaml`. Both are tracked, the design forbids them.
- Do not change `park` behavior. Pause is separate.
- Do not invent the unpause resume pass here. U2 owns it.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons stay attached: wave safety, locked design, and scope control. The only exception is a revised brief from A.

## 6. Ordered steps

1. Write `tests/pause.test.ts` for criteria 1-5 first, using `fixture` plus `cli`. Cover root, subfolder, worktree, idempotent repeat, outside-repo refusal, missing file, invalid file naming the path. Run it red.
2. Add `src/pause.ts` for criteria 1, 2 and 4. Run the new tests green.
3. Wire `src/akrogon.ts` for criteria 1-3. Run the new tests green.
4. Edit `.gitignore`, `README.md` and `tests/command-reference.test.ts` for criterion 5. Run the reference test green.
5. Show criterion 6: break one guard, show red, restore green. Keep no broken code.
6. Run the brief changed-test command. Commit only owned paths.

Advisory size: about 6 files and under 24 turns.

## 7. Commands

Run only this changed-test command, with the supplied base:

`AKROGON_BASE=3e034dee43f0853446c2ba8f97bb72668ab213dc bun test --changed=3e034dee43f0853446c2ba8f97bb72668ab213dc --timeout=30000`

A runs criterion proof and every `checks` command separately.

## 8. Done-when, evidence and report

Done when criteria 1-6 pass with pasted command results, and the commit contains only owned paths. Link each criterion to its test or evidence. Name limits and unverified criteria or say none.

A worker commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file. A commit adding a case to an existing test file carries the same trailer naming what was added and that no existing expectation changed, citing no source. This unit edits `tests/command-reference.test.ts`, so its commit carries `Test-Change: tests/command-reference.test.ts added pause and unpause contracts, no existing expectation changed`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
