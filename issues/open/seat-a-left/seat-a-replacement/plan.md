# Plan: seat-a-replacement

Direct synthesis. `debate: no`, no positions or rebuttals. Source: brief.md, design.md, live `src/next.ts` allocate, `src/shell.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts`, probe `issues/chart/seat-a-left/forks/layout-scope-probe.md`.

## Read-first

- `docs/reference-index.md`
- `src/AREA.md`
- `tests/AREA.md`
- `learnings/LESSONS.md`
- `src/next.ts` ~337-438 (`allocate`)
- `src/shell.ts` (`herdr`, `tabs`, `tabSchema`, retry helper)
- `tests/fake-herdr.ts`
- `tests/next.test.ts` allocation cases (~1851-1900)
- `tests/helpers.ts` (`fakeHerdr`, `dispatchFixture`)
- `issues/chart/seat-a-left/forks/layout-scope-probe.md`

## Needed interfaces

- `herdr pane split <B> --direction right --cwd ... --env ... --no-focus` returns `{ pane }`
- `herdr pane swap --source-pane <B> --target-pane <newA>` returns `{ changed: true }`
- `herdr tab list` returns tabs with `.focused`
- `herdr tab focus <prevTab>` restores operator tab and workspace
- `herdr pane layout --pane <id>` returns rects (fake-only assertion, never called by prod)
- `saveState` / `readState` for intermediate and final saves
- `dispatchLeaf report()` for leaf-named error output

## Decisions

- D1: Repair runs only when recorded A is absent and recorded B survives in the leaf tab, and not on bootstrap (`matches.length === 0` or both panes undefined). All other paths keep current code with no swap and no focus call.
- D2: Read the operator focus as the `focused` tab from a fresh `tab list` right before the swap (after split and save). This narrows the switch window. Reusing the list from the top of `allocate` is rejected.
- D3: Split B right with the existing `placement` flags, then save the new A pane ID at once before the swap. A crash or swap error then retries with no second A.
- D4: Swap is one call `herdr pane swap --source-pane <B> --target-pane <newA>`, no retry helper, no second attempt. Source is B so the leaf tab keeps B focused.
- D5: After the swap, also after a swap error, run `herdr tab focus <prev>` once when prev exists and differs from the leaf tab. Skip when prev is the leaf tab. If the swap failed, still try restore, then throw the swap error; a restore failure there only warns. If the swap passed and restore fails, report the restore failure.
- D6: Swap failure throws an error naming the slug plus the herdr code and message. No retry, no close of the new pane, recorded A ID stays. Next pass finds recorded A present and starts no second A.
- D7: Fake herdr gains only parent-relative left/right geometry for `right` splits, `pane swap` by explicit IDs swapping rects, `pane layout` rects, a focused tab, and `tab focus`. Tests assert rects (`A.x + A.w <= B.x`) and focus, never only command strings. The replacement test fails before the fix (A right of B) and passes after.
- D8: Prod code never calls `pane layout`. Layout exists in the fake for assertions only.
- D9: Parse new herdr shapes loosely so real herdr 0.9.3 extra fields pass: tab list with optional `focused`, swap result as object with `changed` boolean and passthrough, tab focus result as loose object. Fake returns the same shapes.

Brief and design agree. No conflict note.

## Acceptance

- C1: Missing-A/surviving-B replacement ends with new A at or left of B (`A.x + A.w <= B.x`), B keeps its pane ID and agent.
- C2: Operator prev tab is focused again after replacement, including another workspace. Operator already in the leaf tab stays there with B as focused pane.
- C3: Swap failure reports leaf plus herdr failure, no retry, no close, new A ID stays recorded, next pass starts no second A. Position after error is not guaranteed.
- C4: New tab, bootstrap, B-only replacement keep A-left-of-B with no swap and no focus call. Both seats present keep IDs and positions (even reversed) with no swap and no focus call. Extra operator panes keep IDs and positions, and a missing-A/surviving-B tab with extra panes still gets the C1-C3 repair.

Open limitation, kept: an operator switching tabs during the swap-to-restore window is sent back once; an operator in the leaf tab with an extra non-seat pane focused ends with B focused; vertical splits and extra-pane swap geometry were not probed live.

## Units

### Wave 1

#### U1: fake herdr geometry, swap, layout, tab focus

