# Blind notes, slot C: seat-scope

Question: pane shell before `herdr agent start`, or seat process after start. Read 2026-10-13.

## 1. Pick: pane shell, adopted in allocate before any agent starts

This reverses my round-1 seat-process pick. The new fact is why: herdr 0.9.1 prints the pane shell PID (`herdr pane process-info --pane <id>` returns `process_info.shell_pid` and `foreground_processes`, checked 2026-10-13). With the shell PID available before launch, the shell option stops being the harder one and becomes the one that removes the whole race class: the harness and everything it ever spawns are born inside the cgroup, a replaced seat in the same pane is contained with no new action, and even a seat the operator restarts by hand in that pane stays inside. Cost, named in the fork question and accepted: the unit is per-pane, it contains the operator's own typing in that pane, and stopping it kills the shell, so the pane itself dies (below).

### Unit layout

```text
akrogon.slice
  akrogon-<leaf>.slice            (measure and stop target for one leaf)
    akrogon-<pane-hash>.scope     (pane shell A, seat A, all descendants)
    akrogon-<pane-hash>.scope     (pane shell B, seat B, all descendants)
```

- `akrogon.slice` is where ceiling properties live (kind and values belong to ceiling-values, not this fork). The leaf slice carries no properties of its own; it exists so one leaf can be measured and stopped without naming its panes.
- Slice names encode hierarchy at dashes, so the leaf part must be encoded without dashes (repo and slug joined with underscores, or a short hash in the style akrogon already uses for leaf temp dirs). Otherwise `akrogon-framework-pass-two-review-notes.slice` silently creates a chain of intermediate slices and two different repo/slug pairs can collide.
- Scope names key on pane ID, never on slot. Akrogon already derives a stable name from `sha256(pane_id)` for agent start (`src/next.ts:633`); reuse that. Keying on slot breaks at the pane-swap repair (`src/next.ts:492-521`), where panes exchange positions while `state.pane` keeps the IDs straight: the scope must follow the pane, which pane-ID naming does for free.
- No per-run units. A run-check or worker run is already a descendant of the seat inside the pane scope, and a scope cannot meaningfully nest under another scope. The pane scope is the run's container; the permit (limit-boundary, taken) is what limits it.
- The B seat pane is adopted at allocation like A, even in phases that never prompt B. Both panes are created unconditionally (`src/next.ts:476-525`); an idle B shell in an otherwise empty scope costs one unit and removes a second adoption path when B is first needed.

### When adoption happens

One ensure step inside `allocate`, after both pane IDs are final and before the allocated state is saved and returned (`src/next.ts:524-526`). For each pane: read `shell_pid` from `herdr pane process-info`, read that PID's cgroup, and if it is not the pane's scope under the leaf slice, create the scope with that PID (transient-unit adoption, exact control operation still a pending proof in the taken lock). Nothing changes in dispatch: `herdr agent start` at `src/next.ts:631-647` stays exactly as is, and by then the shell is already inside.

 Placing it in `allocate` rather than before each agent start covers every pane-creation path in one place: new tab (`src/next.ts:470`), bootstrap first pane, repair split (`src/next.ts:485-490`), and second-pane split (`src/next.ts:522-524`). It also runs on every dispatch pass, so it must be a cheap check first (cgroup read) and only call systemd when the shell is not already contained. Adoption failure must fail closed: that leaf is skipped this pass with the error recorded, never dispatched into an uncontained pane. The taken lock says every dispatched seat, and a silent fallback is how round 1 got an incident.

### Bus-cut seat env at allocation

One more pair in the existing placement list (`src/next.ts:456-467`): `--env DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`. That single list feeds tab creation and both pane splits, so every new pane shell, and therefore every seat and descendant, starts with the cut. Measurement 2 in the taken lock proved this shape at run level: full `framework:verify:core`, 239 s, 0 escaped `app-*.scope` units, Playwright Chromium included. Note the placement env is only applied when a pane is created. A pane that already exists keeps its shell's environment forever; there is no way to retrofit the cut into a running shell or seat. That fact drives the rollout rule next.

### Existing seats at rollout, replaced seats and panes

- Already-running seats are not migrated live. Their cgroup could in principle be moved process by process, but their environment cannot: the bus stays reachable, so their Chrome still self-scopes out, and a moved seat would report as contained while its browsers are not. Existing panes therefore stay a named legacy class until their tab closes. They still get the permit and the run-level bus cut through `constructedEnv`, because those are code-level and apply to any seat. What they lack is ad-hoc containment, and `akrogon status` should say so per leaf rather than letting operators assume. They drain as leaves merge and tabs close; an operator who wants a leaf contained now closes its tab, accepting the seat-session loss that tab closure already causes today (scratch is cleared on new-tab allocation, `src/next.ts:448-450`).
- Replaced seat, same pane (harness exited, dispatch relaunches at `src/next.ts:631`): nothing to do. Shell scope and cut env are already in place. This is the shell option's main structural win.
- Replaced pane (recorded pane gone, allocate splits a new one): the new pane is born from placement, so it gets the cut env, and the ensure step adopts its shell in the same pass. The old scope is empty once its shell died and systemd removes it.
- Pane swap repair: no unit action. Processes, scopes, and env are unchanged; only pane positions move.

