# Round 20 B

**Old watchers also resumed after `/clear`. This is proven in a named `w-akrogon` session before the hc port, using the same Claude 2.1.317 as today's report.** The port added another source of ticks. It did not introduce cron surviving `/clear`.

## F1: Old akrogon did not externally wake watchers

At `e82ef65a^:skills/watch-issues/SKILL.md:12–18`, the watch is Claude cron only. Starting creates the exact `/watch-issues tick <root>` job. A tick checks once. Stopping deletes the matching job. Line 14 explicitly says the watch never self-deletes and ends on stop, session loss or expiry. There is no watcher label or agent-session registration.

Searching `6efbd57e^` executable source finds no `watch-issues` wake path. Failure and busy handling showed notifications instead:

- `6efbd57e^:src/phase.ts:98–118`: `herdr notification show`, with body and sound.
- `6efbd57e^:src/next.ts:249–258`: `herdr notification show` for a busy leaf.

The old agent-session comparison at `6efbd57e^:src/next.ts:763–770` guards duplicate prompts to a **leaf seat**. It does not select or disable watchers. No watcher-specific Herdr hook or agent-session lookup was found in old akrogon. Its cron target was the Claude process that created the job, not a Herdr watcher lookup.

`6efbd57e` introduced the hc module on **November 7 at 20:04:54Z**. `e82ef65a` added watcher labelling on **November 8 at 02:27:20Z**.

## F2: Historical transcripts disprove the claimed clear behavior

All paths below are under `/home/ivan/.claude/projects/`.

| Evidence | `/clear` | Scheduled tick after clear |
| --- | --- | --- |
| `-home-ivan-Work-infra-akrogon/35a1c7a8-5796-4311-8ca1-b480adbfc9c7.jsonl` | Line 8, **2026-11-07 14:23:54.365Z**, Claude **2.1.317** | Line 14, **14:27:37.157Z**, task **c2eb7f3b**, `turnOrigin: scheduled`, `wakeupSource: schedule_wakeup`. Line 1 names the session **w-akrogon**. This is before the hc module and watcher label commits. |
| `-home-ivan-Work-infra-akrogon/3d9a59b9-ae05-4adf-839b-81950c5f968c.jsonl` | Line 6, **2026-10-12 13:23:30.793Z**, Claude **2.1.296** | Line 12, **13:26:08.337Z**, task **9d1a4988**, scheduled origin. Line 1 names it **watch-akrogon**. |
| `-home-ivan-Work-infra-tamdoma-framework/be339658-e9ee-499d-9418-bb0f3e4c4223.jsonl` | Line 8, **2026-11-08 19:02:19.340Z**, Claude **2.1.317** | Line 14, **19:03:11.316Z**, task **5161d1f8**, scheduled origin and schedule-wakeup source. This reported turn came from Claude cron. |

In the two historical examples, the scheduled tick is the first submitted task after the local clear records. There is no intervening manual watch start. The same-version November 7 example rules out both “there were no w-agents” and “the operator had never cleared them.” It does not establish why the operator experienced the old setup differently.

Local corroboration: `/home/ivan/.claude/cache/changelog.md:1800`, under **2.1.290**, discusses fixing `/loop`'s countdown disappearing after `/clear`, with the count restarting for the new conversation. This is supporting context, not proof of every cron version's policy. The actual transcripts establish survival in the versions above.

## F3: The added wake path is real, but removing it will not stop cron

Current `src/hc.ts:570–591` selects terminals by `akrogon.watch=<repo>`, checks status, and sends a tick to the selected idle/done terminal. It does not compare Claude conversation identity. `src/listen.ts:104–126`, `src/phase.ts:218` and `src/next.ts:188` trigger those wakes. `/clear` does not remove a terminal label. This added targeting can therefore reach a cleared conversation, or a replacement agent in the same labelled terminal.

To restore the old **cron-only delivery model**, remove the external wake calls/helper and watcher-label registration/discovery. That deletes complexity, but leaves the reported scheduled tick intact. Do not present that deletion as a fix for the 19:03:11Z incident.

For the desired **clear-then-stop behavior**, Door A's candidate is a small policy change: before observing or acting on leaves, a tick that starts a fresh conversation deletes its exact matching cron job and removes its watcher label. It handles both tick sources without a new file, timer or hook. Update the existing “never self-deletes” rule to permit it.

Its limits should be explicit: it wakes once to perform the stop, and a different submitted prompt before that first tick would defeat the “first prompt” condition. Treat “first prompt” as the first submitted task, excluding the local `/clear` records shown above. This changes historical behavior rather than restoring a previously proven clear guarantee. The existing `/watch-issues stop` already provides explicit cancellation of both sources.

Read-only investigation. No hc sends, label changes, cron operations or live agent inputs were performed.
