# Plan: close-verb

Direct synthesis from `brief.md` and `design.md` (`debate: no`). No positions or rebuttals ran.

## Read first

- This leaf's `brief.md` and `design.md` in `/home/ivan/Work/infra/akrogon/issues/open/source-closure/close-verb/`.
- `learnings/LESSONS.md`, line `2026-09-19-min1-not-nonblank`: `z.string().min(1)` accepts blank input, use `.trim().min(1)`.
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md` for area entry points.
- `src/akrogon.ts` for options table, `close` case shape, and usage string.
- `src/pull.ts` for `closeSource` view/close/retry/comment-dedup body and `closeSources`.
- `src/state.ts` for `sourcePattern`, `src/config.ts` for `requireRepo`/`currentRepo`, `src/shell.ts` for `CommandError`.
- `src/phase.ts` for `completeOwner` (must stay unchanged).
- `tests/helpers.ts`, `tests/fake-gh.ts` (stateful `view`/`close`/`api`), `tests/pull.test.ts`, `tests/phase.test.ts` (partial-close retry expectations), `tests/command-reference.test.ts`.
- `skills/chart-issues/SKILL.md` Open section, `docs/guide/chart.md`, `README.md` Command table.

Brief/design alignment: no conflict found. Design's comment-param refactor, `sourcePattern` reuse, and `.trim().min(1)` govern.

Credentials: none. `gh` uses the operator's existing login. No variable name is listed, so no `.env` presence check applies and this seat opened no env file.

Dependencies: none. No ordering beyond this leaf's own checklist.

## Decisions and interfaces

Needed interfaces (literal):

- Invocation: `akrogon close <owner/repo#n> --by <text>`.
- Identity: `sourcePattern` from `src/state.ts`, the same regex leaf `sources` use.
- `--by`: `z.string().trim().min(1)`; posted comment is `delivered by <text>` with `<text>` verbatim after trim; content otherwise unvalidated.
- New export in `src/pull.ts`: `closeCommand(source: string, by: string): Promise<void>`.
- Internal refactor: `closeSource(repo: Repo, source: string, comment: string): Promise<void>` where `comment` is the full posted text.
- Success output: one stdout line `closed <owner/repo#n> with delivered by <text>`.

D1. Dispatch `close` in `src/akrogon.ts`. Add `close` to the options table as `{ by: { type: 'string' } }`, add `case 'close'`, and add `close` to the usage string. Validate with `z.tuple([z.string().regex(sourcePattern)])` for positionals and `z.string().trim().min(1)` for `values.by`. Missing or blank `--by`, a second positional, an invalid identity, or an unknown flag fails before any `gh` call with an error naming the problem. Blank rejection follows lesson `2026-09-19-min1-not-nonblank`; probe it with a whitespace-only `--by`.

D2. Reuse the existing close body by parameterizing the comment. Change `closeSource` to accept the full `comment` string instead of `commit`; `closeSources` passes `` `merged ${commit}` `` so its output stays byte-identical, and `closeCommand` passes `` `delivered by ${by}` ``. Keep the view parse, CLOSED early return, two-attempt retry with warning, and retry comment-existence check comparing the full comment text unchanged. Reject the sibling-duplicate alternative: it copies the retry body for no behavioral gain. `closeSources` and `completeOwner` behavior is unchanged.

D3. Resolve and report like other commands. `closeCommand` runs `requireRepo(readGlobal(), process.cwd())`, calls `closeSource(repo, source, comment)` with cwd `repo.root`, then prints the D1 success line. No worktree or leaf is required. Invalid source throws the existing `SourceError`; `gh` failure propagates the existing `CommandError`/`SourceError` context (identity, argv, cwd, response). No new error type.

D4. Put verb tests in a new `tests/close.test.ts` reusing `tests/helpers.ts` (`fixture`, `cli`, `fakeGh`) and `tests/fake-gh.ts` stateful steps, not in `tests/pull.test.ts`. Pull tests stay mirror-only; the close path shares only the `gh` fake. Cover the brief criterion 4 matrix through real CLI invocations: open issue closes with the exact `delivered by <text>` comment; already CLOSED makes no close call; first close posting then failing retries, finds the exact comment on the comments listing, and closes without a second comment; blank `--by`, invalid identity, and extra positional each exit nonzero with no `.calls` file (no `gh` spawn).

D5. Wire the command reference. Add `close: '<owner/repo#n> --by <text>'` to `contracts` in `tests/command-reference.test.ts`, add the matching README row `` | `akrogon close <owner/repo#n> --by <text>` | ... | `` with a non-empty effect, and list `close` in the `src/akrogon.ts` usage string. The existing `argumentGroups` check requires the README args to equal the contract after space normalization; no `|` means no escaping.

