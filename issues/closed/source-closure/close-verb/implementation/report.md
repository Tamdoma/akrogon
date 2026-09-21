# Implementation report: close-verb

Executed inline in this session. Config says `implement: subagents` and briefs 1-2 were written, but `subagent_spawn` failed with `model=devin/swe-2-max effort=max check=unsupported-effort`, so both units were implemented sequentially here following the briefs in order. No worker returns to fold.

## Changed files and reasons

- `src/pull.ts`: refactored `closeSource(repo, source, commit)` to `closeSource(repo, source, comment)` taking the full posted text; `closeSources` passes `` `merged ${commit}` `` (byte-identical); added `closeCommand(source, by)` resolving the repo via `requireRepo`, closing with `` `delivered by ${by}` ``, printing the success line.
- `src/akrogon.ts`: imported `sourcePattern`, added `close` options branch `{ by: { type: 'string' } }`, added `case 'close'` validating one positional plus `z.string().trim().min(1)` for `--by` before any `gh` call, added `close` to the usage string.
- `tests/close.test.ts` (new): real-CLI plus stateful fake-`gh` coverage for open-close exact comment, CLOSED no-close, retry dedup, and five negatives with no `gh` spawn.
- `tests/command-reference.test.ts`: added `close: '<owner/repo#n> --by <text>'` contract.
- `README.md`: added the matching `akrogon close` command row.
- `skills/chart-issues/SKILL.md`: Open prose after the dedup sentence naming skipped identities still open, offering the verb, running it for delivered/duplicate records.
- `docs/guide/chart.md`: one sentence on the door closing delivered-or-duplicate reports with the verb.
- `src/AREA.md`: Commands list `close` line (31 lines, four required sections intact).

## Commands run with pasted results

Base for changed tests: `AKROGON_BASE=20926c68f7664015b23ea0224147f69059d5b881`.

Red before code (`bun test tests/close.test.ts`): 1 pass, 3 fail. The three positive close tests failed with exit 1 (verb missing); the negative matrix passed.

Green after core (`bun test tests/close.test.ts`): 4 pass, 0 fail, 33 expect calls.

Changed set after core (`AKROGON_BASE=... bun test --changed="..."`): 3 changed files, 1/14 files run, 4 pass, 0 fail.

Regression (`bun test tests/phase.test.ts`): 31 pass, 0 fail, 283 expect calls. `closeSources`/`completeOwner` unchanged.

Reference (`bun test tests/command-reference.test.ts tests/docs-links.test.ts`): 7 pass, 0 fail, 978 expect calls.

Changed set after docs (`bun test --changed`): 8 changed files, 2/14 files run (`command-reference`, `close`), 8 pass, 0 fail, 1003 expect calls.

Blocking checks: `bun run format` formatted only `tests/close.test.ts`, rest unchanged; `bun run typecheck` (`tsc --noEmit`) exit 0; `bun test` full suite: 291 pass, 0 fail, 3468 expect calls across 14 files.

No `issues/` paths on the branch (`git diff --name-only -- issues` empty). No advisory checks configured. Artifact paths: briefs at `implementation/brief-1.md` and `implementation/brief-2.md` in the leaf folder; this report at `implementation/report.md`.

## Base and committed head

- Base: `20926c68f7664015b23ea0224147f69059d5b881`
- Head: `e445fd49a98e74257d4ce78d0594d2bef3491892` (`close-verb: add akrogon close verb reusing closeSource`, 8 files, +152/-8)

## Known limitations

- R1 from the plan holds: the closed issue's seed file remains until the next successful `akrogon pull`; `close` never edits `issues/seeds/`.
- R2 from the plan holds: a concurrent external close between this command's `view` and `close` can still post a comment; the retry only dedups this command's own partial comment-then-failure.
- Execution note: delegated mode was unavailable (worker effort unsupported), so verification was done inline by seat B rather than by separate workers plus B's full-suite rerun. The full suite still ran once after the final unit.

## Unverified criteria

- None. A1-A7 are covered by `tests/close.test.ts`, `tests/command-reference.test.ts`, `tests/docs-links.test.ts`, `tests/phase.test.ts` (regression), and the full `bun test` / `typecheck` / `format` runs above. No live GitHub mutation was attempted; state changes were exercised through the stateful fake-`gh` boundary per the standing design.
