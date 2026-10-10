# Plan: red-batch-culprit

Debate is off (`debate: "no"`); this synthesis plans directly from brief, locked design and live surfaces.

## Decisions

- D1 — CLI surface and refusal matrix. `src/akrogon.ts` gains `culprit: { type: 'string' }` in the `phase` options and passes `values.culprit` as a new trailing `rawCulprit` parameter of `phaseCommand`. Upfront refusals beside the `--red-on-base` block (src/phase.ts:778-784): `--culprit is only valid for check.fix`, `--culprit requires --slot B`, `--check cannot combine with --culprit`, `--culprit cannot combine with --red-on-base`. The `--command requires --red-on-base` check already makes `--command` unusable with `--culprit`. The slot requirement runs before the merge branch so the stale-attempt refusal (src/phase.ts:806-809) still fires on `--slot B` calls, and any refusal lands before the first write, matching the `--red-on-base` shape.
- D2 — Membership and preflight, all inside the existing `.lock` before any write, in the culprit branch placed after the `redOnBase` branch and before `requested === 'merged'` (src/phase.ts:811-854). `--culprit` requires `record !== undefined` (`--culprit requires a batch record: <slug> holds none`). The culprit is the holder slug or a slug in `memberEntries(repo, record)` (so a member whose leaf left `merge` counts as outside the batch and is refused like any unknown slug: `--culprit <slug> is not the holder or a carried member`). Then preflight mirrors the merge -> check.fix guards of `transition` for the culprit leaf: `!culpritState.done.includes('B')` (slot-already-recorded check), `requireClean(culprit.state.worktree)`, `requireNoIssueFiles(repo, culprit.state.worktree, culprit.path, target(repo), savedHead)`, `requireTestChangeCitations(repo, culprit.state.worktree, target(repo), savedHead)`. `savedHead` is the member's `record.members[].head`, `record.holder.head` for a non-solo holder culprit, or a `HEAD` ref for a solo holder culprit (its exception: nothing restores it, so its live head is what the transition sees). A dirty culprit worktree or any guard throw exits the lock with zero state, branch or record change.
- D3 — Write order on success, verbatim from the locked design: `restoreMembers(repo, memberEntries mapped to { ...member, leaf })`, `restoreHolder(repo, leaf, record)` (keeps the solo-holder exception: `src/batch.ts:123` no-ops on `solo === true`), `saveState(holder, batch: undefined)`, `appendAttempt(repo, leaf.state.slug, record, 'ejected', culpritSlug)` (schema already accepts the outcome and the optional culprit field, `src/attempts.ts:6,15`), print `ejected <culpritSlug>`, then `transition(repo, culpritLeaf, 'check.fix', 'B', undefined, undefined, false, onCommitted)`. `commitMove` (src/phase.ts:151-157) bumps `fix_rounds` (merge origin counts per the landed merge-bounce-rounds work), keeps `merge_stamp`, and the cap at src/phase.ts:307-310 turns an at-cap culprit into `failed` with the shared `fix rounds exhausted` outcome — no special-casing.
- D4 — No `batch_limit` is set on ejection and nothing else carries forward. Clearing the record commits the call; `akrogon phase`'s `mergeWake` rebuilds the next turn's batch from the queue (holder culprit: the next eligible leaf becomes holder; member culprit: the holder rebuilds with the survivors), which is exactly the design's "next mergeTurn rebuilds from the queue with the existing build".
- D5 — Skill and docs. `skills/merge-issue/SKILL.md` (the red-ending paragraph at :65) states the order base, culprit, split: after the base-red ending and before the un-attributed split, B names the holder or one carried member from evidence, first writes the finding (exact command, arguments, tested base and top, logs, attributed diff, restored head from the saved member head) into that culprit's own `review-B.md`, then calls `check.fix --slot B --attempt <id> --culprit <slug>`; the red-main-hold and bounce-repair-proof sentences stay. `README.md` command row and `tests/command-reference.test.ts` contract gain `[--culprit <slug>]` on `phase` and the effect text names the ejected ending. `docs/guide/merge.md:29` gets the same base/culprit/split narrative. `docs/guide/files.md:72` adds `ejected` to the written outcomes. `docs/guide/state.md:54` gets one clause: an ejected ending clears the record without a limit, since the current "a holder whose batch ran red carries `batch_limit`" rule becomes false.
- D6 — Tests live in a new `tests/culprit.test.ts` carrying the `started`-bearing `batchFixture`/`soloFixture` shape copied from `tests/merge-attempts.test.ts` plus its `attemptLines`, `headOf`, `branchAt` helpers and the `AKROGON_LEAF_TEMP_ROOT` boilerplate. `test.serial` throughout, repo paused before the ending call where a rebuilt batch record must be inspected deterministically (the `mergeWake` rebuild after the call is asserted only where the brief names it, not duplicated for the split-covered cases).

## Read-first

