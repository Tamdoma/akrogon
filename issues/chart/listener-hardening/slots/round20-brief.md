# Round 20 (door A): why do cleared w- watchers keep getting ticks now, and not on the old (herdr) akrogon?

Operator report: "Why are w- agents always being turned on? I clear them, but someone always automatically puts the /watch-issues command in there." The operator wants the real reason the OLD akrogon (herdr era) did not do this and the new (hc) one does, before any fix. Less complexity is the goal; do not propose new mechanisms unless the cause demands it.

## Evidence so far (door A)

- w-framework is hc terminal t6 (session infra), Claude Code 2.1.317, label `akrogon.watch=framework`.
- Its current transcript `~/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/be339658-e9ee-499d-9418-bb0f3e4c4223.jsonl`: operator `/clear` at 2026-11-08T19:02:19Z, then at 19:03:11Z a user turn `/watch-issues tick /home/ivan/Work/infra/tamdoma/framework` with `turnOrigin: "scheduled"`, `wakeupSource: "schedule_wakeup"`, `scheduledTaskId: "5161d1f8"`. The previous conversation `51af12b2-48cd-4281-9d8a-f73edbecc3c4.jsonl` has the same task 5161d1f8 firing at 17:43, 18:03, 18:23, 18:43. So Claude Code's CronCreate job outlived /clear (same process).
- Second path: `src/hc.ts` `wakeWatcher` (listener, phase failed, next busy) sends `/watch-issues tick <root>` to any idle/done terminal labelled `akrogon.watch=<repo>`. The label is on the hc terminal and outlives /clear and even a new agent in that terminal.
- The old skill (`git show e82ef65a^:skills/watch-issues/SKILL.md`) had cron only: no label, no listener wake. `e82ef65a` ("watch-issues runs on hc seats, labels its terminal and folds wakes") added the label and wake; `09c80175`/`6efbd57e` added wakeWatcher/listener.

## Questions

1. What did the old herdr-era akrogon do that kept a cleared watcher quiet? Check old code and skills before the hc port (e.g. `git show 6efbd57e^:src/...`, `e82ef65a^`, herdr wake/notify paths, any herdr hook or `herdr agent` lookup that keyed the watcher on its agent session rather than its pane). Did old akrogon wake the watcher at all, and how did it pick the target?
2. Does Claude Code's CronCreate job survive /clear in this version, and did it in the version used in the herdr era? Look for evidence in older transcripts under ~/.claude/projects (a scheduled turn right after a /clear), and in Claude Code docs/changelog if available locally. If cron always survived /clear, was the operator just never clearing w- agents before, or did the old setup not have w- agents?
3. So which part is the regression: the label + wake added in the hc port, the cron, or both? Name the smallest change that restores the old behavior (could be deleting something). Compare with door A's candidate: "a tick that is the first prompt of its conversation stops the watch (CronDelete + label removal)".

Concrete evidence only, file:line or transcript path + timestamp. Read-only: no edits, no hc send, no label changes, no CronDelete in anyone's session. Write round20-<letter>.md and reply with the path.
