# Blind notes, slot C: owner-reuse and close-witness

## owner-reuse

Question: May an owner name that already closed take new leaves (append into the closed owner), or does each handoff group get a fresh owner name with twins refused?

### 1. Pick

Fresh owner name per handoff group, twins refused in code. An owner name that sits in `issues/closed` never takes new leaves under `issues/open`. `akrogon next` refuses to dispatch work for an open owner whose name also exists in `issues/closed`, naming both folders. The existing `completeOwner` throw stays as a backstop.

Reason: the owner name is already a single identity everywhere else, so keeping it unique removes the problem class instead of teaching each reader to handle two folders with one name. `locate` maps a recorded log path to `open|closed|parked/<owner>` and `readLog` reads only the first existing folder, so an open twin already hides the closed wave's archived logs while it is open. `completeOwner` also assumes one lifetime: it packs the open folder and renames it onto `issues/closed/<basename>`. One name per lifetime makes both true by construction.

Cost: one guard, one flipped test, and a one-time repair for the live twin. The operator-visible loss is continuity: wave 2 of a topic closes under a second name (for example `satellite-plan-fit-2`), so the topic's history sits in two closed folders joined only by text references.

This pick reads the destination as prevention, not tolerance: after the guard, a same-name closed folder cannot arise through normal work, so completion never meets one. The one existing twin still needs the stuck-repair fork to rename it before retry.

### 2. Rejected options

- Append into the closed owner on completion. This keeps the broken window and pays to close it. While the twin is open, `readLog` hides first-wave logs. At completion, new union code must merge two index files (both twins hold an `EPIC.md` with different text, and the open one already points back at the closed one), decide child-name collisions, and survive a crash mid-move. `packFolder` unions loose logs with one folder's own archive only, so the archive side is reusable after a move, but the move, the index rule and the `.closing` recovery are all new. That is stacking code to support a state one guard makes impossible.
- Reopen by moving the closed owner back to `issues/open` before adding leaves. One folder at a time, so no twin window, but it rewrites closed history: the first wave's completion, its packed archive and its closed sources all become open again, and a second completion re-announces the same epic. It also needs a defined operator action before handoff, which is the step that already failed as prose.
- Keep the current prose-only refusal. `shapes.md` Preflight already refuses an existing `issues/closed/<owner>` before handoff writes, and the live twin was written anyway. Prose had its chance.

### 3. Evidence

- Tier: direct code read at HEAD `e522c186`, 2026-10-19. `src/phase.ts` `completeOwner` throws `Completion destination exists` before `closeSources`, `packFolder` and `renameSync(owner, destination)`.
- Tier: direct code read at HEAD, 2026-10-19. `src/evidence.ts` `locate` returns owner dirs in order open, closed, parked; `readLog` reads plain files from any of them but falls back to the archive of the first existing dir only, so an open twin without the member hides the closed archive.
- Tier: direct code read at HEAD, 2026-10-19. `src/pack.ts` `packFolder` merges one folder's loose `*.log` files with that same folder's `evidence.tar.zst` and refuses differing bytes for a shared member. It takes one folder, not two.
- Tier: test read at HEAD, 2026-10-19. `tests/next.test.ts` "closed owner name does not block an open same-name owner" expects dispatch to continue with a twin, and even dispatches the closed leaf by explicit closed path. The guard flips the first half of this test.
- Tier: live tree inspection, 2026-10-19. Framework holds both `issues/open/satellite-plan-fit` (6 leaves, all `phase: merged`) and `issues/closed/satellite-plan-fit` (`EPIC.md`, two leaf folders, `evidence.tar.zst`). The two `EPIC.md` files differ; the open one lists wave 2 and notes the earlier leaves are closed.
- Tier: unverified intake, 2026-10-18. Tamdoma/akrogon#108 in INTAKE.md reports the repeated `Completion destination exists` failure for all six leaves.
- Tier: peer synthesis, opening map section "#108 reopened epic never completes", read 2026-10-19. Agrees the throw precedes all completion work and that `shapes.md` refuses the twin as prose only. `skills/chart-issues/assets/shapes.md` Preflight text confirmed directly at HEAD.

