# Implementation report: merged-siblings-rule

## Execution mode

Config says `implement: subagents`, but worker delegation failed deterministically: `subagent_spawn` returned twice `Cannot use subagent worker settings: model=devin/swe-2-max effort=max check=unsupported-effort supported=off,minimal,low,medium,high`. Session worker settings are immutable to this seat, so B executed `implementation/brief-1.md` directly (one-file, one-line prose unit). Identical diff to the briefed work; recorded here for review.

## Changed files and reasons

- `skills/watch-issues/SKILL.md` (1 line): replaced the "Merged still under open" Judge bullet with the sibling-aware rule per plan D1–D5 (read top-level owner states; any-unmerged → waiting on siblings, no `next`; all-merged → `next` once, re-observe, command-error rule; unreadable state → gap).

## Commands run with pasted results

From worktree root `/home/ivan/Work/infra/akrogon/issues/worktrees/merged-siblings-rule`:

- `git status --porcelain` → `M skills/watch-issues/SKILL.md` (pre-commit); clean after commit.
- `git diff --stat` → `skills/watch-issues/SKILL.md | 2 +- / 1 file changed, 1 insertion(+), 1 deletion(-)`.
- `grep -rn "Merged still under open" docs/ skills/ --include='*.md'` → only `skills/watch-issues/SKILL.md:37` (the edited bullet); `docs/` clean.
- Changed tests `AKROGON_BASE=20926c68f7664015b23ea0224147f69059d5b881 bun test --changed="20926c..."` → `--changed: 1 changed file, but no test files are affected / 0 pass, 0 fail`.
- `bun test` (root) → `287 pass, 0 fail, 3360 expect() calls, 13 files, 72.13s`.
- `bun test tests/docs-links.test.ts` → `3 pass, 0 fail`.
- `cd skills/watch-issues && bun test` → `20 pass, 0 fail, 53 expect() calls`.
- `bun run typecheck` (`tsc --noEmit`) → clean, no errors.
- `bun run format` → all files unchanged; status after format still exactly `M skills/watch-issues/SKILL.md`.

## Base and committed head

- Base: `20926c68f7664015b23ea0224147f69059d5b881` (`20926c6 add issues`).
- Head: `045dd11 merged-siblings-rule: sibling-aware merged-still-under-open rule` on branch `merged-siblings-rule`.
- No file under `issues/` on the branch (artifacts live only in the registered checkout).

## Known limitations

- Plan's open limitation stands: prose-only enforcement, nothing at runtime verifies the agent read every sibling state or ran `next` exactly once.
- Inline execution instead of delegated worker (tooling failure above); no worker return to fold in.

## Unverified criteria

- None. AC1–AC5 all verified: bullet content/order (AC1, AC2) by diff inspection, exclusions (AC3, AC4) by status/diff/grep, suites (AC5) by the runs above.
