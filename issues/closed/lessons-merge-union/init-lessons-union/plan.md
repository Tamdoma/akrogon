# Plan: init-lessons-union

Direct synthesis (debate: no). Source: brief.md + design.md + live checkout.

## Decisions

- D1: Append the attribute inline in `initialize` reusing the `.gitignore` pattern (`src/init.ts:50-59`): read existing file or `''`, exact-line check, separator newline, append. No new helper, no mode flag.
- D2: Literal line is `learnings/LESSONS.md merge=union`. Presence check is `prior.split('\n').includes(line)` (exact match), not substring or trimmed match.
- D3: Missing trailing newline: write `prior + '\n' + line + '\n'`. Present or empty prior: write `prior + line + '\n'` (empty prior is `line + '\n'`).
- D4: Create `<root>/.gitattributes` when absent with exactly `learnings/LESSONS.md merge=union\n`. Preserve every existing byte otherwise.
- D5: Write nothing to `.git/info/attributes`. No read of it either.
- D6: Second init is byte-identical: when the exact line is present, skip the write entirely.
- D7: Tests live in `tests/init.test.ts` using real CLI (`cli(f, ['init'])`) and real git. Rebase test builds on `fixture()` bare `origin`: commit init output, clone a second worktree via `git clone`, append different lesson lines on both sides, `git pull --rebase origin main` from clean state. Negative leg reuses the same two clones with a conflicting edit to one other tracked file.
- D8: Docs: one-line-class edits only. `skills/init-akrogon/SKILL.md` extends the command-owns sentence; `docs/guide/setup.md` extends the writes sentence. Both name the LESSONS.md merge attribute among init writes.

## Read-first

- `docs/reference-index.md`
- `src/AREA.md`
- `tests/AREA.md`
- `src/init.ts`
- `tests/init.test.ts`
- `tests/helpers.ts`
- `skills/init-akrogon/SKILL.md`
- `docs/guide/setup.md`
- `learnings/LESSONS.md`

## Needed interfaces

- `initialize(cwd, proposal, toolkit)` in `src/init.ts`: owns the new append, after the `.gitignore` block, before global config write.
- `fixture()`, `cli(f, args, cwd)` in `tests/helpers.ts`: isolated repo with bare `origin` at `<home>/remote.git`, `main` branch, test user config.
- Git surface in tests: `git check-attr merge -- learnings/LESSONS.md`, `git rev-parse --git-path info/attributes`, `git pull --rebase origin main`, `git diff --name-only --diff-filter=U`.

## Acceptance criteria

- C1: Init on fixture with no `.gitattributes` creates it with exactly `learnings/LESSONS.md merge=union\n`; `git check-attr merge -- learnings/LESSONS.md` prints `union`.
- C2: Init on fixture whose `.gitattributes` is `* text=auto eol=lf` without trailing newline yields `* text=auto eol=lf\nlearnings/LESSONS.md merge=union\n`; second init leaves bytes identical.
- C3: Init writes no `learnings/LESSONS.md` rule to `git rev-parse --git-path info/attributes`.
- C4: Rebase test: after committing init output and pushing, both sides append different lesson lines; clean `git pull --rebase origin main` exits 0 and the lesson file contains both. Then conflicting replacements of the same line in another tracked file: pull exits non-zero and `diff --name-only --diff-filter=U` names that file. Setup commands asserted, fixture cleaned on failure.
- C5: Both skill and setup docs list the merge attribute among the command's writes.
- C6: `bun run format`, `bun run typecheck`, `bun test` pass; report records saved `bun test tests/init.test.ts` output path.

## Checklist

1. `src/init.ts` — append `.gitattributes` rule per D1-D6. Covers C1, C2, C3.
2. `tests/init.test.ts` — add missing-file + `check-attr` test (C1), no-trailing-newline + idempotency test (C2), no-local-rule test (C3), two-clone rebase + negative-conflict test (C4).
3. `skills/init-akrogon/SKILL.md` — name the attribute among command writes (C5, agent doc).
4. `docs/guide/setup.md` — name the attribute among command writes (C5, human doc).
5. Run verification below (C6).

Agent/human docs affected: `skills/init-akrogon/SKILL.md` one-line write-list update; `docs/guide/setup.md` one-line write-list update. No AREA.md change: no new commands, files, or patterns.

## Verification

```sh
bun run format
bun run typecheck
bun test tests/init.test.ts 2>&1 | tee /tmp/init-lessons-union-init-test.log
bun test
```

Record `/tmp/init-lessons-union-init-test.log` (or actual saved path) as the artifact in the implementation report.

## Credentials

None. Design states no auth, secrets, backend, or browser flow is touched. No env check required.

## Open limitation

Union merge silently retains both sides on overlapping edits to the same lesson line and on delete-vs-edit (accepted per design Q5 5a; next prune removes leftovers). Not fixed here.

## Dependencies

None.

## Notes for review

- None: brief and design agree.