### 4. Pitfalls

- P1: Guard placed only in `completeOwner` changes nothing; that is today's late failure. Removed by refusing at dispatch in `next`, the first code point that reads the open owner for work, so no leaf does paid work under a doomed name.
- P2: `next` discovers leaves itself and `status` scans separately (`scanRepo`), so a guard copied into both can drift. Removed by putting the refusal in one place; `status` surfacing is optional and must not become a second copy of the rule.
- P3: The flipped test's second half dispatches a closed leaf by explicit `issues/closed/...` path. A blunt twin refusal could break addressing closed leaves on purpose. Removed by refusing only work under the open twin, and stating in the leaf whether explicit closed-path dispatch survives.
- P4: `locate` also includes `issues/parked`, so an open/parked twin has the same log-hiding shape. Removed by deciding parked explicitly in the leaf, not by leaving it silent. My lean: include parked in the refusal, same identity argument.
- P5: An empty or stray `issues/closed/<name>` folder would block a fresh owner forever. Removed by an error that names the conflicting path, so the operator can remove or rename it. No auto-cleanup.
- P6: Renaming the live twin breaks name-based references to the open epic. Largely removed already: `blocked-by` uses leaf slugs, which do not change, and links inside the folder are relative. The repair still updates the `EPIC.md` heading and any chart text naming the open folder.

### 5. Question the fork does not ask

What names wave 2, and who chooses it? If the chart door must invent `satellite-plan-fit-2` at handoff, naming becomes a recurring small decision, and nothing stops a door from picking a name that collides with a different closed owner. Does the guard's error suggest the next free suffixed name, or is naming fully the door's job with the guard only refusing?

## close-witness

Question: What does the source-closing comment cite once the worktree is gone: the leaf slug, or a landed commit saved at merge?

### 1. Pick

Cite the leaf slug: `delivered by <slug>`, the text `closeCommand` already posts. Delete the worktree guard and the `git rev-parse HEAD` call from `closeSources`.

Reason: the commit in the comment is presentation, not proof. Nothing reads it back except the exact-text duplicate check inside `closeSource`, and the value used today is weak: it is the triggering leaf's worktree HEAD at completion time, which for a delayed owner completion is not necessarily the source leaf's landed commit, and may be a branch tip that landed under a different SHA after rebase. The slug is durable state, present in every stuck leaf today, and it names the closed folder a reader needs. Deleting the guard removes #103 for all current and future leaves with no state change and no backfill, which matches the carry: remove code before adding code.

Cost: the GitHub comment no longer carries a clickable commit. A reader goes from slug to `issues/closed/<owner>/.../<slug>` or `git log` to find the landing commit. One hop more, on a comment few will follow.

For stuck-repair: with this pick, the five worktree-less merged satellite leaves need nothing reconstructed. Fix the twin name (owner-reuse pick), rerun, and sources close.

### 2. Rejected options

- Save the landed commit in state at merge and cite it. Adds a state field and a write on every landing path (solo `commitMove`, batch members and holder in `next`, the `phase` command path), plus a definition of which commit counts for a shared source closed at epic completion, where several leaves landed. It also cannot fix the leaves already stuck: their landed SHAs were never recorded, and recovering them by searching git history is a guess dressed as a witness. All of that to keep a hash in a comment nobody parses.
- Keep citing a commit but read it somewhere else after cleanup, for example from the target branch or `log.jsonl`. The target tip at retry time is some later commit, not the landing one. The opening map notes `log.jsonl` is written after the state save and can fail, so it is not durable evidence. Both cite a wrong or unreliable SHA, which is worse than citing a slug that is exactly true.
- Keep the worktree until sources close. Already half-tried: reconcile keeps the worktree only when the whole owner completes this pass (`ownerCompletes`), which is exactly the case that does not break. Extending retention to incomplete owners keeps worktrees and tabs alive for as long as completion keeps failing, and ties an external API retry to a disposable checkout forever.

