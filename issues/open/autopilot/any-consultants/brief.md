# Brief: any-consultants

## What
The chart-issues door accepts any number of operator-named consultants (charting peers), including none, in attended and autopilot mode alike. Peers get slot letters in the order the operator names them: the first is B, then C, D and so on. Every charting rule that today names B and C applies to each named peer, stated once. The direct route's reviewer stays B, the first named peer. When the operator asks for peers without naming panes, the door splits A's pane to the right for B, and each later peer's pane splits the previous peer's pane down. The change is skill and guide text only: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `docs/guide/chart.md`.

## Why
The operator names a different number of consultants each session ("the number of consultants will always be arbitrary", intake 2026-10-16), and the Picking answer sets no minimum count. Today `SKILL.md` (first reply, pane creation) and `questions.md` (blind peer exchange) allow only B and C, with C only alongside B. The operator chose the same rule for attended and autopilot mode (split answer 2a, 2026-10-16). The prompt script (`peer-ask.ts`) already takes any number of pane triples, and the usage script (`chart-usage.ts`) already reads any seat letter, so only the text limits the count.

## Done-criteria
1. A reader of `SKILL.md` and `questions.md` learns that the operator may name no peers or any number of them, that letters follow naming order starting at B, and that no rule caps peers at two or ties one peer to another.
2. Each peer rule is stated once for every named peer: first-reply naming, pane creation, blind exchange and return paths, rebuttal, final-shape check, leaf review, seat record and agreeing-slot tags. The return-path examples and the brief pointer's slot letters show that letters continue past C.
3. Pane creation for each peer after B uses `herdr pane split <previous peer pane> --direction down --ratio 0.5 --cwd <root> --no-focus`, and the size statement says that all created peers share the right 35% when A's pane fills its tab, with only A's area split otherwise, as today.
4. The direct route still requires B and has B review, with B defined as the first named peer.
5. The `docs/guide/chart.md` peer section describes any number of named peers with the same role, each blind to A and to every other peer.
6. `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists only the three files above.
