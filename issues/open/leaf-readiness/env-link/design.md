# Design: env-link

## Binding decisions, verbatim

### Env source ([env-source](../../../chart/leaf-readiness/forks/env-source.md))

2026-10-02, operator, verbatim: "1a"

When akrogon prepares a leaf worktree (new or reused), it links `<worktree>/.env` to the registered checkout's file, found through the existing repo registration. It refuses, never overwrites, when the path is a real file, a tracked path, a different link, or when the link or target is not gitignored, and never creates an empty target. Writes go to the real file, never through the link. Worktree removal deletes only the link. Client repos keep their own file. Presence is still checked at dispatch; a dangling link counts as missing. Reason: one file, keys added mid-run reach every leaf, no script changes. Foreclosed: 1b path only, 1c env-aware runner, copy, value injection.

### Excluded binding decisions

- readiness-contract, key-sheet, key-creation, live-change-grant, proof-fixtures and save-route: the contract schema and gap check belong to readiness-contract, door work to door-readiness, seat rules to seat-input-rules
- blocker-record: seat rules and the operator settings change, not touched here

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md (installed at ~/.claude/skills/chart-issues/assets/standing-design.md)

- No hardcoded secrets: tests use synthetic names and values in fixture repos.
- Negative cases are criterion driven: each refusal is a realistic prior state (operator-made file, tracked file, stale link, missing ignore rule).
- Cheapest sufficient tests: `tests/next.test.ts` fixtures with the fake herdr. No live call.
- Not applicable: auth mocks, server authorization, backend mutation, chain triggers, browser flows.

## Leaf architecture

Owned surfaces: `src/next.ts` (`ensureWorktree` and one helper it calls), additions to `tests/next.test.ts`, the fixture repo in `tests/helpers.ts` (`.gitignore` ignoring `.env`) (A,B), the repo-root `.gitignore` (A), `src/AREA.md` (one non-obvious-pattern line).

Interface: `linkEnv(repo: Repo, worktree: string): Promise<void>`, called at the end of `ensureWorktree` on both the new-worktree and existing-worktree paths, before `saveState`. Checks in order: `git ls-files --error-unmatch .env` in the worktree (tracked: refuse), `git check-ignore -q .env` in the worktree and in `repo.root` (either not ignored: refuse), then `lstat` of `<worktree>/.env` (absent: create the link; symlink whose `readlink` equals the target: keep; anything else: refuse). The target is the absolute path `resolve(repo.root, '.env')`. Refusals throw `Error` with the path and reason, which `dispatchLeaf` already reports and skips (`src/next.ts:592-595`). A refusal happens after `git worktree add` and before `saveState`, so the worktree stays unrecorded and the existing-path branch of `ensureWorktree` reuses it next time. (A,B)

Akrogon writes nothing through the link. `cleanupMerged`'s `git worktree remove --force` removes the link and leaves the target, which criterion 5 proves.

Exclusions: no `.env.*` files, no consumer-repo files, no presence check (readiness-contract reads the holder file directly), no change to seat prompts.
