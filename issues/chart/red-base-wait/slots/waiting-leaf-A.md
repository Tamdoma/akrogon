# Waiting leaf, slot A notes

## Q1 what the proving leaf becomes and what is recorded
- Pick: the stop writes or joins the repo hold in `held.yaml` (same record the merge turn reads) and the leaf goes `failed` with a new failure cause `held` (enum today: blocked|attempts, src/state.ts:11-17). Dispatch treats a `held` failure as waiting and moves it back to `failure.phase` itself once the hold is released (release fork). Notice fires only when the hold is created or gains a new command. Reason: one record already exists with the merge gate wired to it; a cause value is the smallest state change; status and watch already render failed leaves with cause. Cost: new enum value plus a new writer path for the hold outside merge (`akrogon phase <slug> failed --red-on-base <sha> --command <cmd>` from implement/check seats; today the flag is merge-only, src/phase.ts:797-801).
- Rejected: new `held` phase (touches routing, required seats, status, watch phase tables, every skill phase list). Notice-only (each leaf still burns a full run and needs manual recovery; misses #76 expected behavior).
- Evidence: better-than-training, src/hold.ts:10-17, src/phase.ts:844-877, src/next.ts:1044-1072, read 2026-10-10. Practitioner: Mozilla sheriffs close once and communicate once (wiki.mozilla.org/Sheriffing/Deciding_To_Close_A_Tree, read 2026-10-10).
- Pitfalls: the leaf's base is its merge-base with the tracking ref (src/config.ts:252-253), not current main, and leaves do not rebase before merge; a resumed leaf on an old red base re-holds forever. Removed in release fork: the resumed pass rebases onto current main first. Watch two-cycle recovery (watch SKILL.md:39) must not count `held` cycles; removed by the watch skipping `held` causes.

## Q2 other leaves while the hold stands
- Pick: leaves keep working (no dispatch block). A seat whose own run of the held command goes red, with its base equal in content to the held sha, skips its own base comparison and joins the hold. Saves the base run (7 to 15 min) per leaf. Cost: the leaf's own breakage of the same command is hidden until release, when the rerun on the fixed main exposes it.
- Rejected: block dispatch into implement/check while held (Chromium: closed tree means nobody progresses; would also block the fix leaf). Every leaf runs its own base run (#76 cost stays).
- Pitfall: a seat already mid-run when the hold appears cannot be cancelled; accepted cost, no promise of zero duplicate runs.

## Q3 several reds at once
- Pick: one hold per repo holding a list of {command, sha, first leaf, evidence}; a new command on the same hold notifies once more. Rejected: one command only (second red is silently folded or lost), one hold file per command (more records to clear under the lock).

## Question I would add
- Does the merge turn's existing hold and this pre-merge hold share release, or can a merge-written hold release while pre-merge waiters remain? Belongs in release.
