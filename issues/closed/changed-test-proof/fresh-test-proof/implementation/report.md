# Report: fresh-test-proof

Base: `fe7d558c255305f897fe66c8e2c625d3724e46e7` (origin/main at refresh; rebase was a
no-op, branch already current). Head: `013f7c3`.

## Changed files and reasons

- `skills/implement-issue/SKILL.md` (commit `e2678da`) — D1, D2: both proof steps
  (`## implement` :65, `## check.fix` :86) now reuse earlier evidence for a test only
  when it ran after the latest change to that test and every helper or fixture it
  uses; the report clause records per proof result the command, the commit it ran on
  and the result.
- `skills/check-issue/SKILL.md` (commit `b7af64c`) — D3: B rejects proof for an
  added or changed test that ran before the latest change to that test or a helper
  or fixture it uses and asks for the missing current run, with the green-runs
  example.
- `docs/guide/phases.md` (commit `013f7c3`) — D4: implementation paragraph describes
  the freshness rule; review paragraph notes the rejection. No full restatement.

No `Test-Change:` trailers: no file matched by `src/test-files.ts` changed.

## Worker returns (folded in)

Three workers, one wave, disjoint paths, each `bun test --changed` exit 0 with
"1 changed file, but no test files are affected":

- u1 `51d708d` → cherry-picked as `e2678da` (implement-issue).
- u2 `679bcdb` → cherry-picked as `b7af64c` (check-issue).
- u3 `4ce371d` → cherry-picked as `013f7c3` (phases.md).

All worker worktrees removed.

## Done-criteria proof

| # | Criterion | Proof command | Commit | Result |
|---|-----------|---------------|--------|--------|
| 1 | Freshness rule in both proof steps | `grep -n "latest change" skills/implement-issue/SKILL.md` | `013f7c3` | pass — hits at :65 and :86 |
| 2 | Report records command, commit, result | `grep -n "commit it ran on" skills/implement-issue/SKILL.md` | `013f7c3` | pass — hit at :65 |
| 3 | B rejects pre-latest-change proof | `grep -n "ran before the latest change" skills/check-issue/SKILL.md` | `013f7c3` | pass — hit at :55 |
| 4 | phases.md describes rule in both paragraphs | `grep -n "latest change" docs/guide/phases.md` | `013f7c3` | pass — hits at :94 and :104 |
| 5 | Text-only scope, no scheduling change | `git diff --name-only fe7d558..HEAD` | `013f7c3` | pass — only the three owned files; no code, run count, phase step or `checks`/`merge_checks` change |

## Commands run (checks)

| Command | Commit | Result | Wall time |
|---------|--------|--------|-----------|
| `checks.format` (`bun run format`) | `013f7c3` | pass — all files unchanged | seconds |
| `checks.typecheck` (`bun run typecheck`) | `013f7c3` | pass — `tsc --noEmit` clean | seconds |
| `checks.test` (`bun test --timeout=30000`) | `013f7c3` | pass — 843 pass, 0 fail, 44 files | ~75s (minutes) |
| `checks.test_changed` (`bun test --changed`) | `013f7c3` | pass — 3 changed files, no test files affected, 0 selected | seconds |

## Refresh record

`git fetch origin` + rebase onto `origin/main`: no-op; prior base `fe7d558`, new base
`fe7d558`, prior head `013f7c3` (pre-fetch) unchanged. No conflict.

## Known limitations

None. Prose wording is reviewed by check.review per the standing design (no vanity
tests of skill/guide text).

## Unverified criteria

None.
