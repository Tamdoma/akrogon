# Round 16 (door A): the round-13 warm-up wait misses claude's reply, because claude writes it after "done"

## Incident (live, framework door t3k, release efd515e1)

`/home/ivan/Work/infra/tamdoma/framework/issues/chart/fork-tool-boundary/slots/door-reset.log`: warm-up sent 14:07:21.798 (turn 20), then `code-lookup: reset unconfirmed` at 14:17:21.800, after the full 600 s bound. Claude answered in 3 s: `~/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/c6ff1c9b-7693-4816-81ea-a760b56c7f02.jsonl` holds the code in the user record (line 10) and the reply `assistant` record (line 41, timestamp 14:07:24.423). Running the deployed `transcriptByCode` against t3k now returns that file, so the lookup logic is right. The start prompt was never sent, so t3k is idle on its new conversation.

## Measured cause (throwaway claude 2.1.317 under hc, removed)

`hc events --terminal`: status `done` and the `turn` event at 15:00:56.384 UTC. The transcript's last write (the final assistant text, record timestamp 56.346) has mtime 15:00:56.484, about 100 ms AFTER done. After done no further event for that terminal arrived in 9 s (0 title events, only heartbeats). So the predicate runs once on the done event, finds no reply yet, and nothing wakes it again. This is the residual C flagged in round 13 ("if claude flushed the assistant record only after its idle status and no further hc event for A arrived"). The fake writes the record before its idle status, so the tests could not see it.

## Constraint

Operator: no new files, no polling, no watchers, fewest parts. Slot A may be claude, codex, pi or agy.

## Question

The smallest correct fix. Candidates to weigh (or better ones): (1) a transient `fs.watch` on the candidate transcript(s) as a second wake source inside the existing wait; (2) a bounded re-read after the idle event; (3) go back to a turn-count proof but remove round 12's race another way (e.g. the turn end that follows the code's user record); (4) something hc already offers that wakes after the flush. For each: what it costs, whether it is "polling or a watcher" in the operator's sense, and whether codex, pi and agy have the same write-after-done order (check real files/timestamps where you can, read-only). Also say how the fake should model the lag. Read-only. Write round16-<letter>.md with file:line. Reply with the path.
