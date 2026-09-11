## 1. Goal

Implement plan D5–D6: source close after owner rename, awaited under existing locks.

## 2. Numbered acceptance criteria

1. Plan A4–A6: correct owner and triggering commit, deduplicated sources, CLOSED skip, recheck-before-retry, final failure continues other sources and exits nonzero with move intact, source-free preservation, lock and next recovery proof.
2. Tests exercise real CLI processes in temporary repos with substituted gh/herdr. No real external mutation.

## 3. Read-first list

Read ../plan.md and ../brief.md, src/config.ts, src/shell.ts, src/state.ts, src/akrogon.ts, src/phase.ts, src/next.ts, tests/helpers.ts, tests/fake-herdr.ts, relevant command tests, and /home/ivan/.codex/skills/implement-issue/ponytail.md. Copy existing temp-repo/CLI fixture conventions. Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/pull-close.

## 4. Change list and needed interfaces

Own closeSources(repo: Repo, leaf: Leaf, destination: string): Promise<void> in src/pull.ts, src/phase.ts and src/next.ts awaited integration, tests/phase.test.ts and tests/next.test.ts. Extend preceding fake-gh fixture support only as needed. Preserve preceding mirror implementation.

Worker 1's fake-gh consumes FAKE_GH JSON with steps [{stdout, stderr?, code?, delayMs?, args?}], records argv/cwd in <path>.calls, and shifts/saves each step before output. Reuse this scripted interface and add only required closed-folder/lock/worktree probes. Installed gh issue help supports -R [HOST/]OWNER/REPO, but the locked command uses owner/repo. Set GH_HOST=github.com for the child through an explicit env process invocation if needed without mutating global process.env. All processes still use src/shell.ts. Do not add a generic environment option throughout unrelated callers.

## 5. Do-not, reasons and exceptions

Do not edit seed-issue, chart, broadcast, init, unrelated docs or dispatch logic because scope is locked. Do not contact real GitHub or herdr because tests must substitute that boundary. Do not add dependencies or generic frameworks because existing helpers suffice. Do not commit or advance phase as worker because B owns integration. Return a mismatch with concrete evidence instead of changing scope/interfaces. Exception: a revised brief from B can authorize the correction. These exclusions preserve scope, isolated verification, and one integration owner.

## 6. Ordered steps

Read worker-1 report and existing fake-gh interface. Write tests and record red before code. Implement close loop and all awaited callers, run focused tests green. Save outputs here. Advisory about 6 files and 18 turns. Return evidence if interface correction needed.

## 7. Commands

No configured changed-test runner. Use targeted command: `AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/phase.test.ts tests/next.test.ts`. Workers run only this targeted check. B owns the full suite and other blocking checks.

## 8. Done-when, evidence and report

Fill the report with exact command outcomes and evidence paths from real fixture invocations. Report limitations and remaining criteria explicitly. Never substitute prose checks for functional outcomes.

Changed files and reasons: `src/pull.ts` adds post-move source enumeration/deduplication, triggering-worktree commit lookup, validated state checks, one fresh-check retry for command failures, contextual errors and aggregate failure. `src/phase.ts` awaits closure after rename from every completion path while preserving finally logging. `src/next.ts` awaits already-merged recovery before removing the worktree. `tests/fake-gh.ts` adds moved-folder, nonblocking flock, worktree-presence, and GitHub host probes. `tests/phase.test.ts` and `tests/next.test.ts` cover A4–A6 through real CLI processes and substituted external boundaries. Existing mirror implementation is preserved.
Tests run: `AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/phase.test.ts tests/next.test.ts` before implementation exited 1 with 14 pass, 4 fail and 147 assertions, saved in `implementation/close-red.txt`. Final targeted run exited 0 with 19 pass, 0 fail and 181 assertions, saved in `implementation/close-green.txt`. CLI fixtures verify epic owner timing, distinct triggering commit, deduplicated source close arguments, CLOSED skips, external retry/recheck and remotely-applied-close recovery, exhausted view/close failure continuation, malformed references and invalid/malformed view responses without close authorization, retained merged state/logging, repeated-merged refusal, missing worktree failure without gh invocation, and both sourced next recovery paths including already-merged failed-rename recovery. Delayed fake gh probes verify renamed-folder existence, relocated flock contention, and available worktree through closure completion. Temporary repositories are removed by fixture cleanup.
Known limitations: Plan R1–R3 remain. GitHub listing is not transactional, closure failures or a crash after rename may leave remote sources open without automatic replay, and completion holds existing locks during GitHub latency. No live GitHub or herdr mutation was attempted.
Unverified criteria: None within this brief. B still owns formatting, typecheck, full-suite validation, final integration and any lifecycle transition. No commit or full-suite run performed by this worker.
