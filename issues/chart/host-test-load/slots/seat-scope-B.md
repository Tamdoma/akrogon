# Slot B: seat-scope

Blind notes for Q1, 2026-10-13. No peer's seat-scope notes read. Read-only investigation, no transient units or seat launches. Paths are relative to akrogon unless prefixed `herdr/`, which means `/home/ivan/Work/infra/herdrdev/herdr/`.

## 1. Pick, reason and cost

**Pick the pane shell before `herdr agent start`, with one scope per pane runtime generation under a per-leaf slice.** The shell is the parent from which Herdr launches the harness. Once it is contained, harness initialization, its in-process workers and their ordinary child launches inherit ownership. Restarting an agent in the same shell does not require catching and migrating another agent PID. Moving only the agent after readiness leaves an initialization interval in which children can escape adoption.

Proposed unit layout:

```text
akrogon.slice
  akrogon-<leaf-key>.slice
    <pane-A-runtime-generation>.scope
    <pane-B-runtime-generation>.scope
    <other recorded pane generations still owning work>.scope
    <run execution units, if used by the run-lifetime contract>
```

The leaf key includes registered repository identity and leaf slug. Scope identity follows the actual pane shell lifetime, not just the A/B label or harness session. Record pane/terminal identity where available, shell PID plus boot/start identity, unit name and leaf ownership. This avoids collisions across repos and confusion when a pane is replaced or the harness restarts. All execution units belonging to the leaf must remain under that leaf slice. Scopes are siblings, not nested scopes. This layout does not decide the open permit-release rule or the stop command's name/semantics.

**Adoption barrier:** after each pane is created or recovered by allocation, obtain its current shell PID and establish its scope before any harness start or prompt. Prefer completing ownership of both A and B before entering the dispatch loop. In current code that barrier belongs between successful allocation and the loop at `src/next.ts:789-795`, with validation again before a start if the runtime identity changed. It must also cover reused allocations and busy seats rather than living only inside the `pane.agent === null` branch.

The allocation environment adds `--env DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` to the shared placement arguments. Those arguments already serve new tabs, replacement A panes and B splits (`src/next.ts:453-470,480-489,523-530`). The taken lock requires the same explicit value in constructedEnv after env/pass_env and reserves the name. A/B both receive it. Existing shells do not acquire a changed startup environment by being migrated to a cgroup, so rollout must address that separately.

**Rollout:** do not live-adopt already-running seats and declare them safe. Their environment is already established, and browsers may have migrated to independent app scopes. Use a controlled transition for each identified old leaf: finish or stop its existing owned work under the separately chosen stop/recovery procedure, preserve worktrees and harness session records, then recreate its pane shells with the bus-cut environment and adopt them before dispatch. Until transitioned, the leaf is explicitly uncontained and receives no new automated prompt under the new guarantee. The migration procedure must be settled and proven before rollout, not improvised by the implementer.

**Stop consequence:** stopping the pane scope terminates its shell as well as the harness and contained descendants. On the inspected normal Linux pane path, Herdr closes the pane rather than presenting a surviving shell prompt (`herdr/src/app/api.rs:482-505`). Stopping the whole leaf therefore normally removes both panes and may remove their tab. A respawn-enabled runtime can instead create a fresh shell, which is a new ownership generation and must be contained before another agent starts. This is the real user-facing cost of selecting the shell boundary.

Cost: one scope per actual shell lifetime, persistent ownership records and adoption verification. Existing active leaves require a controlled transition. Normal agent restart on an unchanged shell becomes simpler. Exact StartTransientUnit adoption, installed Herdr exit behavior and restore behavior remain pending proofs.

## 2. Rejected options and reasons

