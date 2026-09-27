# Review A: startup-resume

- Base: `1a21e22e0056a7e9d6b5e35a5a395b867847a844`
- Reviewed head: `5589f64162b652f871859e05e0a5bb21d93b4f3c` (branch `startup-resume`, worktree clean)
- Debate: `debate: no`, so no positions/rebuttal artifacts exist or were expected.

## Verdict: nits

## Verification

Run from the worktree, `AKROGON_BASE=1a21e22e0056a7e9d6b5e35a5a395b867847a844`:

- `bun run format` → clean, all files unchanged.
- `bun run typecheck` (`tsc --noEmit`) → exit 0.
- `bun test` → 293 pass / 0 fail / 3522 expects (70.42s).

## Acceptance criteria

- A1 pass. `akrogon.ts` parses `{all, resume}` for `next` only, one guard `positionals + all + resume > 1` errors with the D4 message, `--resume` routes to `nextCommand`. README row and `command-reference.test.ts` contract list `--resume`; invalid list locks `--resume` required. Rejection asserted in the new test (`--resume a-old`, `--resume --all` exit non-zero).
- A2 pass. `herdr-plugin.toml` second startup entry is `["sh", "next.sh", "--resume"]`; `pull.sh --all` unchanged; `pull.test.ts` asserts the manifest. `next.sh` is `exec akrogon next "$@"`, forwards.
- A3 pass. Resume branch iterates `registeredRepos` unconditionally (D1), filters `merged || tab || worktree`, dispatches via `sweep` (merged-first sort, `explicit: false`), `cleanupRepos` over all repos (D3). New two-repo test asserts exactly the 2 allocated prompts, 2 tabs, unallocated leaves untouched with attempts `{A:0,B:0}`.
- A4 pass. Merged leaf completes in `sweep` via `dispatchLeaf` (returns `completed` without `sweepAll` follow-up, per design), `cleanupRepos` removes worktree/branch/tab. New test asserts closed move, worktree gone, branch deleted, zero tabs/prompts, dependent untouched.
- A5 pass. `next.md` startup line is resume-only and still true (cleanup happens). `limits.md:10`, `problems.md:51`, `merge.md:27` still true, verified by reading. `merge.md` example `akrogon next` unchanged and valid.
- A6 pass. All three checks green above.

## AREA.md check

`src/AREA.md` and `tests/AREA.md` name 10 paths; all exist from repository root. Neither claims changed behavior. `docs/guide/next.md` (behavior doc for the changed surface) was re-read in full: no stale startup or sweep claims remain.

## Findings

Fixes: none.

Nits:

- N1: `src/akrogon.ts` `next` dispatch nests a second ternary (`--resume` : `--all` : positional) inside `await (...)`. Functionally correct; slightly dense. Harmless.
- N2: `nextCommand` still reads `HERDR_PLUGIN_EVENT_JSON` when input is `--resume` and parses the event, though the resume branch ignores it. Dead work only reachable if a startup invocation carried an event env var; unreachable in practice via `next.sh`. Harmless.

## Lessons

None new.

## Merge pass (slot A)

- Rebase: `startup-resume` rebased onto `origin/main` `4ac0f7a` cleanly (no conflicts; sibling `completion-dependents` landed first, its `dispatchDependents` completion sites do not touch the resume branch or `sweep`). Prior reviewed head `5589f64162b652f871859e05e0a5bb21d93b4f3c` → rebased head `17fa33a`.
- AKROGON_BASE refreshed: `4ac0f7a65e16f47594a31bf2c53ce49236199f39`.
- Checks post-rebase: `bun run format` clean, `tsc --noEmit` exit 0, `bun test` 297 pass / 0 fail / 3562 expects (74.49s).
