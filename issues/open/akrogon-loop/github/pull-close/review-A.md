# Review A: pull-close

Base: ab36dd0e424b5b5041dd251c189639498c72b4a8
Reviewed head: e58c2445cb38c74a5d5abe253dae555b5754035c

Read: positions-A.md, rebuttal-A.md, plan.md, implementation/brief.md, ponytail.md, the full source and test diff.

## Verdict: nits

## Done criteria

1. Mirror: `tests/pull.test.ts` writes one file per number across two pages, deletes an absent number, replaces a retitled slug leaving one file, keeps a non-seed file, and proves a failed, malformed and schema-invalid listing leaves bytes unchanged. Holds.
2. Origin: missing, GitLab and truncated GitHub origins exit non-zero with the reason; `--all` with a missing registration and a GitLab repo still mirrors the healthy repo and names both failures. Holds.
3. Close: epic fixture with an issue-owned source, a source repeated across issues, and a leaf without `sources`; the earlier issue's completion makes no gh call, the final move closes 1, 2, 3 once each with the triggering leaf's worktree sha, which the test proves differs from the checkout head and the other leaf's head. A `flock -n` probe from inside the fake `gh` proves the relocated issue lock is held during close. Already-closed skip, retry with fresh state check, lost-response recheck, exhausted retry continuing, malformed source continuing, non-zero exit with state `merged` and log line written, repeated `merged` adding no call. Holds.
4. Manifest: parsed TOML asserts `pull.sh --all` before `next.sh --all`, and both wrappers forward their argv. Holds.

## Verification

- `bun test`: 40 pass, 0 fail, 436 assertions, rerun by me at e58c244.
- `bun run typecheck`: clean, rerun by me.
- Live read-only probe: `bun src/akrogon.ts pull` in the worktree against the real origin exits 0, creates `issues/seeds/` in the registered checkout, folder empty, matching `gh issue list` returning zero open issues; `git status` shows nothing from it.
- `next` paths: `tests/next.test.ts` proves recovery through `next` closes before tab close and worktree removal, and that a failed rename retried through `next` still awaits closure.

## Fix

None.

## Nits

- N1 `closeSource` targets github.com by prefixing argv with `env GH_HOST=github.com`, while the listing uses `gh api --hostname`. Passing an env option through `run` would be one mechanism instead of two and avoid spawning `env`. Maintainability, not behavior.
- N2 A close failure during `next`'s recovery branch throws out of `dispatchLeaf`, so the rest of that `--all` sweep for the repo is skipped for that pass, and the tab close and worktree removal happen on the next pass. Same shape as the pre-existing rename-failure path, which the design says is retried by the next run. Recorded so the merge skill knows a non-zero `phase merged` with sources still means merged.
- N3 The repo lock is held across the GitHub listing (plan D4, limitation R3). Every herdr startup `pull --all` therefore blocks `phase` moves on that repo for one network round trip. Accepted by the plan; my rebuttal preferred fetch-outside-lock, and the plan chose otherwise on the stale-overwrite argument. Not a defect.

## Re-check after check.fix round 1

Prior reviewed head: e58c2445cb38c74a5d5abe253dae555b5754035c
Repair head: 65b67f4 (code at 2b62662, evidence-only commit on top)

Repair diff inspected: `src/pull.ts` closeSource, `tests/fake-gh.ts` stateful steps, `tests/phase.test.ts`, `tests/pull.test.ts`, plan D6/A5 text, `learnings/history/2026-09-11-pull-close-partial-side-effect.md`.

Verdict: nits (unchanged).

- B's F1 (duplicate comment after comment-posted/close-failed): repaired. The retry, only when the fresh state check still reads OPEN, lists the issue's comments with paginated `gh api` and closes without `--comment` when the exact `merged <commit>` body already exists. A failed or malformed comment listing throws inside the retry, so no close runs on unverified evidence, and later sources continue. Two new phase tests exercise the partial-success path across a second comment page and the three listing-failure shapes through the real CLI.
- B's F2 (serialization-order and prose assertions): repaired. Warnings are parsed as JSON objects and matched on fields; the invalid-origin test asserts the structured repo and origin context.
- Earlier findings N1 to N3 stand. N1 is slightly more visible now: one function targets github.com with `env GH_HOST` for `issue` calls and `--hostname` for the `api` call.
- No defect introduced by the repair. The extra `gh api` call happens only on the retry path.

Verification rerun by me at 65b67f4: `bun test` 42 pass, 0 fail, 460 assertions; `bun run typecheck` clean; `bun run format` changed nothing.

## Merge attempt 1: rebase conflict

Rebase target: origin/main at 7af5184669bc43d6e9f47f30e0bd8fb24c282a7d (three commits ahead of base ab36dd0: f281241, 507aff5, 7af5184).

Rebase stopped applying e58c244 (first of the leaf's three commits). Rebase context left in the worktree for B.

Conflicting file: `tests/phase.test.ts`, lines 4 to 14, the import block. Upstream added `command` to the shell import; the leaf added `fakeGh`, `GhFixture`, `GhStep` and `zod` imports. Both sides are true; the union is the resolution. Remaining commits 2b62662 and 65b67f4 have not been applied yet.

Upstream drift to recheck during repair, none conflicting textually:
- `src/phase.ts`: `commitMove` resets a new `prompted` field, `transition` calls `requireClean` before `check.review`, `recoverMerge` calls `requireClean` before the ancestry check.
- `src/next.ts`: `busy` status, `prompted` session guard, `git worktree remove` without `--force`. The leaf's `await completeOwner` line in the recovery branch sits next to that removal line.
- `src/state.ts`: `prompted` added to `stateSchema`.
- `tests/fake-herdr.ts`, `tests/next.test.ts`: fixture changes the leaf's new next test may need to follow.

After resolution: continue the rebase, refresh `AKROGON_BASE` from `akrogon config`, run `bun run format`, `bun run typecheck`, `bun test` in the worktree.
