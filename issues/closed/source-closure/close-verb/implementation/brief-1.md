# Brief 1: close verb core and tests

## 1. Goal

Implement `akrogon close <owner/repo#n> --by <text>` reusing the existing close body. Plan D1, D2, D3, D4. Covers acceptance A1, A2, A3, A4.

## 2. Numbered acceptance criteria

1. `akrogon close acme/project#4 --by "leaf x (commit abc)"` closes an OPEN issue through real CLI plus fake `gh`, posting exactly `delivered by leaf x (commit abc)` and printing `closed acme/project#4 with delivered by leaf x (commit abc)` on stdout with exit 0.
2. An already CLOSED issue exits 0 and makes no `close` call (only `view`).
3. First `close` posts its comment then fails; retry sees OPEN, finds the exact `delivered by` comment in the comments listing, and closes without a second `--comment`, ending CLOSED with one comment and attempts 2.
4. Blank `--by` (`"   "`), missing `--by`, invalid identity (`bad#x`), and a second positional each exit nonzero with an error naming the problem and spawn no `gh` (no `.calls` file).
5. `closeSources` still posts `merged <commit>` byte-identical; existing `tests/phase.test.ts` closure tests pass unchanged.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/close-verb/src/pull.ts` (`closeSource` lines 107-182, `closeSources`).
- `/home/ivan/Work/infra/akrogon/issues/worktrees/close-verb/src/akrogon.ts` (options table, `pull` case, usage string).
- `/home/ivan/Work/infra/akrogon/issues/worktrees/close-verb/src/state.ts` (`sourcePattern`), `src/config.ts` (`requireRepo`, `readGlobal`), `src/shell.ts` (`CommandError`).
- `/home/ivan/Work/infra/akrogon/issues/worktrees/close-verb/tests/helpers.ts` (`fixture`, `cli`, `fakeGh`), `tests/fake-gh.ts` (stateful `view`/`close`/`api`), `tests/phase.test.ts` partial-close test near line 430.
- Pattern to copy: `tests/phase.test.ts` "partial commented close success retries" with `gh.db + '.state'` plus 5 stateful steps and `.calls` argv assertions.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- `src/pull.ts`: refactor `closeSource(repo: Repo, source: string, commit: string)` to `closeSource(repo: Repo, source: string, comment: string)` where `comment` is the full posted text. Delete the internal `` `merged ${commit}` `` construction; the retry comment-existence check compares the passed `comment`. Update `closeSources` to call `closeSource(repo, source, `merged ${commit}`)`. Add `export async function closeCommand(source: string, by: string): Promise<void>` that runs `requireRepo(readGlobal(), process.cwd())`, calls `closeSource(repo, source, `delivered by ${by}`)`, then `console.log(`closed ${source} with delivered by ${by}`)`. No worktree lookup. Keep `SourceError`, view/close argv, two-attempt retry with warning, and CLOSED early return unchanged.
- `src/akrogon.ts`: import `sourcePattern` from `./state`. Options table: add `verb === 'close' ? { by: { type: 'string' } }` branch. Add `case 'close':` parsing `z.tuple([z.string().regex(sourcePattern)]).parse(positionals)` and `z.string().trim().min(1).parse(values.by)`, then `await (await import('./pull')).closeCommand(source, by)`. Add `close` to the usage string `akrogon <...|close|...>`. Validation must throw before any `gh` call.
- `tests/close.test.ts` (new): real CLI scenarios with `fixture()` plus `fakeGh(f)`. Use stateful steps for criteria 1-3 (`gh.db + '.state'` with `{state, comments, attempts}`), static `args`-matched steps where simpler. Assert stdout line, `.state` contents, and `.calls` argv. For criterion 4 assert nonzero exit, stderr names the problem, and `existsSync(gh.db + '.calls')` is false.
- Literal interfaces: identity `sourcePattern`; `--by` is `z.string().trim().min(1)` with verbatim text after trim; comment `delivered by <text>`; success line `closed <owner/repo#n> with delivered by <text>`; `gh` cwd is `repo.root`.

## 5. Do-not, reasons and exceptions

- Do not duplicate the close body as a sibling function. Reason: the plan locks comment-param reuse; a copy doubles retry drift. Exception: revised brief from B authorizing it.
- Do not change `closeSources` output, `completeOwner`, `pullRepo`, `phase`, `next`, or `status`. Reason: locked exclusions; the merged path must stay byte-identical. Exception: revised brief from B.
- Do not add `--all`, `--leaf`, `--duplicate-of`, bulk form, config keys, state fields, or anything under `issues/`. Reason: locked exclusions. Exception: revised brief from B.
- Do not edit `tests/command-reference.test.ts`, `README.md`, `skills/chart-issues/SKILL.md`, `docs/guide/chart.md`, or `src/AREA.md`. Reason: owned by brief 2. Exception: revised brief from B.
- Do not run the full suite or `typecheck`/`format` as gates here. Reason: this worker owns only the changed-test command; B runs the full suite. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.
- Restated: the exclusions above hold because the plan locks the shared close body and leaf boundaries; each lifts only on a revised brief from B.

## 6. Ordered steps

1. Write `tests/close.test.ts` criterion 1 first (OPEN closes with exact comment and stdout line). Run the changed-test command to show red (verb missing). Covers criterion 1.
2. Refactor `src/pull.ts` per section 4 (`comment` param, `closeSources` passes `merged`, new `closeCommand`). Covers criteria 1-3, 5.
3. Wire `src/akrogon.ts` per section 4 (options, case, usage, validation). Covers criterion 4 plus criterion 1 dispatch.
4. Extend `tests/close.test.ts` for criteria 2-4 (CLOSED no-close, retry dedup, four negatives with no `.calls`). Run the changed-test command to show green. Covers criteria 2-4.
5. Rerun the changed-test command after any fix. Covers criterion 5 via the changed set.

Advisory size: about 3 files and under 14 turns (at least four turns per file for read, edit, test).

## 7. Commands

Run only this, with the supplied base (B runs the full suite separately):

```sh
AKROGON_BASE=20926c68f7664015b23ea0224147f69059d5b881 bun test --changed="20926c68f7664015b23ea0224147f69059d5b881"
```

If that command reports no tests in the changed set, also run `bun test tests/close.test.ts` once as the targeted check for the new file and paste both results.

## 8. Done-when, evidence and report

Done when criteria 1-5 hold with pasted changed-test output showing the new tests passing and no `closeSources` regression in the changed set. Scenarios use temporary repos, real files and processes, and `gh` replaced at the PATH boundary only; no real GitHub, panes, install roots, or herdr socket. Tests assert the observable contract (exact comment, CLOSED skip, retry without duplicate, negative exits with no spawn), not prose or coverage.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
