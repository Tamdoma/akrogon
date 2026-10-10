# Search routing, slot B blind notes

## 1. Pick, reason, cost

Pick: Explore override on Haiku, with escalation by one explicit field, plus one routing test line in haiku.md. Default direction is cheap, escalate up, never the reverse.

- `~/.claude/agents/Explore.md` with `model: haiku`, read-only tools, body carrying the citation rules (Explore skips CLAUDE.md, so the rule text does not reach it).
- A hard search runs the same agent with `model: "opus"` on the call. The Agent tool takes a per-call `model` field, and the subagents doc puts that field first in resolution, above frontmatter. Evidence: framework session 47f624e2, three `Agent` calls with `"model":"haiku","subagent_type":"Explore"`, read 2026-10-10.
- One line in haiku.md replaces the routing guess with a test: "Explore runs on Haiku. If the brief's output is facts with path:line, that is right. If the output you need is an explanation or a judgment you must defend, call Explore with `model: opus` or do it yourself."

Reason: this is the only option where the wrong default is visible. A Haiku return that is thin or wrong fails the spot-check and gets rerun on Opus, cost one retry. An Opus return for an easy search never fails anything, costs more, and nobody sees it. Systems with a silent failure mode do not self-correct. Put the default on the side whose mistake shows.

Cost: a hard search occasionally runs twice. One extra file in `~/.claude/agents/`. The operator accepts that a first attempt may land on Haiku; the escalation path is the answer to the objection, not a denial of it.

## 2. Rejected options

- Keep built-in Explore on Opus and add a second Haiku agent (`find`, `retrieve`). Rejected: the main model must pick by name on every call, which is the guess we are removing, and the harness prompt names Explore, so the habit lands on Opus. Default up, escalate down never happens because the easy-search overspend is silent.
- Rule text only, "spawn Explore with model: haiku". Rejected: the model field is the step skipped in all 3 measured spawns' siblings. Zero Explore calls in akrogon sessions in 24 hours, so the natural path never ran at all. It adds a decision per call instead of removing one.
- A numeric or keyword classifier for "hard" (file count, "why" in the prompt). Rejected: counts are known only after the reads; keyword rules rot.
- Two Explore flavours by thoroughness (quick=haiku, very thorough=opus). Rejected: thoroughness is depth, not difficulty. A very thorough listing of all callers is still facts; a quick "why does this race" is still judgment.
- A hook that counts reads and nags. Deferred per rule-rewrite Q3.

## 3. Evidence

- better-than-training · https://code.claude.com/docs/en/sub-agents, read 2026-10-10 · Explore runs on the main model (Opus under Fable); a user agent named Explore overrides it and keeps its model; resolution order is per-call `model`, frontmatter, env var, main model; Explore skips CLAUDE.md · basis for the override plus per-call escalation and for putting citation rules in the agent body.
- better-than-training · transcript `~/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/47f624e2-*.jsonl`, read 2026-10-10 · three Agent calls with `"model":"haiku","subagent_type":"Explore"`, all summarize tasks · proves the per-call field works in this harness and that Explore with explicit model is the only path used.
- better-than-training · https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5, read 2026-10-10 · "Delegate independent subtasks to subagents and keep working while they run"; brief instructions steer better than enumerations · the latency loop is weakened by parallel spawns, not by more rule text.
- better-than-training · https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices, read 2026-10-10 · models "may spawn subagents for code exploration when a direct grep call is faster and sufficient"; damping sample uses task shapes · supports a single output-type test over counts.
- better-than-training · https://code.claude.com/docs/en/memory, read 2026-10-10 · rules are context, not enforcement; contradicting instructions picked arbitrarily · why the fix must be structural (agent file) with the rule as the tie-breaker.
- better-than-training · session 5eb6ac92 harness Agent tool description · "Do the work yourself when it is a handful of tool calls or a lookup whose target you already know ... When in doubt, don't spawn" and "answering would mean reading across several files — delegate that" · both halves of the loop below.

## 4. Pitfalls and what removes each

- Hard search lands on Haiku and returns a confident wrong answer. Removed by: the Hand-offs spot-check line (facts come with path:line, the main model opens the lines its decision depends on), and the escalation line. A fact with a citation is checkable; a judgment is not, which is why judgments do not go to Haiku at all.
- Main model escalates everything to Opus "to be safe". Removed by: the test is on output type, not on confidence. "Where is X" is facts even when the codebase is large. Plain wording, no "if in doubt".
- Explore override catches a skill that spawns Explore for reasoning. Removed by: grep of `skills/` finds no Explore reference; boundary line says lifecycle skills choose their own agents. Any future skill names its own type.
- Latency makes the model avoid hand-offs in interactive sessions. Removed by: the back-and-forth exit, the "already in context" case, and the Fable guidance to keep working while subagents run. Spawn Explore and continue; do not block.
- Double citation rules (haiku.md Hand-offs and Explore.md body) drift. Removed by: Explore.md body holds the output contract (what Haiku returns), haiku.md Hand-offs holds the caller contract (what the main model sends and checks). Different sides, no copy.
- Measurement is too slow to correct anything. Removed by: Q3's 7-day recount uses the intake's exact transcript query, so the count is a script run, not a study.