### 3. Evidence

- Tier: direct code read at HEAD `e522c186`, 2026-10-19. `src/pull.ts` `closeSources` throws `Sourced completion requires a worktree` when `leaf.state.worktree` is undefined, then runs `git rev-parse HEAD` in that worktree and posts `merged <commit>` per source. `closeCommand` in the same file posts `delivered by <by>` through the same `closeSource`.
- Tier: direct code read at HEAD, 2026-10-19. `closeSource` returns without posting when the issue is already `CLOSED`, and on its second attempt checks existing comment bodies for exact equality with the comment text before posting again. The comment text is only ever compared to itself.
- Tier: direct code read at HEAD, 2026-10-19. State has `merge_stamp` (a timestamp, `src/state.ts`, set in `src/phase.ts` `commitMove`) and no landed-SHA field. Search of `src/*.ts` for a recorded merge or head SHA on 2026-10-19 found none.
- Tier: direct code read at HEAD, 2026-10-19. `completeOwner` closes an issue's private sources with the triggering leaf, and at epic completion closes the remaining shared sources with that same leaf. Today's commit witness is therefore the triggering leaf's HEAD, not each source's own landing commit.
- Tier: live tree inspection, 2026-10-19. Five of the six merged satellite-plan-fit leaves record sources (framework#281, #282, #284, #285, #292, #294) and only `pool-parity` still records a worktree, so four sourced leaves have none. Fixing #108 alone runs these into #103.
- Tier: unverified intake, 2026-10-18. Tamdoma/akrogon#103 in INTAKE.md reports 20 merged sourced leaves failing every retry with this error.
- Tier: peer synthesis, opening map section "#103 sourced completion", read 2026-10-19. Confirms the narrower shape: complete owners keep the worktree, incomplete owners lose it and then throw on every retry.

### 4. Pitfalls

- P1: For a shared source closed at epic completion, "the leaf slug" is the triggering leaf, which varies with which merged leaf retries first. The comment can then name a leaf that did not carry the work alone, and the exact-text duplicate check can miss across separate calls. Today's commit text has the same variance, so this is not a regression, but the leaf should state the choice plainly: triggering leaf's slug, every time. Removed as a surprise by naming it in the contract and covering a shared-source case in tests; only partly removable without changing the pick.
- P2: Sources close before `packFolder` and the rename, so a later failure leaves sources closed with the folder still open. Removed on retry by `closeSource` returning early on `CLOSED`; the retry then redoes only pack and rename. No change needed, but the order must stay as is.
- P3: A slug is unique inside one repo's discovery, and the source string carries its own repo (`owner/repo#number`), so cross-repo confusion needs a reader who ignores the source's repo. Accepted; adding repo text to the comment would be noise.
- P4: Tests or skills text expecting `merged <sha>` would fail silently in prose. Removed by searching for the old comment text in `src`, `tests` and `skills` in the same leaf (at HEAD, `tests/close.test.ts` already expects `delivered by` for `closeCommand`).
- P5: Deleting the guard also deletes the only check that a sourced leaf ever had a worktree, so a leaf marked merged by hand would close its sources. That state is already trusted everywhere else (`phase: merged` is terminal and drives the rename), so no new check is added. Named here so the trust is explicit, not accidental.

### 5. Question the fork does not ask

Should the comment cite anything beyond the slug that a GitHub reader can act on without this repo, for example nothing at all? The fork offers slug or commit, but a third shape is closing with no comment, since the closed folder and git history already hold the record inside the repo. Is the comment for GitHub-only readers, and if so, does a bare slug actually help them?
