# Map brief, slot D: seat-shell-kill

You are slot D, a consultant to the chart door (slot A, hc terminal t126). This is a blind exchange: write your own territory map. Do not read any other slot's map file under /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/slots/ (map-A.md, map-B.md, map-C.md, map-D.md) until this exchange ends.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You still choose your own evidence and may locate other needed sections under the same rule.

## What this chart is

A re-chart of the stopped akrogon leaf `seat-turn-idle/shell-sweep` (Tamdoma/akrogon#157). Its contract chose which seat processes to kill by reading /proc and cgroup snapshots while the process tree forks, reparents and migrates. Five review and fix rounds each closed some races and opened new ones; the leaf was stopped 2026-11-25T07:14:20Z. The new contract must end leftover seat shells at phase advance without a selection rule that races, and keep the rest of #157 (a seat recovered by hc as a bare shell is a lost seat).

## Inputs

- Intake (sources verbatim, findings): /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/INTAKE.md
- Locks, never re-argued:
  - Operator seed decision: /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/forks/seed-decision.md, section `## Taken`. Its `## Findings` F1 is a recorded residual, not a lock.
  - Session signposts (A's picks): /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/forks/signposts.md, section `## Taken`.
- Old chart, context only (its picks are not locks for this chart): /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/shell-sweep.md, sections `## Charting proofs` (P1, P1b, P2, P3 observations stay valid) and `## Taken`.
- What failed: /home/ivan/Work/infra/akrogon/issues/open/seat-turn-idle/shell-sweep/review-B.md (findings F1 to F12) and that leaf's brief.md and design.md. The stopped branch is in /home/ivan/.akrogon/worktrees/akrogon/shell-sweep (read only).
- Live surfaces: /home/ivan/Work/infra/akrogon/src/seat.ts (startSeat launches each seat as `systemd-run --user --scope ... -- env <akrogon env> <harness argv>`; cgroupOf), /home/ivan/Work/infra/akrogon/src/scope.ts (leafSlice, cgroupRoot, procRoot, runUnitArgv), /home/ivan/Work/infra/akrogon/src/phase.ts (commitMove), /home/ivan/Work/infra/akrogon/src/next.ts (dispatchSlot), /home/ivan/Work/infra/akrogon/src/listen.ts, /home/ivan/Work/infra/akrogon/src/run-check.ts and /home/ivan/Work/infra/akrogon/src/admission.ts (run-check writer and payload scopes), /home/ivan/Work/infra/akrogon/src/reconcile.ts. Harness command templates: `akrogon config` key `harnesses` (claude, codex, agy, pi).
- Candidate direction from the watcher, unverified: tool shells live in their own cgroup and one `cgroup.kill` write ends them atomically, instead of per-process selection.

## Task

Write a proportional territory map for this re-chart:

1. The material forks, each with options, what each option could break or invite later (not only now), and which F1 to F12 failure class it removes or keeps.
2. Mechanisms to weigh at least: the watcher's cgroup.kill direction and how a tool shell gets into its own cgroup per harness (claude, codex, pi, agy), for example a harness shell or shell-prefix setting akrogon can pass in the seat env, systemd `Delegate=`, or a wrapper; ending the whole seat scope and relaunching or resuming the harness; `cgroup.freeze`; and any simpler option you find. Say where the akrogon caller (`akrogon phase` runs inside a seat tool shell) and run-check writers and payloads sit under each.
3. Practitioner questions and pitfalls over the work's lifetime, grounded in inspected files (path and function) or primary docs (URL and date read). Mark model knowledge as such with the searches that found nothing stronger.
4. Your recommended direction and its cost, and what you would ask the operator that the intake does not settle.

Free observations are welcome: throwaway processes, scopes and cgroups you create yourself, cleaned up after. Never signal, move or stop a process or terminal you did not create, and change no file outside your return path. A paid harness launch runs only through `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/direct -- <argv>` with its budget inside the argv; record each observation with command, version, date, result, cleanup and limits.

## Return

Write your map to /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/slots/map-D.md, then run:

```bash
hc send t126 "done D: /home/ivan/Work/infra/akrogon/issues/chart/seat-shell-kill/slots/map-D.md"
```