- **Agent PID after `herdr agent start`:** cannot guarantee capture of initialization children. Kernel migration moves the selected process, not its already-existing descendants. “Before first prompt” does not mean “before the harness can fork.” Startup hooks and helpers do not require a user prompt.
- **One shared scope for the entire leaf:** A/B shells can be created, replaced and die independently. A scope's lifetime follows its member processes, while the leaf is a longer-lived ownership identity. A per-leaf slice with separate pane scopes expresses both lifetimes without later PID attachment or mixing old orphan work with a new pane generation.
- **A new scope for every harness restart:** repeats PID adoption and reopens the startup race despite the parent shell already providing a stable boundary. Use a new scope when the shell runtime changes, not merely when pi/codex gets a new session.
- **Wrap akrogon's `herdr agent start` subprocess:** contains the request process, not the harness injected into the already-existing pane shell. Herdr's start implementation writes the command into that terminal (`herdr/src/app/agents.rs:193-197,213-216`).
- **Migrate active seats by collecting descendants once:** is not a reliable replacement for pre-launch ownership. Already-detached/reparented or self-scoped browsers may be absent from that snapshot, and the running seat can fork during collection. It also cannot update the seat's inherited bus address.

## 3. Evidence, tier, source and date

All sources read on 2026-10-13. The installed Herdr PID capability and completed measurement are supplied door evidence, not independently reproduced by B.

