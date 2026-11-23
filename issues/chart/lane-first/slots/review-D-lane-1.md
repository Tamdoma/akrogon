# Slot D review of lane-first

**Verdict `fix`**

Base `814a2387`  
Head `2dce5d471c69b91dc92da645352d40f8fd5a716b`

## Findings

- **F1 · `src/install.ts:81`.** Rollback leaves an owned `akrogon-land.slice` link dangling. I deployed a fixture release that shipped the unit, confirmed the link resolved, then ran `akrogon rollback` to the earlier release. Rollback returned `0`, but the link still pointed through `current` to the missing unit file. The installer skips creating optional units that are absent and only prunes stale links in the skill and mod directories. Prune the owned unit link when the target release omits it and cover upgrade followed by rollback in one test.
- **F2 · `src/stop.ts:72`.** A failed stop of an off-slice unit is reported as success. I made the systemd fixture return `Access denied` for the selected leaf's live verify pass. The CLI printed `stopped` and returned `0` while the pass remained active. `stopRunUnits` discards failed stop results. Keep going for units already gone and report failures that leave target units active.
- **F3 · `src/next.ts:408`.** Merge waiters can block the unstarted prerequisite they all need. With repo cap 1 and two merge leaves blocked by `prerequisite`, the new count refused to start `prerequisite`, and neither merger was eligible. The same fixture allocated the prerequisite with main's `next.ts`. Leave waiters with unfinished prerequisites out of the cap count until their prerequisites merge.
- **F4 · `src/stop.ts:69`.** A check queued from outside the leaf slice can start after `stop` succeeds. A real full check in a second leaf held the line. I queued a check for the target leaf, stopped it, then released the holder. The queued check launched its command and returned `0`. `liveRuns()` includes waiting records, which have no units for `stopRunUnits` to stop. Reuse `cancelWaitingRun` and handle promotion under the admission lock, as `stop-run` does.

## Verification

- All 105 tests passed across `install`, `green-merge`, `pause-next`, `run-units` and `command-reference` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. The tests covered land pass and scope placement, an ordinary scoped stop, and the resume and `check.repair` exceptions. Land selection runs separately from the seat cap. Off-slice stop records are selected from the current state home by repo and leaf. The sibling leaf's pass stayed active in the stop probe.
- A private systemd slice probe enabled the CPU controller for its children and measured weights 100 for the leaf and 1000 for land. The installed `akrogon.slice` and `app.slice` reported weights 20 and 100. Enabling CPU changes competition inside Akrogon to per-slice shares, as recorded in the design. The probe resolved memory high and max to about 61.73 and 92.59 GiB, matching 50% and 75% of this host's RAM. I exercised install and rollback in a release fixture and left the host's active unit links alone. [systemd resource control](https://www.freedesktop.org/software/systemd/man/262/systemd.resource-control.html)
