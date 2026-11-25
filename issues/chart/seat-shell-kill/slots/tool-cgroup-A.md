# Fork notes, slot A: tool-cgroup

2026-11-25. A has read the peer maps (the merge is A's job), so these notes are A's view, not blind.

## Q1 Granularity and caller

- Pick a, one cgroup per tool shell. Reason: the kill stays inside commitMove as plain writes, the caller's tool call returns normally, and no helper unit or pid wait exists (signposts 1a, 3a). The caller's cgroup is the one value the calling process can read about itself without a race: it does not move unless akrogon moves it. Cost: one mkdir per top-level tool shell; empty `t-*` directories accumulate until `rmdir` at sweep (best effort) or scope stop (B P-d). Residual: a background child started in the same tool command as the phase call survives this advance, the same class as seed-decision F1 (a shell started after the call).
- Rejected b: a detached helper per move plus a wait on a pid is a second moving part and puts timing back (D's own O3b cost). Rejected c: the harness sees its phase call killed; a model that retries calls phase twice for one move (B C2, D O3d).
- Evidence: C Obs 5 (two tool shells in separate `t-*`, kill all but the caller's: loop ended, caller survived, exit 0), better-than-training, 2026-11-25. D E5a (writing your own cgroup's kill kills you).
- Pitfalls: a nested bash inside a tool shell must stay in its parent's `t-*` (the wrapper's exact-seat-root gate does this, C Obs 5). The caller check must use the cgroup akrogon started in (before Q2's move), recorded once at process start.
- Question not asked: should the sweep also `rmdir` empty `t-*` directories? A: yes, best effort, never an error.

## Q2 akrogon's own processes

- Pick a, every akrogon CLI process. Reason: one rule at the CLI entry covers run-check writers, phase, verify and any later command, with no list of commands to keep in sync (signpost 3a). The process leaves before it writes anything, so the kill can only lose a command that has published nothing (C,D). Cost: a hung akrogon process survives advances, bounded by its own timeouts and leaf close.
- Rejected b: a writer-only move leaves the next long-running command (verify) to rediscover F2.
- Pitfall: the target must be a child cgroup of the seat scope, never the leaf slice root (EBUSY, B P-c).

## Q3 Harness entry

- Pick a, one wrapper wired per harness kind. Reason: `BASH_ENV` alone breaks claude (stripped and gated, B,C) and maybe agy (denylist string, C); claude's prefix setting also wraps MCP launches (C,D), which would put MCP servers in the kill set. The per-kind table is the minimum that reaches every harness, and the wrapper's gate makes every hook a no-op outside the seat root. Cost: four touchpoints that a harness upgrade can silently break.
- Rejected b and c for the reasons above.
- Required before handoff: one paid seat probe per harness kind (claude, codex, pi, agy) under the standing grant 3b, showing a background tool shell lands in a `t-*` and dies on the kill, and for claude that hc then reads `done`. Without a passing probe, that harness's hook is cut from the contract and recorded as a residual.

## Q4 Delegation

- Pick `Delegate=yes`. Reason: it is the documented contract that systemd leaves the subtree alone (D G7); without it a flatten would silently empty the tool cgroups. Cost: one launch property. Note `DelegateSubgroup=` is ignored on scopes (C Obs 6); not needed.

## Q5 Width

- Pick uniform. Reason: one sentence explains it and it never reads a process to decide; harness-direct children survive by placement (B,C,D). Cost: a seat-started `ssh-agent` or dev server dies at advance. Each phase is self-contained, so that is the intended contract, stated in the brief.
- Rejected narrow entry: a parent test at spawn needs the harness pid in the env and is a small selection rule again (D O5b).

## Q6 Seat scope lookup

- Pick: enumerate the seat scopes under the leaf's slice cgroup (startSeat names them `<slice>-<seat>-<rand>.scope`) and kill the `t-*` in each. Reason: no state field and no hc call (signposts 3a, 6a); it also reaches the scopes of seats replaced by the lost path, which closes the old leaf's "replaced seat not swept" residual. Cost: coupling to startSeat's unit naming, which the same leaf owns.
- Rejected: a recorded unit field (a state change, signpost 6a) and hc harness-pid resolution (fails when the harness is dead).
