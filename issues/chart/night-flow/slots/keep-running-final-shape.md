# Keep running: proposed final shape after the operator's answer

## Operator answer (verbatim, 2026-10-11)
"1a - but this shouldn't be formal. I always do it, but there should be NO dependencies on this so we don't overcomplicate. | 2a - make sure they're always synced when appropriate, so I don't get errors. Be careful when updating Maine when other leaves are running so it doesn't create conflicts. Just follow my intent. My intent is to have it all synced up so that the problems never arise because of desynced files. |"

## Q1 Taken shape (A)
- The watch stays an informal operator habit. No leaf, done-criterion, doc or design depends on it. S1 (waiting leaf) and S5 (seat retry) must be correct with no watch: they move on the next pass from any existing source (herdr event, startup `--resume`, merge wake, dependents, manual).
- Two skill-text edits only, in `skills/watch-issues/SKILL.md`: delete the self-delete stop rule (`:45`) so the watch ends only on `/watch-issues stop`; the tick runs nothing for a repo `akrogon status` reports paused (C RB5, `src/next.ts:1572` typed dispatch ignores pause).
- Dropped as formal machinery: the expiry warning, any doc stating the watch is required.

## Q2 Taken shape (A), new leaf records-sync
1. Trigger: the existing self-update call sites (`src/next.ts:1382` after a merge, `:1543` each pass). No new trigger.
2. Scope: every registered repo's root checkout on its default branch, not only akrogon's. Install and skill links stay akrogon-only. Reason: operator intent "have it all synced up"; a door handoff commit can stay local in any repo.
3. Integrate committed history only: when every local-only commit touches only sync-eligible issue records (classified per commit, `src/sync.ts:22-31` rule), replay them onto the fetched default branch, push, and move the checkout to the pushed commit. Uncommitted record edits are never staged or committed by this path; `akrogon sync` keeps that job. Reason: framework's `.github/workflows/release-branch.yml:3-5` runs on every push to main, so committing records each pass would start a release per pass; uncommitted records cause no error in a single checkout.
4. Never under running agents: no stash, no autostash, no rewrite of a file with uncommitted edits, since seats write records in the root checkout while leaves run. The replay happens off the working tree; the checkout moves only by a keep-local-edits move that refuses when an incoming change touches a dirty file (today's "fast-forward refused" line).
5. A merge push rejected because main moved keeps its test result: `src/phase.ts:614-625` clears `tested_top`/`tested_main` on any rejection, so a record-only main move forces a full re-check; the reuse guard at `:665-669` already refuses reuse when code or `issues/config.yaml` moved. So a records push never costs a merging leaf a re-run.
6. Stops: a local code commit ahead keeps today's skip; a record file changed on both sides stops that checkout's integration, names the file in the line and retries next pass, never guessing; never force-push.
7. Lock: integration takes the global `.lock` beneath the install lock with explicit ownership; `syncCommand` is not called (B F3).
8. Docs: `docs/guide/install.md:40` loses the ahead/diverged operator action; the skip line stops saying "run akrogon sync" for record-only commits.

## Questions for your check
- Does any part contradict an existing lock, a Taken decision or code you can cite?
- Is scope item 2 (all registered repos) safe, or does it break something (cite)?
- Is item 3's committed-only boundary the right reading of "always synced when appropriate", given the release workflow?
