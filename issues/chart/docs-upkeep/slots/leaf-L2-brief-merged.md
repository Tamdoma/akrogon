# Brief: index-repair

## What
`docs/reference-index.md` in pi-extensions has no row whose path does not exist, and every remaining row still describes the file it names.

## Why
The index is the first thing planning agents read. At least two rows point at deleted files (checked 2026-09-19 from the repo root: `tamdoma-forced-native-compaction/index.ts` and `tamdoma-subagents/btw.ts` do not exist), so agents plan around code that is gone.

## Done-criteria
1. One shell command run from the leaf worktree root over every backticked or linked path in `docs/reference-index.md` reports zero unresolved rows: (B) a literal path must exist in the worktree, a glob such as `tamdoma-subagents/*.test.ts` must match at least one file, and the check runs in the worktree, not the registered checkout, so machine-local ignored files cannot make the map look valid. The command and its output are in the implementation report.
2. Each removed row is listed in the report with its reason: the commit that deleted its file (`git log --diff-filter=D --oneline -- <path>`), or (B) that the file is a generated, git-ignored artifact (such as `tamdoma-subagents/manifest.json`, ignored by `tamdoma-subagents/.gitignore`, or `herdr-agent-state.ts`), in which case the row is retargeted to its tracked source when one exists and otherwise removed. A row whose file was renamed is retargeted rather than dropped.
3. Rows kept are spot-checked: for every row whose description names an exported symbol or command, that symbol or command still exists in the file.
4. No other file changes. The configured checks pass.

Env values needed: none.
