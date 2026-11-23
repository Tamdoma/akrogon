# Design brief: seat-rounds

You are a consultant. Read only. Write your own view before seeing anyone else's.

Locked: forks/signposts.md (2026-11-23: 5a "B fixes one-line test and proof mistakes itself, only real code problems go back to A", 4a merge speed first). The operator asked whether this is already in akrogon: it is partly; skills/check-issue/SKILL.md:79 lets B repair every Fix except a test-expectation correction, a proof-command correction, a locked brief/design change, a new live action and a recorded model choice.
Direction from the opening map (issues/chart/lean-akrogon/slots/map-merged.md "Chart 6 seat-rounds"): audit first; X1 drop A's first-round review if the audit shows A rarely finds what B misses; P3 B repairs test expectations and proof commands; a mechanical implement-exit proof-command check that removes the class; P8 mechanism-binding wording; X2 skill rules stated once; frozen-citation scope (a brief that names an exact call blocks an outcome-preserving repair, #149 check16-reads-imports held 117.7 min).

Data: framework /home/ivan/Work/infra/tamdoma/framework issues/open and issues/closed review-A.md / review-B.md files, issues/log.jsonl; akrogon issues/closed likewise. Skills: skills/check-issue/SKILL.md, skills/implement-issue/SKILL.md, skills/plan-issue/SKILL.md (proof-command rule), src/phase.ts (two-seat review aggregation).

Answer with file:line or file counts:
1. Audit: in fix/fix and fix/ready reviews, how many Fix items did only A find that B missed, and were they real product defects? Does X1 pay?
2. P3: the exact new check-issue :79 text so B repairs test-expectation and proof-command corrections, with the guard that stops B weakening a test to pass (who re-checks, what B must cite). Is the implement-exit mechanical check still needed then?
3. Frozen-citation: the smallest rule change.
4. P8 and X2: only if a concrete defect remains; else drop.
5. Fewest-parts final shape with the figure (seat turns per merged leaf, baseline) and open forks with your pick.
Under 60 lines. Write slots/design-<slot letter>.md here.
