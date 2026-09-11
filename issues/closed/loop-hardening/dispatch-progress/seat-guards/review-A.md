# Review A: seat-guards

Base: 9dc1055a0a1ba3682335622d81f41873de966f11
Reviewed head: 572a624b9b1a141072f6a1f32454a9282482fd57
Diff scope: src/next.ts, tests/next.test.ts only. Working tree clean after `bun run format`.

## Verdict: ready

## Findings against plan and brief

- D1 session guard (`src/next.ts:318`): skip requires a defined prompted value and an equal session value. Null and omitted session data now prompt. Tests cover both, plus the existing matching/changed-session cases.
- D2 merge guard (`src/next.ts:407`): recorded merge seat via `seatFor(state, 'A')` with `busy(pane)`, so blocked and working both return `waiting` before `recoverMerge`. Tests for seat A and seat B use a PATH git wrapper that logs every call and delegates to the real binary. The log file is read unconditionally, so a missing wrapper would fail the test, proving the probe was active. No `fetch` and no `status --porcelain` are recorded, state and prompts are unchanged, dirty file survives.
- D3/D4 allocate (`src/next.ts:252-275`): only zero members throws. Recorded A and B resolved independently by ID. Missing seat splits from the surviving recorded seat. Both missing with members splits from an anchor then from new A, never adopting a member. Bootstrap (new tab, or neither seat ever recorded) uses the initial member as A. Traced all six cases by hand and they match the decisions. Tests cover neither/A/B/both missing with an operator pane listed first, plus interrupted split, empty tab and recreated tab with stale IDs.
- D5 timeouts: start `--timeout 30000`, prompt keeps `--wait --until working --timeout 5000`. Asserted on recorded arguments.
- `slot` field write at `src/next.ts:324` untouched. Existing blocked-agent wait test unchanged in the diff.
- Docs: `docs/next.html`, `docs/merge.html`, `docs/limits.html` and `REFERENCE.md` never stated the two-pane limit or the 5 s start timeout, so no prose is stale. No lesson claim was made by the implementation.
- No mocks of the unit under test. Tests run the real CLI against temp Git repos and the existing Herdr process fixture.

## Verification (rerun by A on the worktree)

- `bun run typecheck`: exit 0
- `bun run format`: exit 0, no file changes
- `test_changed` (AKROGON_BASE=9dc1055): exit 0, 48 pass, 0 fail, 338 assertions
- `bun test`: exit 0, 104 pass, 0 fail, 1051 assertions

## Nits

None.

## Merge (slot A)

Rebased 572a624 onto origin/main 35a2088 cleanly. Rebased head: 131b02d. AKROGON_BASE refreshed to 35a20886b65463c0c7c6b0a30047f56a680d5e63.

- `bun run format`: exit 0, no changes
- `bun run typecheck`: exit 0
- `test_changed` (base 35a2088): exit 0, 48 pass, 0 fail
- `bun test`: exit 0, 137 pass, 0 fail

No advisory checks configured. No nits.
