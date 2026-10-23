# Implementation report: docs-use-finish

Base: `40902d8399dc88612da71a678f43038db90e1286` (origin/main, unchanged at fetch before verify, so no refresh moved the branch). Committed head: `2c3e99c1255e9a41e16cc897ed5378f444e85849`.

Mode: subagents. Wave 1: U1, U2, U3. Wave 2: U4, U5. Each worker ran in `<worktree_store>/docs-use-finish-u<N>` at the lane HEAD, and A cherry-picked the commits in order. Every worker worktree is removed.

## Changed files

| Commit | File | Reason |
|---|---|---|
| 2463cb04 (U1) | docs/use/roll-back-a-release.md | D7. `akrogon rollback`, then the manual block copied from README "Rollback" and checked against src/rollback.ts, src/release.ts, src/self-update.ts. Links releases-and-updates.md#rollback. |
| 36060a5d (U2) | docs/use/merge-and-announce.md | D5. Covers the land run with no seat, the B wake cases, the solo rebase, B never pushing, the completion lines and broadcast-issue. Plain link to change-flow.svg. |
| 932b6414 (U3) | docs/use/when-work-fails.md | D6. Covers the failed record, recovery with status, phase without `--slot` and next, and other refusals. Embeds failure-recovery.svg. |
| ed385c5d (U4) | docs/use/learn-from-work.md | D8. Covers the lesson line, the history file pattern, the lesson rule, how a line leaves, and /learn-issues outcomes. Embeds lessons-flow.svg. |
| 71455c4b (U5) | docs/use/save-records.md | D9. Covers the sync steps, eligible records and refusals from src/sync.ts, and gacp described without reprinting. Embeds records-vs-code.svg. |
| 2c3e99c1 (A) | docs/use/when-work-fails.md | A's review fix: a missing value goes in the `.env` of the holder repo named on the `Missing:` line, not in the worktree (src/readiness.ts `gaps`, `holderRoot`). |

No other file changed. README, docs/reference-index.md and docs/guide are untouched (D11).

## Criteria and proof (all on head 2c3e99c1)

1. Subjects covered. `ls docs/use/` lists all five pages. Per-page claims were checked by the workers against the sources in their briefs. A spot-checked land.ts, status.ts (`broadcast pending`), phase.ts (tab rename, fix_rounds), sync.ts and readiness.ts. Final per-page source check is B's review.
2. Pictures and next steps. `check docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-finish/implementation/check-docs-links-1792767882155-2012148.log` (8 pass). There are three image embeds with alt text (when-work-fails, learn-from-work, save-records). Last lines form the chain merge-and-announce → when-work-fails → roll-back-a-release → learn-from-work → save-records → ../reference/files.md.
3. Roll-back manual steps. `check rollback-page: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-finish/implementation/check-rollback-page-1792767882790-2012213.log` (1 pass). For the deliberate break, `writeDeploySuccess` was renamed in the page and the test went red: `check rollback-page-break: 1 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-finish/implementation/check-rollback-page-break-1792767887773-2015245.log`. The page was then restored, leaving the worktree clean. Red before the page existed: see plan.md.
4. No bans or dates. `check docs-bans: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-finish/implementation/check-docs-bans-1792767883463-2012629.log` (15 pass). `grep -nE '\b20[0-9]{2}-[0-9]{2}' docs/use/*.md` exits 1 with no output.

`akrogon verify` exited 0 on 2c3e99c1 (`verify leaf 2c3e99c1…: green`), with a wall time of 176 s. Format, test (1114 pass, 0 fail) and typecheck were all green.

## Notes from workers

- U2: `src/phase.ts` records the broadcast handoff whenever an owner completes, with no config gate. So the page does not claim "only when targets are configured". It names `broadcast.discord.webhook_env` as the target source, and says a failed broadcast does not undo the merge. Code wins over plan D5's wording.
- U3: `src/next.ts` reads a `failure.cause` of `attempts` that nothing writes, so it is left out. Two guide claims the code does not confirm are dropped: force push not being a recovery step, and the idle-seat grace period.
- U5: the advice in the refusal section is page wording, because the code prints only the error.

## Known limitations

- The rollback test checks three literal lines, not the whole shell block. The rest is review (design Q2).
- gacp has no source in this repo. It is checked against docs/guide/gacp.md only.

## Unverified criteria

None by command. Criterion 1 and 4's per-page source match is B's review by design.
