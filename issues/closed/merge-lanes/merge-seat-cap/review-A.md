# Review A: merge-seat-cap

Base: `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444`. Reviewed head: `daeec29a4816f7b2ffb6d6e57cbc608e5f590407` (commits d49b7bb8, ad2cb3fd, 633db0ad, daeec29a; worktree clean).

## Criterion checks

1. **Counting** — `unfinished` excludes `merge` in `activeCount` (src/next.ts:372-374). The predicate is shared by the live-session filter, the refused-session filter and `seated`, so one edit covers every arm; `unknown` (`max_active`) and `unreadable` terms untouched; `allocate`'s live-seat early return untouched (merge holder re-prompt unaffected). Tests T1/T2 at tests/next.test.ts end prove the live and refused branches for merge (seated) vs check.repair/implement (refused); `plan.synthesis` counting is exercised by T3's waiter holding capacity. Green in implement proof (`check cap-count: 0`) and verify.
2. **Wait reason** — `end('capacity')` at the only dispatchLeaf `allocated === null` site (src/next.ts:762); `broadcastPass` unchanged (design Taken 3); `recordWait` dedup untouched → exactly one `capacity` row across repeated refusals (T3, `check cap-wait: 0`); `waitReasonSchema` + `waitOrder` carry the literal → `wait capacity` in slug and cohort reports (T4, `check cap-report: 0`); all pre-change reasons remain in the enum so old ledgers parse.
3. **Text** — read: docs/reference/config.md `max_active` row, limits.md bullet, run-work.md paragraph each state leaves waiting in merge do not count while keeping prior claims; files.md `wait <reason>` lists `capacity`; seatCommand error names the exclusion.

## Doc and surface audit

- No `AREA.md` in the diff.
- Docs for the changed behavior read (config.md, files.md): claims accurate. `commands.md`, `park-pause-stop.md`, `dispatch-order.svg` make no counting claim — no stale text. `skills/init-akrogon/` holds no `max_active` prose (plan D6) — confirmed, nothing owed.
- No other `WaitReason` enumeration or wait writer outside `dispatchLeaf` `end`, `mergeTurn`'s `merge_turn` and `park.ts` park/unpark rows.
- A merge leaf at turn head refused by non-merge leaves writes `capacity`; behind the turn it keeps `merge_turn` — consistent ordering.
- Trailer form on d49b7bb8 and ad2cb3fd matches the rule (added cases cite no source; corrected expectation cites observed output + mechanism).
- No lesson application in the diff; no model-choice criteria; no grants, paid launches or env names.

## Verification evidence

- `check cap-count: 0`, `check cap-wait: 0`, `check cap-report: 0` (implement pass, head daeec29a).
- `akrogon verify` on daeec29a green: format, test (1267 pass), typecheck; receipt `verify leaf daeec29a4816f7b2ffb6d6e57cbc608e5f590407: green`.
- Planning red evidence and four reverted deliberate-break proofs recorded in plan.md.

## Findings

No Fixes. No Nits recorded (duplicated 3-line `maxActive` helper matches the per-file helper convention; assert-order flexibility in T4 is deliberate per plan.md).

## Verdict

`ready`
