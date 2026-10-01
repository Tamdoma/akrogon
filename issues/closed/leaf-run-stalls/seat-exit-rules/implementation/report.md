# Implementation report: seat-exit-rules

Base: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`. Committed head: `708f85e2492eda4ac38f2d5d07f2b1f7d87fd607`. One wave, one worker (U1, commit `1dba4a2a373cd17ab10e3fc3716695e0cb367a23`, cherry-picked clean as `708f85e`). No remaining edits after the pick, no empty commit.

## Changed files and reasons

- `skills/implement-issue/SKILL.md` (C1): new rule-1 paragraph after the failed-exit paragraph covering implement and check.fix, reusing that exit, naming reason format `"<criterion> red: <cause>"`, forbidding pre-existing/base red/modulo handoff. One cross-ref sentence added in check.fix.
- `skills/implement-issue/worker-protocol.md` (C2): line-17 sentence replaced with the two-branch relaunch rule. Provider branch covers error-text recognition, relaunch after old worker ended, retained-worktree spawn cwd, original brief plus the verbatim added line, one relaunch, second-failure `failed` exit naming provider/error/both transcripts with the standalone report. Budget/limit branch keeps the remainder rule with `never the original brief again` only there.

## Commands run with results

Worker U1 (worktree `seat-exit-rules-u1`, since removed):
```text
$ AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca bun test --changed="$AKROGON_BASE"
--changed: 2 changed files, but no test files are affected
 0 pass, 0 fail, Ran 0 tests across 0 files. [24.00ms]
```
Expected: prose-only diff. `bun install` ran first (node_modules absent there).

A after cherry-pick:
```text
$ AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca bun test --changed="$AKROGON_BASE"
--changed: 2 changed files, but no test files are affected
 0 pass, 0 fail, Ran 0 tests across 0 files. [9.00ms]

$ bun test
 339 pass, 0 fail, 3937 expect() calls, Ran 339 tests across 15 files. [80.92s]

$ bun run typecheck
$ tsc --noEmit (exit 0, about 1s)

$ bun run format
all files unchanged (exit 0)

$ grep -rn "never the original\|pre-existing\|modulo" docs/ skills/ src/
only the two new rule sentences hit; no stale copies in docs/ or elsewhere
```

Wall time: `bun test` 80.92s (minutes). All other commands seconds.

Artifact paths: brief `implementation/brief-1.md`; worker full report was returned in-transcript (worktree removed, no separate artifact kept).

## Base and head

Base `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`, head `708f85e2492eda4ac38f2d5d07f2b1f7d87fd607`. Worktree clean, no files under `issues/` on the branch.

## Known limitations

Plan's open limitation stands: nothing enforces that a future A reads the error text correctly; a quota, billing, or context-overflow error misread as a provider death would get a wasted relaunch. Worker reported none of its own.

## Unverified criteria

None. C1-C2 verified by reading the diff above; C3 by the green checks.