D6. Document the door use at the locked insertion points only. In `skills/chart-issues/SKILL.md` Open section, immediately after the dedup sentence (`skip exact GitHub identities already in ...`), add prose: at open the door names each skipped GitHub identity still open on GitHub, offers `akrogon close <owner/repo#n> --by <text>` for each, and runs it during the pass for any identity the chart records as delivered or duplicate, with `<text>` naming the delivering leaf and commit or the other identity. In `docs/guide/chart.md` add one sentence saying the door closes such reports with this command. In `src/AREA.md` Commands list add one `close` line. Do not touch the installed copy under `~/.claude/skills`; `akrogon install` links it.

D7. Keep the locked exclusions. No new field, file format, or config key. No change to `pullRepo`, `closeSources`, `completeOwner`, `phase`, `next`, or `status`. No warning in pull, no chart/intake parsing by the command, no seed deletion (next pull drops the seed once GitHub reports CLOSED), no `--leaf`/`--duplicate-of`, no bulk or `--all` form, nothing under `issues/`.

## Acceptance criteria

A1. `akrogon close <owner/repo#n> --by <text>` dispatches with exactly one positional matching `sourcePattern` and a required non-blank `--by`; missing/blank `--by`, a second positional, or an invalid identity fails before any `gh` call with an error naming the problem.

A2. The exported close reuses the existing view, idempotent close, retry, and comment-existence logic for the comment `delivered by <text>` verbatim; an already CLOSED issue is a no-op success; no worktree or leaf is required; `closeSources` still posts `merged <commit>` and `completeOwner` behavior is unchanged.

A3. The command resolves the registered repo root as other commands do and runs `gh` with cwd at that root; a `gh` failure surfaces identity, argv, cwd, and response matching existing `SourceError`/`CommandError` context.

A4. `tests/close.test.ts` proves via real CLI plus fake `gh`: open issue closed with the exact comment; already CLOSED makes no close call; comment-posted/close-failed retry closes without duplicating the comment; blank `--by`, invalid identity, and extra positional are rejected with no `gh` call.

A5. `contracts` gains the `close` entry, README gains the matching row, the usage string lists `close`, and `tests/command-reference.test.ts` passes.

A6. The chart skill Open section names each skipped identity still open on GitHub, offers the verb, and runs it for delivered/duplicate records with the delivering reference; `docs/guide/chart.md` carries the one-sentence note; `src/AREA.md` mentions the verb.

A7. No new field, file format, or config key; pull, next, phase, and status unchanged; `bun test`, `bun run typecheck`, and `bun run format` pass.

Concrete scenario: a report filed after its fix merged (e.g. `Tamdoma/akrogon#21`) sits in no leaf's `sources`; the door records it as delivered by leaf `example` commit `abc123` and runs `akrogon close Tamdoma/akrogon#21 --by "leaf example (commit abc123)"`; GitHub shows CLOSED with the single comment `delivered by leaf example (commit abc123)`; the next `akrogon pull` drops its seed.

## Ordered implementation checklist

- [ ] E1. Refactor `src/pull.ts` per D2-D3 (`closeSource` takes full comment, `closeSources` passes `merged <commit>`, new `closeCommand` resolves repo, closes, prints success line). Covers A2-A3. Verify with `bun run typecheck`.
- [ ] E2. Wire `src/akrogon.ts` per D1 (options entry, `close` case, usage string). Covers A1, A3, A5 (usage part). Verify with `bun test tests/command-reference.test.ts` after E4.
- [ ] E3. Add `tests/close.test.ts` per D4 covering the A4 matrix plus the A1-A3 CLI paths (exact comment assertion, CLOSED no-close assertion, retry-dedup assertion, no-`gh`-call negative assertions). Covers A1-A4. Verify with `bun test tests/close.test.ts` and `bun test tests/phase.test.ts` (no regression in `closeSources`/`completeOwner`).
- [ ] E4. Update `tests/command-reference.test.ts` `contracts` and `README.md` command table per D5. Covers A5. Verify with `bun test tests/command-reference.test.ts`.
- [ ] E5. Update agent/human docs per D6, one line each: `skills/chart-issues/SKILL.md` Open prose after the dedup sentence; `docs/guide/chart.md` one sentence on door closure; `src/AREA.md` Commands list `close` line; `README.md` command row (done in E4). Covers A6. Verify with `bun test tests/docs-links.test.ts` and a grep that no `issues/` path changed.
- [ ] E6. Run `bun run format`, inspect `git --no-pager diff` for unrelated changes, then `bun run typecheck` and `bun test`. Covers A7. Save outputs as completion evidence per the implement skill.

Checklist order reflects shared code/fixture needs inside this leaf, not a cross-leaf dependency.

## Remaining limitations

R1. The closed issue's seed file remains until the next successful `akrogon pull`; `close` performs only the GitHub mutation and never edits `issues/seeds/`.

R2. A concurrent external close between this command's `view` and `close` can still post a comment on an issue another actor just closed; the existing retry only dedups this command's own partial comment-then-failure, not a racing closer.
