# Implementation report: red-batch-culprit

## Changed files and reasons

- `src/akrogon.ts` — `culprit` phase option; passed as trailing `rawCulprit` to `phaseCommand`.
- `src/phase.ts` — `rawCulprit` param and parse; four upfront refusals beside the `--red-on-base` block (`--check` conflict, `check.fix`-only, `--red-on-base` conflict, `--slot B` required); `--culprit requires a batch record` guard; new `else if (culprit !== undefined)` branch between the `redOnBase` and `merged` branches: membership against `memberEntries` (departed members refuse as outside the batch), saved head (member `head`, `holder.head`, `HEAD` for solo), preflight mirroring the transition's merge → check.fix guards (done-slot, `requireClean`, `requireNoIssueFiles`, `requireTestChangeCitations` against the saved head) before any write, then `restoreMembers` → `restoreHolder` → clear `batch` → `appendAttempt(..., 'ejected', culprit)` → `ejected <slug>` → `transition(..., 'check.fix', 'B')`. No `batch_limit`, no `solo` marks.
- `tests/culprit.test.ts` — new file, 5 `test.serial` tests; `batchFixture`/`soloFixture`/`branchAt`/`attemptLines`/`headOf` copied from `tests/merge-attempts.test.ts`.
- `skills/merge-issue/SKILL.md` — red ending states base → culprit → split, including the finding B writes into the culprit's own `review-B.md` before dispatch; hold and replay sentences preserved.
- `README.md` — `phase` row gains `[--culprit <slug>]` and an ejection clause.
- `tests/command-reference.test.ts` — `contracts.phase` gains `[--culprit <slug>]`.
- `docs/guide/merge.md` — same base/culprit/split order in guide prose.
- `docs/guide/files.md` — `ejected` joined to the written outcomes.
- `docs/guide/state.md` — a culprit ejection clears the record without `batch_limit` (the prior sentence claimed every red holder carries one).

## Tests run

- `bun test tests/culprit.test.ts --timeout=30000` — 5 pass, 0 fail (all-fail before implementation: unknown `--culprit` option).
- `bun test --changed="2595d71097880793bb369c26248b657663a45aa0" --timeout=30000` after each cherry-pick — 27 pass then 31 pass, 0 fail.
- `bun run typecheck` — clean.
- `bun run format` — clean for this diff; rewrote pre-existing drift in untouched `src/status.ts`, reverted (known lesson 2026-10-08).
- `bun test --timeout=30000` — 636 pass, 0 fail, 6834 expects, 49.4s wall. Log: /tmp/red-batch-culprit-full.log.

## Criterion proof map

1. Member ejection → `a member culprit ejects to check.fix ...` test (phases, saved heads, `merge_stamp`, `fix_rounds` +1, cleared record, one `ejected` line naming the culprit; unpause + `next` proves the rebuild carries only the survivor).
2. At-cap culprit → `a culprit at the fix-rounds cap ends failed ...` (shared `attempts`/`fix rounds exhausted` outcome).
3. Holder ejection → `a holder culprit ejects itself ...`.
4. Refusals → `refused --culprit calls exit nonzero ...` (stale/missing attempt, slug outside the batch, dirty culprit worktree, flag-shape refusals; state, branches, record and jsonl untouched) and `--culprit on a merge leaf without a batch record is refused`.
5. Split without `--culprit` → unchanged `tests/batch-merge.test.ts` (`a red check.fix halves ...`) and `tests/merge-attempts.test.ts` (`a batch check.fix appends exactly one split`), both green in the full run.
6. Docs → `tests/command-reference.test.ts` and `tests/docs-links.test.ts` green; SKILL.md and `docs/guide/merge.md` carry the base/culprit/split order and the evidence copy.
7. Blocking checks → all three `checks` commands above pass.

Deliberate-break proof: commenting out `appendAttempt` turns the criterion-1 test red (`Expected length: 1, Received length: 0`); restored to green.

## Base and commits

- Base: `2595d71097880793bb369c26248b657663a45aa0` (AKROGON_BASE).
- `5f5eb5a` feat: eject one leaf from a red batch with --culprit
- `b56407c` docs: document the --culprit red-batch ejection ending (with `Test-Change:` trailer for `tests/command-reference.test.ts`)
- Head: `b56407c`. Both wave-1 worker commits cherry-picked cleanly; worker worktrees removed.

## Known limitations

- `docs/guide/merge.md` omits the solo-holder restore exception, matching surrounding detail level.
- The at-cap culprit still writes its `ejected` attempt line before `transition` fails it, matching the design's write order (attempt line belongs to the batch, failure to the leaf).

## Unverified criteria

None.
