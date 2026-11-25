# Fork notes: shell-sweep, slot B

## Q1. When and where do a seat's leftover shells end?

### Pick: c — both, with a corrected dispatch-time trigger

At the phase advance in `commitMove`, and again at delivery after a quiet period. Cost: the dispatch-time sweep can fire on a genuine long turn, because hc cannot tell it apart from a masked ended turn; the cost of one mistaken sweep is bounded (shells die, the harness process survives, the turn continues minus its shell), while the benefit is bounded-time recovery from a stall that is permanent today.

Reason the advance alone cannot be the answer: the incident's stall is *in-phase*. The shells were started during `implement.assess`, the seat's root status froze at `working`, its turn counter froze, and the phase therefore never advanced again. A sweep that runs only at phase advance never fires in the incident's own scenario. The advance-time sweep still has its own job — the operator decision's second clause and the cross-phase leak, since a seat terminal is reused across phases (startSeat is only called for missing/finished seats in `src/next.ts:dispatchSlot`), so unswept shells would mask the next phase's turns too.

The dispatch-time trigger as written in option b, "`working` with no outstanding prompt," does not work, and I correct it rather than adopt it: in the frozen stall the prompt bookkeeping is indistinguishable either way. While frozen, `prompted.turn` never falls behind `seat.turn` because the turn never advances (`src/next.ts:617-628` never reached, `prompted.turn >= seat.turn` holds), so a delivered prompt reads as outstanding forever. And after a silent-end count clears `prompted`, redelivery records a fresh prompt immediately, so the no-outstanding-prompt window is empty in practice. The trigger that does work is time, not bookkeeping: root `working` for longer than a quiet period measured from when the working state began (the machinery already records `busy_since` per seat in `observeBusy`, `src/next.ts:204-214`, though it currently only notices at 60 minutes). Genuine turns end; masked stalls do not. A quiet period in the 30-60 minute range makes mistaken sweeps rare because turns that long with live background shells are rare, and the cost of one is small. The exact length is a leaf-design parameter, not a fork.

Placement detail: the sweep runs before the idle gate, it only ends shells, and it never injects. claude flips root to `done` and advances `turn` on its own when the shell dies (probed in the mapping), so the existing machinery — idle-gate delivery, silent-end counting, the 3-attempts cap — resumes unchanged. No new delivery path, no new record kinds.

### Rejected options

- a (advance only): cannot fire in the incident scenario, as above. It is half the answer, not the answer.
- b (dispatch only): misses the cross-phase leak the decision explicitly wants ended ("leftover seat shells end when the leaf's phase advances"), and its stated trigger is empty in the stall it exists to rescue — the trigger must be the quiet period, at which point b-with-correction is already inside my pick.

### Evidence

