# Env source

## Question
Q1. How does a seat in a leaf worktree see the registered checkout's `.env`: a symlink created with the worktree, or the registered root path passed as non-secret context?

### Carries
- [readiness-contract](readiness-contract.md): taken 1a.
- F2: worktrees get no env file (src/next.ts:264-269).
- A and B both reject copying the file and injecting values into the tab env.

## Findings
- Round files: slots/env-source-B.md, slots/env-source-merged.md, slots/env-source-rebuttal-B.md. B saw A's two map lines below once by accident and states it excluded them.
- (A,B) Recommend symlink for reading, real file for writing: akrogon links `<worktree>/.env` to the registered checkout's file via existing registration (src/config.ts:100-119); refuses on a real file, tracked path, other link, or unignored link or target; never creates an empty target. Framework `readSecret` reads process.env only (secret-env/index.ts:48-55), so a path alone fixes nothing. Writes go to the real file (rename onto a link replaces the link; Claude Edit/Write refuse file symlinks). Removal deletes only the link. Client repos keep their own file.
- B rebuttal R1: Bun autoload can be disabled or overridden by mode/local files, and fleet children strip inherited credentials on purpose; effective source and identity stay verified by the proofs.
- B rebuttal R2: phase skills forbid env writes (implement-issue:45, check-issue:31, merge-issue:29) and a matching deny wins over allow; the producer write needs a permitted mechanism. Moved to [blocker-record](blocker-record.md).
- Research: Augusto Chirico, augustochirico.dev 2026-03-18 (symlink to avoid copy drift); code.claude.com/docs/en/worktrees (`.worktreeinclude` copies); bun.com/docs/runtime/environment-variables; code.claude.com/docs/en/permissions (deny matches link or target).
- A: symlink; bun autoloads `.env` from cwd, existing scripts and `checks` work unchanged, one file to edit. Refuse linking when the file is not gitignored.
- B: explicit path; no write-through path, no copy; per-client secrets stay in each client repo.

## Taken
2026-10-02, operator, verbatim: "1a"

When akrogon prepares a leaf worktree (new or reused), it links `<worktree>/.env` to the registered checkout's file, found through the existing repo registration. It refuses, never overwrites, when the path is a real file, a tracked path, a different link, or when the link or target is not gitignored, and never creates an empty target. Writes go to the real file, never through the link. Worktree removal deletes only the link. Client repos keep their own file. Presence is still checked at dispatch; a dangling link counts as missing. Reason: one file, keys added mid-run reach every leaf, no script changes. Foreclosed: 1b path only, 1c env-aware runner, copy, value injection.