- Owns: `tests/fake-herdr.ts`
- Shared test resource: none (uses only the temp fake-herdr DB fixture)
- Needs first: none
- Does: add rect per pane, right-split halves parent width, `pane swap --source-pane --target-pane` swaps rects and focused pane, `pane layout --pane` returns rects plus `focused_pane_id`, tabs carry `focused`, `tab focus <id>` flips it, swap flips focused tab to the leaf tab like real herdr, plus scripted swap failure flag.
- Done when: a scratch test can split, swap, read layout rects, and flip focused tabs without touching prod code.

#### U2: allocate repair in prod code

- Owns: `src/next.ts`, `src/shell.ts`
- Shared test resource: none
- Needs first: none
- Does: in the recorded-A-absent/recorded-B-present non-bootstrap branch only: fresh `tab list` for prev focus, split B right, intermediate `saveState` with new A, one swap call per D4, conditional `tab focus` per D5 on both paths, error per D6. Add loose schemas per D9. Touch no other branch.
- Done when: `bun run typecheck` passes and the branch matches the D1-D6 sequence on read.

### Wave 2

#### U3: allocation tests at the `akrogon next` boundary

- Owns: `tests/next.test.ts`
- Shared test resource: none
- Needs first: U1, U2
- Does: add `akrogon next` CLI tests using the fake that assert rects and focus through `pane layout` and `tab list`, plus state and call checks:
  - missing A beside surviving B swaps A left, B ID and agent kept (C1)
  - prev tab in another workspace restored; already-in-leaf-tab stays with B focused (C2)
  - scripted swap failure reports leaf plus herdr text, keeps A ID, one swap call, no close, second `next` starts no new pane (C3)
  - new tab, bootstrap, B-only, both-present, reversed-order, and extra-pane cases have no swap and no focus call; extra-pane missing-A tab still repairs (C4)
- Done when: the new tests fail on the pre-fix allocate (A right of B) and pass after, and existing allocation tests still pass.

U1 and U2 share Wave 1: disjoint owned paths, no shared test resource, no order need. U3 needs both landed, so Wave 2.

## Implementation notes

2026-10-08, found during implementation:

- A `pane swap` reply with `changed: false` is treated as a swap failure through the D6 path (throw, no retry, no close, recorded A ID stays). Refines D4/D6: D4 binds the call shape and the no-retry rule; whether `changed: false` is success was undefined. Treating it as failure is the conservative read (the new A could be right of B), and a `changed` boolean reporting no change after a swap cannot satisfy C1.

## Docs

No agent or human doc is affected.

## Credentials

Design names no variable by name; `akrogon status seat-a-replacement` shows no `Missing:` lines. No human-only blocker.

## Verification

Not a slow-run leaf. No restart boundaries.

- C1 proof: `bun test tests/next.test.ts --timeout=30000 -t "missing A beside surviving B"` catches A placed right of B or B ID/agent changed. Size: seconds. Rerun when `src/next.ts` allocate or `tests/fake-herdr.ts` geometry changes.
- C2 proof: `bun test tests/next.test.ts --timeout=30000 -t "restores operator tab focus"` catches missing or wrong `tab focus` call and wrong focused pane. Size: seconds. Rerun when focus read/restore code or fake tab focus changes.
- C3 proof: `bun test tests/next.test.ts --timeout=30000 -t "swap failure keeps"` catches retry, close, lost A ID, missing leaf or herdr text in the error, or a second A on the next pass. Size: seconds. Rerun when swap error path changes.
- C4 proof: `bun test tests/next.test.ts --timeout=30000 -t "allocation paths unchanged"` catches an added swap or focus call on new-tab, bootstrap, B-only, both-present, or reversed paths, and catches moved extra panes. Size: seconds. Rerun when any allocate branch or the U1/U2 trigger guard changes.
- Regression: `bun test tests/next.test.ts --timeout=30000` catches broken existing dispatch and allocation cases. Size: minutes. Rerun before handoff.
- Regression: `bun run typecheck` catches schema and allocate type breaks. Size: seconds. Rerun before handoff.
- Regression: `bun run format` keeps the touched files formatted. Size: seconds. Rerun before handoff.

No `merge_checks` and no whole-suite `bun test` requirement. The brief names none.