### What stopping the unit does to the pane

A scope stop sends SIGTERM to every process in the cgroup, then SIGKILL after the stop timeout (`systemd.kill` man page, KillMode control-group). For a pane scope that means seat, in-process workers, test runs, browsers, and the shell all terminate; the PTY dies with the shell, herdr sees the pane exit, and the pane is gone, not left at a prompt. Stopping a leaf slice stops both pane scopes: the tab loses both panes and closes, and both seat sessions are lost. So a unit stop is a hard stop, never a suspend or a pause a seat can resume from. Afterwards `state.pane` points at dead pane IDs until the next `allocate` pass repairs or recreates them, which is precisely why redispatch after a stop must be blocked by leaf state; that contract belongs to the stop fork and is not answered here.

## 2. Rejected option

Seat process after start: rejected now, on the new evidence. Its problem was never finding the PID (`foreground_processes` would also solve that); it is that `herdr agent start` returns only after the harness is ready (`src/next.ts:647`), so harness init, extension loading, and any children they spawn happen outside the cgroup, and adoption must then move a whole tree process by process with a rescan loop for children born mid-move. That machinery is needed again at every seat replacement, the scope dies with each seat exit (scope lifetime is bound to its last process, `systemd.scope` man page) so unit-name reuse races unit removal, and its one advantage, that the shell survives a stop, is a liability here: a stopped seat leaves a live pane at a prompt, ready for the next dispatch pass to relaunch the very work that was stopped. The shell option needs adoption once per pane and has no init window at all.

## 3. Evidence

- better-than-training · `herdr pane process-info` on installed herdr 0.9.1, help output read 2026-10-13, shell_pid behavior from the brief's checked fact · the shell PID is known before any seat exists · reversed my round-1 pick.
- better-than-training · `src/next.ts:448-527` (allocate, placement, tab and pane creation, swap repair) and `src/next.ts:631-652` (agent start and its failure path), read 2026-10-13 · one ensure step in allocate covers all pane paths, and pane-ID hashing already exists · fixed adoption point and unit naming.
- better-than-training · limit-boundary Taken, Measurement 2, 2026-10-13 · a full suite passes in 239 s with every browser contained under the bus cut and scope control works from a cut-bus environment · the env half of this design is already proven at run level; the unproven part is only transient adoption of a herdr-owned shell.
- better-than-training · local `systemd.scope` and `systemd.kill` man pages, read 2026-10-13 · scopes manage externally created processes, live only while a process remains, and stop is TERM-then-KILL to the whole cgroup · set the stop consequence and killed per-seat scope reuse.
- model-knowledge · nothing stronger found for: whether StartTransientUnit with a `Slice=` naming a new akrogon leaf slice auto-creates the slice chain or transient slices need explicit creation (fallback is slice unit files installed once), and whether an empty leaf slice is garbage-collected by systemd or persists. Both sit inside the taken lock's pending scope-control proof.

## 4. Pitfalls, and what removes each

- Stale shell PID: the shell exits between `process-info` and scope creation, or the PID is reused, and akrogon adopts a stranger. Removed by verifying the PID still belongs to that pane immediately before adoption (fresh process-info read, and process start time unchanged across the two reads) and treating any mismatch as a failed ensure, retried next pass. Part of the pending scope-control proof.
- Scope creation against a shell that has not finished starting in a just-split pane. Removed by the fail-closed rule: no contained shell, no dispatch this pass; the next pass retries. `herdr agent start` has the same readiness requirement, so no new waiting shape is introduced.
- Half-contained legacy leaves mistaken for covered ones. Removed by reporting containment per leaf where the operator looks (`akrogon status`), naming the pane creation time as the boundary. This is a leaf done-criterion, not a warning.
- Ensure step runs on every hook and dispatch pass and adds a herdr call plus a cgroup read per pane. Removed by ordering: read the shell's cgroup first and touch systemd only when it is wrong; in steady state the step is two reads.
- Moving a herdr-owned shell between cgroups could disturb herdr's own accounting if it ever keys on cgroup. No evidence it does (it tracks PTYs and process trees, unaffected by cgroup membership). Removed only by the pending proof: adopt a real pane shell, launch a seat, stop the scope, and observe herdr and akrogon state agree afterwards.
- Leaf slice left behind empty after a leaf merges and both scopes vanish. Removed by an explicit slice stop in the same code path that closes a merged leaf's tab, named here because otherwise every leaf ever run leaves a unit behind.

## 5. Questions this fork does not ask

- A pane the operator splits by hand inside a leaf tab is in no `state.pane` record. Is work run there dispatched work that must be contained, and if so, who adopts it, given `allocate` only ensures the two recorded panes?
- On herdr server restart every shell dies and every scope empties while leaf state still names the panes. Does the existing reconcile path close that gap, or does the ensure step need a server-generation check?
- Should the `akrogon.slice` itself be installed as a user unit file (survives, can carry properties before any leaf runs) or created transiently on first use (nothing to install, lost on user manager restart)? This decides where ceiling-values later writes its numbers.
