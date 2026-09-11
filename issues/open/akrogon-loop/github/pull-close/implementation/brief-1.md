## 1. Goal

Implement plan D1–D4 and D7: complete origin-based pull and startup declaration.

## 2. Numbered acceptance criteria

1. Plan A1–A3 and A7: mirror identity/retitle/delete, complete pagination excluding PRs, failed listing leaves bytes unchanged, origin and all-repo failures, worktree targeting, concurrent pull serialization, startup order.
2. Tests exercise real CLI processes in temporary repos with substituted gh/herdr. No real external mutation.

## 3. Read-first list

Read ../plan.md and ../brief.md, src/config.ts, src/shell.ts, src/state.ts, src/akrogon.ts, src/phase.ts, src/next.ts, tests/helpers.ts, tests/fake-herdr.ts, relevant command tests, and /home/ivan/.codex/skills/implement-issue/ponytail.md. Copy existing temp-repo/CLI fixture conventions. Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/pull-close.

## 4. Change list and needed interfaces

Own src/pull.ts mirror functions, src/akrogon.ts pull dispatch, tests/fake-gh.ts plus narrowly needed reusable fixture helper, tests/pull.test.ts, plugin/pull.sh and plugin/herdr-plugin.toml. Expose pullCommand(all: boolean): Promise<void> and pullRepo(repo: Repo): Promise<void>. Use shell execution and zod already installed. Do not implement closeSources yet.

## 5. Do-not, reasons and exceptions

Do not edit seed-issue, chart, broadcast, init, unrelated docs or dispatch logic because scope is locked. Do not contact real GitHub or herdr because tests must substitute that boundary. Do not add dependencies or generic frameworks because existing helpers suffice. Do not commit or advance phase as worker because B owns integration. Return a mismatch with concrete evidence instead of changing scope/interfaces. Exception: a revised brief from B can authorize the correction. These exclusions preserve scope, isolated verification, and one integration owner.

## 6. Ordered steps

Write observable tests first and record red. Implement pull, then plugin integration, then rerun focused tests green. Save exact red/green outputs under this implementation folder. Advisory about 7 files and 15 turns. Return evidence if scope differs.

## 7. Commands

No configured changed-test runner. Use targeted command: `AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/pull.test.ts`. Workers run only this targeted check. B owns the full suite and other blocking checks.

## 8. Done-when, evidence and report

Fill the report with exact command outcomes and evidence paths from real fixture invocations. Report limitations and remaining criteria explicitly. Never substitute prose checks for functional outcomes.

Changed files and reasons: `src/pull.ts` adds origin parsing, complete validated listing with existing retry helper, repo-locked numbered mirror reconciliation, and isolated all-repo failures. `src/akrogon.ts` adds strict pull dispatch. `tests/fake-gh.ts` and the narrow `fakeGh` helper in `tests/helpers.ts` substitute the external process with scripted responses and call/event records. `tests/pull.test.ts` covers A1–A3 and A7 through real CLI processes in temporary repositories. `plugin/pull.sh` and `plugin/herdr-plugin.toml` add pull-all before next-all. No closure integration, full checks, or commit performed.
Tests run: `AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/pull.test.ts` before implementation exited 1 with 0 pass, 6 fail (8 assertions), saved to `/home/ivan/Work/infra/akrogon/issues/open/akrogon-loop/github/pull-close/implementation/pull-red.txt`. The same command after implementation exited 0 with 6 pass, 0 fail (61 assertions), saved to `/home/ivan/Work/infra/akrogon/issues/open/akrogon-loop/github/pull-close/implementation/pull-green.txt`. Actual fixture CLI processes verified 102 issues across pages, byte preservation for failure and malformed responses, retry recovery, registered-checkout/worktree targeting, explicit GitHub API argv despite ambient target settings, continuing all-repo failures, serialized listing events, and executed shell wrappers. Temporary fixture repositories were removed by fixture cleanup.
Known limitations: R1, GitHub listings are not transactional snapshots. R3, listing holds the repo lock and can delay dispatch. R2 concerns closure, which is assigned to the next brief. No real GitHub or herdr access occurred.
Unverified criteria: None within this brief. A4–A6 remain assigned to closure integration. Formatting, typecheck, and the full suite remain B’s integration checks.