- Frozen-stall mechanics: `src/next.ts:dispatchSlot` delivers only when status is `idle`/`done` (the gate), counts silent ends only when `seat.turn` advances past `prompted.turn`, and replaces silently-ended seats only when the terminal is `finished` — all three dead while the mask holds. Inspected source, 2026-11-25. Tier: better-than-training.
- The mask and its end: claude holds root `working` with one `records` entry per background shell; killing the shell externally flips root to `done`, advances `turn`, clears `records` — claude notices the death itself. Live hc probe, claude 2.1.331, 2026-11-25 (mapping session). Tier: better-than-training.
- Indistinguishability: a genuinely working turn with a background shell shows the identical hc surface (same probe series). Tier: better-than-training. This is why any dispatch-time sweep carries false-positive cost, and why injecting into `working` is not a safe alternative.
- Seat reuse across phases: `src/next.ts:dispatchSlot` only replaces seats that are missing or `finished`; a live idle seat is re-prompted in place. Inspected source, 2026-11-25. Tier: better-than-training.
- pi does not mask (binary read of pi's program-status-reporter: status keys off agent-loop events only, no shell awareness), codex unobserved. Tier: model-knowledge for codex, better-than-training for pi.

### Pitfalls and what removes each

- The quiet period fires during a genuine long turn and kills a shell the agent wanted (a dev server, a long test it backgrounded). Bounded cost, not corruption: the harness process is untouched, in-flight foreground work that is not shell-shaped is untouched, the agent can restart what it needs. Nothing fully removes this; the quiet-period length trades recovery latency against frequency.
- The sweep kills a foreground tool-call shell (a foreground Bash call is also a shell-shaped child of the harness). Same bounded cost as above: one tool call dies, the harness and session survive. hc's `records` distinguish background shells in claude's emission (foreground calls carried no records in probes), so a refined kill set could skip shells that records do not track — worth one observation in the leaf, low confidence it generalizes across harnesses.
- Race: the sweep fires just as a genuine turn ends. Harmless — the shells were about to be leftovers anyway.
- Sweep-right detection needing fields the schema drops: `src/hc.ts:terminalSchema` currently drops `records` and parts of `foreground`. Widening the schema is additive and inside the existing record (signpost 3a). If the quiet-period-only design is chosen, `records` is not even needed.
- pid reuse: the sweep enumerates live processes at sweep time rather than comparing stored pids, so reuse does not bite.

### Questions the fork does not ask

1. How long is the quiet period, and is it repo-configurable or fixed? I lean fixed, since every configuration knob is a decision the next operator must remake.
2. Should the sweep be limited to seats whose harness is known to mask (claude), or run for all seats? Cost of running for all is the same false-positive cost on harnesses that never mask; I lean all seats, because the hygiene argument (leftover shells end) is harness-independent and pi seats can leave shells too even though pi reports honestly.
3. Does the listener cadence bound recovery time in practice (the sweep only runs when a dispatch pass runs)?

## Q2. Which processes count as a seat's leftover shells?

### Pick: a — shell-program processes in the seat's scope, with their process trees, sparing the caller's ancestry

Sharpened from the written option: rather than "children of the harness process," match any process in the seat's systemd scope whose program is a shell (bash/sh/dash/zsh by comm), and kill it with its tree. Census evidence shows the wrapper chain is two levels of bash before the payload (`bash ppid=claude`, inner `bash`, then `bun`), so single-level parentage is fragile while comm-matching catches the whole family. This never requires knowing or storing the harness pid, and it spares everything non-shell by construction. Cost: a harness that is itself a shell script would be killed — checked against reality below, all harnesses in use are binaries, so the cost is zero in practice.

Why the advance-time sweep needs the caller-ancestry sparing (this is in option a of Q1 and confirmed here): `akrogon phase` runs as a tool call of the seat, inside the very shell family being swept. Live census of seat fw-seo-targets-ia-keyword-a (2026-11-25): `bun` (the akrogon CLI) ← `bash` ← `bash` ← `claude`. Walking `/proc` ppids from the caller up to the scope root is three hops and trivially implementable; the dispatch-time sweep runs outside the scope and needs no sparing.

### Rejected options

- b (everything in the scope except the harness pid): live census refutes it. Seat fw-close-lost-stop-b (codex, 2026-11-25) carries direct children `node_repl` ×2 and `codex-code-mode` — persistent harness infrastructure, not shells. Killing them at every phase advance and every quiet-period sweep would damage harness internals continuously; whether codex regenerates them is unobserved, and "maybe it recovers" is not a design. The unmasking does not need them dead either: the mask is keyed to shells claude tracks, so the extra killing buys nothing.
- c (everything except harness, caller chain, and recorded helper pids): an observation-recorded census of helpers is a maintenance surface — every harness version change can invalidate it, and a helper missing from the census dies. It exists to save processes that option a already spares by shape.

Residual, honestly stated: processes in the scope that are not shell-shaped but are leftover payload (a `python3 server.py` started with a shell wrapper dies with its shell; one started detached and reparented survives). They cannot mask — the harness only tracks its own shell wrappers — so leaving them does not weaken the fix. They are a resource leak the decision does not ask this leaf to solve; scope stop at leaf close already reaps them.

### Evidence

- Census of three live seats' cgroups via `/proc/<pid>/cgroup` and `/sys/fs/cgroup/.../cgroup.procs`, 2026-11-25: claude seat — two-level bash wrapper chain plus `bun`/`tail`/`flock` grandchildren; pi seat — zero children at rest; codex seat — `node_repl` and `codex-code-mode` non-shell infra children. Tier: better-than-training.
- The caller chain: same census shows the reporting `bun` inside the bash family. Tier: better-than-training.
- Harness binaries: claude is a compiled binary at `~/.local/share/mise/installs/claude/latest/claude`, pi at `/usr/lib/pi-coding-agent/pi`, codex a node binary — no harness in use is a shell script, so comm-matching shells never hits the harness itself. Tier: better-than-training (inspected locally, low confidence for harnesses not yet in use).
- `systemd-run --scope` exits after setup: harness ppid in the census is the herdr-core pid (15010), outside the scope, so the scope's root process is the harness itself. Tier: better-than-training.
- The mask follows claude's tracked shells only: probes in the mapping session (records entries keyed per background shell; root flips when they die). Tier: better-than-training.

### Pitfalls and what removes each

- Shell wrappers that are not comm-shells (`env`, `timeout` prefixes): `env` execs its payload so the shell comm appears in its place; genuinely non-shell leftovers fall under the honest residual above.
- Killing by comm catches a user shell if one ever shares the scope — scopes are per-seat units created by `startSeat` (`src/seat.ts:startSeat`), nothing else runs in them except nested run units, which run-check places in sibling scopes (shared facts). Removed by construction; verify in the leaf that nested worker shells (implement-issue's `u1`-suffixed worktrees) run inside the seat's own processes or in run scopes, and treat accordingly.
- The ancestry walk failing mid-sweep (a ppid exits): walk once at start, exclude the whole chain by pid set, tolerate a broken walk by skipping only the unresolvable tail.
- codex and agy shell topology unobserved: one free census per harness in the leaf's proofs, since the kill shape must not depend on claude-only facts.

### Questions the fork does not ask

1. Should the sweep kill the shell process first or its children first? (Children-first avoids a respawning supervisor pattern; in practice shells do not respawn. Minor, leaf-level.)
2. What does the sweep log? It destroys evidence of what the seat was doing — the comm/argv/pid list of what was killed belongs in the leaf's existing timing or evidence records (signpost 3a), not a new record kind.

## Q3. A recovered bare-shell terminal (live, status null, foreground a shell)

### Pick: a — treat it as a lost seat on positive evidence, charging `lost` like any lost seat

First, the confirmed new-stall fact that makes (c) untenable: current machinery does nothing at all with this terminal. `observeBusy` (`src/next.ts`) tracks only `working`/`blocked`; status null matches neither, so no busy notice ever posts. The delivery gate rejects anything not `idle`/`done`. And the replacement paths require the terminal to be `finished` or absent — it is `live`. The leaf waits forever with no notice, which is exactly the failure class this chart exists to remove.

On charging: I probed what `keep: true` actually does (2026-11-25). A keep terminal whose program exits normally goes `state: finished` — no resurrection. A keep terminal whose program is *killed* resurrects as a live bare shell: `status: null`, `reported: false`, foreground and pid become the new shell. Two consequences. One, the bare-shell shape is not reboot-specific: any abnormal harness death — OOM kill, SIGKILL, crash, reboot — produces the identical shape, and no hc field separates them. Two, since crash-loss and reboot-loss are indistinguishable and physically the same event class (the harness died before ending its turn), there is no honest basis for charging one and not the other. The lost-seat path is the path built for exactly this — harness died mid-turn — so it should charge like it. A machine that reboots or OOMs repeatedly is a degraded environment; letting it consume unbounded paid restarts silently is the worse unattended failure mode, and three losses failing the leaf loudly is the visibility the operator needs. Confidence: medium — this is a judgment about what `lost` means, and the door may read the operator's intent differently, but the indistinguishability is probed fact.

The positive evidence is solid and cheap: `state: live` + `status: null` + `reported: false` + foreground program a shell. A live harness always has status — reporting starts with the harness and `reported` stays true for the terminal's life — so null status on a live terminal cannot be a healthy seat. Note `src/hc.ts:terminalSchema` currently drops `reported` and `foreground.argv`/name, so this detection requires the same additive schema widening Q1 may need anyway.

One hazard found in probing: `hc send` into a resurrected shell returns `started: null` but the text still executes in the shell. So the detection must happen before any delivery attempt, inside the seat-state resolution — which the lost-seat path does naturally, since it ends the terminal and starts a fresh seat.

### Rejected options

- b (same path, no charge): attractive only if reboot-loss were distinguishable from crash-loss; the probe shows it is not, so b would exempt most real harness crashes along with reboots. I would flip to b if an hc field proving reboot-recovery exists — the merged facts claim a keep-recovery observation is still needed, and that probe is in the leaf either way.
- c (out of scope): leaves a second permanent silent stall in a chart whose purpose is removing permanent silent stalls.

### Evidence

- keep-terminal probes, throwaway hc terminals running bash only, 2026-11-25: normal exit → `finished`; external kill → live bare shell with `status null`, `reported false`, new shell pid; `hc send` into it → `started: null` yet text executes. Tier: better-than-training.
- Live corroboration: terminals hs-slot-b/c (t2kv, t2kw) are live, `keep: true`, `status: None`, foreground bash, started within two minutes of this machine's boot time (13:59 vs boot 13:57 on 2026-11-24) — consistent with reboot recovery. Tier: better-than-training.
- The stall mechanics in current code: `src/next.ts:observeBusy` and the delivery gate, inspected 2026-11-25. Tier: better-than-training.
- Schema drops `reported`/`foreground` detail: merged-map shared facts, confirmed in `src/hc.ts`. Tier: better-than-training.
- Existing finished-but-keep seats (hs-slot-b finished entries in `hc ls --all`) corroborate that normal exit ends even keep terminals. Tier: better-than-training.

### Pitfalls and what removes each

- False positive during harness self-restart or re-exec: unobserved whether claude/pi/codex ever re-exec. A one-pass grace (require the shape on two consecutive dispatch passes) costs minutes against a stall and removes transient misreads. Low confidence this is needed at all.
- Losing evidence: the existing lost-seat path already records the seat_lost timing row with screen and status before ending the terminal — reuse it unchanged.
- A bare shell holding a live run-check child of the leaf: the lost path ends only the terminal; the shell's children die with `end`. Same as any lost seat today.

### Questions the fork does not ask

1. Does `reported` reset or persist across the resurrection — i.e., is `reported: false` part of the reliable positive evidence, or incidental? (In my probe it was false after resurrection; whether it can ever be true on a recovered terminal is unobserved.)
2. Should the same detection apply to consultant terminals (door consultants are keep terminals too, as t2kv shows), or only leaf seats? Consultants are out of this leaf, but the door should know the same stall shape exists there.
