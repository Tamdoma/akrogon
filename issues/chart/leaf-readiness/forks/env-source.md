# Env source

## Question
Q1. How does a seat in a leaf worktree see the registered checkout's `.env`: a symlink created with the worktree, or the registered root path passed as non-secret context?

### Carries
- [readiness-contract](readiness-contract.md): taken 1a.
- F2: worktrees get no env file (src/next.ts:264-269).
- A and B both reject copying the file and injecting values into the tab env.

## Findings
- A: symlink; bun autoloads `.env` from cwd, existing scripts and `checks` work unchanged, one file to edit. Refuse linking when the file is not gitignored.
- B: explicit path; no write-through path, no copy; per-client secrets stay in each client repo.

## Taken
