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
