# Map B: codex-seat-scope

Blind consultant map, slot B, 2026-11-25. The intake's cause is confirmed and independently reproduced. The lock clause fires: the closed design's placement predicate ("acts only when the current cgroup is exactly the seat scope root") cannot hold for a bash-wrapped harness — not because the predicate is wrong for tool shells, but because the harness's own launch chain is bash sitting exactly at the scope root, indistinguishable by cgroup alone. The fix is a one-predicate extension in the shared entry placement, proven below in a real scope.

## Cause: confirmed, with one sharpening

Confirmed by own repro (free probes, throwaway `slotb-probe.slice`, cleaned after):

- **P1** — In a real user scope, `systemd-run --scope` places the payload pid in the scope and the payload's parent stays outside it (parent cgroup `app.slice/hc-hold-…`). A nested child bash's parent reads inside the scope. This is the structural asymmetry the fix exploits.
- **P2** — bash sources `BASH_ENV` both for shebang-script execution (same pid as the script) and `bash -c`. So the codex chain — mise execs the bash script `/usr/share/omarchy/bin/omarchy-agent-account-exec` in-place — sources the entry in the seat pid itself.
- **P3** — End-to-end repro of the defect: a scope launched with the exact startSeat wiring (`BASH_ENV=<installed bash-env>`, `AKROGON_SEAT_CGROUP=<scope>`) running a two-level chain script: the chain root moved itself into `tools/t-<pid>-<start>` and the nested child inherited that t-. Matches the recorded refusal cgroup in the consult brief exactly (`…scope/tools/t-3559863-9659049`).
- **P4** — The discriminator probe: in a real scope, the chain root's parent reads outside the scope while a nested bash's parent reads inside. Deterministic, no timing.

Sharpening beyond the intake: the intake frames the failure as a dispatch-time `scopeEntry` race. The worse mode hides behind it: even when `scopeEntry` wins the race (the one successful 15:26Z start), the agent process itself execs in-place from the moved chain bash and therefore lives permanently inside `tools/t-<seat pid>`. The first `commitMove` sweep (`src/tool-cgroup.ts` `sweepScope`) finds its `akrogon/<t>` unpopulated and writes `cgroup.kill` — killing the seat mid-turn, after the leaf looked healthy. So there are two failure modes, early-loud and late-lethal, one mechanism.

Also confirmed from source: consultant/direct seats are unaffected (`src/seat.ts` `launch` — no systemd-run, no wiring); claude seats are unaffected because the claude chain, though equally bash-wrapped on this machine (`claude` resolves through the same `omarchy-agent-account-exec`), never receives `BASH_ENV` and `CLAUDE_CODE_SHELL` only intercepts tool shells, never the chain; agy is unaffected because its wiring shadows bash only by PATH lookup and the omarchy chain scripts use absolute `#!/bin/bash` shebangs; pi's chain sources nothing (A's probe, consistent with pi resolving to a real binary).

## The lock fires

The closed design stands wherever it can. Q3's placement predicate cannot hold as written for a bash-wrapped harness: "exactly the seat scope root" is where the chain root bash unavoidably sits, and nothing in the cgroup path alone tells it from a tool shell. The lock's out clause ("unless the map shows one cannot hold for a bash-wrapped harness") is met. Everything else in the design — per-shell `t-` cgroups, the relocation, the sweep, the helper, the never-fail entry, the atomic refresh — is untouched by this fix and stands.

## F1. The discrimination fork: how the entry tells the seat's chain from a tool shell

