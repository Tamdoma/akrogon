# Merged notes: limit-boundary

## Options
- 1a (A,B,C): host-wide permit in run-check and base-run, start 1, plus every seat in an akrogon slice. Reason: only option with both a counter and containment below the agent layer; incident had one of six runs through run-check (C). Cost: most machinery, Linux/systemd only, seat adoption needs a probe (A,B,C).
  - Correction (B,C): the slice must carry an aggregate ceiling (TasksMax plus CPU or memory) or ad-hoc runs inside it stay unbounded. Values deferred until one full run is measured alone (B,C).
  - Correction (C): per-leaf slice with one scope per seat launch, since a scope dies with its last process and A/B seats start at different times. (B) agrees per-run units must stay under the leaf and stop must cover all of them.
- 1b (A,B,C rejected): bypass is the incident itself (C), right first leaf but wrong answer (C).
- 1c (A,B,C rejected as sole): throttling makes timeouts and fork-error reds, no queue. Kept as backstop inside 1a (B,C).
- 1d (A,B,C rejected): counts panes, not workers or runs.

## Evidence
- Seats start via `herdr agent start --kind` with argv[0] equal to the kind (src/next.ts:268-276, 631-647); no prefix slot (A,B,C).
- Herdr exposes the pane shell PID via pane.process_info (herdrdev herdr/src/app/api/panes.rs:193-235) (B).
- systemd StartTransientUnit with PIDs adopts existing processes (systemd.io CONTROL_GROUP_INTERFACE) (B); systemd.scope man page (A,C).
- base-run execs printed text that re-enters run-check (src/base-run.ts:157-164, src/config.ts:316-317) (A,B,C).
- run-check spawner passes children only stdio (src/shell.ts:38-45); withLock holds lock in a spawned flock child (src/state.ts:205-209) (C).
- Practitioner: Bazel `--local_test_jobs` and `exclusive`, Skia marked emulator tests exclusive (A).

## Pitfalls and removal
- Adoption misses early children (A,B,C): B adopts the pane shell PID before `herdr agent start`, so the harness is born inside; C adopts at agent-ready before first prompt. Door probe pending either way.
- Nested deadlock at limit 1 (A,B,C): C uses own cgroup membership (unforgeable); B uses a verified ownership marker carried through constructedEnv and checked against the run's membership; A used an env token.
- Lock fd inherited by detached browser (A,B,C): hold flock inside the run-check/base-run process, never in generated shell text (C); keep holder separate and permit held until owned workload retires (B).
- Existing running seats need a transition (B).
- Framework flock workaround must be removed when the pool lands (C).
- Queued run looks hung (C): belongs to the queue fork.

## Open questions raised
- What counts as heavy: B every run-check/base-run run, no exemptions; C default heavy with an explicit per-name light list in repo config.
- Ceiling values and failure policy (B,C).
- Queue order and wait bound, merge priority (C).
- Runs vs browsers as the counted unit (B,C).
- Standalone/direct seats outside dispatch (C).

## Where slots differ
- Adoption point: B pre-launch pane shell, C post-launch agent PID.
- Nesting proof: C cgroup membership, B marker plus membership.
- Light checks: B none, C opt-in list.
