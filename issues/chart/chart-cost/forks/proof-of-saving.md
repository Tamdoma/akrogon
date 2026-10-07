# Proof of saving

The map's K8 (B,C): how the saving is measured per fork across at least three charts. Every earlier fork carried something here.

## Question
Q1. After this chart's changes ship, how does the operator learn whether a chart got cheaper and faster: what does each chart record, when, and who measures it?

### Carries
- Lock (operator 2026-10-06, verbatim): "cutting down the costs and optimizing the process without necessarily changing how it works because I I actually do like the new way it works."
- Lock: no model or effort is hard coded in skill, config or docs. The operator sets each peer's model and effort when starting the pane (forks/cut-boundary.md, forks/peer-effort.md).
- Changes this chart ships, all skill text: peers return blind five-part notes; A writes compact merged notes and the full round once; register rules in the round template; every peer task is a brief file with a one-line prompt; reviewed leaf drafts are corrected and moved, with no second writing. Operator practice outside the skill: C's model and B's effort at pane start.
- What earlier forks asked this fork to record or measure: each peer's model, effort and note format per chart; whether the door states each peer's model and effort at open; restatement requests per round (the operator asked for an eli or elid restatement after every round on merge-turn and seed-root-cause, and after 6 of 7 rounds on this chart, including rounds written under the new register rules); tool calls, web calls and cache tokens per map turn; cache read share of each peer's bill and B's input tokens per turn; characters of leaf files written before and after peer review and handoff output per chart.
- What exists today, inspected 2026-10-06 by A:
  - `herdr agent list` prints, per pane, the harness kind and the harness session id (`agent_session.value`) for A, B and C.
  - Claude transcripts (~/.claude/projects/<project>/<session>.jsonl) hold per-call token usage with timestamps and model, and one `cost-state` record per session with `totalCostUSD` and per-model token totals. A session can span more than one chart.
  - Codex transcripts (~/.codex/sessions/<date>/*<session>.jsonl) hold per-turn start and end, effort and token usage. They hold no dollars.
  - akrogon has no cost record for charts. A chart folder records no session ids, so today's analysis had to find each chart's sessions by searching transcripts.
- Baselines measured in this chart (door on Opus 5.5 on the 10-05 charts, C on Fable 5.1): door $10.20 (seed-root-cause) and $11.95 (merge-turn); C $11.37 and $18.84; C on this chart about $13.3 with the map turn $6.90; B fork turn 2.1 minutes and 3.6k output at medium effort; handoff $1.34 and $2.40. Today's measurement was done by hand with one-off scripts in the door's session and cost several dollars of the door's own tokens.
- Not measurable from transcripts by a script without judgement: whether a round "worked" for the operator. A restatement request is visible as an operator message.

## Findings
- better-than-training · session transcripts and `herdr agent list`, inspected 2026-10-06 by A, B and C · every figure the earlier forks asked for is in the transcripts, and only the link from a chart to its sessions is missing · the options became a link plus a reader and not new tracking.
- better-than-training · Claude transcripts in ~/.claude/projects/-home-ivan-Work-infra-akrogon, checked 2026-10-06 by A · the `cost-state` dollar record is written when a session ends (0 in the two live sessions, 82 of 85 ended ones) and is a whole-session total · recorded dollars cannot be in a block written at handoff, which made dollars its own question.
- better-than-training · A's transcript, 2026-10-06 · effort is recorded per call · model and effort come from transcripts for every seat, so the door asks nothing at open.
- practitioner · Anthropic, "Demystifying evals for AI agents", read 2026-10-06 by B · separates cheap transcript metrics from quality judgement and asks for several trials · the block carries figures only and three charts are treated as an observation.
- Peer notes and rebuttals: slots/proof-of-saving-A.md, -B.md, -C.md, -merged.md, -rebuttal-B.md, -rebuttal-C.md.

## Taken
Operator answer 2026-10-06, verbatim: "1a | 2a |". The round was restated once on an elid request before the answer.

Q1 = 1a. Each chart records its own usage:
1. At open the door writes one line per seat into the chart: pane, harness kind and session id from `herdr agent list`, and the open time. It adds a line whenever a seat's session id changes.
2. When the chart ends, with any marker, the door runs one read-only script under skills/chart-issues/scripts/. It reads those transcripts between the chart's start and end and writes a usage table into the chart: operator wait minutes, usage per seat, the map turn on its own line, model and effort per seat as read from the transcripts, and the count of restatement requests.
3. The handoff review shows this chart's summary next to the summaries of earlier charts.
4. Rows split at operator messages are labelled operator turns and never forks (B).
5. The script prints ids, times and numbers, never message or tool text (B).
6. A transcript the script cannot read gives "usage unmeasured" with the file and field, and never blocks handoff (A).
7. Done-criterion: small fixtures with independently known totals (duplicate Claude blocks, cumulative codex counters, counter reset, missing session) match exactly, and the script reproduces this chart's hand figures (B,C).
8. Held for leaf review: how restatement requests are counted. The door notes each one in the fork file when it records that fork's answer (A), or restatement words recorded per chart at open and counted by the script (C).
9. Held as B's disagreement: no per-chart quality review beside the figures. The table claims nothing about quality and three charts are an observation, not proof of cause.

Q2 = 2a. Tokens by class and minutes only. No model name, price or rate in the script or skill. When a Claude session has ended, the table also shows the dollar total that session recorded, labelled as a whole-session figure. Stated limit: the table shows that usage changed, not that dollars fell (B).


## Operation proof
- Operation: `herdr agent list`, the call the door uses to read each seat's harness kind and session id at open.
- Command and inputs: `herdr agent list`, no arguments, run from the akrogon root inside the herdr session that holds panes w8:pCT (A), w8:pGY (B) and w8:pGZ (C).
- Identity: the operator's local user, no credential.
- Version and date: herdr 0.9.3, 2026-10-06.
- Observed result: JSON with one record per pane carrying `pane_id`, `agent` (claude or codex), `agent_status`, `name` and `agent_session.value`. Observed fields for the three seats: w8:pCT agent=claude session_kind=dict has_value=True; w8:pGY agent=codex session_kind=dict has_value=True; w8:pGZ agent=claude session_kind=dict has_value=True. The Claude id is the transcript file name under ~/.claude/projects/<project>/, and the codex id is the suffix of the rollout file name under ~/.codex/sessions/<date>/ (C, 2026-10-06).
- Cleanup: none, the call is read-only.
- Limits: does not prove the field names on another herdr version, a pane with no agent started, or a harness other than claude and codex.

## Reference figures for the script (A, 2026-10-06)
Hand totals for this chart, window 2026-10-06T16:34:47.701Z (the operator's opening message) to 2026-10-06T20:16:00Z, main transcript files only.
- A, claude session 1ce71920-4c64-414b-ac1c-af56890a1c4b: 151 assistant messages, output 268,671, input 324, cache read 19,653,997, cache write 635,593.
- C, claude session 14a11404-8a8d-482e-b5ca-0fdb6ae0f864: 116 assistant messages, output 111,968, input 250, cache read 14,434,644, cache write 336,356.
- B, codex session 01a10f8a-d864-7f20-b425-d2fc02d57295 (first record 16:35:54Z): 19 turns, input 12,716,484, cached input 12,255,616, output 49,427, reasoning output 9,681.
- Method. Claude: assistant records grouped by `message.id`, output is the largest `output_tokens` in the group, the other classes are the group's last values, summed over groups. Codex: `total_token_usage` of the last `token_count` event in the window minus that of the last one before the window, turns counted by `task_started`.
