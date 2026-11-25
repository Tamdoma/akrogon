# Opening map, merged (A, B, C, D)

Sources: map-A.md, map-B.md, map-C.md, map-D.md in this folder, written blind 2026-11-24/25 on akrogon main 47bca6c1..085f2f88 (085f2f88 only changes the merge-issue skill description). Tags name the slots that wrote the point.

Breach: B ran live claude (haiku) probes although its brief said "Run no paid model launch". The findings are kept as evidence that still needs its own recorded proof before handoff.

## Shared facts

- hc status is the program's own OSC 7501 word, passed through untranslated (A,B,C,D). Claude holds root `working` with `msg "1 shell still running"` and one `records` entry per background shell while one lives. When the shell dies, even when it is killed from outside, root flips to `done`, `turn` advances and `records` clears (B probed). pi does not mask (B, binary read). codex and agy are unobserved.
- Through hc, a turn that has ended with a background shell still running looks exactly like a turn that is still working with one (B probed). No hc field tells them apart.
- Seats run in their own systemd scope under the leaf slice (`src/seat.ts:startSeat`). Seat shells are direct children of the harness pid. run-check payloads run in sibling run scopes (A,B,C,D).
- Seat terminals are `keep: true`. After a reboot hc gives them a shell: `live`, `status: null`, foreground = shell (C,D observed).
- `src/hc.ts:terminalSchema` drops hc's `argv`, `records`, `reported` and `foreground.name` (C,D).
- `src/run-check.ts:constructedEnv` feeds both run-check and verify commands. `runUnitArgv` unsets `XDG_RUNTIME_DIR` unless constructedEnv carries it (B,C,D). Verify's systemd service env comes from `passForwarded` (C,D).
- `failureNames` already matches bun's `[Nms]` suffix and drops it. Bun prints `^ this test timed out after Nms.` in the same stream after the `(fail)` line, and failing lines repeat in the end summary (C observed). One framework merge log holds about 12,000 test lines in about 770 files (C,D counted). verify-runs.jsonl is rewritten whole on each pass (C,D).
- The verify pass caller already carries `attempt`, and `runOnce` drops it (B,C,D).
- Direct runs record slug `checkout` (B,D). `run-check --leaf <folder>` exists (B).

## seat-turn-idle (#157)

- Cause: the masking is claude's, not hc's. An hc fix is out of place (A,B,C,D). C left an hc fix open pending a probe, and B's probe closes it.
- Fork: how the ended turn becomes deliverable.
  - (A,B,C,D) End the leftover shells, then the existing idle gate delivers.
  - (B, fallback) Deliver into a masked `working` state. The risk is turn accounting.
  - (A) Read the end-of-turn record from the transcript. Rejected by B and D: per-harness parsing, and nothing wakes a pass.
- Fork: where the sweep runs.
  - (C,B) At the phase advance in `commitMove`, sparing the caller's own ancestry.
  - (A,D) In dispatch, outside the seat scope. Risk: this can run while the seat's own `akrogon phase` tool shell is still alive.
  - (B) Also at delivery after a quiet period.
- Fork: what gets killed.
  - (D) Every scope process except the agent pid. Risk: harness MCP servers die (B,C).
  - (B) Shell children of the harness, with their process trees.
  - (C) Everything except the agent, the caller chain and verified helpers.
- Fork: the reboot variant (a live terminal whose shell has replaced the agent) counts as a lost seat (A,C,D,B silent).
  - Positive evidence only: the foreground program is a shell, not the agent (C argv, D foreground name).
  - Charge `lost` (D) or not on a reboot (C).
- Pitfalls: killing the caller's `akrogon phase` (C,D). Killing another leaf (A, lesson 2026-10-13). pid reuse (D). The run-check wrapper in the seat scope during publish (D).
- Proof needed: one claude probe with a background shell (status, `records`, the flip on kill), a census of resting harness children (MCP servers), and keep-recovery fields in a throwaway core (B,C,D).

## fresh-leaf-base (#156)

- Cause confirmed. There is no withdraw verb. Reconcile keeps orphans as "unmanaged worktree" (A,B,C,D).
- Gate: the first adoption, when `state.worktree` is unset (A,C,D), and the branch has no commits of its own (A,B,C,D). A branch with commits is adopted as-is, which keeps direct-route growth-stop adoption working (C,D).
- Clean, commit-free leftover:
  - (C,D) Fast-forward in place.
  - (A) Remove and recreate.
  - D argues ff keeps ignored files and is one operation.
- Dirty, commit-free leftover:
  - (A,C,D) Refuse loudly with the file list.
  - (B) Record the diff, then reset. Refusing stalls unattended runs.
- Fetch before the first allocation:
  - (C) Yes.
  - (D) No. The chart scope says "current tracking ref". Name the residual.
- Lesson line retirement needs N1 (A,B,C,D).

## run-check-display (#155)

- Copy the display set in `constructedEnv` for every repo (A,B,C,D).
  - Set: `DISPLAY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR` (A,B,C,D). `XAUTHORITY` (A,B,C). D: only if the probe needs it.
  - Verify service:
    - (C) Also add to `passForwarded` and `launchLand`.
    - (D) Keep merge verify display-less.
- Pitfalls: the akrogon suite reaching the real hc socket through `XDG_RUNTIME_DIR` (C,D: fixtures pin scratch dirs). Repos already listing these in `pass_env` stay valid (C).
- Proof: a free headed probe on this host (A,B,C,D). The run-check-drops-display lesson line is on main and retires (A,C).

## merge-test-facts (#154)

- Timeouts: optional `timeouts: string[]` per command and per rerun, attached per stream (C,D). B prefers a `tests[]` with `timed_out`.
- Durations:
  - (B) Every test `{name, ms, outcome}`.
  - (C,D) Bounded: per-file ms over a floor (C), or the K slowest tests per command (D).
  - Full per-test data is about 1 MB per row (C).
  - Pitfall: a threshold hides a test once it gets fast (C).
- Join:
  - (B,C,D) Optional `attempt` on the verify row from the pass caller.
  - (C) Also `verify_runs` on the attempt row and `state.batch`.
  - D rejects attempt-row writes: scattered writers, no run in scope.
- Pitfalls: summary lines double-count (C). Rerun split (C,D). Verdict neutrality: `failures` stays byte-identical (D).

## direct-visible (#153)

- Record:
  - (B,C) A real leaf `state.yaml` with a direct marker that dispatch, reconcile, renameTabs, stop and broadcastPass respect.
  - (D) Lines in the CHART.md Direct attempt section, rendered by status, with no leaf.
  - (A) leaned b, a chart-local state file.
- Phases:
  - (B,C) Reuse `implement`, `check.review`, `check.repair`, `merge`.
  - (D) Show the operator's words.
- Landing:
  - (C) The land command does it: merge queue, verify, close, `state.broadcast`.
  - (B,D) The door keeps landing.
- Runs: `--leaf` (B) or the chart slug in `leafTarget` (D).
- Pitfalls: reconcile killing the door or closing its tab (C, catastrophic). The `check.review` two-slot rule (C). Prose drift across skills and docs (C). Phantom rows after Held (B,D).

## Order and dependencies

Five charts, one leaf each. No logical dependency between them (A,B,C,D). The order follows the signposts.
