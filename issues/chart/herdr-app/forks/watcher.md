# watch-issues on hc

## Question

Today watch-issues is a Claude Code session the operator starts in a repo; it creates a Claude cron job (`*/20 * * * *`, `/watch-issues tick <root>`, 7-day expiry) and each fire runs `akrogon status`, `skills/watch-issues/scripts/observe.ts` (herdr `agent list`, transcript paths), judges every leaf (Waiting, Failed, Busy rules) and acts with `akrogon next`/`phase`, `herdr agent send-keys esc`, `agent prompt`, `agent read`, `notification show`. Signpost 4a: the crash auto-fix runs through this watcher, workflow unchanged. Operator 2026-11-06: no polling or waiting, `<hc>` messages wherever possible, fewest moving parts, nothing that works today may break.

1. What wakes the watcher: the 20-minute cron as today, the listener sending the watch session an `<hc>` message for each event the watcher acts on (crash or lost seat, blocked seat, failed leaf, silent-stop bound, 60-minute busy), or both?
2. How does it observe and act on hc: `observe.ts` on `hc ls --label`, `hc get`, the session-id resolver; read by `hc read`; steer by `hc interrupt`/`hc keys esc` and `hc send`; notices through the notices Taken?
3. Where does the watch session run and who starts it, including after a reboot: an operator-started terminal as today, or something the listener starts?

### Carries

- Operator clarification 2026-11-06 (signposts.md): no polling or waiting; seats communicate by `hc send` / `<hc>` messages wherever possible. Today's door safety-net `hc wait --children` and timed checks are to be judged against it.

- Signposts: forks/signposts.md `## Taken` (4a) and its 2026-11-06 directions.
- Engine-shape, identity, start-and-pane, delivery, session-id, notices, containment: `## Taken` in each fork file (binding; delivery Q3 sends silent leaf stops to failed with a reason after the third prompt).
- Map: slots/map-merged.md fork "watcher".

## Findings

- Merged notes: slots/fork-watcher-merged.md (A,B,C,D,E with rebuttal corrections).
- Agreed: judgment stays in the watcher with today's rules; the listener (and a committed move to failed from any caller) sends the watch terminal one coalesced `/watch-issues tick <root>` wake for a lost or exited seat, a keep-shell replacement, a blocked seat, a failed leaf (silent-stop bound included), the busy deadline; the watch terminal is found by a label it sets on itself; operator starts and stops it; one per repo; corrective sends confirm the same address and conversation.
- Q1: keep the 20-minute cron beside the wakes for loops inside a turn and a dead listener (A,C,E; D no disagreement after merge) vs drop it and wake on transcript changes plus deadlines (B).
- Q2: stop with `hc interrupt`, a per-harness probe naming `hc keys esc` where interrupt would press ctrl+c (A,C,D,E) vs always one `hc keys esc` (B).
- Q3: operator-started Claude terminal in hc, as today; nothing restarts it after reboot; status shows whether a watcher is live (all).

## Taken

Operator 2026-11-06, door t15, verbatim: "1a, 2a, 3a - wat her must not be mandatory, like it isnt today."

Read as:
- The watcher stays optional, as today: nothing in the engine, listener, start or handoff requires a running watcher. With no live watch terminal for a repo the listener sends no wake and everything else runs as without a watcher today; `akrogon status` shows whether a watcher is live as information only, never a warning, gate or notice.
- Q1 1a: the 20-minute Claude cron stays as today (`*/20 * * * *`, `/watch-issues tick <root>`, 7-day expiry, operator-created and -deleted). Added: the listener, and any committed move of a leaf to failed, sends the repo's live watch terminal one `/watch-issues tick <root>` by plain `hc send` for a lost or exited seat, a seat replaced by hc's keep shell, a blocked seat, a failed leaf (delivery's silent-stop bound included) and the 60-minute busy deadline; coalesced to one wake in flight per repo; a wake or a cron fire runs one full check, and queued ticks run one check. The watch terminal is found by the label `akrogon.watch=<repo>` the skill sets on its own terminal at start and removes at stop; only a live terminal running an agent counts; two live matches are reported.
- Q2 2a: `observe.ts` keeps its line format on `hc ls --json` filtered by akrogon labels in the resolved session, cross-checked against recorded addresses; null status prints `unknown` (hands off), a keep shell or exited terminal is absent; logs from the session-id resolver; screens by `hc read`. Stop by `hc interrupt` (a per-harness probe names `hc keys esc` for any kind where interrupt would press ctrl+c), then confirm idle, empty input, same address and same conversation, then one corrective `hc send`; unknown conversation or missing history means notify. Never `--force`, kill or park; notices through the notices verb.
- Q3 3a: the operator starts `/watch-issues` in a Claude terminal inside hc in the repo's session, one per repo; the skill refuses outside hc (no `HC_TERMINAL_ID`) as it refuses without cron today; nothing restarts it after a reboot.

Correction, operator 2026-11-07, door t15 (leaf review round, slots/leaf-review-merged.md S3), verbatim: "1a | 2a | 3a"

Read as (3a): the reset helper's cancel check reads the operator's submitted input from A's transcript per kind, as today's `door-reset.ts` does (SKILL.md Handover input records); the watcher's empty-input confirmation reads the screen by `hc read`, as today's watcher reads it. Stated limit: text typed but not submitted is not seen. Foreclosed: a new input source.
