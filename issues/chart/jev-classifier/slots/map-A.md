# Map A (blind)

## Baseline
- akrogon makes no model API call (grep of src and skill scripts: only fetch is the Discord webhook, skills/broadcast-issue/scripts/discord-send.ts:91). Fuzzy decisions are made inside harness turns that already run with full context, under seat subscriptions. A judgment inside an existing turn costs near nothing. Jev saves money or time only when it removes a whole turn, or replaces brittle code.
- Deterministic decisions in src (flaky red-then-green src/flaky.ts:25-45, verdict aggregation src/phase.ts:323, turn eligibility src/turn.ts:11-52, delivery check src/session-file.ts:40-70, peer-wait state machine) are protocol facts. A probabilistic classifier would make each worse.

## Candidates
1. Direct vs lifecycle (SKILL.md Direct route list). Four of five refusals are mechanical (draft has inputs/grants/produces/retained, live-run criterion, pending human prerequisite, B not named). One is judgment ("more than one outcome or unfinished dependency"). The door decides once per chart while holding every fact. Jev adds a call and a key to remove nothing; reviewers say multi-condition AND logic belongs in code (akitaonrails 2026-10-10, inovex). Verdict: not a classifier job.
2. Autopilot vs not. Locked as an operator switch in words (issues/chart/autopilot/forks/switch.md; boundary.md "Autopilot never changes its own switch or limits. Only the operator does."). A classifier choosing autopilot contradicts a taken lock. Not a classifier job.
3. watch-issues tick (skills/watch-issues/SKILL.md:16, */20 cron, 72 turns per day while away). Most ticks report no change. The real cost is the LLM turn per tick. Jev cannot remove the turn because the cron prompt itself is the turn; a quiet check would have to sit in observe.ts and the cron turn still fires. A deterministic "nothing changed since last tick" hash in observe.ts beats Jev if this is ever worth doing. Low value.
4. Seed duplicate and routing (chart-issues open, seed-issue:73). Per chart, low volume, input is untrusted GitHub text (Jev follows injected instructions per inovex, treated "PASSWORD-523" as a credential per akitaonrails). In-context door judgment is already free. No.
5. check-issue Fix/Nit, learn-issues sort, merge red-cause judgment. Need justification text and multi-step reasoning, which Jev lacks by design (TypeSafe launch post: no string output). No.

## Pitfalls over lifetime
- New outside need: TYPESAFE_API_KEY into every machine's env, readiness inputs, a new failure domain in a CLI that today works offline.
- Early access vendor, pricing possibly subsidized (TypeSafe launch post), jev-latest drift; pinning needs re-tuned thresholds on each upgrade.
- Calibration poor on new data (inovex, 900 tickets); thresholds need our own labeled set, which we do not have and would need to maintain.
- Agent-facing code invites "ask the classifier" creep: a second decider beside the agent that disagrees with it.

## Forks
- F-A1 Whether to add any classifier at all (recommend no: Off route with reasons).
- F-A2 If yes, where: only a place that removes a whole LLM turn. None found with volume above ~70/day.
- Optional measurement: a 30-minute scratch eval of Jev on past direct-route decisions from issues/chart/*/CHART.md Route lines, if the operator wants evidence beyond reviews. Needs a TypeSafe key (operator step).

## Recommendation
Do nothing in akrogon. Close the chart with Off route reasons. Revisit when akrogon gains a high-volume decision over free text that today costs a whole turn.

## Evidence
- better-than-training · repo grep at f7baddc, 2026-10-17 · no model API calls.
- better-than-training · docs.typesafe.ai/primitives and typesafe.ai launch post, read 2026-10-17 · typed decisions, no text, $0.042/M input, 70-500 ms, early access.
- practitioner · inovex review (inovex.de, 2026-10) · prepare decisions, not make them; weak at multi-step logic, injection, poor calibration on new data.
- practitioner · Fabio Akita benchmark, akitaonrails.com 2026-10-10 · 97.6% on set; rules and thresholds stay in code.
