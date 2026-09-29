# Brief: init-lessons-union

## What
`akrogon init` appends `learnings/LESSONS.md merge=union` to the repo-root `.gitattributes` when that exact line is missing. It creates the file when absent, preserves every existing byte, and adds a separating newline when the existing file lacks a trailing one, like the `.gitignore` additions in `src/init.ts:50-59`. It writes nothing to `.git/info/attributes`. `skills/init-akrogon/SKILL.md:76` and `docs/guide/setup.md:31` name the attribute among what the command writes.

Outcome: a repo initialized by akrogon rebases two sides' new lesson lines cleanly and keeps both.

## Why
When the main checkout and origin/main both add lesson lines at the same spot, `gacp`, `akrogon sync` (`src/sync.ts:122`) and the merge seat's rebase stop on a conflict (Tamdoma/akrogon#40). The 9 registered repos already carry the tracked line (backfilled 2026-09-29). This leaf makes repos registered later get it too.

## Done-criteria
1. In `tests/init.test.ts`, init on a fixture with no `.gitattributes` creates it with exactly `learnings/LESSONS.md merge=union\n`, and `git check-attr merge -- learnings/LESSONS.md` in the fixture prints `union`.
2. Init on a fixture whose `.gitattributes` is `* text=auto eol=lf` with no trailing newline yields `* text=auto eol=lf\nlearnings/LESSONS.md merge=union\n`. A second init leaves the file byte-identical.
3. Init writes no `learnings/LESSONS.md` rule to the file at `git rev-parse --git-path info/attributes`.
4. A rebase test uses the fixture's bare `origin` and a second clone. After init's tracked attributes and lesson scaffold are committed and pushed, both sides append a different lesson line. From a clean worktree, `git pull --rebase origin main` exits 0 and the resulting lesson file contains both additions. Then create and commit different replacements of the same existing line in another tracked file on the two sides, push the remote side, and run the pull again from a clean worktree. Assert that it exits non-zero and `git diff --name-only --diff-filter=U` identifies that unrelated file. Check setup commands succeed and clean up the fixture even on failure. (A,B)
5. `skills/init-akrogon/SKILL.md` and `docs/guide/setup.md` list the LESSONS.md merge attribute among the command's writes.
6. `bun run format`, `bun run typecheck` and `bun test` pass. The implementation report records the path of the saved `bun test tests/init.test.ts` output as the artifact.
