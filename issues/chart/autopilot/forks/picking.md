# Picking

## Question
Q1 How does A pick the best option at each decision point, and what happens when a named consultant still disagrees after rebuttal? Q2 How many consultants must an autopilot door have?

### Carries
- Intake: "pick the best solutions", not always the recommended answer; every step kept.
- Operator values (INTAKE.md source file, Operator record): simplicity, function over form, delete rather than stack, speed, cost; 9% own-text answers pushed toward now, user-facing optimum, tighter time targets, stronger model floor, owning repo.
- Opening map: slots/map-merged.md fork 2.

## Findings
- Proof 2026-10-16, pane split for a peer after C (leaf any-consultants): `herdr tab create --cwd /home/ivan/Work/infra/akrogon --label proof-peer-split --no-focus` (tab w8:tCZ, root pane w8:pRB), then `herdr pane split w8:pRB --direction right --ratio 0.65 --cwd <root> --no-focus` -> w8:pRC, `herdr pane split w8:pRC --direction down --ratio 0.5 --cwd <root> --no-focus` -> w8:pRD, `herdr pane split w8:pRD --direction down --ratio 0.5 --cwd <root> --no-focus` -> w8:pRE, each id read from `.result.pane.pane_id`. Identity: operator herdr session (workspace w8). Version herdr 0.9.1. Result: `herdr pane layout` showed A 77 wide full height, B 19 rows, C 9 rows, D 9 rows in the right 42 columns. Cleanup: `herdr tab close w8:tCZ` returned ok; `herdr tab list` and `herdr pane list` show no tab or pane for w8:tCZ. Limits: no `herdr agent start` in the new panes (that form is unchanged from B and C); splitting the previous peer halves it, so peer heights are uneven; not proven when A's pane does not fill its tab.

## Taken
- 2026-10-16 settled by the Boundary answer (INTAKE.md "Boundary answer": "no middle ground", "by consulting or either doing it alone, whether based on how many consultants I gave you"): A decides a disagreement that stands after rebuttal and records the dissent. No minimum consultant count. A alone runs with no peer steps and no direct route (SKILL.md:97). Checked by B and C (slots/boundary-final-check-2-*.md).
- 2026-10-16 operator "1a" (INTAKE.md "Picking answer"; round from slots/picking-merged.md, rebuttals slots/picking-rebuttal-B.md, -C.md). Taken: when a named consultant's exchange ends in failure or blocked, or herdr refuses the prompt, A keeps going with the consultants still working, or alone, and stops using that consultant for the rest of the session. A never re-prompts it. Completed returns are kept. The morning record names the lost consultant, when, and which charts ran without it. If B is lost the direct route is gone (SKILL.md:97). B and C disagreed (roster fixed at switch-on); operator chose 1a.
