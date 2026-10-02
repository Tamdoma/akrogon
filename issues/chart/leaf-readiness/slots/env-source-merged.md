# Env source: merged A + B

Independence note: B saw A's two Findings lines in env-source.md once by accident and states it excluded them.

## Recommendation (A,B): 1a symlink for reading, real file for writing
- When akrogon prepares a worktree (new or reused), it links `<worktree>/.env` to the registered checkout's `.env`, found through the existing repo registration (src/config.ts:100-119), never by guessing.
- It refuses, never overwrites, when the path is a real file, a tracked path, a different link, or when either the link or the real file is not gitignored (B). It never creates an empty real file to look ready (B).
- Why: framework `readSecret` reads `process.env` only (secret-env/index.ts:48-55); Bun loads `.env` from where it runs, so every existing script and check in the worktree sees the keys with no changes. A path alone fixes nothing for those scripts (A,B).
- Writes (key-creation 2a) go to the real file, never through the link: renaming a temp file onto the link replaces the link with a private copy (Linux rename(2)), and Claude Code Edit/Write refuse file symlinks (B).
- Removal deletes the link only; existing `git worktree remove --force` (src/next.ts:610-616) never touches the target (A,B).
- Client repos keep their own `.env`; nothing links client repos to framework (B, fleet run-backup.ts:56-57,99-107).

## Options
- 1a (A,B) symlink as above.
- 1b explicit root path only; every command must pass the env-file flag, including transitive launchers. Cost: every consumer entry point changes; one missed call reproduces the bug.
- 1c an env-aware runner command. Cost: a new surface every script must use; drifts toward the broker the standing design rejects.
- Rejected (A,B): copy (drifts when you add a key mid-run), injecting values into the seat's environment (every child process gets every key).

## Pitfalls
- A link is not proof: presence is still checked at dispatch; a dangling link counts as missing.
- Same shared file means any seat process can read all keys in it; this is the standing design's accepted exposure, not new.
- Processes already running keep old values after a key is added; re-run, do not assume.

## Research
- practitioner · Augusto Chirico, "Claude Code Loves Worktrees. Your Infrastructure Doesn't." (augustochirico.dev, 2026-03-18) · firsthand monorepo account: symlink env into worktrees to avoid copy drift.
- better-than-training · code.claude.com/docs/en/worktrees · Claude Code's `.worktreeinclude` copies instead; copying drifts after a mid-run key addition, which is the recovery path here.
- better-than-training · bun.com/docs/runtime/environment-variables · Bun autoloads `.env`; `--env-file` overrides.
- better-than-training · code.claude.com/docs/en/permissions · deny matches the link path or its target, so the existing Read deny on `**/.env` still applies to the link.
