# Review A: red-batch-culprit

- Base: `2595d71097880793bb369c26248b657663a45aa0`
- Reviewed head: `b56407c7f2d0631db477be9fe5d9a81c962b2a52` (feat `5f5eb5a` + docs `b56407c`)
- Diff: `src/akrogon.ts` +`culprit` option; `src/phase.ts` +33 (parse, 4 upfront refusals, record guard, culprit branch); `tests/culprit.test.ts` +403 (new file, 5 serial tests); SKILL.md/README/`docs/guide/{merge,files,state}.md`/`tests/command-reference.test.ts` each 1-line edits.
- Evidence: reviewer ran the full suite earlier this pass context is reused from the implement report (636 pass / 0 fail / 49.4s) plus a fresh ad-hoc probe (see F1) executed in the worktree and then deleted.

## Behavior trace

`--culprit` parses beside `redOnBase`, refuses `--check`/`--red-on-base`/non-`check.fix`/non-B-slot upfront, requires a batch record, resolves the culprit against `memberEntries` (departed members refuse as outside the batch), preflights the transition's merge→check.fix guards against the saved head (`member.head`, `holder.head`, or `HEAD` for solo), then writes in the locked design order: `restoreMembers` → `restoreHolder` → clear `batch` → `appendAttempt(..., 'ejected', culprit)` → `transition('check.fix', 'B')`. `commitMove` bumps `fix_rounds` on the merge origin and keeps `merge_stamp`; the cap maps to `failed` via the shared `capped` path. Write order, refusal order and no-`batch_limit` all match plan D1-D4 and the locked design.

Docs edits match the code: SKILL :65 now reads base → culprit → split with the evidence copy into the culprit's `review-B.md`; guide merge.md, files.md (`ejected` listed), state.md (`batch_limit` clause), README row and the contract test all updated. `src/AREA.md` unaffected (names no red ending; all paths it lists exist). No AREA.md in the diff.

## Findings

### Fix

**F1 — `--culprit` silently accepts `--verdict` or `--reason` and commits the ejection.**
- Source (real, reproduced): in a temp fixture `akrogon phase hold check.fix --slot B --attempt a1 --culprit mem-a --verdict ready` exited `0`, printed `ejected mem-a`/`moved check.fix`, restored `mem-a` to its saved head, cleared the record (mergeWake rebuilt a solo batch) and wrote the `ejected` attempt line. The verdict was dropped, not refused. Same for `--reason oops`.
- Consequence today: a mistyped or stale flag on the B call commits a real ejection — branches moved, batch dissolved, attempt line written — instead of a refusal. A solo `check.fix --verdict` call on the same leaf refuses (`--verdict` is only valid for `check.review`-origin moves via `transition`), so `--culprit` is strictly less strict than the ending it replaces; B's script has no signal that its command line was malformed.
- Criterion/gap: brief criterion 4 (`--culprit ... refused ... no state, branch or record change`) fails for the flag-shape misuse the preflight is meant to cover; the upstream guard exists in `transition` but runs after the branch's writes, and in this path the flags are passed `undefined` so it never runs.
- Repair: refuse upfront beside the other culprit checks — `if (culprit !== undefined && verdict !== undefined) throw` and `... && reason !== undefined) throw` (`--verdict is only valid for check.review`/`--reason is only valid for failed`-style messages), plus a refusal case in `tests/culprit.test.ts`.

### Nits

- **N1 — Refusal text style.** New messages use `--culprit <slug> is not the holder or a carried member of <holder>` / `--culprit <slug>: slot B already recorded`, while `transition` uses `Slot already recorded: B` / `Merge turn refused for <slug>: holder is <holder>`. Deferred: wording inconsistency costs a greppable cosmetic difference only. Promotion: a caller or doc that depends on message shape.
- **N2 — Solo-record `--culprit` untested.** `record.solo === true` selects `savedHead: 'HEAD'` and a no-op `restoreHolder`; code reads correct but no test drives it. Deferred: criterion set (1-5) doesn't name it and the path reuses the solo shape exercised by `tests/hold.test.ts`. Promotion: a reported solo-ejection failure or a change to `restoreHolder`'s solo branch.

## Verdict

`fix` — F1 blocks.
