# Map A (2026-10-06), written before reading B or C

Measured from ~/.claude/projects/-home-ivan-Work-infra-akrogon/*.jsonl (usage per API call, cost-state per session) and issues/chart/*/slots sizes.

## Findings
A1. No single step at 10-04 in A's own numbers. A's cost per chart session: 09-28..09-30 $2-8, 10-01..10-03 $3-14, 10-05 $11.2 and $12.9. Per fork cycle A output: 5-9k tokens (09-28..09-30), 12-16k (10-01..10-03), 14-30k (10-05).
A2. Peer C is the largest single cost. C runs on claude-fable-5-1, fitted about 2.2x the Opus 5.5 token price. C sessions: 10-02 $19.56, 10-05 AM $11.37, 10-05 PM $18.84, against A $11.65, $11.20, $12.92. C on Fable since 10-01 11:30 UTC, so older than 10-04.
A3. Round text grew after 7bac4c1 (10-04 12:16). Slots per fork: seed-root-cause 44KB, merge-turn 32KB, against 7-27KB before. Median merged file 7.9KB and 5.5KB against 2-5KB. A's presented round 5.6k chars in 0c5414ba against 2.0-3.5k before. Confound: fork difficulty. retro-concepts (10-04 evening, after the commit) stayed small.
A4. A writes each round three times as output tokens (slot A file, merged file, operator round), and the operator asks for an eli/elid re-presentation after nearly every round (6-7 per session), a fourth copy.
A5. Cost share by token type, fitted from recorded costs: Opus cache write 38%, cache read 34%, output 28%. Fable cache write 49%, output 31%, cache read 18%. New text entering context is the main cost, and every output token is paid again as cache write.
A6. Every recent door session hits the context limit (about 210k) and compacts twice, then re-reads the skill files (cw 55-71k each time).
A7. Wait inside a fork cycle is dominated by the peers' independent round (222s in the 18:49 merge-turn cycle), then rebuttal (22s), plus an unlisted followup stage (48s) and door probes (120s).
A8. Skill text itself is 44KB (about 11k tokens) held in context on every call. Small share.
A9. peer-wait script (10-03) moved waits to the foreground. No token cost found.

## Forks
- Which model and effort C runs on.
- Whether peers return a full formatted round or a short position.
- Whether A writes slot A and merged files in full or writes only the operator round plus attribution.
- Whether the first presentation is already in the eli register.
- Whether rebuttal runs only on disagreement.
- Compaction: keep context smaller (read peer files by section, not cat both) or accept.

## Pitfalls
- Cutting peer independence weakens the blind check the operator likes.
- Shorter peer returns may drop the evidence A needs to merge.
- A cheaper C model changes review quality, which only shows later in leaf defects.
