# Report: test-writer-4 — tests/direct-land.test.ts

## File written

`tests/direct-land.test.ts` — 6 tests, ~560 lines, all helpers local. No other file created or modified. Nothing committed.

## Red summary (all 6 fail at the same point, correctly)

Every test fails at its first `expect((await next(f, ...)).code).toBe(0)`: `cli next` exits 1 because the strictObject state schema rejects the seeded direct-leaf state with `Unrecognized key: "direct"` (verified verbatim in stderr: `"code":"unrecognized_keys","keys":["direct"]`). No test reaches a target-behavior assertion at base, so no assertion is vacuously green now and each will exercise its target behavior once the schema accepts `direct`.

| # | Test | Red |
|---|------|-----|
| T1 | a direct leaf merge lands through the command merge: remote advanced, merged, owner closed, sources closed | schema rejects `direct` at first `cli next` |
| T2 | with webhook_env configured and set the direct land records the broadcast handoff | same |
| T3 | a lifecycle control leaf in the no-target fixture records no broadcast key after its land | same |
| T4 | an idle reviewer receives the broadcast prompt after the direct land, with no allocation | same |
| T5 | a working reviewer holds the broadcast, the sweep keeps temp worktree and slice, and the end of its turn releases them | same |
| T6 | a refused broadcast send records delivery_error.B and the holds survive; the turn advancing past lets the retry land and clears the error | same |

## Typecheck

`bun run typecheck` clean (zero errors), before and after writing the file. Base was verified clean beforehand.

## Coverage mapping

- **Landing (criterion 7)**: T1 — merge-phase direct leaf, real worktree one commit ahead, applied batch, green merge receipt, fake-systemd-run; `cli next` drives the merge turn (asserts exactly one `systemd-run` land launch with the right unit and argv), then direct `akrogon land <slug> --attempt` replicating green-merge.test.ts. Asserts: exit 0, `moved merged`/`issue complete chart-x` stdout lines, remote tip advanced to the leaf head, `phase === 'merged'`, owner folder in `issues/closed`, the merged log row `{slug, from: merge, to: merged, slot: null}`, one `merge-attempts.jsonl` outcome `merged`, and fake-gh evidence: exactly `issue view` then `issue close -R team/project 1 --comment 'delivered by fix-alpha'` with the step queue drained.
- **Gate (criterion 8)**: T1/T3 assert no broadcast key without any webhook config (T3 adds a lifecycle control leaf in the same fixture, landed after the direct leaf); T2 asserts `broadcast` recorded with `webhook_env` configured plus the env var set non-empty, matching kind/name/destination/pushed/sources.
- **B idle**: T4 — broadcast prompt text delivered to the recorded `seat.B` terminal (`broadcast-issue fix-alpha slot=B owner=issue:chart-x` + `closed=`/`sha=`/`sources=none` fields), `prompted.B` recorded with B's address, no `delivery_error.B`; allocation proof: the terminal address set is exactly the test's own before/after and no terminal carries `akrogon.leaf` labels; a further pass over the same turn sends nothing more.
- **B working**: T5 — HOLD-gated B stays working through a pass: no task sent, `prompted.B` undefined, `status --json` shows `broadcast_pending: true` for the leaf, and worktree/leaf-temp/leaf-slice all survive with no `systemctl stop` for the slice. After release: pass sends, `prompted.B` recorded; once B's turn passes `prompted.turn + 1` idle, a further pass sweeps worktree, temp and slice (stop logged), owner stays in closed, branch deleted, B still live (shared terminal never ended).
- **Send failure (research-tests §6h)**: T6 — the hc-shim one-shot `unavailable` refusal armed before the land (carried on both `cli land` and the first pass, since either may be the sending pass); asserts `delivery_error.B` recorded, `prompted.B` undefined, nothing delivered, hold state preserved (worktree/temp/slice), no resend while the turn stands still, then after `hc send ping` advances B's turn: retry delivers exactly one prompt, error cleared, `prompted.B` recorded, and the settle sweep runs as in T5.

## Construction validation done at base