1. **E1 — Operator tier: binding limit-boundary decision.** The final `## Taken` in `issues/chart/host-test-load/forks/limit-boundary.md` records the operator's “1a”: every dispatched seat and descendants must be stoppable, both seat and check environments deny the ordinary session bus, A/B display/runtime variables remain available, and no TasksMax is a working limit. Measurement 2 passed the core suite in 239 seconds with browsers contained. This fork cannot choose run-only containment or undo that environment lock.
2. **E2 — Operator tier plus inspected code: shell PID is available.** This brief records installed Herdr 0.9.1 returning `process_info.shell_pid`. The inspected implementation obtains `runtime.child_pid()` and returns it with the foreground process list (`herdr/src/app/api/panes.rs:193-208,227-235`). The scope target should be that shell runtime, not an arbitrary foreground-process match.
3. **E3 — Better-than-training: allocation and launch are separate.** New allocation emits shared placement arguments, creates/reuses a tab, restores missing A, preserves/swaps the recorded B arrangement, then creates/reuses B and records both panes (`src/next.ts:453-532`). The caller then invokes required slots (`src/next.ts:789-795`). `dispatchSlot` returns early for busy agents and starts a harness only when no agent is detected (`src/next.ts:604-612,630-647`). This shows both the pre-start insertion point and why a start-only guard misses reused/busy seats.
4. **E4 — Better-than-training: placement environment affects fresh shell creation.** Herdr applies launch environment entries to its command builder before spawning the pane shell (`herdr/src/pane.rs:112-116,1655-1659`). That gives the bus-cut value an existing allocation surface. It does not establish that an already-running shell gets new environment entries, or that shell initialization cannot override them. Verify the actual harness environment in the selected launch proof.
5. **E5 — Better-than-training: adopt externally-created roots through systemd.** Systemd exposes StartTransientUnit with construction-time PIDs and Slice properties. [Systemd control-group interface](https://systemd.io/CONTROL_GROUP_INTERFACE/). Slices group units, while scopes follow member-process lifetimes. [Systemd 262 scope documentation](https://raw.githubusercontent.com/systemd/systemd/v262/man/systemd.scope.xml), [slice documentation](https://raw.githubusercontent.com/systemd/systemd/v262/man/systemd.slice.xml). Kernel children inherit current cgroup membership, but moving a process does not move existing descendants. [Kernel cgroup v2](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html). These sources support the layout and timing, not a claim that the selected adoption operation has passed on this host.
6. **E6 — Better-than-training: stopping the shell changes the UI.** Herdr handles PaneDied, emits pane exit and prepares removal layout; the normal Linux runtime action is ClosePane unless the explicit respawn flag applies (`herdr/src/app/api.rs:175-200,226-242,482-505`). Default terminal state has that flag false (`herdr/src/terminal/state.rs:177-180`). The respawn path starts a new runtime and clears agent identity (`herdr/src/app/api.rs:523-569`). Confirm the installed behavior with the exact adopted-pane proof rather than assuming a retained shell.
7. **E7 — Better-than-training: Herdr restore can bypass akrogon's launch point.** The inspected pending-resume implementation creates a shell and immediately sends its saved resume command (`herdr/src/app/agent_resume.rs:219-246,264-281`). If this route is used for akrogon-owned terminals, a guard solely around `src/next.ts` agent start does not contain initialization. Treat restore as a concrete integration question, not proof that “all restarts are covered.”

The operator's scope lock and installed PID observation are the strongest supplied material. Primary systemd/kernel documentation and actual launch code decide the recommended mechanism. No model-only assumption supplies an adoption or pane-exit guarantee.

## 4. Pitfalls and what removes each

1. **R1 — B gets prompted without ownership.** Establish and validate scope records for both recorded panes after allocation, including the B split and the missing-A repair/swap branch. A phase that currently requires only A must still leave its idle B shell inside leaf ownership before later B dispatch.
2. **R2 — Unit identity follows a slot name rather than a process.** Use shell-runtime generation identity. A normal harness restart reuses its owned shell scope. A new shell PID/start identity needs a fresh scope and verification. A pane swap changes layout; validate actual pane/runtime ownership after it rather than renaming scopes by position alone (`src/next.ts:490-530`, `herdr/src/app/api/panes.rs:540-551`).
3. **R3 — Adoption acknowledges success before ownership is established.** Wait for the exact unit operation's terminal result, verify its leaf slice and shell membership, revalidate PID/start identity before agent start, and refuse dispatch on failure or mismatch. Do not kill a conflicting scope merely to reuse its name. The door must prove the exact operation through the chosen private-manager connection under the locked environment.
4. **R4 — Existing active work is relabelled as contained.** Record rollout status explicitly. Scope adoption alone cannot repair old environment or detached browsers. Require the controlled transition described above before the guarantee applies, without deleting uncommitted work or harness session artifacts.
5. **R5 — Shell startup or Herdr restore forks before adoption.** The pre-harness barrier removes the known harness race. Prove that fresh pane startup leaves no relevant pre-adoption workload. Also resolve E7: restoration must either honor ownership before sending the resume command or leave those owned terminals for akrogon's guarded dispatch. If neither route exists on the installed surface, name a real Herdr prerequisite rather than claiming an akrogon-only patch covers it.
6. **R6 — Unit stop removes panes, then hooks recreate unowned work.** The stop fork must fence dispatch before terminal exits and cover the entire leaf layout. This pass supplies the pane-death consequence, not the stop verb or Esc policy. Any respawned shell is unowned until freshly adopted. Current hooks can call dispatchLeaf after topology changes (`src/next.ts:1569-1614`), so that integration must be proved.
7. **R7 — Pane disappearance hides detached leftovers.** Retain old generation ownership while its unit still contains processes, even when no pane maps to it. A new pane gets its own generation. Unit cleanup and permit release remain the separate fork's responsibility.
8. **R8 — Existing environment is assumed from a allocation argument.** Probe the actual harness/worker bus address without dumping unrelated environment values. Keep the run constructor's separately locked assignment because it rebuilds its environment (`src/run-check.ts:44-55`).

Required handoff probes for this fork: pre-start adoption of a fresh A/B pair, an initialization child born inside ownership, restart of a harness on the same shell, replacement of each pane, missing-A repair with existing B, adopted-scope stop and observed pane effect, and the installed restore path. Use the exact unit names/properties/connection and verify cleanup. No live operations were performed here.

## 5. Questions missing from the fork

1. **Q2 — Restore route:** Can the installed Herdr restoration path be made to defer akrogon-owned harness launch until containment exists? If not, which repo owns the prerequisite that makes pre-launch adoption apply there?
2. **Q3 — Rollout transition:** What exact operator-controlled procedure retires already-running uncontained leaves and recreates their panes while preserving unfinished work and resumable sessions? Scope membership alone cannot make their old environment compliant.
3. **Q4 — Pane consequence:** Is closing the A/B panes when their shell scopes stop acceptable? The alternative must name how it retains an interactive shell while still proving complete ownership, rather than promising the current pane survives shell termination.

The pick is shell adoption before harness start, separate pane-runtime scopes under a per-leaf slice. Permit-release and stop policy remain open and are not answered by this note.
