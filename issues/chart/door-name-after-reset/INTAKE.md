# Intake: door-name-after-reset

## Scope

The chart door's A terminal keeps its session name when the door resets A for the next chart. Destination repo: akrogon (the reset helper `skills/chart-issues/scripts/door-reset.ts` and the door's skill text).

## Provenance

- Operator: door t126, 2026-11-14T09:47Z, `/chart-issues` arguments

## Source: operator 2026-11-14 door t126

When the main slot A consultant restarts during the charting process, it loses its name. I have to manually rename the actual agent. I'm using the actual names (like "c-akrogon") To identify slot A charting agents faster, but now when it restarts, when it's doing a new chart, it loses its name completely. Can we implement it so that the name is actually put after the restart and the clear or whatever happens during the restart? Use slot b consultant (codex) and slot c consultant (claude fable 5.2 medium effort) to chart this out. Do it on autopliot, and test it out. The name has to be the previous name. I always give the name initially, but it's usually the name of the tab (right now, this tab is c-akrogon). Full autopilot mode, including the singposts.

## Agent findings

Observed by A on 2026-11-14 (claude 2.1.323 running in t126, claude 2.1.325 installed, hc terminals read with `hc get`):

- F1. The claude session name is a transcript record: `{"type":"custom-title","customTitle":"c-akrogon"}` plus `{"type":"agent-name",...}`. hc shows it as the terminal `title`. The hc `name` of a door terminal is null and the tab name sits in the `where` label (`akrogon / c-akrogon`).
- F2. On claude a session that has a name keeps it across `/clear`. Past handover resets in t126 (door-reset logs of dispatch-flake, shared-rules, round-rewrites, 2026-11-10 and 11-11): each new transcript starts with the `custom-title` record on line 1. The operator's manual `/clear` on 2026-11-14 kept it too.
- F3. Live probes on claude 2.1.325 (haiku, throwaway terminals t1v2 and t1v3, removed after): a session started with `-n probe-kept`, then `/clear` by keys, then one prompt, wrote a new transcript whose line 1 is `custom-title: probe-kept`. An unnamed session renamed by keys `/rename probe-mid` changed the hc title at once, and after `/clear` the new transcript starts with `custom-title: probe-mid`.
- F4. The framework door (t3k, tab `c-framework`) is the observed loss. Its sessions carried `c-framework` through 2026-11-11T21:12Z. A new claude process started at 2026-11-12T10:20:37Z (transcript 45249161, first input an hc notice, not a reset) with no name. Every transcript in that chain since has zero `custom-title` records, across about 40 handover resets, and the hc title is an auto title that changes per session (now `Chart-issues skills-typecheck handover`).
- F5. So on claude the reset does not drop an existing name. A session with no name of its own gets a new auto title after every reset, which reads as "lost its name completely".
- F6. `door-reset.ts` types `/clear` (claude, agy) or `/new` (codex, pi) as keys and sends the start prompt. It never reads or sets a name. `seats.yaml` records `name: null` for A.
- F7. Not yet observed: whether codex (0.169.0) or pi (1.5.2) keep a session name across `/new`, and whether they have a rename command.
