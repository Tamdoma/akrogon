# Round 17, slot C: S1 holds, with one pi fix

Verdict: S1. Drop the outside warm-up. Keep the per-kind reset keys and input check. Fix pi's resolver first, because today's pi handover already cannot continue (Q2).

## Q1: attacks on S1

F1. Start prompt typed during claude's `/clear` turn. Not a failure. Both live logs show hc pastes 200 ms after the keys (link-plan-drift log: reset-keys 13:27:49.969, warm-up 13:27:50.174; fork-tool-boundary log: 14:07:21.578 then 14:07:21.798), so the warm-up already lands at that moment today, and round 12 showed it landed in the new conversation. S1 changes the text, not the timing.

F2. `send`'s `started` right after a reset. hc schema SendResult: `started` is "whether it went `working` within a few seconds; null when it doesn't report status". Claude's `/clear` is already `working` at paste time, so `started` is true or false by timing, never a signal of delivery. `door-reset.ts:152-155` presses one enter when false. Enter on an empty composer is a no-op in all four harnesses, so the fallback cannot harm. agy has no status turn on `/clear` (round 15 brief), so its `started` is the normal case.

F3. codex, pi, agy `/new` timing. codex opens the new rollout at the next prompt (proofs.md:25), pi the new file at the next prompt (proofs.md:27), agy the new db at once (round 15 brief). Under S1 the start prompt is that next prompt, so by fresh A's first tool call the process names the new transcript for codex (newest open rollout, `src/transcript.ts:159-164`) and agy (lock, `:137-142`). Only pi fails (Q2).

F4. Operator input between input check and send. Today's window is check (`:103-106`) to keys (`:111`) to warm-up (`:115`); S1's is check to keys to start prompt. Same class, shorter. hc holds a person's keys during a paste and delivers them after (schema terminal.send), so the input lands after the start prompt either way. Nothing lost.

F5. Half-happened reset. The one thing the warm-up buys: `differing-path` (`:145`) is a deterministic gate before the start prompt. Under S1 the gate is SKILL.md:163 read by whichever session receives the prompt. If `/clear` did not run, old A, a session with a full context, gets a prompt addressed to a fresh session. SKILL.md:163 says what a fresh session does; it does not say what a non-fresh session does with a start prompt whose path equals the entry. Add that sentence (print `handover not continued: same transcript`, stop) so the stop is a rule, not a judgment. No code.

F6. Watcher. `observe.ts:74-77` resolves the path with `transcriptFor`, process first (`src/transcript.ts:210-216`), so the label only matters when no process names a path (`:213`). For claude, codex and agy the label is cosmetic and fresh A's own `transcript.ts` call rewrites it (`:214-215`). The steer check (watch-issues SKILL.md:44 compares the label to the judged path) is stale only between the reset and fresh A's first call, seconds, and the watcher runs on a 20-minute cron.

F7. Usage and seat records. SKILL.md:163: fresh A records its seat with the path from its own `transcript.ts` call; `chart-usage.ts:6-7,18` reads that `session`. Unchanged by S1. For pi it is wrong today and right after Q2.

F8. What S1 removes: `door-reset.ts:114-149` (36 lines), `replySchema`, `answered`, the second `waitFor` and bound use (`:136`), `transcriptByCode` and `resetCandidates` (`src/transcript.ts:174-195, :221+`; only `door-reset.ts:14,135,142` use them), the warm-up cases in `tests/door-agent.ts` and `tests/door-reset.test.ts`, one paid turn per handover, and the whole class of "helper reads A's transcript while the harness writes it" (rounds 12, 13, 16).

## Q2: pi, confirmed broken today

`seat.ts:75` starts every pi seat with `--session-id <uuid>`. `piStart` (`src/transcript.ts:146-150`) maps that id to the start file forever. `transcriptFor` returns a process-named path over the label (`:210-216`) and relabels when they differ (`:214-215`). So today: the helper labels the new file (`door-reset.ts:148`), fresh A's own `transcript.ts` call returns the old file, relabels it, and the SKILL.md:163 check sees the entry's path and never continues. A pi door without `--session-id` resolves null and takes the label (`:213`), which S1 never sets. Pi session headers hold no parent field (checked the newest `~/.pi/agent/sessions/*/…jsonl`: `{"type":"session","version":3,"id","timestamp","cwd"}`), so no chain from the start file to the current one exists on disk.

Smallest fix that keeps S1 (two edits, no new mechanism):

1. `skills/chart-issues/scripts/transcript.ts`: when `address === process.env.HC_TERMINAL_ID` and `PI_SESSION_FILE` is set, label and print it. pi 1.5.0 sets it for every bash tool command, "resolved when each command starts" (`pi/docs/environment-variables.md:26-27`, CHANGELOG.md:1361). The start prompt is persisted before the tool runs, so the file exists. Confidence medium: documented, not run live here.
2. `src/transcript.ts`: for pi, let an existing label beat `piStart`. The argv id names the start conversation only, and the only writer of a pi label is a post-`/new` self call, so the label is never older than the argv path. Claude, codex and agy keep process-over-label.

Alternative with the same two edits but more parts: carry a code in the start prompt and pass it to `transcript.ts` for `transcriptByCode`. Rejected: keeps `resetCandidates`, and still needs edit 2.

## Q3: other designs

The herdr-era helper (`git show af28d63e^:…door-reset.ts:108-135`) read the identity from each harness's own hook (`agent_session`) and never confirmed a reset from outside. S1 plus Q2 is the same idea with the harness's own per-tool env as the hook, without an integration install. Nothing else removes the class: heartbeat and handshake both keep the outside reader.

## Q4: verdict

- S1 (recommended): removes F8; adds one SKILL.md sentence (F5) and the two pi edits (Q2, needed regardless of S1).
- Heartbeat (round 16): adds `onHeartbeat` in `src/hc.ts:377-418` and a re-run in `waitFor`; keeps the paid turn, the code, the outside reader and a 15 s worst case.
- Handshake: adds an hc-message protocol between helper and fresh A; most parts, same race moved.
