# Map C: chart-issues cost and speed since 2026-10-04

Slot C, independent. Read: intake.md, skills/chart-issues/* at 3ce2085, git history of skills/ (97435f1..57bbe3c), issues/chart/*/slots, A transcripts in ~/.claude/projects/-home-ivan-Work-infra-akrogon/, C transcripts (same folder), B transcripts in ~/.codex/sessions/2026/10/05/. Timestamps below are UTC from transcripts (local is +2). Repo files unchanged.

## Method

- A sessions were split at each operator message. For each span: assistant messages, output tokens, cache-creation and cache-read tokens, wall minutes, and the summed wall time of `peer-wait.ts` / `herdr agent wait` Bash calls (tool_use timestamp to tool_result timestamp).
- B (codex gpt-6.1-sol, `model_reasoning_effort=medium`) turns from `task_started`/`task_complete` events and `token_count.last_token_usage`.
- C (claude-fable-5-1, effort medium) sessions split per prompt the same way as A.
- Slot file sizes under issues/chart/*/slots/ by role. mtimes are flattened by git checkout for every chart committed through `add issues` (for example all 38 seed-root-cause files carry 14:28:13), so mtimes were used only for leaf-readiness, retro-concepts, long-implement, check-reruns, reviewer-repair, door-turn-and-stale-tab, where they spread.
- Models and effort were checked per session: A is claude-opus-5-5 with `effort: high` in every chart session from 09-29 to 10-05, C is fable medium, B is gpt-6.1-sol medium (start commands in 0c5414ba, 4e65805a). No model or effort change inside the window.

## Task 1: measured reasons

### T1. Per-fork cost of A, chart by chart

| A session | chart | forks | peers | active wall m | peer-wait m | A out tokens | A cache read | wall/fork | wait/fork | out/fork |
|---|---|---|---|---|---|---|---|---|---|---|
| 7b06e0a0 09-29 | seat-role-swap | 3 | B+C | 24 | 14 | 128,583 | 17.9M | 8.0 | 4.7 | 43k |
| 4e65805a 10-01 | leaf-run-stalls | 4 | B+C | 37 | 12 | 349,983 | 47.3M | 9.2 | 3.0 | 87k |
| ace3864f 10-01 | test-time-and-temp | 2 | B+C | 29 | 11 | 231,943 | 26.7M | 14.5 | 5.5 | 116k |
| 1d906b68 10-01 | long-implement | 3 | B+C | 19 | 8 | 164,738 | 19.2M | 6.3 | 2.7 | 55k |
| aaeb21c3 10-02 | reviewer-repair + akrogon-slow-phases | 7 | B+C | 118 | 70 | 372,770 | 42.7M | 16.9 | 10.0 | 53k |
| a31eb12a 10-02 | leaf-readiness | 8 | B | 85 | 65 | 302,731 | 33.9M | 10.6 | 8.1 | 38k |
| 546713ff 10-02 | test-runs + temp-release | 5 | B | 44 | 22 | 302,589 | 29.8M | 8.8 | 4.4 | 61k |
| 858cdae8 10-02/03 | agent-test-rules | 5 | B+C | 87 | 52 | 337,584 | 41.0M | 17.4 | 10.4 | 68k |
| ffece812 10-03 | door-turn-and-stale-tab | 2 | B | 12 | 4 | 109,175 | 10.0M | 6.0 | 2.0 | 55k |
| 0c5414ba 10-05 am | seed-root-cause | 5 | B+C | 37 | 12 | 319,168 | 34.9M | 7.4 | 2.4 | 64k |
| 0218f863 10-05 pm | merge-turn | 4 | B+C | 77 | 53 | 435,817 | 45.2M | 19.2 | 13.2 | 109k |

"Active wall" excludes operator gaps (it sums only spans that begin at an operator message and end at A's last message in that span).

Finding F1. There is no step change at 10-04 in A's per-fork cost. seed-root-cause (10-05 morning, after every chart-issues commit in the window) is one of the cheapest charts measured: 7.4 min and 64k output tokens per fork. aaeb21c3 (10-02) and agent-test-rules (10-02/03), both before 7bac4c1 and 036b367, sit at 17 min and 10 min of peer wait per fork. The only post-window chart that is heavy is merge-turn, the first chart opened after the seed-issue commits, and its weight has specific causes (F2 to F6).

### T2. What made merge-turn slow and expensive

Timeline from 0218f863 and the B/C transcripts (B: ~/.codex/sessions/2026/10/05/rollout-2026-10-05T14-38-04-01a10c12.jsonl; C: 1a4397c3).

| span | operator msg | A wall | A wait | A out | B turn | C turn | note |
|---|---|---|---|---|---|---|---|
| 17:08 open + map | /chart-issues | 7.5m | 4.0m | 37.9k | 6.4m, 9.5k out, 11 calls | stalled, 1.3k out | F2 |
| 17:18 | "I told C go, continue" | 9.2m | 6.2m | 62.5k | 1.5m + 0.6m | 4.6m map (70.4k out) + 1.2m + 0.7m | F3 |
| 17:30 | "1d" | 5.3m | 3.1m | 39.5k | 2.0m + 1.1m | 2.1m + 1.2m | F4 |
| 17:39 | "1a 2a 3a" | 11.8m | 9.0m | 9.8k | 12.7m for 2.4k out | 3 out tokens (prompt lost) | F5 |
| 18:06 | "lost my internet, retry" | 8.5m | 12.3m | 17.3k | 5.6m for 0.8k out | 1.5m | F5 |
| 18:19 | "1a 2a" | 5.1m | 4.0m | 33.1k | 1.8m + 0.6m | 2.2m + 0.5m | normal fork |
| 18:49 | "1a 2a 3a" | 11.2m | 9.7m | 55.6k | 4.2m + 0.5m + 0.8m | 2.2m + 0.3m + 0.7m | followup exchange |
| 20:05 | "1a 2a 3a" (handoff) | 11.5m | 4.2m | 103.9k | 5.0m, 8.4k out + 4.6k reasoning | 2.9m, 31.4k out | F6 |

Finding F2 (measured). C did not start the opening map for 9 minutes. A inlined a 1,936-character brief into `herdr agent prompt` (0218f863 at 17:09:08). Claude Code delivered it to C as a `<pasted_content>` block, and C answered "You pasted a chart-issues slot C brief with no message of your own, so I have not started on it. Reply go" (1a4397c3, first assistant text at 17:09). The operator typed "go" at 17:18. In seed-root-cause A sent `Read and follow $S/prompt-C.md exactly.` (0c5414ba at 09:20:41) and C started at once. Cause: questions.md:46 requires the exact output path in every peer prompt but says nothing about brief length or file-versus-inline, and SKILL.md:25 and questions.md:44 prescribe only the `herdr agent prompt <pane> "<text>"` form. Cost: 9 min wall, no tokens.

Finding F3 (measured). The opening map was 2.5 to 3 times the size of the previous chart's. The prompt (0218f863 at 17:09:08) asked each peer to research eight named outside systems "practitioners first ... name each source with URL and date read" and to inspect a second repository's live evidence. C produced 70,394 output tokens in 4.6 min (seed-root-cause map: 25,643 in 1.9 min; retro-concepts: 21,177 in 1.5 min). B took 6.4 min and 9.5k output (seed-root-cause: 2.3 min, 3.2k). Slot files: merge-turn map-B.md 31,260 B and map-C.md 28,507 B against 8,577 and 13,884 for seed-root-cause, 18,372 for leaf-readiness map-B. Cause: questions.md:40 ("For anything outside the repository, practitioners first: name who has done this at scale ...") and SKILL.md:47 (tier order before every question) apply to any chart with an outside-practice question; merge queues are such a topic, seed-issue formatting was not. This rule predates the window (308d5ed 09-11, 735cd63 09-14). Within the window 7bac4c1 (10-04) widened the map to "pitfalls over the work's lifetime, what each option could break or invite later" at SKILL.md:37 and questions.md:3, and A's merge-turn map prompt carries that wording verbatim. Measured size growth of peer fork files after 7bac4c1: average C fork file 10,426 B (seed-root-cause) and 13,763 B (merge-turn) against 2,566 to 10,859 B for every earlier chart; average merged file 7,719 and 5,316 B against 1,358 to 5,634 B earlier. Average operator-visible round text did not grow (3,610 chars in merge-turn, 4,979 in seed-root-cause, 2,585 to 7,264 earlier), so the extra tokens are in peer files and A's merge, not in what the operator reads.

Finding F4 (measured). The operator picked `1d`, an option not in the round. SKILL.md:49 and questions.md:50 then require one focused final-shape check by each peer before recording and A added a rebuttal on the revised shape: two extra exchanges (B 2.0m + 1.1m, C 2.1m + 1.2m, files merge-order-1d-shape.md, merge-order-1d-merged.md, merge-order-1d-rebuttal-B/C.md, merge-order-final-check-B/C.md 9,753 and 11,005 B). Cost about 5 min wall and 39.5k A output tokens on a fork that was already answered.

Finding F5 (measured). The issues-only fork lost about 30 minutes to a network outage. A prompted both peers at 17:39:27. B's turn ran 12.7 min for 2,365 output tokens and 4 tool calls (its ordinary fork turn is 1.5 to 2 min); C received no usable prompt (3 output tokens). A's `peer-wait.ts` returned `budget` after 541 s, then `done` for B and `failure` for C (0218f863 at 17:41:52, 17:51:52, 17:51:53). The operator wrote "lost my internet, retry" at 18:06; the rebuttal round then took 322 s because B needed 5.6 min for 770 output tokens. Not a skill cost. It shows one lifetime pitfall: the door has no cheap way to tell "peer is slow" from "peer is stuck", so A sat in a 9-minute foreground wait (questions.md:44, budget below the harness timeout, rerun on `budget`).

Finding F6 (measured). Handoff is the largest single A span in every chart and grew with 97435f1 (10-02). merge-turn handoff: 68 assistant messages, 103,870 A output tokens, B 5.0 min with 4,571 reasoning tokens, C 31,434 output tokens; seed-root-cause handoff: 44 messages, 45,820 tokens; agent-test-rules (10-03): 62 messages, 68,277; leaf-run-stalls (10-01, before 97435f1): 41 messages, 68,453. 97435f1 added to SKILL.md the needs sheet (line 55), per-leaf `grants` (57), fixture cleanup proof (59), save-route proof (61), the grant confirmation in the handoff review (65) and the `bun -e ... gaps(...)` presence check per draft folder (73 to 79); 7c612ef added an 83-line readiness.yaml example to shapes.md that A and both peers read at draft review (SKILL.md:67). The merge-turn transcript shows A running the presence check and a push proof script (push-proof.sh, 20:07 to 20:17) that earlier charts did not run. Unmeasured: how many of the 104k tokens are the proofs versus the drafts.

### T3. Costs that exist in every chart since 09-11 and dominate the bill

Finding F7 (measured). About 80 percent of A's output tokens are hidden reasoning, not written text. Visible characters (text plus tool input) per output token: 0.58 (leaf-run-stalls), 0.59 (leaf-readiness), 0.69 (agent-test-rules), 0.86 (seed-root-cause), 0.62 (merge-turn). At roughly 4 characters per token, visible content is 15 to 20 percent of A's output. A runs opus-5-5 at `effort: high` in all eleven sessions (per-message `effort` field). Output tokens are the expensive class, so A's effort setting is the largest single lever and is not a skill rule at all. Unmeasured: output quality at medium effort for the merge and round-writing steps.

Finding F8 (measured). The exchange count per fork is fixed by SKILL.md:49 and questions.md:48 to 50: blind round to each peer, A merge, disagreement-only rebuttal from each peer, then the operator round, plus a final-shape check when an answer changes a mechanism. With B+C that is four peer turns and two waits per fork before the operator sees anything, six with a final check. Measured peer turn times are stable (C fork round 0.9 to 2.6 min and rebuttal 0.3 to 0.7 min from 09-29 to 10-05; B fork round 1.5 to 2.0 min and rebuttal 0.6 to 0.7 min on 10-05), so the floor per fork is about 2.5 min of peer time plus A's two writes. The time between forks that the operator feels is this floor plus A's merge and round composition (A spans of 5 to 12 min with 3 to 10 min inside waits).

Finding F9 (measured). Every peer turn re-reads the chart. B's input tokens per fork turn climb across a session (317k, 394k, 492k, 419k, 639k in seed-root-cause; 572k to 1.38M in merge-turn), 94 to 97 percent cached. C's cache-creation per fork round is 15k to 66k. The prompts (0c5414ba at 09:25:09, 0218f863 at 17:24:07) tell each peer to read INTAKE.md, the fork's Question and Carries, every related fork's Question, the locks, their own earlier map and questions.md (9,687 B) every round. Cached input is cheap per token but it is 6 to 9M tokens per chart on B alone.

Finding F10 (measured). Each `eli`/`elid` re-render of a round costs 2 to 5k output tokens and a full cache read, and happens on nearly every round (10 round texts for 5 forks in seed-root-cause, 10 for 4 in merge-turn). It is small next to F7 but it doubles the number of operator-visible rounds per fork.

Finding F11 (measured, not in the window). The seed-issue commits 0d15906, 3b8fdb5, 57bbe3c (10-05 12:48 to 13:15 local) changed only skills/seed-issue/SKILL.md. Their effect on the door is a longer intake: merge-turn INTAKE.md is 6,589 B with Suspected cause, Whose view, Files read, Not inspected and Related reports sections against 3,390 B for seed-root-cause and 1,682 to 10,252 B for earlier charts. That is one more page per peer read per round (F9), not a step change.

Not found. Nothing in 036b367 (removes the lesson-prune offer, SKILL.md:29), 126e6d6 (one-word prose change), 8f0338f (done-criteria wording) or the peer-wait commits 8b0c0ae, ddd43fc, 415fd09 adds tokens or wall time. peer-wait.ts polls `herdr agent wait` in 10 s slices (scripts/peer-wait.ts:86) and returns on a non-empty file, which is faster than the earlier `for i in $(seq 1 9); do herdr agent wait ... 30000` loops in a31eb12a (10-02) that waited 271 s per call regardless of file state.

### Answer to the operator's question

The door did not get systematically slower or costlier on 10-04. One chart (merge-turn) was about twice as slow and 1.7 to 2 times as costly per fork as the chart that morning, for five measured reasons: a 9-minute peer start stall caused by an inlined brief (F2), an opening map with outside practitioner research that tripled peer map size (F3), an off-menu operator answer that triggered the final-shape exchange (F4), a 30-minute network outage inside a foreground wait (F5), and a handoff that has grown since 97435f1 (F6). The costs that make every chart expensive are older than the window: A at effort high spending 80 percent of its output on hidden reasoning (F7), four to six peer turns per fork (F8), and full re-reads by peers every turn (F9).

## Task 2: territory for cutting cost and time without changing the door

Lock: the operator keeps the same rounds, options, pitfalls avoided, challenge check, peers B and C, blind exchange and rebuttal. Everything below changes how the door produces them, not what the operator sees or answers.

### Material forks

Fork K1. Where A spends its output tokens (F7).
- O1. Run A at effort medium for chart sessions and keep high for nothing. Removes the largest cost class in one setting. Could break: weaker merges and weaker challenge checks on hard forks. Invites later: nobody notices quality drift because rounds still look the same. Unmeasured: quality delta; one chart at medium with the operator judging rounds would measure it.
- O2. Keep A at high, move the mechanical steps out of A: peer prompting, waiting, file assembly already go through scripts; extend the script to write the prompt files and collect returns so A's turns are fewer (F8, F9). Cuts assistant turns and cache reads, not reasoning per turn.
- O3. Leave A alone and cut peers (K2). Smaller effect on A's bill because A's reasoning is per step, not per peer.

Fork K2. Exchange count per fork (F8).
- O4. Make the rebuttal conditional: A merges, and only when the merge shows a disagreement tag other than `(A,B,C)` does A send a rebuttal prompt, and only to the disagreeing peer. The challenge check still carries "each named peer's remaining disagreements" (questions.md:24) because agreement is recorded in the merge. Saves one wait and two peer turns on agreeing forks. Could break: a peer who would have objected to A's merge of its own text has no second look. Invites later: A writing merges that look agreeing. Measurable from existing slots: how many rebuttal files contain a material point (merge-turn rebuttals are 499 to 3,496 B).
- O5. Prompt both peers once with blind round and rebuttal in one turn is impossible (rebuttal needs the merge), so the alternative is to drop the blind round and have peers rebut A's draft only. This changes the door's independence guarantee and is outside the lock.
- O6. Keep two exchanges but run them concurrently with A's own round: A already writes its A-file while peers work (SKILL.md:49). Measured A files are 1.4 to 4.5 KB and A finishes before peers, so there is no slack here.

Fork K3. What peers read per turn (F9).
- O7. Give each peer a per-fork packet file that A writes once (intake summary, Question, Carries, related Questions, locks) and have the prompt say "read this file". Cuts B's 400k to 1.4M input per turn and avoids F2 because the prompt is short. Could break: packet omits something the full files held. Invites later: packets drifting from forks when A edits a fork after writing the packet.
- O8. Keep full reads, shorten questions.md: the round shape block (lines 5 to 25) is what peers need; the research tiers and peer-exchange sections are A's. Splitting the file so peers read 2 KB instead of 9.7 KB is a cheap cut.

Fork K4. Opening map research (F3).
- O9. Bound outside research in the map prompt: "at most N named practitioner sources, one paragraph synthesis" as questions.md:40 already says ("synthesize in one paragraph rather than listing sources"). The merge-turn prompt listed eight systems, and C wrote 28 KB. Keep the tier rule, cap the volume.
- O10. Do outside research once, in A only, and give peers the findings as a lock. Breaks blind independence on research, which questions.md:40 requires ("A and each named peer research independently"). Outside the lock unless the operator relaxes it.

Fork K5. Peer start and stuck detection (F2, F5).
- O11. Always deliver peer briefs as files with a one-line prompt (seed-root-cause pattern). Zero cost, removes the pasted-content stall.
- O12. Make peer-wait.ts report the peer's last activity age (herdr `agent get` exposes status) and return `stalled` after N minutes of no file growth and no status change, so A can ask the operator instead of sitting 9 minutes. Could invite: false stalls on long legitimate turns (B's 6.4-minute map). Unmeasured: herdr's status latency.

Fork K6. Handoff weight (F6).
- O13. Keep every proof and the presence check but run them from one script that prints names only, replacing the per-folder `bun -e` calls and the hand-written push-proof.sh. Cuts assistant turns, not proofs.
- O14. Skip the peer draft review when both peers already agreed on every fork (SKILL.md:67 makes it mandatory). Outside the lock unless the operator accepts fewer reviews on consensus charts.

Fork K7. Off-menu answers (F4).
- O15. When the operator answers with a new option, A records it as a new fork question in the next round (questions.md:29 already says a challenge exposing a new fork belongs in the next round) instead of a final-shape check plus rebuttal. Saves one or two exchanges on every off-menu answer. Could break: a late mechanism change reaching the leaf without a peer check, which SKILL.md:49 forbids. Needs an operator decision on which is wanted.

### Questions a practitioner would ask

Q1. What is the cost split by token class at current prices (A output at high effort versus A cache reads versus B and C)? Unmeasured here. Without it, O1 versus O4/O7 cannot be ranked by money, only by tokens.
Q2. How often does a rebuttal change the merged round? Countable from existing slots and fork Findings; it decides O4.
Q3. Is B's latency per output token stable, or does codex gpt-6.1-sol slow under load? B needed 12.7 min for 2.4k tokens during the outage and 6.4 min for 9.5k at open. If B is often the slow leg, the cheapest speedup is to prompt B first and C second.
Q4. Does the operator want the outside practitioner research on every outside-practice chart, or only when the map names a fork that needs it? That decides O9.
Q5. Would the operator accept rounds at A medium effort for one chart as the measurement for O1?

### Pitfalls over the lifetime of the work and what removes each

R1. Cutting exchanges silently weakens the challenge check. Removed by O4's rule that the merge carries explicit agreement tags and the challenge check names "no disagreement recorded" when no rebuttal ran.
R2. Packet files (O7) drift from fork files. Removed by writing the packet from the fork file by a script at prompt time, never by hand.
R3. Effort changes get forgotten and later reverted by a settings edit. Removed by setting it where the chart session starts (the `herdr agent start` arguments for peers already carry `--effort`; A's own setting is the operator's).
R4. Stall detection (O12) fires on long legitimate turns. Removed by using file growth plus status, not time alone, and by reporting rather than killing.
R5. Any cut measured on one chart looks like a win because charts differ by 3x in size (F1 table). Removed by measuring per fork and per peer turn, as above, over at least three charts before and after.
R6. Shortening questions.md for peers (O8) desynchronizes the round shape between A and peers. Removed by keeping one shape block in one file that both read, and moving only A's sections out.

### What is not worth doing

- Reverting 7bac4c1 or 97435f1. The operator keeps the pitfalls-avoided round and the readiness contract; their measured cost is in peer file size and handoff turns, which O4, O7, O13 reduce without changing the content.
- Touching peer-wait.ts for speed. It already returns within 10 s of a non-empty file.
- Reverting the seed-issue commits. The longer intake costs one more page per peer read and is the operator's chosen seed shape.

### Unmeasured items, listed

- Quality at A medium effort (K1).
- Rebuttal material-change rate (Q2).
- Money split by token class (Q1).
- B's latency variance outside the outage window (Q3).
- Token share of proofs versus drafts inside handoff (F6).
- Pre-09-28 charts: slots are absent for charts before stuck-seat-recovery, so single-slot cost per fork before peers existed could not be compared.
