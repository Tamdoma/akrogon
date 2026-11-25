# Rebuttal: shell-sweep (slot C)

Target: `issues/chart/seat-turn-idle/slots/fork-shell-sweep-merged.md`. Disagreements only.

## Q1 when and where shells end

- **Disagree with option `c` (B, D: add a quiet-period delivery sweep in `next`).**
  - **Fact/evidence:** `src/listen.ts:listenCommand` (`src/listen.ts:95`) wakes `next --wake` only on hc events `turn`, `status: blocked`, `finished`, and `lost` (explicitly no polling). A Claude seat masked as `working` emits none of these (`map-merged.md` `## Shared facts`, 2026-11-25). Additionally, `src/phase.ts:commitMove` (`src/phase.ts:245`) preserves `busy_since` across non-terminal moves, so a seat that worked 55m in `implement` can exceed B's `busy_since` window minutes after advancing; and because hc cannot tell a working turn with a shell from an ended turn with one (`map-merged.md` `## Shared facts`), D's "few minutes from phase entry" with no prompt also matches a live post-advance or operator-recovered turn.
  - **Consequence if it stands:** In unattended runs with no unrelated event, the quiet-period sweep never executes (leaving a dead safety net unless polling is added to `listen.ts`), while adding an ungrounded time threshold that risks killing an active turn when another pass does arrive.

## Q2 which processes

- **Disagree with matching only "Direct shell children of the harness with their trees (A, D)".**
  - **Fact/evidence:** Live `/proc` census on this host (2026-11-25) observed a background shell loop (`PID 1087782`, `bash -c while true; do sleep 5; done` → `sleep 5`) inside `hc-hold-7db5510a.service` reparented to `PPID 2317` (`systemd --user`), not its launching harness PID. Detached/subshell background loops (`(until ...; do sleep 30; done &)`) whose intermediate shell exits are reparented to the subreaper while staying in the seat's systemd `.scope` cgroup.
  - **Consequence if it stands:** Reparented background shells inside the seat `.scope` survive `commitMove`, leaking loops and file/worktree holds across phases. Matching shell roots anywhere in the seat `.scope` (direct harness children or reparented orphans, sparing caller ancestry) catches both without touching non-shell harness helpers.

- **Disagree with "skip the whole sweep while the leaf has a live run (D)".**
  - **Fact/evidence:** Live cgroup census of `akrogon-l40ca58c258f0-fw-seo-targets-ia-keyword-a-e6d72639.scope` (2026-11-25) shows a `run-check` wrapper (`bun akrogon run-check`, PID `854597`) sits inside one `bash` subtree (`854594`), independent of any other background shell subtree; `src/admission.ts:liveRuns` returns all live/draining runs for the leaf across both seats and workers.
  - **Consequence if it stands:** One live or draining run record on the leaf (e.g. on the other seat) cancels the entire phase-advance sweep for an unrelated stuck background shell, leaving the `#157` stall intact with no second sweep under Q1(a). Sparing only the specific shell subtree containing a live `run-check` PID protects the run without disabling the sweep.

- **Disagree with "D proposed KILL at a later sweep".**
  - **Fact/evidence:** Under Q1(a) there is no later sweep; `SIGTERM` alone sent to a shell or subshell can leave child commands (such as `sleep 30` in `INTAKE.md` `## Observation`, 2026-11-24) alive if they ignore or do not propagate `SIGTERM`.
  - **Consequence if it stands:** A shell or child that survives `SIGTERM` keeps Claude's root masked as `working`, preventing the `turn` event and stalling delivery. The single advance sweep must send `SIGTERM` to the collected tree, wait briefly, and `SIGKILL` survivors (re-checking start time and scope membership).

## Q3 recovered bare shell

- **Disagree with D's fixed whitelist `reason in {server_stop, stopped_by_restart, holder_lost}` for the parked/lazy-shell (`pid: null`) shape.**
  - **Fact/evidence:** Throwaway `hc 0.1.22` probe (2026-11-25): starting `hc run --bg --keep -- sh -c 'sleep 300'` and sending `kill -9` produced `{"state":"live","argv":["sh","-c","sleep 300"],"pid":null,"status":null,"reported":false,"reason":"signaled"}` (before attach triggers lazy shell spawn). `hc --help` (0.1.22, 2026-11-25) confirms `keep` recovers signal deaths too.
  - **Consequence if it stands:** Any `keep: true` seat killed by OOM, `SIGKILL`, or `SIGSEGV` stays parked with `state: 'live', pid: null, reason: 'signaled'` forever and is never matched by D's whitelist, stalling the leaf until a human attaches to spawn the shell. Match `state === 'live' && pid === null && reason !== null && reason !== 'spawn_pending'` instead.

- **Disagree with omitting `argv` from `src/hc.ts:terminalSchema` on D's claim "The launch `argv` is rewritten on recovery, so it is unusable for comparison".**
  - **Fact/evidence:** `src/seat.ts:startSeat` (`src/seat.ts:320`) always launches leaf seats with `argv[0] === 'systemd-run'`. Throwaway `hc 0.1.22` keep-recovery probes (2026-11-25) show `hc` keeps the launch `argv` while running or parked (`pid: null`), and rewrites `argv` to `["/usr/bin/bash"]` once the recovery shell spawns (`pid !== null`, `reason: null`).
  - **Consequence if it stands:** Checking only `status === null` and `foreground.name` being a shell can false-positive on a booting seat whose harness shim/wrapper under `systemd-run` briefly exposes `foreground.name === 'sh'`/`'bash'` before OSC 7501 status arrives, killing a healthy starting seat and charging `lost`. Keeping `argv` in `terminalSchema` and requiring `argv[0]` to be a shell (not `'systemd-run'`) alongside `foreground.name` makes the spawned-recovery-shell check immune to startup races.
