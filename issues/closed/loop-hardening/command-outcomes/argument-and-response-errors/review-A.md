# Review A: argument-and-response-errors

Base: a4f0b5d88080026860be4837f97f6a89a7c52a1c
Reviewed head: eff9c92e8b478596b10a5af6105557f27b42edad (worktree clean, HEAD equals the diff)
Debate: no, so no positions or rebuttal input.

## Verdict: ready

## Findings against plan and brief

- C1 (D1): `src/next.ts` guards `existsSync(folder) && !statSync(folder).isDirectory()` before `commonDirectory`, so Git is never spawned with a file cwd. `statSync` follows symlinks, so a file symlink is rejected; a dangling symlink still falls through to slug lookup. Message names the supplied path and the three accepted target kinds. Absent paths, directory selection and hook branches are untouched. Tests cover relative, absolute and symlink files with no state change, no Herdr calls and no worktree creation, plus explicit leaf folder and worktree path dispatch.
- C2 (D2): `herdr` keeps `command` outside the guard, so nonzero exits remain `CommandError`. Only `SyntaxError` and `z.ZodError` are wrapped, others rethrow unchanged. The wrapped error carries the same `{command, cwd, stdout, error}` shape as `CommandError` plus native `cause`. Public signature unchanged, stdout normalization from `run` preserved, no retry or empty-result fallback. CLI tests prove the skip line carries argv, cwd, raw payload and parser/validation message. The subprocess shell test proves `cause` is `SyntaxError`/`ZodError` and that an invalid command still yields `CommandError` with no cause.
- C3 (D3): only `logMove` is wrapped inside the existing finally block. `saveState` ordering, `moved` output, merge completion and R2 precedence are unchanged. Non-Error throws rethrow. Tests assert nonzero exit, `implement` persisted, committed/log append failed wording, EISDIR for the append case, and merge-base/`origin/missing-base` for the diagnostic case, with unchanged bytes and no log file on retry.
- C4 (D4): fake Herdr gains one optional schema-validated `paneListStdout`. No new dependency, no mock of the unit under test, tests assert diagnostic content rather than whole wording.

## Verification

- Worker/B evidence: /tmp/argument-and-response-errors-evidence/{c1-red,c2-red,c3-red,cli-tests,format,typecheck,full-tests}.log. full-tests: 162 pass, 0 fail. typecheck: tsc --noEmit clean. format: only owned files.
- A rerun on reviewed head: `bun test tests/next.test.ts tests/phase.test.ts tests/shell.test.ts` exit 0, 86 pass, 0 fail.
- Live surface: `command`, `CommandError`, `expandPath`, `report` skip line and `commitMove` read directly and match the plan's live-code note.

## Nits

None blocking. docs/problems.html lists common messages and does not mention the new target/response/log messages; the plan excludes doc changes for this leaf, so this is an observation for a later doc pass, not a finding.

## Lessons

No reusable lesson beyond what the plan already records.

## Merge

Rebased 7be7188 onto origin/main f3b25f5 with no conflicts. AKROGON_BASE refreshed to f3b25f55c302cc00aeee4896d5e595b0cd35a807. Checks in worktree after rebase, logs under /tmp/argument-and-response-errors-evidence/merge-*.log:

- format: exit 0, no diff.
- typecheck: exit 0.
- test: exit 0, 176 pass, 0 fail.
- test_changed: exit 0, 176 pass, 0 fail.

Advisory: none configured.
