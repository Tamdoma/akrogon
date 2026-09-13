# Model Tiering

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Both slots run top models today. Which of the dotted phases run a cheaper model? Whether building goes to subagents inside the harness is the operator's own call and the machinery must not know (intake 259). Does a cheap implementer fail check-issue often enough to eat its saving? Blocked by # Debate Count.

Reshape 2026-09-08 after # Debate Count, # Turn Within Phase, # Driver State: positions and rebuttals run in parallel, settled. The debate is on by default and skipped at the door for very small issues, so the cheap-implementer question covers both the debated plan and the plan slot B writes alone.

From # Quality Layers 2026-09-08: a re-check reads only the repair diff, so it is a small pass and a candidate for a cheaper model.

From # Implementer Brief 2026-09-08, operator-locked: slot B is never a cheap model. Tiering applies to the worker subagent B spawns and to small passes such as re-checks.

From # Skill Rewrite 2026-09-08: pi as slot B requires a write-capable worker tier in tamdoma-subagents (children today get read, grep, find, ls only). Work item in the pi extension repo, tested before pi serves as B.

From # Config Shape 2026-09-08: `workers` is an open map of harness name to model string, `harnesses` holds one launch line per harness with `{model}` and `{effort}`; no harness name appears in code. Verified flags: claude --model/--effort, codex -m and -c model_reasoning_effort=, pi --model/--thinking, grok -m/--effort.

From # Distribution 2026-09-08: `akrogon install` runs `herdr integration install <kind>` for every harness listed under `harnesses` in the global config, so the harness list in config is also the install list.

## Findings

Slot A (Claude, blind): four questions: no cheaper model for re-checks; no worker effort key; spawn table per harness in the implement skill; pi write tier as an outside work item. Evidence: Lin Cursor 2026-07-20 tier 1; intake 259 tier 1.

Slot B (Codex, blind): five questions: no phase switching (Lin; O'Keefe and Volkov 2026-08-06 tier 1); first worker defaults luna and haiku (model docs tier 2, local Codex model cache); optional worker effort key (Claude subagents inherit parent effort, Codex applies the worker model's default, tier 2 docs 2026-09-09); no per-call worker override (Rajasekaran 2026-03-24 tier 1); cost yardstick = subscription allowance plus overage per completed leaf, failed leaves counted (Lin; Anthropic billing docs tier 2).

Merged 2026-09-09 into six questions with tags. Rebuttal, slot B: Q3 native effort defaults hide a real cost choice; Q6 any spawn table must be verified per harness and pi must go through its worker extension; Q7 (pi tier) already locked in Skill Rewrite, dropped from the batch.

Operator answers 2026-09-09: 1-A. 2, free text, a decision: "This will be decided in the harness itself. I don't know if akrogon should be model-aware of subagents at all ... the only thing that it should be aware of is the main agent model, not the sub agents as workers." Slot A confirmed no mistake: matches intake 259, removes the `workers` config key, the skill spawn table and any spawn rule. 3-A. 4-B, free text: worker override is the harness's business as long as akrogon and herdr hold no lever for it; the repair count stays in the command, the last round stays with B. 5-A, plus a new fork: a per-repo performance log. 6, free text: left to the harness. Challenge confirmed.

Operator explanation recorded for handoff. akrogon knows only the two slot models, because it launches the panes. The implement skill says "delegate the sub-brief to a subagent" and nothing about model or mechanism; Claude reads its agent settings, Codex its config, pi its extension; the broadcast writer is spawned the same way. If a harness has no cheap worker configured, the subagent runs at the parent's model and cost; nothing breaks.

Performance log, debated in chat 2026-09-09 and accepted by the operator ("yes, one line per phase move, no tokens, no prose"). `akrogon phase` appends one JSON line to `issues/log.jsonl` on every phase move. Fields, all mechanical: ts; slug; leaf; from; to; slot; harness; model; effort (effective config at that moment); pane; tab; worktree path; branch; head commit; files, insertions, deletions vs `$AKROGON_BASE` (`git diff --shortstat`); attempts; fix_round; verdict (on reviews); debate (the door field); session (the harness's own session id, read from `herdr agent get <pane>` field `agent_session.value`, verified 2026-09-09 on the Codex pane; Claude also exports `CLAUDE_CODE_SESSION_ID` to child processes; operator asked for it: "can it at least know the session link and put that link into the table"). Durations are subtractions on ts and are not stored. No token counts: the command cannot see them; every harness writes per-message usage (input, output, cache read, cache write) to its own session files on disk, so the log carries the join keys (harness, session id, worktree path, pane, ts) and a later analysis agent joins the two and applies looked-up prices. No prose: a learning is written by a person in `learnings/` after reading the numbers. Nothing in the loop reads the log; `akrogon status` may read it for stall durations (carried to # Status View).

## Taken

Slot A and slot B always run their configured strong model for every pass; no pane changes model between phases. akrogon is aware of the two slot models only, because it launches the panes; worker subagents, the broadcast writer, their models, effort and any override are configured and chosen inside each harness, and the implement skill says only "delegate the sub-brief to a subagent". The `workers` key leaves the global config (correction to # Config Shape). The repair cap and the last-round-by-B rule stay in the command. A worker earns its keep by subscription allowance plus paid overage per completed leaf, failed leaves counted, measured from the performance log: `akrogon phase` appends one JSON line per phase move to `issues/log.jsonl` with the mechanical fields listed in Findings, no tokens, no prose; token usage is joined later from harness session files by an analysis agent. Why: the machinery holds one lever, the slot model, and cannot push a wrong one for workers; the log is one write in code that already runs and gives the data the intake's stall analysis needed by hand. Forecloses: a `workers` map, worker effort keys, a spawn table in skills, cost estimates written by agents, prose in the log.

From # Status View 2026-09-09: status shows minutes since the leaf's last log line for the current phase, or "unavailable"; no stuck verdict.

Operator 2026-09-10: advice, not a lock. Slot B on a subscription-capped frontier model (Fable 5.1 on a Max plan, GPT-6 Astra by API) is the cost driver of a delegated leaf, about two thirds of spend (Cursor 2026-07-20). Slot B stays never cheap; when the budget is the constraint, pick the cheapest model that still plans well (Opus 5, GPT-5.6 Luna medium) before switching a repo to `implement: inline`.
