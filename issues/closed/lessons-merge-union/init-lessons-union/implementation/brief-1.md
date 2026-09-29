# Brief-1: init appends LESSONS.md union rule + tests

## 1. Goal

`akrogon init` appends `learnings/LESSONS.md merge=union` to the repo-root `.gitattributes` idempotently, with tests proving bytes, git attribute, and real rebase behavior. Plan D1-D7.

## 2. Numbered acceptance criteria

- B1-C1: Init on a fixture with no `.gitattributes` creates it with exactly `learnings/LESSONS.md merge=union\n`, and `git check-attr merge -- learnings/LESSONS.md` in the fixture prints `union`.
- B1-C2: Init on a fixture whose `.gitattributes` is `* text=auto eol=lf` with no trailing newline yields `* text=auto eol=lf\nlearnings/LESSONS.md merge=union\n`. A second init leaves the file byte-identical.
- B1-C3: Init writes no `learnings/LESSONS.md` rule to the file at `git rev-parse --git-path info/attributes`.
- B1-C4: Rebase test uses the fixture's bare `origin` and a second clone. After init's tracked attributes and lesson scaffold are committed and pushed, both sides append a different lesson line. From a clean worktree, `git pull --rebase origin main` exits 0 and the resulting lesson file contains both additions. Then conflicting replacements of the same existing line in another tracked file on the two sides, push the remote side, run the pull again from a clean worktree: exits non-zero and `git diff --name-only --diff-filter=U` names that unrelated file. Setup commands asserted, fixture cleaned even on failure.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/init-lessons-union-u1/src/init.ts` (copy the `.gitignore` append block as the pattern)
- `/home/ivan/Work/infra/akrogon/issues/worktrees/init-lessons-union-u1/tests/init.test.ts`
- `/home/ivan/Work/infra/akrogon/issues/worktrees/init-lessons-union-u1/tests/helpers.ts` (`fixture()` gives bare origin at `<home>/remote.git`, `main` branch, test user; `cli(f, ['init'])` runs real CLI)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Open `docs/reference-index.md` only if this list has a gap.

Pattern to copy (existing `.gitignore` block in `src/init.ts`, inside `initialize`): read `prior` or `''`, filter additions by `!prior.split('\n').includes(line)`, write `prior + (prior !== '' && !prior.endsWith('\n') ? '\n' : '') + additions.join('\n') + '\n'` only when additions are non-empty.

## 4. Change list and needed interfaces

Files owned by this unit: `src/init.ts`, `tests/init.test.ts`. No prerequisites must land first. No shared test resource. No consumed output from another worker.

- `src/init.ts`, `initialize()` only, after the `.gitignore` block, before the global config write: read `<root>/.gitattributes` or `''`; literal line `learnings/LESSONS.md merge=union`; exact-line presence check `prior.split('\n').includes(line)`; when missing write `prior + (prior !== '' && !prior.endsWith('\n') ? '\n' : '') + line + '\n'`; when present skip the write entirely (byte-identical repeat). No new helper, no mode flag, no read or write of `.git/info/attributes`.
- `tests/init.test.ts`: add tests for B1-C1 (bytes + `git check-attr`), B1-C2 (no-trailing-newline + repeat identical), B1-C3 (no local rule via `git rev-parse --git-path info/attributes`), B1-C4 (two-clone rebase + negative conflict leg). Follow existing style: `fixture()` + `try/finally f.clean()`, real `cli` + real `git` via `command()`.
- Needed signatures: `initialize(cwd: string, proposal: string | undefined, toolkit: string | undefined): Promise<void>`; `fixture(): Promise<Fixture>`; `cli(f, args, cwd?): Promise<Result>`; `command(args: string[], cwd: string): Promise<string>` (throws on non-zero; for the negative leg use `Bun.spawn` directly or catch the throw and assert on it — check how other tests assert non-zero git, e.g. via `cli` returning `code`).

## 5. Do-not, reasons and exceptions

- Do not touch `issues/log.jsonl` merging: status reads the log by line order; out of scope.
- Do not touch gacp, sync, or anything under `issues/`: locked exclusions.
- Do not write `.git/info/attributes`: the design requires tracked rule only, no hidden per-clone override.
- Do not add a helper with a mode flag: reuse the inline append pattern; keeps the diff minimal.
- Do not edit docs (`skills/`, `docs/`): owned by the docs worker.
- Mismatch rule: return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.
- Restated: exclusions above protect locked scope and parallel ownership; the only way past one is a revised brief from B.

## 6. Ordered steps

1. `tests/init.test.ts` B1-C1/B1-C2/B1-C3: write the three tests first, run them, show red (rule missing).
2. `src/init.ts` B1-C1/B1-C2/B1-C3: add the inline append per section 4, rerun, show green.
3. `tests/init.test.ts` B1-C4: write the rebase test (positive union leg then negative unrelated-conflict leg), run, show green (red-first is impractical for the rebase leg since it verifies git behavior enabled by the new code; the B1-C1 red covers fail-first).
4. Run the changed-test command from section 7.

Advisory size: about 2 files and under 8 turns.

## 7. Commands

```sh
AKROGON_BASE=53508e807128de2a77b22cf4874e266224cf4f0e bun test --changed="$AKROGON_BASE"
```

Run from the worker worktree. Only this command, not the full suite.

## 8. Done-when, evidence and report

Done when B1-C1 through B1-C4 pass via real CLI and real git, and the section 7 command passes. Paste command results. Tests use temporary repositories and real processes; no real panes, install roots, GitHub, or herdr socket.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
