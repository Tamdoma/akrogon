# Design: any-consultants

## Binding decisions, verbatim

### Split (issues/chart/autopilot/INTAKE.md, "split answer")
Operator 2026-10-16: question 1 "1a | what are the other questions? eli", question 2 "2a".
1a: two parallel leaves of one issue, autopilot-mode and any-consultants. Reason: each is checked on its own, so a problem in one does not hold up the other. Cost: both edit `SKILL.md`, so the second to merge may resolve a conflict. Foreclosed: 1b one leaf for both.
2a: any number of consultants in both modes, attended and autopilot. Reason: one rule, nothing to keep in sync, and naming B and C keeps working as today. Foreclosed: 2b autopilot only, which leaves two roster rules that can drift apart.
Binding from the round: the first named peer is B, so the direct route's reviewer is always defined. When the door creates panes, each further peer splits the one before it, so the layout is not guessed.

### Boundary (issues/chart/autopilot/forks/boundary.md)
Operator 2026-10-16: "if this is gonna be autopilot, then it's gonna be autopilot... by consulting or either doing it alone, whether based on how many consultants I gave you. I don't want the middle ground."
Taken: inside autopilot A answers every question with the consultants named for that session (none, one or several). For this leaf: the roster may be none, one or several. The autopilot rules themselves belong to leaf autopilot-mode.

### Picking (issues/chart/autopilot/forks/picking.md)
Taken 2026-10-16: no minimum consultant count. A alone runs with no peer steps and no direct route (`SKILL.md` Direct route, "B is not named").
Operator "1a", which drops a failed consultant for the session: autopilot-only, owned by leaf autopilot-mode, and excluded here. Attended handling of a failed peer stays as today (report to the operator, never re-prompt automatically).

### Intake (issues/chart/autopilot/INTAKE.md)
Operator 2026-10-16: "the number of consultants will always be arbitrary and I will be actually telling you what they are and maybe if the panes are already active or not. We are doing everything inside of Herder."

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md: this leaf has no auth, secrets, outside accounts or live calls. It changes skill and guide text only, and a reviewer proves it against the binding decisions above. No test asserts skill prose wording, which keeps the proof about function, not exact words. The one external operation the brief names, the herdr pane split of the previous peer, was proven at charting (readiness.yaml `proofs`) and is not rerun by the leaf. Existing checks still run: `tests/docs-links.test.ts` covers any link the guide edit adds.

## Leaf architecture
- Owned: `skills/chart-issues/SKILL.md` (Open first reply and pane creation; the agreeing-slot tag examples in Take and Handoff where wording assumes at most C), `skills/chart-issues/assets/questions.md` (Blind peer exchange: roster sentence, pane creation, return-path examples, slot letters in the brief pointer), `docs/guide/chart.md` (the peer section and its diagram).
- Interfaces, unchanged and reused: `skills/chart-issues/scripts/peer-ask.ts` accepts `<budget> (<pane> <return-file> "<text>")+` and rejects argument counts that are not triples (main). `skills/chart-issues/scripts/chart-usage.ts` reads `seats.yaml` entries with any non-empty `seat` string (`seatSchema`). The seat record rule in `SKILL.md` Open already covers "A and each named peer".
- Consumers of the roster rule: the direct route (`SKILL.md` Direct route eligibility "B is not named" and the review step's B pane), which keeps B as the first named peer. Lifecycle seats (`slots:` with keys `a` and `b` in shapes.md and src) are a different mechanism and are excluded.
- Excluded: autopilot text (leaf autopilot-mode), scripts under `skills/chart-issues/scripts/`, `src/`, `tests/`, `issues/`.
- Shared lines: leaf autopilot-mode also edits `SKILL.md` Open (first reply) and `questions.md`. The leaves run in parallel, and whichever merges second rebases onto the other's text and keeps both outcomes.
- Open for the plan: whether the pane-size sentence (A 65% wide, peers sharing the right 35%) needs a note that later peers get smaller panes. The proof showed B at 19 rows and C and D at 9 rows each.