## 5. Questions the fork does not ask

- Q-a. Does the operator accept "first attempt may be Haiku, hard ones rerun on Opus" as the trade? That is the whole pick. If no, the alternative is the silent-overspend default and the goal "most searches on Haiku" is not reachable without a per-call guess.
- Q-b. Should `tools:` in Explore.md include Bash? Read-only intent, but Bash can write. The built-in Explore denies Write and Edit yet allows shell. Suggest keeping Bash for `git log` and `rg`, matching the built-in.

## Systems sketch

### Stocks and flows

Stocks:
- S1 Main-model context: raw file and search output accumulated this session. Grows with every inline read. Shrinks only on compaction.
- S2 Spend: dollars this session, split main model vs Haiku. Grows with S1 and with every main-model turn that re-reads what is in S1.
- S3 Haiku hand-off count: the operator's measured signal.
- S4 Operator trust in the rule: rises when S3 moves, falls when it stays at zero.
- S5 Facts the main model holds about the codebase: filled by either route; the route decides what it cost.

Flows and who decides:
- F1 Inline read into S1: main model, per tool call, by habit and by the harness "handful of calls" default.
- F2 Hand-off to Explore: main model, per task, by the rule and the Agent description.
- F3 Return from Explore into S1: shaped by the brief's output format (small if facts with citations, large if a dump). Decided by the main model when writing the brief.
- F4 Model chosen for the hand-off: today the main model per call; after the override, the agent file, with per-call escalation.
- F5 Rule edits: operator, after a manual transcript count. Slow.

### Loops pushing away from the goal

- R1 "Already here" (reinforcing): inline read fills S1; the next question is answerable from S1; the model answers from context; delegation looks pointless; more inline reads. Observed: 357 shell reads and 65 Read calls in 24 hours against 3 hand-offs. Self-sustaining within a session.
- R2 "Cheap to me" (reinforcing): the main model never sees S2. The only costs it feels are latency and effort. Inline reads are low on both, so every cost comparison it makes favours inline, and the rule's cost exit confirmed it. Observed in the 11:39 and 11:40 statements.
- B1 "Harness damping" (balancing, wrong setpoint): the Agent description says do a handful of calls yourself and when in doubt do not spawn. It balances toward zero spawns for small reads. The rule had no override, so this setpoint won.
- B2 "Double-work fear" (balancing): the re-read line made each hand-off look like a read plus a read. It capped hand-offs at the point where inline felt equal. Fixed in rule-rewrite by the spot-check line.
- B3 "Operator correction" (balancing, slow): operator counts, finds zero, rewrites the rule. One cycle per day or week. Too slow to hold the model's per-call habit without a structural change.
- R3 "Model guess" (reinforcing, latent): if Explore stays on Opus and the model must pass `model: haiku`, each forgotten field is an Opus run that looks like a success, so nothing corrects it and the habit of omitting the field hardens.

### Fixes by structure

- Cut R3 at the source: Explore defaults to Haiku by file, not by memory. One field to escalate, none to delegate.
- Reset B1's setpoint: the override clause in the opening reason, already taken in rule-rewrite.
- Add a corrective loop the main model feels: the spot-check. A thin Haiku return is an immediate, visible failure that triggers escalation. This loop exists only when the default is cheap.
- Weaken R1: the "do it yourself" list names the only inline cases (edit next, already in context, one known line, single page). Everything else is a hand-off, including questions the model thinks it could answer from a quick cat.
- Keep B3 cheap: the 7-day recount is the same query, so correction stays possible without a hook.

## Challenge to "most searches go to Haiku"

Right as stated for the narrow meaning of search: locate, list, summarize, extract, compare two files for a named difference. Haiku returns facts with citations and the main model checks the few it uses.

Wrong when "search" means "understand": why a race happens, how data flows across four modules, whether two implementations are equivalent, which of twelve call sites is the real bug. Those return an explanation. The main model cannot spot-check an explanation without redoing the reasoning, so delegation saves nothing and risks a wrong premise entering a decision unchecked.

Single test: can you write the brief so its output is facts you can check by opening the cited lines? Yes, Haiku. No, it is judgment: Opus Explore when the reading is wide and you still want it out of your context, yourself when the answer and the next edit are the same work.

## Does Explore.md belong in the fix

Yes, with the escalation field as its pair. The operator's objection is correct about a single-model override with no escape. It is answered by the per-call `model` field the harness already honours and by the output-type test that says when to use it. Without the file the goal is unreachable: today's natural Explore path is Opus-only, the explicit field was passed in 3 of roughly 20 subagent calls, and no loop punishes forgetting it.
