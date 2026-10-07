# Slot C notes, fork proof-of-saving, 2026-10-06

Read: INTAKE.md, forks/proof-of-saving.md, CHART.md, `herdr agent list` output (live, 2026-10-06), skills/chart-issues/scripts/ (peer-wait.ts), src/status.ts:265-288, the Claude and codex transcript records I parsed for the map round (per-call `message.usage` with `message.id` and `message.model`, codex `turn_context.payload.effort`, `task_started`/`task_complete`, `token_count.info`).

## Q1. How does the operator learn whether a chart got cheaper and faster: what is recorded, when, by whom?

Options I name:
- 1a. Record at open, script at handoff. When the door names the panes, A writes a `## Sessions` section into CHART.md: per slot, harness kind, session id from `herdr agent list`, and the model and effort as the operator stated them at pane start, plus the open timestamp. At handoff the door runs `bun <skill-folder>/scripts/chart-cost.ts <chart>` once; the script reads the ids, parses the transcripts between open and handoff, and writes `<chart>/COST.md` with fixed rows. The handoff review shows its summary line. The operator reads COST.md, or runs the script on any chart at any time.
- 1b. By hand, as today: A measures with one-off scripts in its own session when asked.
- 1c. Record only: the Sessions section, no script; measurement happens when someone asks.
- 1d. Cost tracking inside akrogon core (state.yaml, `akrogon status`).

1. Pick: 1a.
   One reason: every number this chart's forks asked for already exists in the transcripts; the only thing missing is the link from a chart to its sessions, and that link is free at open and unrecoverable later (today's analysis found each chart's sessions by searching transcripts, Carries). Once the link exists, a script produces the rows for zero model tokens, which is the only way a measurement does not itself cost the thing it measures (today's hand measurement cost "several dollars of the door's own tokens").
   Cost: one leaf to build the script (about 200-300 lines of TypeScript, the parsing is the same as the one-off scripts written today; estimate $3-5 of agent time and one review). Per chart: one CHART.md section at open (a few lines of output), one script call at handoff (seconds, no tokens), one summary line read by A (under 200 tokens). A dated price table per Claude model id lives in the script and is the one thing kept by hand; codex rows carry tokens only.

   Smallest thing the operator sees: `<chart>/COST.md`, same rows on every chart, so three charts compare by reading three files:
   - per seat: model, effort (codex from `turn_context`, Claude from the Sessions section), turns, minutes working, output tokens, thinking tokens, cache write, cache read, dollars where a price exists
   - per fork (bounded by brief-file mtimes, which peer-packet made mandatory): minutes from brief to Taken, door output, peer output, restatement requests (operator messages that are exactly `eli`, `elid`, `scr` or `foc`)
   - map turn: tool calls, web calls, cache read, bytes per map file
   - handoff: minutes, door output, characters of leaf drafts before and after review
   - one summary line: door $, B tokens, C $ or tokens, minutes per fork, restatements per round

2. Rejected:
   - 1b: costs door tokens every time, lands in the door's context (compaction pressure is already in Fog), and its results differ by who measures (my raw token sums double-counted streamed records and A corrected them on the map round).
   - 1c: keeps the link but every measurement is 1b again. The script is the part that makes the record usable for the price of writing it once.
   - 1d: chart cost is not leaf state. `akrogon status` reads CHART.md for existence (src/status.ts:284-288) and validates emitted leaf files; putting transcript parsing into core ties akrogon to two harnesses' private log formats. The script already lives next to peer-wait.ts for the same reason.

3. Evidence:
   - Tier better-than-training. Source: `herdr agent list`, run 2026-10-06 by C. Finding: per pane it prints `agent_session.value` for Claude (`14a11404-...`) and codex (`01a10f8a-d864-7f20-b425-d2fc02d57295`), and the codex id is the suffix of the rollout file name (`rollout-2026-10-06T06-48-40-01a10f8a-...-d2fc02d57295.jsonl`), so both transcripts are addressable from the id alone.
   - Tier better-than-training. Source: Claude transcripts, parsed 2026-10-06 by C for the map round. Finding: `message.usage` per call with `input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`, `output_tokens`, `output_tokens_details.thinking_tokens`, `message.model` and a timestamp; streamed records repeat usage per content block and must be deduplicated by `message.id` (my R1 correction). Tool calls and web calls are `tool_use` blocks by name. Operator alias requests are user records whose content is the bare alias.
   - Tier better-than-training. Source: codex transcripts, parsed 2026-10-06 by C for peer-effort. Finding: `turn_context.payload.effort`, `task_started`/`task_complete` timestamps per turn, `token_count.info.total_token_usage` with input, cached input, output and reasoning tokens. No dollars.
   - Tier better-than-training. Source: forks/proof-of-saving.md Carries. Finding: the baselines for the three measured charts (door $10.20/$11.95, C $11.37/$18.84/$13.3, B 2.1 min and 3.6k per fork turn, handoff $1.34/$2.40) and the session ids found today exist, so the leaf's done-criterion can be: run the script on seed-root-cause, merge-turn and chart-cost and match today's hand figures.
   - Tier better-than-training. Source: skills/chart-issues/scripts/peer-wait.ts and questions.md:44. Finding: the door already invokes one script by `<skill-folder>` path with a fixed contract and no model tokens; chart-cost.ts follows the same convention.
   - Tier practitioner: not searched; the artefact is this door's own.

4. Pitfalls:
   - A session spans more than one chart (Carries). Removed by: the Sessions section records the open timestamp and the script takes handoff time from the last `issues/open/` leaf file written, counting only records between them.
   - The operator restarts a pane mid-chart and the new session is missed. Removed by: A appends a Sessions line whenever it names or re-prompts a pane whose `agent_session.value` is not yet listed; the script accepts several ids per slot.
   - Prices drift, or a model has no price (Fable's are fitted, Carries). Removed by: tokens are always printed, dollars only for a model id in the dated table, with the date shown. The price table is the only hand-kept input and sits in one place.
   - Transcripts are pruned before anyone measures (Claude Code cleans project logs after a retention period). Removed by: COST.md is written at handoff, so the chart keeps its numbers when the logs are gone. A chart measured late prints what remains and says what was missing.
   - Fork boundaries drift when slots files are rewritten. Removed by: boundaries come from brief files, which peer-packet fixed as written before the prompt and never edited.
   - The measurement re-enters the door's context and costs what it measures. Removed by: A reads only the summary line for the handoff review; COST.md is for the operator.
   - "Did the round work" is read off the restatement count. Removed by: the row is named "restatement requests", nothing more, and the register fork's done-criterion compares it across charts, as that fork said.
   - Recording model and effort per chart becomes a default. Removed by: the Sessions section records what the operator chose for this chart; the skill names the field and no value, which is the lock's shape.

5. Missing question: are dollars what the operator wants to see, or tokens by class and minutes? Dollars need a hand-kept price table that is wrong the day a price changes; tokens and minutes need nothing. If tokens and minutes are enough, the price table is dropped and the comparison is model-neutral, which also fits the operator's practice of changing C's model between charts.

## Not measured
- Build cost of the script beyond an estimate; the parsing exists only as today's one-off scripts.
- Where Claude Code keeps the per-session `cost-state` record A cited; I did not find it inside the session .jsonl and the script should not depend on it.
- Codex transcript retention.
