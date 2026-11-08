# Fork notes A: watcher

## Q1 what wakes it
- Pick: both, each for what only it can see. The listener already receives every seat event; for the events the watcher acts on (a seat lost or exited unexpectedly, blocked, a leaf moved to failed, including delivery Q3's silent-stop bound) it sends the watch session one `<hc>` message (`hc send <watch terminal> "<event line>"`), so a crash is judged in seconds, not up to 20 minutes. The 20-minute cron stays for the one thing no event marks: a seat looping or hung inside one long turn (the Busy rule's loop evidence), and as the existing heartbeat. Reason: signpost 4a (workflow unchanged, crash auto-fix through the watcher) plus the no-waiting direction where an event exists. Cost: the listener must find the watch terminal: a label `akrogon.watch=<repo>` set when the watch starts; no watch running means no message, as today.
- Rejected: events only (loses loop detection inside a turn; nothing emits an event while an agent repeats a command). Cron only (a crash waits up to 20 minutes, and the operator asked for messages where possible).
- Pitfall: an event storm floods the watch session. Removed by: the listener sends at most one message per leaf per event kind until the watcher's next check, and the message only names the leaf; the watcher re-reads state itself (no judgment from the message text).
- Evidence: better-than-training · `skills/watch-issues/SKILL.md` Busy rule (loop evidence from transcript lines), engine-shape Taken (listener follows `hc events`) · 2026-11-06.

## Q2 observe and act
- Pick: same rules, hc commands: `observe.ts` lists akrogon terminals with `hc ls --json --label akrogon.repo=<repo>` and `hc get`, logs from the session-id resolver; screen by `hc read`; stop and resteer by `hc interrupt` (esc for status-reporting programs) then `hc send`; `next`/`phase` unchanged; notices through the notices Taken. Never `hc send --force`.

## Q3 where it runs
- Pick: as today: the operator starts `/watch-issues` in a Claude terminal of the repo; it runs until stopped, session loss or the cron's 7-day expiry. After a reboot the operator starts it again, as today. Reason: the skill says started and stopped only by the operator.
- Ask: should the watch terminal be started parentless so it survives a door closing? Today it is the operator's own terminal.
