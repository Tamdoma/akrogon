# Implementation report: failed-with-cause

Base: `43ef0f7a7cb8908df33a734bbdee406b1563d408`
Head: `d0582362b8e09a4e3dab997308e3c3bc9dc467a4` — `failed-with-cause: seat-declared failed stop with typed cause`

Three delegated units (briefs 1–3 under `implementation/`), sequential in this worktree. Worker reports folded in from `implementation-report-brief-{1,2,3}.md`.

## Changed files and reasons

- `src/state.ts` — optional strict `failure` object (`cause`, `phase`, `slot`, `reason`, reserved `delivery`) and `Failure` export (D9).
- `src/routing.ts` — `failed` added to every active phase's `next`; `check.fix` added to `failed.next` (D1).
- `src/akrogon.ts` — `--reason` option on `phase`, forwarded to `phaseCommand` (D2).
- `src/phase.ts` — `phaseCommand` parses `rawReason` with `.min(1)`; `transition` refuses `--reason` misuse, runs the stop path before all worktree/verdict/barrier guards, skips `requireClean` only for `cause: 'blocked'` restarts, records `cause: 'attempts'` at the fix-rounds cap; `commitMove` takes `failure?`, clears `busy_since`/`busy_notified` on `failed`/`merged`, writes `failure` only on `to === 'failed'` (D3–D6). `reason as string` cast in the stop path: tsc does not narrow the two-check pattern; the invariant is enforced immediately above.
- `src/next.ts` — `activeCount` excludes `failed` in the readable filter and the unreadable branch; `dispatchLeaf` skips `observeBusy` for `failed`; `dispatchSlot` attempts cap passes `{ cause: 'attempts', phase, slot, reason: 'attempts exhausted' }` (D6, D7).
- `src/status.ts` — `note()` prepends `failed <cause> <reason>` / `failed` for legacy records, suppresses busy age for `failed`/`merged` (D8).
- `README.md` + `tests/command-reference.test.ts` — `[--reason <text>]` contract pair (D10).
- `tests/state.test.ts` — `failure` round-trip and strict rejection.
- `tests/phase.test.ts` — 6 new tests (stop on dirty worktree, stops from all phases with slot validation, blocked vs attempts restart, routing/reason guards, merged clears busy, fix-cap failure record); the `refuse check.fix` test updated to `moved check.fix`.
- `tests/next.test.ts` — 3 new tests (failed leaf capacity in readable and unreadable branches, blocked-pane observation skip) plus `failure` assertion on the three-misses cap test.
- `tests/status.test.ts` — NOTE cause/reason and terminal busy suppression test.

## Commands run

- `: "${AKROGON_BASE:?}" && bun test --changed="$AKROGON_BASE"` (`AKROGON_BASE=43ef0f7…`) — per unit: 164, 167, 168 pass, 0 fail.
- `bun test` (full suite, B) — 239 pass, 0 fail, 3028 expect() calls, 12 files, ~54s.
- `bun run typecheck` — clean.
- `bun run format` — applied; reformatted touched test files only.

## Known limitations

- `failed -> plan.positions`/`plan.rebuttal`/`check.review` without `--slot` prints `recorded` and stays in `failed` (pre-existing two-seat barrier behavior, unchanged).
- `src/AREA.md` line "every phase move rejects a dirty worktree" is now stale for `failed` stops and `blocked` restarts; outside the design's owned list, flagged for review.
- Guide HTML (`docs/guide/*.html`) still describes old failed-leaf recovery prose; outside owned surface.
- Herdr notification/tab rename and `failed_notified` removal remain with failure-attention; the existing `Failed leaf:` notification path is untouched.

## Unverified criteria

None. All brief done-criteria 1–7 are covered by the new tests above.

## Repair: check.fix round 1

Before: `d0582362b8e09a4e3dab997308e3c3bc9dc467a4`
After: `f91cea968ac46f5a30119e4ce03eac611cc66abd` — `failed-with-cause: refuse whitespace-only --reason, correct AREA.md invariant`

Findings repaired (review-A F1, N1 / review-B N1):

- `src/phase.ts`, `src/state.ts` — `--reason` and `failureSchema.reason` now `.trim().min(1)`: whitespace-only refused at the boundary and in stored records; padded reasons store trimmed text.
- `src/AREA.md` — dirty-worktree bullet corrected to name the `failed` stop and `cause: blocked` restart exceptions.
- `tests/phase.test.ts`, `tests/state.test.ts` — extended with blank/empty/padded reason cases and whitespace-reason schema rejection.

Verification: `bun test` 239 pass / 0 fail (3035 expects); `bun run typecheck` clean; `bun run format` applied. Worker report: `implementation-report-brief-4.md`.
