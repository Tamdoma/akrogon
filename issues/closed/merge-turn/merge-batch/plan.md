# Plan: merge-batch

The command builds one stack of all eligible waiting merge leaves plus the holder, applies it, lets the holder's B check once, then pushes, moves and reconciles itself. Seats never push.

## Decisions

- D1. The batch record lives on the holder leaf's `state.yaml` as optional `batch`: `{ attempt, built_on, members: [{ slug, base, head, tip }], top?, tested_top?, candidate?, applied }`. `base` is `git merge-base <built_on> <member.head>`; `head`/`tip` are the saved and rebased commits. Members exclude the holder; the holder is the record's owner. A leaf-level `solo: true` marks a leaf excluded from every batch until `commitMove` clears it on any move out of `merge`.
- D2. Merge dispatch leaves `dispatchLeaf`/`sweep`. A new `mergePass(repo)` in `src/next.ts` owns the turn lifecycle and runs its own short locked sections, called unlocked from `nextCommand` post-pass steps and `mergeWake`: lock → reconcile any existing record / write a new record → unlock → build → lock → verify attempt and apply → unlock → prompt the holder's B (`dispatchSlot` gains an optional context suffix). Merge-phase leaves inside the generic sweep return `waiting`; the `ordered.push` holder-fail revisit in `sweep` becomes dead and is removed.
- D3. Build is disposable git state: a detached worktree under `leafTemp(repo)/batch-<attempt>`. For each member in queue order run `git rebase --onto <tip> <member.base> <member.head>` (tip starts at `built_on`, the tracking ref), then the holder last. Rebase-or-abort: a member conflict aborts, marks that member `solo` under the lock, drops it, and rebuilds under a new attempt id. A holder conflict restores every member (drift check against `applied`) and prompts the holder with `solo` so B resolves in its own worktree.
- D4. Apply under the lock: verify `attempt` is still current, then `git -C <worktree> reset --hard <member.tip>` for each member and `reset --hard <top>` in the holder's worktree (`git update-ref` fallback when a worktree is gone). Set `applied: true` and `top` only after all resets. A pass finding a record without `applied` restores any drifted member to its saved head and rebuilds under a new attempt.
- D5. `phase merged --check --attempt <id>` on a batch holder: require the attempt match and worktree HEAD equal to `top`; run the `Test-Change` trailer check per member range `<predecessor>..<member.tip>` and cumulatively on `built_on..HEAD`; record `tested_top = HEAD`. For a `solo` record the same call just records `tested_top` (B rebased itself). Existing guards still run.
- D6. `phase merged --attempt <id>`: under the lock, require attempt current, HEAD == `tested_top`, and holder plus every member still in `merge`; record `candidate`, `git push <remote> <top>:<default_branch>` fast-forward only, then `commitMove` carried members in queue order and the holder last. Non-fast-forward refusal: mark the record for restack, release the lock, rebuild onto the new tracking ref, re-apply under the lock keeping the same attempt, clear `tested_top`, print `fresh checks required` with the new top. Other push errors print their cause. A member out of `merge` at the recheck refuses the push, restores the remaining members, clears the record without solo marks and prints the dissolution.
- D7. `phase check.fix --attempt <id>` with carried members: restore each member's branch and worktree to its saved head, set `solo`, clear the record, print `batch dissolved, merge solo`, and do not commit any move (holder stays in `merge`; the post-call `mergeWake` gives it a fresh pass). With no members it moves the holder to `check.fix` as today.
- D8. Reconcile inside `mergePass` when a record exists and the holder left `merge` or is in `merge` with an unfinished finish: `git fetch <remote>`; `candidate` ancestor of `<remote>/<default>` means finish remaining moves by ancestry (member whose `tip` is an ancestor moves to `merged`; completed members recovered from phases and ancestry; holder moved if still in `merge`), then close member tabs. `candidate` not on the ref restores every non-merged member to its saved head and clears the record, no solo marks. A failed fetch restores nothing, keeps the record, and reports the error. A `failed` holder with a landed `candidate` gets a herdr notice naming `akrogon phase <slug> merge` as the next step; the move back lands in `merged` by ancestry without a run.
- D9. `dispatchDependents` fires on every `completed` sweep outcome, not only the explicit single-leaf path, so moved members wake their `blocked-by` leaves. `closeMergedTab` and `cleanupMerged` skip a leaf that is a recorded member of an in-flight batch (holder's record names it and is not cleared); `mergePass` closes member tabs once the holder finishes.
- D10. Every `merged`, `merged --check` and `check.fix` call on a holder carrying a record requires `--attempt <id>` matching the current attempt; a stale or missing id is refused and changes nothing. `akrogon.ts` gains the `attempt` option for `phase`. Once the record is cleared, plain calls work as today. Operator moves without `--slot` keep working only when no record exists.
- D11. The merge prompt becomes `merge-issue <slug> slot=B phase=merge leaf=<path> attempt=<id> top=<sha>` for an applied batch (including a memberless one) or `attempt=<id> solo` after a holder conflict. Existing merge-prompt text expectations in `tests/next.test.ts` are updated to the new shape.
- D12. Batch engine helpers (build, apply, restore, ancestry, drift check) live in a new `src/batch.ts` importing `state`, `shell`, `config`, `turn`, `log` only, so `phase.ts` can use them without importing `next.ts`. `commitMove` clears `solo` on moves out of `merge`; the record itself is cleared only by the paths above.

Open limitation (preserved, owned by record-only-reuse): a refused push always restacks and prints `fresh checks required`; no record reuse across the refusal.

## Read first

- `src/state.ts` — `stateSchema`, `commitMove` call site in `phase.ts`, `withLock`, `allLeaves`, `findLeaf`.
- `src/turn.ts` — `eligibility`, `mergeQueue`, `QueueEntry`.
- `src/next.ts` — `dispatchLeaf` merge guard, `sweep`, `mergeWake`, `dispatchDependents`, `cleanupMerged`, `closeMergedTab`, `nextCommand` lock scope, `leafTemp`.
- `src/phase.ts` — `phaseCommand`, `transition`, `commitMove`, `completeOwner`, `requireTestChangeCitations`, `requireClean`.
- `src/akrogon.ts` — `phase` option set and `mergeWake` finally-hook.
- `src/log.ts`, `src/shell.ts` — `readLog`, `command`/`run`/`CommandError`.
- `tests/helpers.ts`, `tests/fake-herdr.ts`; merge-turn tests at `tests/next.test.ts:3889-4162` and `tests/phase.test.ts:1792-1871`.
- `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, `README.md` command table.

## Interfaces

- `mergePass(global, repo): Promise<void>` — record, reconcile, build, apply, prompt; callable only unlocked.
- `buildStack(repo, record): Promise<{ tips: Map<string, string>, top: string } | { conflict: string }>`; `applyStack`, `restoreMembers`, `stackAncestry` in `src/batch.ts`.
- `phaseCommand(..., attempt)` signature extended; `transition` unchanged (batch logic wraps it).
- `dispatchSlot(..., context?: string)` appends ` ${context}` to the prompt.

## Waves

### Wave 1

U1 — record and engine.
- Owns: `src/state.ts`, `src/batch.ts` (new), `tests/batch.test.ts` (new), `tests/helpers.ts` (any shared batch fixture helper).
- Shared test resources: none beyond read-only use of `helpers.ts`.
- Land first: none.
- Criteria: schema accepts/rejects batch and solo shapes; build produces tips in queue order onto a bare-remote base; member conflict returns `{ conflict }` and a new attempt is usable; `reset --hard` apply and restore move real branches and worktrees.

### Wave 2

U2 — pass orchestration. Land first: U1.
- Owns: `src/next.ts`, `tests/batch-dispatch.test.ts` (new), merge-prompt expectations in `tests/next.test.ts`.
- Shared test resources: fake-herdr database in fixture home (own file, no sharing with U3's file).
- Criteria: record written before prompt; prompt carries `attempt` and `top`; late joiner excluded; interrupted build rebuilds without live branch change; holder-fail mid-run restores members and prompts next; reconcile paths (landed / not landed / fetch fails / post-push resume); dependents woken per member; member tabs closed only after holder finishes; member worktree/tabs untouched while in-flight.

U3 — phase calls. Land first: U1.
- Owns: `src/phase.ts`, `src/akrogon.ts`, `tests/batch-merge.test.ts` (new), `tests/phase.test.ts` touch-ups if refusal text changes.
- Shared test resources: none.
- Criteria: `--attempt` required and stale refused; `merged --check` validates member ranges and records `tested_top`; green `merged` pushes once and moves members then holder with correct completion lines; member `failed` during run means no push; refused push prints `fresh checks required` and the rerun pushes the restacked top; red `check.fix` dissolves with restores and solo marks, no-member red moves holder; criterion 6 stale call refused.

### Wave 3

U4 — skill and docs. Land first: U2, U3 (wording must match shipped behavior).
- Owns: `skills/merge-issue/SKILL.md`, `README.md`, `docs/guide/merge.md`, `docs/guide/phases.md`, `docs/guide/state.md`, `docs/guide/next.md`, `tests/command-reference.test.ts`, `tests/docs-links.test.ts` if anchors change.
- Criteria: skill describes attempt/top or solo prompts, no seat push, check-then-merged flow, `fresh checks required` and `batch dissolved, merge solo` handling, briefs gathered before `merged`; README `--attempt`; guide merge/state/phase pages describe batching, solo marks and reconcile.

## Verification

Proof commands run in the leaf worktree: `bun test tests/batch.test.ts tests/batch-dispatch.test.ts tests/batch-merge.test.ts` plus `checks` (`bun run format`, `bun test --timeout=30000`, `bun run typecheck`, `bun test --changed=$AKROGON_BASE --timeout=30000`).

| Criterion | Proof (test) | Failure it catches | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1 one push, order, all merged | batch-merge: three leaves land, remote log order member,member,holder, check-run counter file shows 1 | extra check runs, wrong order, member left in merge | minutes | batch-merge.test.ts changed or push/move code changed |
| 2 member conflict solo | batch-merge: member2 conflicts on member1; restored to saved head, `solo`, absent from push | wrong restore, missing solo mark | minutes | same |
| 3 red dissolve + red solo | batch-merge: failing check → `check.fix --attempt` prints `batch dissolved, merge solo`, members restored+solo; solo red → `check.fix` | push on red, moved members, missing solo | minutes | same |
| 4 member failed mid-run | batch-merge: `phase member failed` between `--check` and `merged` → refused, remote unchanged | push with departed member | minutes | same |
| 5 holder fail mid/post push | batch-dispatch: fail holder after apply → members restored, next leaf prompted; post-push failure → nothing restored or rerun | live branches left rebased, double push | minutes | batch-dispatch.test.ts or reconcile changed |
| 6 stale attempt refused | batch-merge: old `--attempt` → nonzero, remote ref unchanged | stale seat pushing | seconds | same |
| 7 resumed pass finishes moves | batch-dispatch: candidate pushed, partial moves → pass completes moves without push/check | rerun checks or repush | minutes | same |
| 8 wake + member tab timing | batch-dispatch: dependent of member prompted; member tabs close after holder finishes; sweep doesn't remove member worktree mid-run | dependents never woken, early tab/worktree removal | minutes | same |
| 9 member adds package | batch-merge: fixture `file:` dep member + `setup` → single check run passes; restored member solo run installs in its own worktree (marker file) | skipped install on batch top, wrong install dir | minutes | same |
| 10 completion lines | batch-merge: batch closes standalone issue and part of epic → one `issue complete`, no `epic complete` | duplicate or wrong broadcast lines | minutes | same |
| 11 interrupted build | batch-dispatch: record without `applied` → no live member branch changed, holder prompted once after rebuild | half-applied stack, double prompt | minutes | same |
| 12 late joiner | batch-dispatch: leaf enters `merge` after record → absent from push, next holder | unbounded batch | minutes | same |
| 13 fetch fail | batch-dispatch: remote renamed → pass reports fetch error, no restore, record kept | restore on unproven remote state | seconds | same |
| 14 post-push holder failure | batch-dispatch: notice names `akrogon phase <slug> merge`; move back lands `merged` with no check/push | missing notice, extra run | minutes | same |
| 15 solo leaf re-carried | batch-dispatch: solo leaf leaves `merge` and returns → member of next batch | permanent exclusion | minutes | same |
| 16 refused push restack | batch-merge: remote advanced externally → `fresh checks required`, nothing moved; rerun pushes restacked top | lost rerun, force-push, moved members | minutes | same |

Docs affected: `README.md` (phase `--attempt`), `docs/guide/merge.md` (batching, solo, dissolve, reconcile), `docs/guide/phases.md` (merge row), `docs/guide/state.md` (`batch`, `solo`, `merge_stamp` keys), `docs/guide/next.md` (one line on the merge pass). `skills/merge-issue/SKILL.md` rewritten for the command-owned push protocol.

No credentials required: `produces`/`inputs`/`grants` are empty and `akrogon status merge-batch` prints no `Missing:` lines.

## Implementation notes

2026-10-05

- The batch record sits on the holder leaf's `state.yaml` as `batch` and is cleared only by the paths in D6-D8, never by `commitMove`, so reconcile can inspect it after the holder leaves `merge`. `commitMove` gains one line: `solo` clears on any move whose destination is not `merge` (refines D1).
- `record.solo` (on the record, not the member flag) marks a holder that rebases itself: solo-marked holders and the holder-conflict path. `record.applied` becomes true only after all resets for an applied stack, or immediately for a `solo` record. A `solo` record keeps `members: []` after restore (refines D3/D4).
- `merged --attempt` on a record holder pushes `record.top` only when `record.applied && record.top` exists; for a `solo` record it pushes the worktree `HEAD` after `tested_top` match (refines D6).
- `merged --check --attempt` writes `tested_top` only after every batch validation and the existing guard set pass, keeping the write atomic with the `ok` result (refines D5).
- `--attempt` is required on `merged`, `merged --check` and `check.fix` calls that carry `--slot B` when the holder has a record. A no-slot operator `merged` on a record holder skips the attempt and `tested_top` gates and runs the same push-and-moves path; `failed` never needs it (refines D10, keeps the turn-release operator-merge exit path).
- A member-out-of-`merge` recheck at `merged --attempt` refuses, restores the still-recorded members, clears the record and exits nonzero; the dissolved holder is reprompted by the post-call `mergeWake` under a fresh record (refines D6).
- A `check.fix` dissolve sets the phase command's `committed` flag so `akrogon phase`'s finally-hook runs `mergeWake`, but commits no transition for the holder (refines D7).
- Non-fast-forward detection: the `git push` result is treated as refused when its code is nonzero and stderr contains `non-fast-forward` or `[rejected]`; after a fetch, if `record.candidate` is already an ancestor of the tracking ref the push is a lost reply and the moves proceed without re-pushing (refines D6).
- Restack reuses `applied: false` + same attempt + rebuild + apply, clearing `tested_top` at restack start under the lock, so a crash mid-restack hits the existing interrupted-build reconcile (refines D6/D8).
- The per-member trailer check reuses `requireTestChangeCitations` logic parameterized by range base (exported helper gains a `from` argument); the cumulative check over `record.built_on..HEAD` reuses the existing call unchanged (refines D5).
- `mergePass` calls `dispatchLeaf` for the holder after apply, passing the context string through to `dispatchSlot`; `dispatchLeaf` keeps its merge guard so only the queue head proceeds and members are never prompted (refines D2/D11).
- Existing merge-turn tests in `tests/next.test.ts` are updated, not weakened: leaves moved into `merge` after the holder's record is written are outside the batch, which preserves the next-holder wake assertions verbatim.
- 2026-10-06 check.fix: `batch` gains required `holder: { base, head }` (the holder's saved merge-base and pre-batch head). Every path that removes members from an applied stack (dissolve, departure refusal, restack conflict drops, interrupted-build rewrite) restores the holder to `holder.head` before continuing, and restack rebuilds the holder range from `holder.head` so member commits cannot ride along. `move()`/`applyStack`/`restoreMembers` never `reset --hard` a dirty worktree: they `update-ref` and report the leaf; apply-stage callers solo-mark dirty members and take the solo-record path for a dirty holder; restore paths solo-mark dirty members. Refines D3/D4/D6; resolves review findings A F2 and B F2.
