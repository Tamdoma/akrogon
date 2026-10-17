# Map A: token-spend (written before reading map-B/C)

## Stocks and flows
- S1 A context. Floor 58k (first call: 27.9k cached system/tools + 30.2k created: skill catalog, CLAUDE.md, chart-issues body). Grows to the compaction setpoint `autoCompactWindow: 250000` (~/.claude/settings.json:237), drains to 65-70k (study-B F5). Today 494 calls x 140k avg = 69.3M.
- S2 Consultant contexts. Floors: codex 20.7k, pi 6k (study-C F1). Grow 60-110k per chart; drained by peer-restart at chart entry (balancing loop B2, measured -46..-57% for codex).
- S3 Disk records (briefs, returns, merged, forks): durable memory; cost only when read into S1/S2.
- Inflows to S1: tool results ~303k c4/day (study-B F3: process text reads 28%, consultant returns 27%, other file reads 27%, herdr/peer 10%); A's own written content re-enters as tool input (450k chars of Bash inputs, 64k Write, study-B F4); compaction restores (invoked skills up to 5k tokens each, 5 most recent files; docs: code.claude.com/docs/en/context-window "What survives compaction", read 2026-10-17 via subagent).
- Outflows: only compaction (S1) and restart (S2). Spend = sum over calls of the stock, so the cost driver is calls x stock, not inflow volume alone.

## Loops
- R1 Plumbing tax: more consultants and exchanges -> more mechanical A calls (wait-for-idle, agent list, peer-ask, rerun waits) -> each costs the whole S1. Window 08:17-09:05: 27 of 113 calls, ~24% of A spend.
- R2 Compaction amnesia: S1 reaches 250k -> compaction drops detail -> skill restore is capped (20k chars seen) -> A re-reads full SKILL.md/shapes/returns to recover (study-B F6: 19.8k chars duplicated) -> S1 refills faster -> next compaction sooner.
- R3 Verbose in, verbose out: whole-file reads by consultants (145-333kB map intake) -> long returns (maps up to 17-28kB) -> A reads them whole and writes long merged notes -> peers re-read longer merged files in rebuttals.
- R4 Warm-session carry: a consultant's rebuttal carries its whole map/notes session (rebuttal mean 575k codex / 364k pi for 3 small reads, study-C F4).
- B1 Compaction at 250k: balancing but with a high setpoint; the delay between growth and drain is long, so average S1 sits near 140k.
- B2 Consultant restart per chart: works.
- B3 Read-once rule SKILL.md:6 (A only; consultants have none).
- Missing: no stage gating for consultants' process-text reads; no projection on herdr output (22k-char roster for a 3-pane question, study-B F7); spend feedback arrives only at handoff (chart-usage), after the spend.

## Leverage points (highest first)
- LP1 Structure, A's call count (R1): peer-ask/peer-wait absorb the pre-prompt `herdr agent wait` and identity reads, so one A call does wait-idle + prompt + wait-return for all peers. Saving ~10-15% of A. L1 holds (same exchanges, same records). Breaks: a peer busy with an operator request is now waited on inside the script; keep its timeouts and refusal lines. Proof: replay the same exchange count before/after, count A calls per exchange.
- LP2 Rules, consultant reading (R3): briefs carry a standing reading rule: read only the named sections for this stage, locate before reading, batch reads, never re-read. ~20-30% of consultant spend. L2 holds: each consultant still forms its own view from the same evidence; risk: a narrow slice hides a rule. Proof: same brief, compare intake bytes and calls per exchange.
- LP3 Structure, rebuttal session (R4): rebuttal runs in a fresh session that reads its own notes file plus merged. ~20% of consultant spend. L2 question: the consultant's model and independence stay; only its scratch reasoning not written to its notes is lost. Material fork.
- LP4 Parameter, A floor: hide unused skills from the model listing (`skillOverrides` "user-invocable-only" keeps operator slash commands), connectors/Chrome guidance off for door sessions; codex skills list off for consultant launches. ~5% A, ~5% codex. L1 risk: anything the operator expects the door to invoke on its own. Lives in machine/project settings or launch argv, not all in the repo. Material fork.
- LP5 Parameter, compaction setpoint (B1): lower autoCompactWindow for door sessions (e.g. 150k). Average S1 drops, but each compaction is a full-context call plus lossy summary (feeds R2). Machine setting, affects every claude session. Likely Off route or a measured fork.
- LP6 Flow, projections: herdr JSON projected to pane/name/agent/status/session; search output bounded by relevance. ~1-3% A. Cheap, inside scripts.

## Material forks
1. Which levers this chart builds (LP1-LP6), and as how many leaves.
2. Rebuttal session: warm (today) vs fresh with own notes (LP3).
3. Harness floor trims: build them (where: repo project settings, launch argv in seat templates, or machine settings) vs Off route (LP4).
4. Compaction setpoint (LP5): change, measure first, or Off route.
5. Proof: how a leaf shows the saving without a live multi-chart pass (replay over today's transcripts vs one small live chart).

## Pitfalls and practitioner notes
- Anthropic, "Effective context engineering for AI agents" (2025, practitioner tier, from model knowledge, not re-fetched): just-in-time retrieval, compaction, sub-agents returning condensed results, tool-result clearing. Supports LP2/LP6 and the existing subagent rule.
- Prompt caching (docs code.claude.com/docs/en/prompt-caching, via subagent 2026-10-17): main session cache TTL 1h on subscription; cache-read vs write weighting against plan limits is undocumented, so savings are stated in tokens, never dollars.
- A cut that adds calls can cost more than it saves (one A call ~140k): every lever is judged on calls x stock.
- A fewer-words rule must not cut evidence a peer uses to disagree (L2).
