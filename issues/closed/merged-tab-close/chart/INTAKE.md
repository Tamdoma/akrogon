# Intake: merged-tab-close

## Scope
One issue in the akrogon repo: `akrogon next` closes the tab of a merged leaf whose folder is still under `issues/open/`, and the merge-issue skill and guide describe the actual rule.

## Provenance
- GitHub: Tamdoma/akrogon#30

## Source: Tamdoma/akrogon#30
# Merged leaf tab stays open when the merge slot skips its final herdr tab close

Source: Tamdoma/akrogon#30
URL: https://github.com/Tamdoma/akrogon/issues/30

Unverified intake.

## Observation
In the framework repo (/home/ivan/Work/infra/tamdoma/framework), leaf `plan-script` reached `merged` at 2026-09-27T01:46:30Z, but its herdr tab `wA:t5W` (panes `wA:pBA` slot A and `wA:pBB` slot B, both idle, titles "✅ plan-script") was still open about 5 hours later. The leaf is still under `issues/open/satellite-network-simplify/satellite-foundation/plan-script` because the epic `satellite-network-simplify` has unmerged leaves.

The other four merged leaves in the same epic (`research-pools`, `design-tokens`, `fixture-network`, `legacy-scoped-style`) had their tabs closed. Each of their merge-slot pi sessions contains a `herdr tab close "$HERDR_TAB_ID"` call. The `plan-script` merge-slot session (`~/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-plan-script--/2026-09-27T00-02-22-464Z_01a0e02b-8080-70fd-b5e0-5f22e88dab65.jsonl`) contains none. After `akrogon phase plan-script merged` printed `moved merged` / `issue complete satellite-foundation`, the slot ran broadcast-issue (Discord delivered to both targets), printed its footer "Merge complete. ..." at 01:47:20Z, and went idle without closing the tab. The same session had been compacted once at 01:15:57Z, during check.review before the merge phase.

`akrogon next --all` was run from the framework root about every 20 minutes after the merge (at least 4 times). The tab stayed open.

Code and docs observed at /home/ivan/Work/infra/akrogon (HEAD 9aaadd3):
- `src/next.ts:554-562` `cleanupMerged` returns immediately when the leaf path is within `issues/open` (`if (within(leaf.path, resolve(repo.root, 'issues/open'))) return;`), so the tab close and worktree removal there only run for leaves that have moved out of `issues/open`.
- `skills/merge-issue/SKILL.md:51` tells the merge slot to "close this tab with `herdr tab close "$HERDR_TAB_ID"` as the very last act; the startup sweep removes the worktree and branch, and closes any tab a merge left open."
- `skills/merge-issue/SKILL.md:47` states "the tab closes as soon as this pane goes idle after `merged`."

## Location
akrogon merge flow: merge-issue skill final step, `akrogon next` merged-leaf cleanup (`cleanupMerged` in src/next.ts), for merged leaves whose owner epic/issue is still under `issues/open`.

## Reproduction
1. Epic with several leaves under `issues/open`, at least one leaf still unmerged.
2. Merge one leaf, with the merge slot ending without running `herdr tab close "$HERDR_TAB_ID"` (seen here after a compacted session and an `issue complete` broadcast).
3. Run `akrogon next --all` from the repo root.
4. The merged leaf's tab and both idle panes stay open.
Observed once (plan-script, 2026-09-27). Four other merges in the same epic closed their tabs normally.

## Expected behavior
A merged leaf's tab closes once the leaf is merged, including when the merge slot does not close it and the leaf remains under `issues/open` waiting on sibling leaves.

## Urgency
Low to medium. Idle panes and a tab stay open, which reads as stalled or idle seats during monitoring. There is no effect on other leaves. Workaround: close the tab by hand (`herdr tab close wA:t5W`).

## Agent findings
Code read at origin/main 17fa33a (local main is 4 commits behind).
- `src/next.ts:554-562` `cleanupMerged` returns early for any leaf under `issues/open`, so the tab, worktree and branch all wait for the owner folder to move. Confirmed as reported.
- The guard came from commit 2a759dd ("Retry source closure before completion moves and cleanup", 2026-09-11). Its purpose was to keep resources while GitHub closure failed and could be retried. The sibling-wait case shares the same guard.
- `tests/next.test.ts:1854` asserts that a merged leaf with an unfinished epic sibling keeps its worktree, branch and tab after `--resume`. The 2a759dd test "startup retries closure before cleanup and retains failed owners with their worktree branch and tab" asserts the same for failed closure.
- `closeSources` requires the leaf worktree to read `HEAD` (`src/pull.ts:185-189`). The tab plays no part in closure.
- Cleanup (`cleanupRepos`) runs only on manual sweeps, `--all` and `--resume` (`src/next.ts:689-714`). Hook passes never clean (`docs/guide/limits.md:10`).
- `skills/merge-issue/SKILL.md:47` says "the tab closes as soon as this pane goes idle after `merged`". No code does that. The only tab close is `cleanupMerged` (`src/next.ts:557`). `SKILL.md:51` and `docs/guide/merge.md:27` say the startup sweep closes a tab a merge left open. That is false while the owner is still in `issues/open/`.
- Herdr `idle`/`done` means the agent finished its turn and is ready for input (herdr skill SKILL.md:58, herdr 0.9.1).
