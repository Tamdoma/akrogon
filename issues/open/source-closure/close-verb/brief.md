# Brief: close-verb

## What
Add `akrogon close <owner/repo#n> --by <text>`: close one GitHub issue that no leaf owns, posting the comment `delivered by <text>` through the existing `closeSource` logic. The chart-issues door, at open, names every mirrored identity it skips as already charted but still open on GitHub, and runs this command for identities recorded as delivered or duplicate. `akrogon pull` is unchanged.

## Why
A report filed after its fix merged, or a duplicate of another identity, is in no leaf's `sources`, so nothing ever closes it. Pull re-mirrors it on every run and the door skips it silently. Tamdoma/akrogon#21 sat open two days this way and had to be closed by hand.

## Done-criteria
1. `src/akrogon.ts` dispatches `close` with exactly one positional matching `sourcePattern` from `src/state.ts` and a required `--by` option; a missing or blank (whitespace-only) `--by`, a second positional, or an invalid identity fails before any `gh` call with an error naming the problem.
2. `src/pull.ts` exports a close function that reuses the existing view, idempotent close, retry and comment-existence logic of `closeSource` for the comment `delivered by <text>` verbatim; an already CLOSED issue is a no-op success; no worktree or leaf is required; `closeSources` and `completeOwner` behavior is unchanged.
3. The command runs from the registered repo root resolved as other commands do, and a `gh` failure surfaces the identity, argv, cwd and response, matching the existing `SourceError` and `CommandError` context.
4. `tests/pull.test.ts` (or a sibling test using `tests/fake-gh.ts`) covers: open issue closed with the exact comment; already CLOSED issue makes no close call; first close failing then comment already present closes without a second comment; blank `--by`, invalid identity and extra positional rejected with no `gh` call.
5. `tests/command-reference.test.ts` `contracts` gains `close: '<owner/repo#n> --by <text>'`, README.md's command table gains the matching row, and the usage string in `src/akrogon.ts` lists `close`; the reference tests pass.
6. `skills/chart-issues/SKILL.md` Open section: the dedup sentence is followed by prose that, at open, names each skipped GitHub identity still open on GitHub and offers `akrogon close <owner/repo#n> --by <text>`, and that runs it for an identity recorded in Off route as delivered or duplicate, passing what delivered it (leaf slug and commit, or the other identity). `docs/guide/chart.md` gains one sentence saying the door closes such reports with this command. `src/AREA.md` Commands list mentions the verb.
7. No new field, file format or config key; pull, next, phase and status unchanged; `bun test`, `bun run typecheck` and `bun run format` pass.

Credentials: none. `gh` is already authenticated for the existing close path.
