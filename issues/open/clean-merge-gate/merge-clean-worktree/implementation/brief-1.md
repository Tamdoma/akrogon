# Sub-brief 1: merge-dispatch empty-folder tests (fail-first)

## 1. Goal

Write the tests proving plan done-criteria 1–4 for `merge-clean-worktree`: before every merge prompt (applied `top` and `solo` forms) the command removes the holder worktree's empty untracked folders, never a file, never ignored paths, in every worktree state, and a failed removal stops the prompt. Plan reference: `issues/open/clean-merge-gate/merge-clean-worktree/plan.md` checklist U1.

**These tests must FAIL now.** The implementation (unit 3) does not exist yet. The expected red is on the removal assertions (folders still present, prompt still sent despite the blocked removal), never on the merge prompt itself — in T1/T2 the merge prompt is already sent correctly today. If a new test fails for any other reason (no prompt, wrong form, error paths unrelated to removal), return a mismatch with the output instead of shipping it.

## 2. Numbered acceptance criteria

1. T1 (criteria 1+2, applied top form): a holder worktree with empty untracked folders at the root, inside a tracked folder, and `untracked-parent/empty-child/` beside a file, plus ignored content, is prompted `merge-issue … attempt=<id> top=<sha>` with the empty folders gone and every file, ignored path, tracked content and the `.env` symlink byte-identical.
2. T2 (criterion 1, solo form): a solo holder with `solempty/` and `up/empty-child/` beside untracked `up/keep.txt` gets a prompt containing `solo` with the empty folders gone and `up/keep.txt` present.
3. T3 (criterion 3): the existing test `a dirty holder worktree drops the batch to solo and restores carried members` also plants `empty-dirty/` and asserts it is gone while the uncommitted file stays byte-identical; existing expectations unchanged.
4. T4 (criterion 4): a removal failure (`chmodSync` the parent of an empty dir to `0o555`, so `git status` reads fine but `rmSync` fails EACCES) makes `next --all` exit 1, stderr names the folder path, no merge prompt is recorded, and the folder still exists. Restore the mode to `0o755` in a nested `finally` before `f.clean()`.
5. One commit touching `tests/batch-dispatch.test.ts` whose message ends with a `Test-Change:` trailer (see §8).

## 3. Read-first

- `tests/batch-dispatch.test.ts` — copy its style exactly: `dispatchFixture`, `allocatedLeaf`, `toMerge`, `expectedPrompt`, `mergePrompts`, `head`, `commitFile`, `idleAll`. The dirty-holder test to extend is near the bottom (`drops the batch to solo`).
- `tests/helpers.ts` — fixture repo layout: initial `.gitignore` is `.env\n`; `cli`/`leaf`/`fakeHerdr`.
- `issues/open/clean-merge-gate/merge-clean-worktree/plan.md` — D2 semantics and the checklist.
- `src/test-files.ts` — the path rule driving the trailer.
- This skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

- Owns: `tests/batch-dispatch.test.ts` only. No other file may change.
- No prerequisite units; no shared test resource (each test builds its own `dispatchFixture`).
- Add `mkdirSync` to the existing `node:fs` import if needed.
- Key mechanics to use: `commitFile(f, leafPath, name, content)` writes+adds+commits one file in the holder worktree (create parent dirs with `mkdirSync` first); `z.string().parse(readState(path).worktree)` gives the worktree path; planting untracked non-ignored files makes `git status --porcelain` non-empty which drops a NON-solo holder to `solo` — so T1 may only plant empty dirs and IGNORED files; untracked `keep.txt` belongs in T2 (solo).
- T1 `.gitignore`: write `.env\n.temp/\nnode_modules/\nign.txt\ntd/ige/\n` to the worktree `.gitignore` and commit it on the holder branch (keeps `.env` ignored; `linkEnv` already linked `.env` at allocation). Plant: `e1/`; `td/` with committed `td/keep` plus empty `td/e2/` and empty ignored `td/ige/`; `up/empty-child/` plus ignored `up/ign.txt` (keeps `up/` alive and status clean); `.temp/out` file; `node_modules/` with a file. Then `toMerge` + `next --all` and assert: prompt equals `expectedPrompt`; `e1`, `td/e2`, `up/empty-child` gone; `up/ign.txt`, `.temp/out`, the node_modules file, `td/ige`, `td/keep`, `.env` symlink all present with planted contents byte-identical.
- T2: `toMerge(path, stamp, { solo: true })`; plant `solempty/`, `up/empty-child/` + untracked `up/keep.txt`, `.temp/x` ignored file; assert removals, `keep.txt` content, and prompt text contains `solo`.
- T4: plant `lp/child/` empty, `chmodSync(lp, 0o555)`; run `next --all`; assert `code === 1`, `stderr` contains the `lp/child` path, `mergePrompts` empty, `existsSync(lp/child)`; `finally` restores `chmodSync(lp, 0o755)` inside the test before `f.clean()`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/` — implementation belongs to a later unit; shipping green tests now defeats the fail-first evidence (criterion 1 demands "shown failing before the change").
- Do not change or delete existing tests or expectations except extending the named dirty-holder test with planted dir + assertions; the review rule allows only additions there.
- Do not add fixture helpers, new test files, or `.gitignore` changes in `tests/helpers.ts`; everything stays in `batch-dispatch.test.ts`.
- Do not weaken any criterion (e.g. asserting only exit code in T4, or skipping byte-content compares in T1).
- Return a mismatch with evidence instead of changing scope or the file-ownership boundary; the exception is a revised brief from A authorizing that change.

Reasons restated: fail-first proof is a done-criterion; the single-file boundary keeps cherry-pick clean; weakened assertions hide the regression this leaf exists to kill. Exceptions: none without a revised brief.

## 6. Ordered steps

1. Read the files in §3. (≤4 turns)
2. Write T1, T2, T4 and the T3 extension in `tests/batch-dispatch.test.ts`. (≤8 turns)
3. Run the §7 commands; record that the new/changed tests fail on the removal assertions and the rest of the file is green. (≤3 turns)
4. Commit with the §8 trailer; fill the report.

Advisory: 1 file, under 20 turns.

## 7. Commands

```sh
bun install
AKROGON_BASE=1d7d536100aebc183bd22f63b7c3ba31d5d07ea5 sh -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'
```

To observe the fail-first state directly:

```sh
bun test tests/batch-dispatch.test.ts --timeout=30000
```

## 8. Done-when, evidence and report

Done when the four test additions exist, the file's pre-existing tests still pass, the new removal assertions fail (recorded verbatim), and one commit lands with a message whose final trailer block carries `Test-Change: tests/batch-dispatch.test.ts <what was added; no existing expectation changed>` — new cases cite no source per the trailer rule; the T3 extension names the added assertion and states no existing expectation changed.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
