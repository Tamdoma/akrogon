# Brief 1: direct guard script

## 1. Goal

Plan D1, D2 (criterion 5). Add `skills/chart-issues/scripts/direct-guards.ts`, which runs the four existing exported phase
guards from `src/phase.ts` against a direct-route worktree, so the chart door applies the lifecycle's guard definitions
instead of restating them.

## 2. Numbered acceptance criteria

1. `bun skills/chart-issues/scripts/direct-guards.ts <worktree> <repo-key> <chart-folder>` exits non-zero, with stderr
   containing the guard's own message, when the worktree:
   a. has uncommitted work → `Uncommitted work`
   b. has a committed file under `issues/` on the branch vs `<remote>/<default_branch>` → `Issue files on leaf branch`
   c. modifies an existing test file (exists on `origin/main`) without a `Test-Change:` trailer → `Changed test files need a citation`
   d. has no changes vs `origin/main` → `Empty leaf branch`
2. It exits 0 on a clean, cited, non-empty code-only branch.
3. Each refusal is shown red once by deliberately removing that guard's call from the script; record each break and
   restore in your report (test output with the break, then green after restore).

Tests: one CLI-boundary test per refusal and one passing case, new file `tests/direct-guards.test.ts`. No other tests.

## 3. Read-first list

- `src/phase.ts:270-375` (call order lines 275-278 and the four exported guards)
- `src/config.ts:160-225` (`readGlobal`, `readRepo`, `target`; `globalHome()` reads `AKROGON_HOME`)
- `src/test-files.ts` (which paths count as tests)
- `tests/helpers.ts` (`fixture()` makes a registered repo `repo` with origin pushed; `AKROGON_HOME=f.home`)
- `tests/phase.test.ts:204-235` (how guard refusal scenarios set up a worktree)
- `tests/chart-usage.test.ts` (pattern for spawning a skill script from a test)
- `skills/chart-issues/scripts/chart-usage.ts` header (shebang, imports style)
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owned paths: `skills/chart-issues/scripts/direct-guards.ts` (new), `tests/direct-guards.test.ts` (new). Must land first:
nothing. Shared test resource: none (each test creates its own `fixture()`).

Script shape (D1, D2):
- `#!/usr/bin/env bun`. Parse `process.argv.slice(2)` with `z.tuple([z.string(), z.string(), z.string()])` into
  `[worktree, key, chartFolder]`.
- `const global: GlobalConfig = readGlobal();` look up `global.repos[key]`; if undefined throw
  `new Error(\`Unknown repo key: ${key}\`)`; `const repo: Repo = readRepo(key, path)`.
- Await in this order, default `from`/`to`: `requireClean(worktree)`, `requireNoIssueFiles(repo, worktree, chartFolder)`,
  `requireTestChangeCitations(repo, worktree)`, `requireNonEmpty(repo, worktree)`.
- On success `console.log('direct guards passed')`.
- No try/catch: an uncaught error makes bun print the message on stderr and exit non-zero, as `akrogon phase` does.
- Strict types on every variable (repo style). Import types from `../../../src/config` as needed.

Test shape: per case `const f = await fixture()`, `git worktree add -b <slug> <f.home>/wt` from `f.root`, mutate, spawn
`[process.execPath, script, wt, 'repo', <f.home>/chart]` with `env: { ...process.env, AKROGON_HOME: f.home }`, assert exit
code and stderr substring, `f.clean()` in finally. For case c, first commit and push a test file such as
`tests/a.test.ts` on `f.root` main (`git push origin HEAD:main`) before adding the worktree, then modify it on the branch.
The passing case: modify that test file with a commit whose message ends with `Test-Change: tests/a.test.ts reason here`
plus a code file change. Note `f.root` has an uncommitted `issues/config.yaml`; that is the root checkout, not the
worktree, so it does not affect the guards.

## 5. Do-not, reasons and exceptions

- Do not edit `src/phase.ts` or any src file: the design says the guards are imported unchanged. Exception: none.
- Do not add try/catch or a custom error printer: the error must be the guard's own. Exception: none.
- Do not assert on prose beyond the guard's error prefix: lessons show wording assertions couple tests to prose.
- Do not touch skill markdown: another worker owns it.
- A mismatch with the plan goes back to A with evidence; exception: a revised brief from A.

Reasons and exceptions restated: src stays unchanged, errors stay the guard's own, assertions stay on refusal reasons,
markdown belongs to other units; only a revised brief from A changes scope.

## 6. Ordered steps

1. Write `tests/direct-guards.test.ts` (criteria 1, 2); run it, red because the script is missing.
2. Write `skills/chart-issues/scripts/direct-guards.ts`; run tests green.
3. For each guard call, remove it, rerun the test file, observe the matching case red, restore (criterion 3).
4. `bun run format` on your files, `bun run typecheck`, commit as one commit (new files only, no trailer needed).

Advisory size: 2 files, under 12 turns.

## 7. Commands

`AKROGON_BASE=d17029e2b0a8c369ee366a91bf12346141fc508a bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

All five cases pass, four breaks recorded red then green, typecheck green, one commit on the detached worktree with its
SHA returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
