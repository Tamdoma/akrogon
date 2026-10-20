# stack-fate notes, slot A (written before reading B and C)

Pick: delete member stacking. Every merge turn is the holder alone. The command still rebases the holder onto the fetched main in disposable state and moves its branch (the existing `buildStack` holder step and lesson retirement), and the solo fallback for a holder that will not rebase stays. This reopens one part of stacked-turn 2026-10-15: "all" in all-or-holder. Caps, bisection, culprit and trains stay foreclosed, and nothing new is added. It fits that decision's own rule, "Simplest systemic solution ... even removing code if necessary", and "I dont want any slowdowns": on recorded data stacking is the slowdown.

Measured, framework issues/merge-attempts.jsonl, 333 lines, 2026-10-10 to 2026-10-19 (read 2026-10-19):
- Stacks with members: 77. 4 merged, 72 red, 1 ejected. 2026-10-18 alone had 58.
- Wall time: red stacks 480 min (median 2.8 min each), ejected 11 min. Merged stacks 55 min.
- Landed by stacks: 5 member leaves in total. Solo merges have a 12.7 min median, so stacking saved at most about 64 min against 491 min spent on stacks that never landed. That is about 98 min of red stack per leaf that stacking landed.
- The members were not bad: 51 of the 53 slugs that sat in a red stack later merged as a holder. So the per-(head, base) red mark mostly blames innocent members.
- Re-stacking: 62 of 71 red member heads went red again on another base, 571 extra red member stackings. That is the `built_on` key in `redMemberHeads` (src/attempts.ts) after main moves.
- After a red stack, the same holder's next turn was solo 85 times, and 54 of those merged. The red stack bought nothing on those turns.
- Not established: which part of each 2.8 min red is a verify failure and which is a `Test-Change` trailer refusal. merge-issue says nothing may commit on a top with members, so an uncited file on a member top goes straight to `check.fix`, which then reads as a stack red.

Deleted under removal:
- src/batch.ts: `pickMembers`, the member loop and `tips` in `buildStack` (the holder rebase and `removeRetiredLessons` stay, with the holder as the only range), and `StackResult.tips`.
- src/attempts.ts: `redMemberHeads`. `appendAttempt` stops writing `members`. The record schema keeps `members` optional so old lines still parse.
- src/state.ts: `BatchMember`, `batch.members` and `tip`. A state file still holding members needs a check of how the state schema treats removed keys (this touches the state-unknown-keys chart, #102).
- src/next.ts: the member branch moves and `commitMove` loop in `reconcileBatch`, the `closable` member tabs, the `kept`/`rebuild` loop in `mergeTurn`, and the `members=` part of `mergeContext`.
- `merged --check` and push code: the "HEAD equals the recorded top when the record has members" rule and the member refusal on push.
- merge-issue skill: the stacking paragraph, the "Members are never prompted" text, the members branch of the `merged` paragraph, the "nothing may commit on a top with members" route and the `stack red; holder turn restarts alone` ending. The memberless rules become the only rules.
- Tests for stacks and red-member skips.

Keep and fix (option B): drop `record.built_on === builtOn` from `redMemberHeads`, so a red head is never stacked again until it changes. One condition deleted. But since 51 of 53 red members were innocent, nearly every waiting leaf would be excluded after one red stack, so stacks would shrink to the holder anyway while all the member code stays. A red stack still costs one wasted run each time a new head joins. It keeps the code and loses most of the benefit.

What each option could break later:
- Removal: throughput is capped at one verify per leaf (about 13 min, 27 under load), so 11 queued leaves take about 2.4 h. That is faster than now on the same data, because every turn today runs a red stack and then the same solo attempt. Real merged stacks could help on a quiet, green queue, but this repo has never produced one: 4 of 77.
- Removal: a later request for batching arrives with no code left. It would come back as a new chart with evidence, not as dead code kept in case.
- Option B: the head-only mark is permanent per head, so an innocent member stays out of stacks until its next commit. That is harmless only because stacking stops mattering.

Practitioner and vendor (training knowledge, not fetched by A; B and C search):
- GitHub merge queue batches with a size limit and, on a failed group, bisects to find the bad pull request. Bors-ng batches all ready pull requests and bisects on failure. Zuul tests speculative chains in parallel and removes a failing change while the others continue. All three need bisection or parallel trains to make batching pay, and stacked-turn foreclosed both. Batching without a way to separate a culprit is the configuration they avoid.

Pitfalls:
- A red holder looks like a member failure: removal makes every red the holder's own, so the existing `check.fix` path names it.
- A leaf in `merge` with a state file still holding `batch.members` at upgrade: the reconcile must clear or reject it loudly, never ignore it.
- Lesson retirement drops ranges with members: its range list becomes the holder only, kept by an existing test.

Question the fork does not ask: are the 2.8 min reds mostly trailer refusals? If yes, the solo path fixes them in place (memberless repair), which is one more reason removal is faster.