Because the schema rejection stops every test before any construction after the first `cli next` executes, I verified the fixture pieces that are schema-independent with throwaway probes (since deleted), all passing:

1. **Land drive replication**: a plain (schema-valid) lifecycle leaf seeded with the same batch/worktree/stamp/receipt construction lands exactly as the tests assume: `cli next` exit 0, one `akrogon-land-a1` launch, `cli land` exit 0 with `moved merged`/`issue complete <owner>` in stdout, remote tip advanced, owner moved to closed, attempt row `merged`, log row `slot: null` as the last and only row.
2. **Two-leaf sequence** (T3's shape): landing leaf one, then seeding leaf two branched off the new tip, second pass and land both clean, tip equals leaf two's head. The sequencing matters: seeding both upfront diverges the second leaf's push, so T3 creates the control leaf only after the direct leaf lands.
3. **Stand-in turn semantics**: HOLD spin at turn 0, release idles at turn 1, `hc send` returns `{started: true, turn: 1}` and the task line is in `.tasks` synchronously when send returns, processing ends at turn 2 idle — confirming the `turn >= promptedTurn + 1` settle wait and the race-free delivered-task assertions.
4. **Base broadcast timing**: for a landed leaf, the broadcast allocation/dispatch happens inside `cli land`'s own exit wake (`landedWake → mergeWake → broadcastPass`), not a later pass. This drove the T6 shim-arming placement before the land; the tests themselves are timing-tolerant since every delivery assertion comes after both invocations.
5. **`status --json` envelope**: `repos[].leaves[]` carries `slug` and `broadcast_pending` exactly as the T5 zod parse expects. Note for implementers: the json leaf list currently scans only `issues/open` leaves, so T5's assertion requires the target to expose the closed-but-broadcasting leaf somehow; that is the intended red for criterion 8's status surface.
6. **Sweep semantics** (reconcile.ts read carefully): `broadcastInProgress` / 'broadcast in progress' keep reasons already exist at base for slice, worktree and temp; the sweep keeps are driven by `broadcastPending` and B-seat non-idle status, which the tests control deterministically through the HOLD gate and explicit passes.

## Deviations from plan.md

1. **T6 arms the shim failure before `cli land`, not before a later pass.** Reason: base behavior (and, per the wake chain, most plausible target behavior) makes a finished land's own exit wake the first broadcast-sending pass. Arming later would make the test depend on an implementation timing detail. Both `cli land` and the first `cli next` carry the one-shot seam, so whichever pass sends first consumes it exactly once. All assertions are timing-tolerant.
2. **T3 seeds the lifecycle control leaf after the direct leaf has landed**, not upfront. Upfront seeding makes the control's batch candidate diverge from main once the first land fast-forwards the remote tip, so its push refuses and the test would exercise restack machinery instead of the gate. Post-land seeding keeps both pushes fast-forward.
3. **Delivery-error shape asserted loosely** (`delivery_error` has key `B`) at the failure point, strictly only for its absence/presence later. The error code (`not_started` vs an `unavailable`-derived shape) is an implementation choice since the shim refusal throws `HcError kind=unavailable` rather than returning `started: false`; the binding behaviors (recorded, held, retried, cleared) are all asserted exactly.
4. **`status --json` assertion kept as specified** even though base scans only open leaves: the criterion requires `broadcast_pending: true` to be visible there, so surfacing it is part of the target work, and the test's zod parse is lenient about everything except the leaf row's two fields.

## Notes

- Nothing committed; no tracked file touched (`git status` shows only the sibling writers' and this untracked test files).
- Throwaway probe scripts in /tmp were deleted after use.
- The tests import only public test helpers (`helpers.ts`, `hc-fixture.ts`) plus `readState`/`Batch`/`State` from `src/state`, `command`/`Result`/`SpawnResult` from `src/shell` and `leafSlice` from `src/scope` — the same imports sibling merge/dispatch tests use.
- Runtime per test at red is ~0.2–0.3 s; at target each test involves several real `cli next`/`cli land` passes plus terminal polling, expect tens of seconds each, within the 120 s timeout.