- `src/phase.ts:238-320` (`transition` guards and cap), `src/phase.ts:382-396` (`memberEntries`), `src/phase.ts:774-883` (`phaseCommand`, the `--red-on-base` and split endings to mirror).
- `src/batch.ts:93-125` (`move`, `restoreMembers`, `restoreHolder` dirty-ref semantics).
- `src/attempts.ts` (outcome schema, `appendAttempt` culprit parameter).
- `src/routing.ts:47-56`, `src/state.ts:35-95` (`Batch`, `State` fields; `done` is cleared on every committed move, so the preflight slot check is belt against unreachable states).
- `src/akrogon.ts:14-27,58-78` (options map and dispatch).
- `tests/merge-attempts.test.ts` (fixture source for D6), `tests/hold.test.ts:358-425` (refusal test shape), `tests/batch-merge.test.ts:355-400` (split behavior the ejection replaces).
- `skills/merge-issue/SKILL.md:65`, `docs/guide/merge.md:29`, `README.md:136`, `tests/command-reference.test.ts:16`, `docs/guide/files.md:72`, `docs/guide/state.md:54`.

## Interfaces

- `phaseCommand(slug, phase, slot, verdict, reason, check, attempt, redOnBase, command, culprit)` — new trailing parameter; the only caller is `src/akrogon.ts`.
- Reused unchanged: `transition`, `memberEntries` (private to phase.ts, reused in place), `findLeaf`, `restoreMembers`, `restoreHolder`, `requireClean`, `requireNoIssueFiles`, `requireTestChangeCitations`, `target`, `appendAttempt`, `attemptRecordSchema` (no schema change; `ejected` and `culprit` already exist).

## Checklist

### Wave 1

- U1 — Command and tests. Owns `src/akrogon.ts`, `src/phase.ts`, `tests/culprit.test.ts` (new). No shared test resource; the fixture's temp repos and fake herdr are per-test. Criteria: brief 1, 2, 3, 4 (part: command refusals), 5.
- U2 — Skill and docs. Owns `skills/merge-issue/SKILL.md`, `README.md`, `docs/guide/merge.md`, `docs/guide/files.md`, `docs/guide/state.md`, `tests/command-reference.test.ts`. No dependency on U1's code landing: the contract string and doc prose are text. Criterion: 6.

Both units are independent and share one wave.

### Commit trailers

`tests/command-reference.test.ts` is an existing test file: its commit needs a `Test-Change: tests/command-reference.test.ts <source and reason>` trailer naming the `--culprit` contract addition. `tests/culprit.test.ts` is a new file: no trailer. Source and doc files need none.

## Verification

| Criterion | Proof | Catches | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1 member ejection | `bun test tests/culprit.test.ts -t 'culprit member ejects'`: batch hold+mem-a+mem-b, `--culprit mem-a`; asserts mem-a in check.fix at saved head, `fix_rounds` +1, `merge_stamp` unchanged, hold and mem-b still in merge at saved heads, `batch: undefined` on the holder (paused repo so no rebuild), exactly one `merge-attempts.jsonl` line `{ outcome: 'ejected', culprit: 'mem-a', members: [mem-a, mem-b] }` | missed restore, missing attempt line, stamp or rounds drift | seconds | src/phase.ts, src/batch.ts, src/attempts.ts |
| 2 at-cap culprit | `bun test tests/culprit.test.ts -t 'culprit at the fix rounds cap'`: config `fix_rounds: 1`, culprit leaf `fix_rounds: 1`; asserts `moved failed`, `failure.cause === 'attempts'`, `phase === 'merge'` in the failure record | cap bypass | seconds | src/phase.ts |
| 3 holder ejection | `bun test tests/culprit.test.ts -t 'culprit holder ejects'`: `--culprit hold`; asserts hold in check.fix, mem-a and mem-b in merge at saved heads, record cleared | holder-vs-member asymmetry | seconds | src/phase.ts |
| 4 refusals | `bun test tests/culprit.test.ts -t 'culprit refusals'`: stale/missing attempt, unknown slug (and a departed member is outside the batch), dirty culprit worktree; each exits nonzero, names the reason, leaves `batch`, branches, worktrees and `merge-attempts.jsonl` untouched | pre-write mutation, missing preflight | seconds | src/phase.ts, src/akrogon.ts |
| 5 split without culprit | existing `bun test tests/batch-merge.test.ts -t 'a red check.fix halves'` and `bun test tests/merge-attempts.test.ts -t 'a batch check.fix appends exactly one split'`: unchanged `check.fix` still halves and appends `split` | regression in the default ending | seconds | src/phase.ts |
| 6 docs and contract | `bun test tests/command-reference.test.ts tests/docs-links.test.ts`; grep of the SKILL red paragraph for base/culprit/split order | doc drift, contract mismatch | seconds | docs files, README, src/akrogon.ts |
| 7 blocking checks | `bun run format`, `bun run typecheck`, `bun test --timeout=30000` | any suite regression | minutes | every change |

Deliberate-break proof for the suite: comment out the `appendAttempt` call — criteria 1 and 4 tests go red (missing `ejected` line), then restore.

## Notes and limitations

- The printed success line is `ejected <slug>` followed by the transition's `moved check.fix` (or `moved failed` at the cap); the brief names no wording, tests assert the `ejected <slug>` line.
- `src/AREA.md` and `docs/guide/phases.md` do not describe red endings today and stay untouched; `docs/guide/state.md:54` is the one stale rule the ending creates (ejection carries no `batch_limit`).
- A member whose leaf left `merge` before the call refuses as outside the batch rather than restoring its branch — consistent with `memberEntries` filtering everywhere else.
- No credentials, grants or operator action are required; `akrogon status` shows no `Missing:` lines.
