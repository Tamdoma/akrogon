# Intake: door-turn-and-stale-tab

## Scope
Destination akrogon. Two independent issues, one leaf each, no blocked-by:
- door-peer-turn / peer-turn-wait (Tamdoma/akrogon#54): slot A stays in its turn while a prompted peer works.
- stale-tab / phase-stale-tab (Tamdoma/akrogon#55): `akrogon phase` does not fail a saved move over a closed recorded tab.

## Provenance
- GitHub: Tamdoma/akrogon#54
- GitHub: Tamdoma/akrogon#55
- Operator: 2026-10-03 door session ffece812, "Let's pull the three issues and let's chart them out."
- Skipped: Tamdoma/akrogon#53, owned by charts test-runs and framework-test-scope (completion owner framework-test-scope, undelivered, stays open).

## Source: Tamdoma/akrogon#54
# chart-issues door ends its turn while a peer slot is still working, so the peer result sits unread until the operator returns

Source: Tamdoma/akrogon#54
URL: https://github.com/Tamdoma/akrogon/issues/54

Unverified intake.

## Observation
During a `/chart-issues` door with slot B (codex, herdr pane `w8:pGA`), A sent B a round prompt, started a background wait loop (`until [ -s round2-B.md ] && herdr agent get ... idle; do sleep 30; done`, `run_in_background`), printed the footer `Next: none, waiting on B's round2-B.md` and ended its turn. B wrote `round2-B.md` at 07:32, about 13 minutes later. The background wait finished, but nothing resumed A until the operator came back and asked "round b was done, how did you miss it?". Operator: "why would you stop? You need to seed this to improve the script during charting. The script that waits for other consulting slots."

The peer-wait rule in `skills/chart-issues/assets/questions.md:44` covers foreground `herdr agent wait <pane> --timeout <T>`, rerunning on `timeout` and checking the return file. It does not say that A must stay in the turn until the peer returns, or that a background wait plus a footer is not allowed while a peer turn is still open.

## Location
akrogon `skills/chart-issues` (SKILL.md Drain/Take peer exchange, `assets/questions.md:44` peer wait), Claude Code harness with herdr peers.

## Reproduction
1. Open `/chart-issues` with a named B pane.
2. A prompts B for a blind map or rebuttal that takes several minutes.
3. A waits through a background command and ends its turn with a `Next: none, waiting on B` footer.
4. B finishes. A does not continue until the operator sends a message.
Frequency: seen once in session 858cdae8 on 2026-10-03.

## Expected behavior
While a named peer's prompted turn is open, A keeps waiting in the same turn using the foreground wait loop, then reads the return file and continues the exchange (merge, rebuttal, operator round) without operator input. A ends its turn only on an operator round, a peer failure or a peer reaching `blocked`.

## Urgency
Each peer round can stall for as long as the operator is away. Workaround: the operator pings A after the peer finishes.

## Source: Tamdoma/akrogon#55
# akrogon phase exits 1 after saving the move when the leaf's recorded herdr tab no longer exists

Source: Tamdoma/akrogon#55
URL: https://github.com/Tamdoma/akrogon/issues/55

Unverified intake.

## Observation
`akrogon phase emdash-offer-join check.fix` printed `moved check.fix`, then exited 1. The move had already taken effect: `state.yaml` showed `phase: check.fix`, and `issues/log.jsonl` recorded `failed -> check.fix` at 2026-10-03T06:27:11Z. The error came from the herdr tab rename for the leaf's recorded tab `wA:t8N`, which no longer existed:

```
error: {"command":["herdr","tab","rename","wA:t8N","emdash-offer-join"],"cwd":"/home/ivan/Work/infra/tamdoma/framework","code":1,"stdout":"","stderr":"{\"error\":{\"code\":\"tab_not_found\",\"message\":\"tab wA:t8N not found\"},\"id\":\"cli:tab:rename\"}"}
      at command (/home/ivan/Work/infra/akrogon/src/shell.ts:50:32)
      at async herdr (/home/ivan/Work/infra/akrogon/src/shell.ts:124:32)
      at async herdrCall (/home/ivan/Work/infra/akrogon/src/phase.ts:32:18)
      at async commitMove (/home/ivan/Work/infra/akrogon/src/phase.ts:116:13)
      at async transition (/home/ivan/Work/infra/akrogon/src/phase.ts:236:9)
      at async <anonymous> (/home/ivan/Work/infra/akrogon/src/phase.ts:282:11)
      at async withLock (/home/ivan/Work/infra/akrogon/src/state.ts:151:18)
      at async phaseCommand (/home/ivan/Work/infra/akrogon/src/phase.ts:279:9)
```

The command was chained as `akrogon phase … && akrogon next …`, so `next` did not run. A separate `akrogon next emdash-offer-join` then succeeded and opened a new tab (`wA:t91`) with new seat panes.

## Location
akrogon CLI, `akrogon phase` (`src/phase.ts` `commitMove`, herdr tab rename). Consumer repo: Tamdoma/tamdoma-framework, leaf `emdash-offer-join`. Bun v1.4.2, Linux.

## Reproduction
1. Have a leaf in phase `failed` whose recorded herdr tab has since been closed. Here the leaf had sat failed for several hours, and its seat panes were gone.
2. Run `akrogon phase <slug> <phase>`.
3. The phase move is saved, then the command exits 1 with `tab_not_found`.

Seen once.

## Expected behavior
Not provided.

## Urgency
A caller sees a failed command even though the move was saved, so scripts and watchers skip the follow-up `next` or may retry the move. Workaround: re-read the state and run `akrogon next <slug>` separately. That works and opens a new tab.

## Agent findings
- #54: transcript 858cdae8 rows 591-609. The background wait started 05:19:46Z, B wrote round2-B.md 05:32Z, the task-notification was enqueued 05:42:17Z, 2 s after the operator's message 05:42:15Z (A). The loop required file AND idle, against questions.md:44 file OR idle (B). questions.md:44 defines the wait but not that A stays in its turn. SKILL.md Printed footer lets "Next: none" name a peer wait (A,B).
- #55: src/phase.ts:109-120 renames the recorded tab after saveState when leaving failed. src/phase.ts:72-83 announceFailed renames after save when entering failed. src/shell.ts:98-118 does not treat tab_not_found as retryable. src/next.ts:327-333 and :388-394 create and persist a new tab when none matches (A,B).
- Probe 2026-10-03, herdr 0.9.3, operator's herdr session: `herdr tab rename wA:zzzz probe` exited 1 with `{"error":{"code":"tab_not_found","message":"tab wA:zzzz not found"},"id":"cli:tab:rename"}`. Nothing to clean up. It proves the error shape only, not the list-then-rename race.
