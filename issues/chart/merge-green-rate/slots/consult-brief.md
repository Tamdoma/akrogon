# Consult: raise the merge green rate (blind, read-only)

Operator, verbatim: "Now I want to see if we can get this percentage green rate higher. Just think about it from the system's thinking perspective. What do we need to do to make this balancing loop or reinforcement loop have higher success? What is the stock and flow analysis? And how do we make the inflows and outflows produce better results? And making sure that the balancing loop also contains the correct target and the correct sensor. ... Think about it deeply from the systems thinker perspective. I don't want some surface level patches that will overcomplicate the system long term."

Standing operator values: simplest systemic fix, remove code where possible, no caps, no slowdowns, no CPU blowups. The operator leans toward merge batching (O1), whose gain grows sharply with the green rate (80% gives 1.25-1.6x, 92% gives 2.6-3.3x).

## Facts
- Framework merges (issues/merge-attempts.jsonl in /home/ivan/Work/infra/tamdoma/framework): since 10-07, 62 merged, 17 red, 14 ejected, 5 held. Since the single-leaf merge at 17:46 today: 12 merged, 3 red (promotion-script twice, disavow-evidence-scope once). In the evening burst, 12 of 13 were green.
- Decision D10 O1 (today): a leaf runs the cheap checks plus its own planned tests. Only the merge runs the full verify (akrogon verify: every `checks` command not in `merge_covers`, then `merge_checks`). So the merge is the first place the full suite runs on a leaf.
- Merge red rule (akrogon docs/guide/merge.md:28): if a red has no cause in the leaf's diff, B reruns once. If still red, the leaf goes to check.fix and back through review.
- Earlier false reds today came from tests timing out under host load (32 cores, a verify peaks at load ~19, 10+ leaves checking at once). Fixes landed today: size-fit, render-fixture-once, test-cpu leaves. Full verify went from ~3,260 to 1,148 CPU-s.
- A per-red cause classification is being written to scratchpad/green-rate/reds.md (same folder as this brief). Read it if it exists when you finish your own pass, and say whether it changes your view.
- Code: akrogon at /home/ivan/Work/infra/akrogon (src/verify.ts, src/phase.ts, src/next.ts, docs/guide/*.md, skills/*/SKILL.md). Framework at /home/ivan/Work/infra/tamdoma/framework.

## Ask
Do a stock-and-flow and feedback-loop analysis of the lifecycle that feeds the merge gate (plan → implement → check.review → merge → merged, with check.fix loops back).
Q1. Stocks and flows: name the stocks (for example latent defects in branches, leaves waiting in merge, drift between a reviewed tree and main) and the inflows and outflows of each.
Q2. Loops: name each balancing and reinforcing loop with its goal (target), its sensor and its actuator, and where a sensor is in the wrong place, measures the wrong thing, or has delay. Name any loop that makes reds breed more reds.
Q3. Leverage: the one or two highest-leverage changes (Meadows-style: structure, information flows, goals, not parameters) that raise the merge green rate without adding complexity. Prefer removing parts. For each give the mechanism, the files it touches, what it removes, and what it could break later.
Q4. What not to do: the surface patches that look tempting but would make the system worse long term.
Q5. The right metric and target: what the system should measure and aim for. Is "merge green rate" itself the right sensor?

Back every factual claim with path:line or a log path. Mark guesses. You may do outside research (systems thinking or CI practitioner sources) if it helps, with URL and date. Write your answer to answer-<your letter>.md in this folder. Don't read the other seats' answers. Max 80 lines.
