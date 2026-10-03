# Brief 1: Test-Change citation guard and `--check` on `akrogon phase`

## 1. Goal

`akrogon phase` refuses a move when the leaf branch changed an existing test file and no commit on the branch cites it with a `Test-Change:` trailer; `--check` runs a move's guards without recording or moving. Plan decisions D1-D7, D9.

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/test-change-check-u1`

## 2. Numbered acceptance criteria

Behavior, proven by CLI tests in `tests/phase.test.ts` (temporary-repo fixtures, real `git` subprocesses via `cli`/`fixture`/`command`, following the existing `handoff to review refuses a dirty worktree` test at :197):

1. A branch modifying an old file matching the path rule (status `M`, `D` or `T` in `git diff --no-renames --name-status origin/main...HEAD`) with no matching trailer is refused on `implement -> check.review --slot A`: non-zero exit, stderr names each uncited file and shows the exact line `Test-Change: <path> <source and reason>`, that it goes in the commit message's final trailer block, and that a later empty commit may carry it; `state.yaml` bytes unchanged.
2. Same branch with a matching trailer moves (`moved check.review`). Add-only test files and a diff touching only non-matching paths move without any trailer.
3. Refused: a trailer naming a different path; a trailer `Test-Change: <path>` with no text after it. Renamed test file: needs a trailer for its OLD path. A trailer on a later `git commit --allow-empty` commit satisfies the check. Operator recovery `failed -> implement` (no `--slot`, state has `failure.cause: blocked` and `worktree`) runs the same check and is refused without a trailer.
4. `--check` prints `ok`, exits 0, and leaves `state.yaml` bytes, `git rev-parse HEAD` and issue folders unchanged when the move would be accepted; fails with the move's error and the same unchanged assertions when refused; `--check` with destination `failed` is refused even with `--reason`; a leaf in phase `merged` under `--check` leaves `completeOwner` untouched (no `issues/open -> issues/closed` rename); `--check` on a dirty worktree fails `Uncommitted work`.
5. `tests/command-reference.test.ts` `contracts.phase` updated to `<slug> <phase> --slot <A|B> [--verdict <verdict>] [--reason <text>] [--check]`.
6. `bun test tests/phase.test.ts tests/command-reference.test.ts` green.

## 3. Read-first list

- `src/phase.ts` whole file; especially `transition` (:181), the `requireNoIssueFiles` call (:220), `requireNoIssueFiles` (:264) as guard shape, `phaseCommand` (:280), `completeOwner` (:132), the `completeOwner` call inside `phaseCommand` (:292).
- `src/akrogon.ts` `phase` options (:14) and dispatch (:51).
- `src/config.ts:144` `target(repo)`; `src/shell.ts` `command` signature; `src/state.ts` `failureSchema` (:11) and `worktree` field (:52); `src/routing.ts` for legal moves.
- `tests/phase.test.ts` :197-228 (worktree fixture pattern), :270 `snapshot`, imports :1-16; `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `yaml`).
- `tests/command-reference.test.ts` `contracts` (:11).
- Ponytail: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/test-files.ts` (new), `src/phase.ts`, `src/akrogon.ts`, `tests/phase.test.ts`, `tests/command-reference.test.ts`. No prerequisite units; no shared test resource beyond your own temp fixtures.

`src/test-files.ts`: `export function testFile(path: string): boolean`, case-sensitive. True when any `/`-separated segment is one of `test tests __tests__ fixture fixtures __fixtures__ __snapshots__ e2e spec specs testdata golden goldens`, or the basename matches `*.test.*`, `*.spec.*`, `*.e2e.*`, `*_test.*`, or `*.snap`. Glob semantics: leading/trailing `*` may match the empty string, so `foo.test` and `.test.ts` do NOT match `*.test.*` while `x.test.ts` does — use regexes like `/^.*\.test\..+$/` (needs a char after the dot-run) or equivalent; `*.snap` is `endsWith('.snap')`.

`src/phase.ts`: new `requireTestChangeCitations(repo: Repo, worktree: string): Promise<void>` next to `requireNoIssueFiles`. Old files: `git diff --no-renames --name-status ${target(repo)}...HEAD` in the worktree; keep lines whose status is `M`, `D` or `T`; parse `<status>\t<path>` splitting on the first tab, same quoting assumptions as `requireNoIssueFiles`. Citations: `git log --format='%(trailers:key=Test-Change,valueonly,unfold)' ${target(repo)}..HEAD` in the worktree; each non-empty output line is one value; a file is cited only when a value's first whitespace-separated token equals its exact path AND the trimmed remainder is non-empty. Refusal: one error listing every uncited file plus the instruction text from criterion 1. Call it from `transition` right after the `requireNoIssueFiles` call under its own `state.worktree !== undefined` guard, so it runs on every non-`failed` move including recovery out of `failed` and never on `-> failed`.

`--check`: `transition` gains a trailing `checkOnly: boolean` param. With `checkOnly` and `requested === 'failed'` throw a refusal; otherwise run the existing validations in the current order and, where a real move would call `saveState`/`commitMove` (before the `recorded` const), `console.log('ok')` and return. `phaseCommand` gains a trailing `rawCheck` param: parse as optional boolean; when `--check` is set, skip the `if (leaf.state.phase === 'merged') await completeOwner(...)` recovery so check-only never moves folders or closes sources, then pass the flag into `transition`.

`src/akrogon.ts`: add `check: { type: 'boolean' }` to the `phase` options record and pass `values.check` to `phaseCommand`.

Fixture pattern for the guard tests (per criterion): in `f.root` write e.g. `tests/x.test.ts`, commit, `git push origin HEAD:main` so the file is old at `origin/main`; `git worktree add -b <branch> <path>` from `f.root`; `leaf(f, slug, 'implement', { worktree: <path> })`; commit the change in the worktree; trailer commits use a body paragraph, e.g. `git commit -m "fix\n\nTest-Change: tests/x.test.ts <reason>"` (two `-m` args also works). For `T` status replace the file with a symlink (`ln -s`) or chmod. For recovery use `leaf(f, slug, 'failed', { worktree, failure: { cause: 'blocked', phase: 'implement', slot: 'A', reason: 'x' } })` matching `failureSchema`. Assertions: exit code, `stderr` substrings for the named file and the trailer line, `bytes(path)` unchanged, `moved <phase>` or `readState` for acceptance — no prose-wording assertions (lesson 2026-10-01).

## 5. Do-not, reasons and exceptions

- Do not add a second copy of the guards for `--check`; reuse the same code path so check-only can never drift from a real move.
- Do not touch `issues/`, `.env`, docs, README, or any skill file — owned by sibling units.
- Do not test prose or error wording beyond the fixed strings the criterion names (file path, `Test-Change: <path> <source and reason>`, `ok`, `Uncommitted work`); wording assertions couple tests to text (lesson 2026-10-01).
- Do not rename files in `tests/` helpers or refactor `transition` beyond the listed edits.
- Exceptions: none. A conflicting requirement returns a mismatch to A.

Restating: the above exclusions matter because sibling units own the prose and a duplicated guard would silently diverge; the exception is a mismatch return, not self-scope-expansion.

## 6. Ordered steps

1. Write the failing scenario tests for criteria 1-4 (may be one test for the move matrix and one for `--check`; keep the matrix explicit per criterion).
2. `src/test-files.ts`, then `src/phase.ts` guard + `--check` path, then `src/akrogon.ts` option.
3. Update `contracts.phase` in `tests/command-reference.test.ts` (criterion 5).
4. Run tests until green (see §7).
5. Commit. Any commit touching `tests/phase.test.ts` or `tests/command-reference.test.ts` ends with a final trailer block `Test-Change: tests/phase.test.ts new coverage added by this leaf's plan; no existing expectation changed` (plus the same line for `tests/command-reference.test.ts` when that commit touches it). Prefer one tests commit carrying both lines. The code-only commit needs no trailer.

## 7. Commands

`bun test --changed=a97d4a11eae4bbc4f1d460eb5fa6a343ef895552 --timeout=30000` (the leaf's resolved changed-tests command with supplied `AKROGON_BASE`), run from the worktree root. During development `bun test tests/phase.test.ts tests/command-reference.test.ts` is the fast loop.

## 8. Done-when, evidence and report

Every criterion in §2 has a passing test; both commands in §7 pass with pasted output. Report links each criterion to its test.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
