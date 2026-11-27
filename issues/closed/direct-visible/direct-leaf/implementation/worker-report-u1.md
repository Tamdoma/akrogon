# Worker report — U1: verbs and state

Commit: 579c9a68 feat: akrogon direct and direct-drop verbs (single squashed commit on creation commit 5c5337df)

## Changed files and reasons

- src/state.ts — `direct: z.boolean().optional()` on the strict state schema (D1).
- src/direct.ts (new) — create + rerun + drop and the shared probe (D2-D5): probeExactlyOne resolves an address across `sessions().live` with exactly-one-live enforcement; create flow runs every refusal before any write, then checkBase/createSparseWorktree/writeLeafEnv(live false)/ensureLeafTemp/saveState with `direct: true`, `phase: implement`, full-ISO `created`, sources in order, frozen {}, both seat refs, env_names, no tab, no setup, no lock; a post-create failure rolls worktree and branch back. Rerun rewrites only seat.A/seat.B through a raw state.yaml edit (byte-preserving everything else; no schema round trip), clearing delivery_error only for slots whose session or address changed; a state without `direct` refuses with `<slug> is not a direct leaf`. direct-drop refuses non-direct, merge-phase, merged/closed, missing --chart and existing `<chart>/direct/` before any mutation, then stopLeafWork, force worktree removal under the worktree lock, branch deletion, and the owner folder rename to `<chart>/direct/` — no seat, tab, sweep or stopped record touched.
- src/usage.ts — VERB_OPTIONS entries for both verbs; FlagSpec gains `multiple?: boolean` and --source is the first repeatable flag via parseArgs native `multiple: true` (D2).
- src/akrogon.ts — dispatch for both verbs; missing/blank --reviewer and --chart are usage errors naming the flag; --source values validated against sourcePattern. One cast on the parseArgs result because the widened FlagSpec otherwise breaks every existing narrow consumer type.
- src/next.ts — the sanctioned two-line export of writeLeafEnv, nothing else.
- src/stop.ts — stopLeafWork factored out of stopLeaf (stopLeaf calls it after endSeats; the ordering comment moved with the factored body); D18: `stop --all` selection gains `|| leaf.state.direct === true`, tabbed/batched behavior unchanged.
- docs/reference/commands.md — rows for both verbs.
- tests/command-reference.test.ts — the two sanctioned contracts entries only.
- src/AREA.md — one line for src/direct.ts plus the stop.ts line update; tests/AREA.md — lines for the two test files.

## Tests run

All in the worktree, final state at commit 579c9a68:

- `bun test tests/direct-create.test.ts --timeout=120000` — 12 pass, 0 fail.
- `bun test tests/direct-drop.test.ts --timeout=120000` — 6 pass, 0 fail.
- `bun test tests/command-reference.test.ts tests/cli-help.test.ts --timeout=120000` — 11 pass, 0 fail.
- `bun run typecheck` — exits 0.
- `bun test tests/leaf-stop.test.ts --timeout=120000` — 10 pass, 0 fail (stop-all selection, tabbed leaves).
- Regression on touched machinery: tests/phase.test.ts 71/71, tests/next.test.ts 201/201, tests/reconcile.test.ts 46/46, tests/leaf-slices.test.ts 16/16, tests/state-home.test.ts 14/14, tests/session-routing.test.ts 14/14, tests/green-merge.test.ts 33/33 — all 0 fail.

## Known limitations

- tests/direct-seats.test.ts: 1 pass, 2 fail — the failures are the wave-2 mechanisms outside U1's scope: busy_since recording (D10 observeBusy, U3) and check.review to check.repair slot routing (D6 requiredSlots, U2). The mislabeled-seat teardown control passes. No failure is caused by U1's files.
- tests/direct-active.test.ts / tests/direct-timing.test.ts: mixed pass/fail, same wave-2/wave-3 cause (activeCount exclusion, leafStart/gap suppression). One active test already passes.

## Unverified criteria

- Criterion 5 as literally worded (the grep hits include tests/direct-seats.test.ts, which cannot pass before waves 2-3 land per the plan's own wave layout) — verified instead as the parenthetical states: tabbed-leaf stop selection is regression-free, evidenced by leaf-stop 10/10 and green-merge 33/33, and the remaining direct-seats reds trace to U2/U3 decisions, not U1. Everything else verified and green.
