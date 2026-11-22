# Rebuttal: waiting-seats (slot C)

Disagreements, factual corrections, and positions on differing/not-asked points in `slots/waiting-seats-merged.md` (checked 2026-11-21).

- **Line 31 (`"a prompt closes the wait"`) is inaccurate in `timing-report.ts`**: `reasonAt` (`src/timing-report.ts:84-89`) scans only `event.kind === 'wait'`, never `prompt`; a `prompt` resets deduplication in `recordWait` (`src/timing.ts:118`), while the wait interval itself is closed by `end('none')` at `src/next.ts:776` (after `dispatchSlot` succeeds). Still works on the normal path, but any path that allocates without reaching `:776` (e.g., `dispatchSlot` throwing into `:777-781`) leaves `capacity` open until the next pass.
- **Q1 reopen trigger (lines 18, 26)**: Hold **B's `memory.events high > 0` + waiting queue > 20** (post-`suite-regrowth`) over a fixed anon GiB threshold — `memory.events high` directly measures kernel throttling against `MemoryHigh=64G` (Lock 1a's host-limit bar) rather than guessing headroom.
- **Q2 idle-age close (lines 10, 25)**: Keep **no close path now**; even with B's 3 h cache-miss finding, `suite-regrowth` cuts queue wait sharply (~13m -> ~5m verify), so revisit idle-age close only if the Q1 trigger fires.
- **Q3 `broadcastPass` row (line 34)**: Hold **A/C (write no row)** — `timing-report.ts:221,282` stops reporting waits at `merged`, and `broadcastPass` (`src/next.ts:1054-1081`) has no `end('none')` close call, so a `capacity` row there would be invisible to reports and left unclosed.
- **Not-asked items (lines 38–40)**: Keep `max_active: 12` with no queue bound now (revisit only on the Q1 trigger); let a `check.repair` leaf with a lost B seat wait under `max_active` (recorded as `capacity`); do not add capacity waits to `akrogon status` now.
