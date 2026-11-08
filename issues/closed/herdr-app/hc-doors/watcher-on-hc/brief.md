# Brief: watcher-on-hc

## What

watch-issues runs on herdr-core, optional as today:

- the skill refuses outside hc (no `HC_TERMINAL_ID`), sets `akrogon.watch=<repo>` on its own terminal at start and removes it at stop; the 20-minute cron stays; a listener wake (`/watch-issues tick <root>`) or a cron fire runs one full check;
- `observe.ts` keeps its line format, built from `hc ls --json` filtered by akrogon labels in the resolved session and cross-checked against recorded addresses; null status prints `unknown`; a keep shell or exited terminal is absent; logs come from the engine's transcript resolver (`log<seat>=-` when unknown); screens by `hc read`;
- stop by `hc interrupt` (or `hc keys esc` for a kind where interrupt would press ctrl+c, named by a per-harness check), then confirm idle, empty input (screen read by `hc read`, as today; operator 3a), same address and same conversation, then one corrective `hc send`; a kind that neither key stops, an unknown conversation or missing history means notify, today's path (B,C); never `--force`, kill or park;
- `observe.ts` stops importing the old `src/shell.ts` exports (`herdrArgv`, `repoSession`, `SessionResolution`) and uses the hc module, so herdr-sweep can delete them (B,E).

Consumes from engine-on-hc (blocked-by): hc addresses and labels in state, the transcript resolver, the wakes the listener sends to the `akrogon.watch=<repo>` terminal, the real-core fixture and stand-in.

## Why

The watcher reads old herdr agent and session lists and sends through herdr panes, which go away. It must keep auto-fixing crashes and stops as today on hc, woken by events instead of only the cron (signposts 4a, forks/watcher.md).

## Done-criteria

1. On a real throwaway core with stand-in seats of a recorded leaf, `observe.ts` prints today's line format with `unknown` for a null status, no line for a keep shell or exited terminal, a log path from the resolver and `log<seat>=-` when none resolves. Proof: own tests in the `test` check.
2. The skill text starts only inside hc, sets and removes its `akrogon.watch=<repo>` label, and runs one full check per wake, cron fire or tick; ticks queued while a check runs each run their own check, as Claude Code submits each queued slash command as its own turn (operator decision C2, 2026-11-08). Proof: the attended watcher check in criterion 4.
3. For codex and agy, a real seat working on a long shell command is stopped by the key the check names (`hc interrupt` or `hc keys esc`), ends idle, and takes the corrective send; a kind that neither key stops is recorded in the skill as notify-only with the observed screen (B,C); claude and pi use `hc interrupt` as observed at charting (P4). Proof: attended paid run under this leaf's grant; it names the live-interaction property (a harness's own stop key on a live tool call) (B,E).
4. A live watcher in a throwaway session, with the listener program run against that session, receives a wake for a stand-in seat that exits, runs one check and records its judgment. Proof: attended watcher check under this leaf's grant, logs kept; the end-to-end proof before old herdr is removed repeats it (C).
5. No watch-issues text or script names `herdr agent`, `herdr pane`, `herdr session` or `HERDR_ENV`, apart from the needs-you notice line notices-on-hc owns, and `observe.ts` imports nothing from the old `src/shell.ts` exports. Proof: a scoped grep recorded in the report.
6. The leaf's verify `test` duration and today's baseline (median 75 s) are both recorded in the implementation report; a rise of more than about 10 s is explained there, and every old test this leaf replaces is named.