Proof of impossibility for the current shape, for the record: chain shells and tool shells share cgroup (both start at the scope root), share environment (the agent inherits the chain's env), and share ancestry shape post-exec (both descend from the seat pid). The one structural asymmetry that survives exec is parentage at shell startup: the chain root is the only bash in the scope whose parent lives outside the scope, because `systemd-run --scope` never enters the scope it creates (P1) and the payload is exec'd in-place through the whole chain.

### O1. Exempt the shell whose parent is outside the scope (recommended)

In `src/tool-cgroup.ts` `placementShell` (shared by both entry forms), after the existing cgroup-equality test, add: read `/proc/$PPID/cgroup`; if it does not match the seat scope path (exact or prefix, with a `/` boundary), return without moving. Effects:

- The chain root never moves. The seat pid stays at the scope root forever; `scopeEntry` passes deterministically — the race disappears because there is nothing left to race with.
- Nested chain children (the `omarchy-agent-account-home` child, command substitutions that re-exec bash) still move into a transient t-, but they are short-lived, die before any sweep, and their moving changes nothing about semantics — placement does not alter execution, only cgroup membership. Empty t- dirs are reaped by the next sweep. Benign noise.
- Every real tool shell moves: its parent (the agent or a descendant) is inside the scope by construction. No tool shell can ever have a parent outside the scope — a process cannot be forked into a cgroup from outside it; the only way in is the initial systemd-run placement or a `cgroup.procs` write, and neither produces a tool shell.
- A bash harness that stays bash (hypothetical) still works: the agent is the chain root, exempt; its tool shells are its children, moved.
- Dead-parent race: if the parent dies between fork and BASH_ENV, `/proc/$PPID/cgroup` is either a zombie's cgroup (still inside, correct move) or unreadable. Unreadable must fail toward moving, not exempting — a shell we cannot prove is the chain root is treated as a tool. This direction matters and must be written into the predicate deliberately.

What it breaks or invites later: nothing structural. It adds one `/proc` read to a script that already reads `/proc/self/cgroup` and `/proc/$$/stat`. The exemption is exactly one process per scope, so the kill design loses nothing.

### O2. Deferred activation: point BASH_ENV at a file created only after the chain settles

Chain shells source nothing because the file does not exist yet; the file appears once `startSeat` finishes. Rejected: creation time can only be keyed on `firstTask` settling, and the agent is already processing its task then — a tool shell spawned in the first task before the file write leaks permanently. That reintroduces a race into a design whose entire point is determinism, and the leak is silent. It also complicates `refreshToolEntry` (shared stable path today) into per-scope state.

### O3. Let the chain move, then move it back at scope entry

`scopeEntry` finds the seat pid in a t-, writes it back to the scope root. Rejected: the chain may still be mid-resolution (a later nested bash re-moves), the inherited `AKROGON_TOOL_CGROUP` marker the moved chain exported now points at a cgroup the seat does not live in (corrupting `ownToolCgroup` for any akrogon process started from the seat's root processes), and the fix fights the mechanism instead of narrowing it — two moving parts where one predicate edit suffices.

### O4. Replace BASH_ENV with PATH-shadowing for the generic kinds

Rejected on the closed design's own grounds: absolute-path bash tool shells escape the shadow (`/bin/bash -c` is a common agent spawn shape) — the coverage hole BASH_ENV was chosen to close. It also does not even fix the chain: a chain script with `#!/usr/bin/env bash` resolves through PATH and hits the wrapper anyway.

### O5. Bypass the wrappers in the harness line

Machine-specific, throws away the account injection the wrapper exists for, and leaves the class in place for any future bash-in-chain harness. Not a fix, a local dodge. Rejected.

## F2. Where the fix lives: shared `placementShell` vs the BASH_ENV form only

Recommend shared. The same latent class exists in the wrapper channel: an agy (or any PATH-shadowed) harness whose chain contains a `#!/usr/bin/env bash` script hits the wrapper in the chain root and breaks identically. claude's chain is bash on this very machine and is protected today only by not receiving BASH_ENV. The exemption never fires for real tool shells in any channel (their parents are always inside), so sharing the predicate costs nothing and removes the class across all three channels rather than one.

## F3. Fork-style chains: residual, loudly detected

O1 fully fixes exec-style chains — the observed shape, including codex's. A hypothetical chain where an intermediate bash forks the agent as a child and supervises it (no final exec) still strands the agent in the supervisor's t-. I found no such harness; codex's chain ends in `exec "$agent_binary"`. Crucially this residual fails loudly at dispatch: `scopeEntry` reads the seat pid inside a t-, refuses with `seat outside its leaf scope`, and the operator sees it immediately rather than discovering a dead seat mid-leaf. Do not extend the exemption to cover it — no descendant-based exemption exists that does not also exempt tool shells (their ancestry is identical). Record the residual; the loud failure is the correct behavior for an unsupported chain shape.

## F4. Sweep-side tolerance as defense in depth: rejected

Exempting the t- that contains the seat pid in `sweepScope` would reintroduce exactly the process-reading selection the design's Q5 removed ("no process is read to decide"). With O1 the seat never sits in a t-, so the sweep needs no knowledge of it. Adding tolerance "just in case" guards a state that can no longer occur and hides the loud residual detection of F3.

## Pitfalls and what removes each

- **P1. The parent-cgroup comparison must use a boundary-aware prefix.** `/x.scope` must not match `/x.scopeevil`. Compare exact-or-`scope/`-prefix on the kernel path form, built with `cgroupRoot()` exactly like the existing equality test. Removed by writing the test with a sibling scope whose name shares the prefix.
- **P2. Unreadable parent cgroup must fail toward moving** (analyzed in O1). A comment in the script is warranted — this direction is counterintuitive.
- **P3. Transient nested-chain moves create empty t- noise.** Benign: empty t- dirs are killed/removed by the next sweep. No action; worth one line in the leaf so reviewers do not read it as a leak.
- **P4. The xtrace machinery.** The added `/proc` reads run inside the placement function whose output is already fully discarded and descriptor-closed (`{BASH_XTRACEFD}>&-` handling in `placementShell`). No interplay; `tests/tool-entry-tracing.test.ts` covers it and must stay green unchanged.
- **P5. Landing order.** S5b analogue: currently-running codex B seats are already broken or unplaced; nothing in the fix migrates live seats (entry refresh happens per seat start). Seats started before the fix keep pre-fix behavior — same residual the original design accepted. No operator step needed beyond the existing N2/N3.
- **P6. Rollback.** Entry files refresh atomically on every seat start, so a rollback re-renders the old predicate. No migration, no state change. Safe both directions.

## Surfaces the change touches

1. `src/tool-cgroup.ts` `placementShell` — the exemption (the only product change).
2. `tests/tool-entry.test.ts` — new red-on-base test at the real boundary: a real throwaway scope wired like startSeat, a two-level bash chain; assert the root stays at the scope root (red today: it lands in `tools/t-`) and a nested tool-shaped shell moves. The file already has the throwaway-scope machinery.
3. `tests/tool-entry-tracing.test.ts` — no change expected; must stay green (P4).
4. `src/AREA.md` — line 21's placement description gains the seat-root exemption.
5. Docs: grep of `docs/` finds no mention of the entry mechanism; nothing to fix (S6a satisfied by AREA.md, the only place the behavior is documented).
6. No change: `src/seat.ts` (scopeEntry stays strict — it is the loud net for F3), `sweepScope` (F4), relocation, helper, `src/scope.ts`.

## Practitioner questions

- Q1. Does the exemption weaken the tool kill? Only the exact chain-root process escapes placement, and no tool shell can ever satisfy the exemption (a process cannot be forked into a cgroup from outside it). The kill set is unchanged.
- Q2. Why not test by pid equality with the seat pid? Because the entry script cannot know the seat pid — it is not knowable before fork and not passed anywhere. Parent-outside is the computable form of the same fact (the seat pid is the only process in the scope whose parent is outside it).
- Q3. Does anything depend on the chain root moving? Nothing — pre-deploy (before bd358f3f) every seat ran at the scope root permanently; O1 restores exactly that for the chain while keeping placement for tools.
- Q4. What about non-bash chains (python/perl wrapper scripts)? They never source BASH_ENV and never invoke the bash wrapper — immune already; the fix does not affect them.
- Q5. Should the exemption apply to the `akrogon/` relocation subtree too? No need: relocation is about akrogon processes inside t-, unrelated to chain placement.
- Q6. Interim state: N3's option of switching `slots.b` to a non-bash-wrapped harness works today because pi/claude/agy chains on this machine are not hit by their own wiring — but note this is machine-luck for agy, not a property; another reason the fix belongs in the predicate, not the harness choice.
